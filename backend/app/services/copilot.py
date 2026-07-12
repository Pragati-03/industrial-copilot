"""
AI Copilot: retrieval-augmented question answering over ingested
documents, using Gemini (via LangChain) for answer generation.

Flow: question -> similarity search in FAISS -> build context from the
top-k retrieved chunks -> Gemini generates an answer grounded in that
context -> return the answer plus the source chunks used, so the caller
can show citations.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import List, Optional

from langchain_google_genai import ChatGoogleGenerativeAI

from app.core.config import settings
from app.services.vectorstore import VectorStoreError, similarity_search

_chat_model: Optional[ChatGoogleGenerativeAI] = None


class CopilotError(Exception):
    """Raised when the copilot cannot answer a question."""


@dataclass
class CopilotSource:
    document_id: int
    filename: str
    chunk_index: int
    snippet: str
    score: float


@dataclass
class CopilotAnswer:
    answer: str
    sources: List[CopilotSource]


def _get_chat_model() -> ChatGoogleGenerativeAI:
    global _chat_model
    if _chat_model is None:
        if not settings.GOOGLE_API_KEY:
            raise CopilotError(
                "GOOGLE_API_KEY is not set. Add it to backend/.env to enable the AI Copilot."
            )
        _chat_model = ChatGoogleGenerativeAI(
            model=settings.GEMINI_CHAT_MODEL,
            google_api_key=settings.GOOGLE_API_KEY,
            temperature=0.2,
        )
    return _chat_model


def get_chat_model() -> ChatGoogleGenerativeAI:
    """
    Public accessor so other services (e.g. maintenance intelligence)
    can reuse the same Gemini chat model instance instead of creating
    their own.
    """
    return _get_chat_model()


PROMPT_TEMPLATE = """You are an industrial knowledge assistant. Answer the question using ONLY the context below, which was retrieved from the plant's own documents. If the context doesn't contain enough information to answer, say so plainly instead of guessing.

Context:
{context}

Question: {question}

Answer concisely and factually, in plain language a maintenance engineer or plant operator would understand."""


def _snippet(text: str, length: int = 280) -> str:
    text = text.strip()
    return text[:length] + ("…" if len(text) > length else "")


def _extract_answer_text(content) -> str:
    """
    Gemini models with 'thinking' mode return content as a list of
    structured blocks (e.g. [{'type': 'text', 'text': '...'}, ...])
    instead of a plain string. Normalize either shape to plain text.
    """
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for block in content:
            if isinstance(block, str):
                parts.append(block)
            elif isinstance(block, dict) and "text" in block:
                parts.append(block["text"])
        return "\n".join(parts).strip()
    return str(content)


def ask(question: str, document_ids: Optional[List[int]] = None, top_k: int = 5) -> CopilotAnswer:
    if not question.strip():
        raise CopilotError("Question cannot be empty")

    try:
        results = similarity_search(question, k=top_k, document_ids=document_ids)
    except VectorStoreError as exc:
        raise CopilotError(str(exc)) from exc

    if not results:
        return CopilotAnswer(
            answer=(
                "I couldn't find any relevant information in the uploaded documents. "
                "Try uploading a document related to this question, or rephrase it."
            ),
            sources=[],
        )

    context = "\n\n---\n\n".join(
        f"[{doc.metadata.get('filename')}, chunk {doc.metadata.get('chunk_index')}]\n{doc.page_content}"
        for doc, _score in results
    )

    prompt = PROMPT_TEMPLATE.format(context=context, question=question)

    model = _get_chat_model()
    try:
        response = model.invoke(prompt)
    except Exception as exc:
        raise CopilotError(f"Gemini request failed: {exc}") from exc

    answer_text = _extract_answer_text(response.content) if hasattr(response, "content") else str(response)

    sources = [
        CopilotSource(
            document_id=doc.metadata.get("document_id"),
            filename=doc.metadata.get("filename", "unknown"),
            chunk_index=doc.metadata.get("chunk_index", 0),
            snippet=_snippet(doc.page_content),
            score=float(score),
        )
        for doc, score in results
    ]

    return CopilotAnswer(answer=answer_text, sources=sources)