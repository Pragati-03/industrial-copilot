"""
FAISS-backed vector store for the AI Copilot's retrieval-augmented
generation (RAG) pipeline.

A single FAISS index holds chunks from every document. Each chunk is
stored as a LangChain `Document` with metadata (`document_id`,
`filename`, `chunk_index`) so retrieved results can be traced back to
their source file for citations.

The index is persisted to disk (`settings.FAISS_INDEX_DIR`) after every
write so it survives server restarts.
"""

from __future__ import annotations

from pathlib import Path
from typing import List, Optional, Tuple

from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document as LCDocument
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.core.config import settings

INDEX_DIR = Path(settings.FAISS_INDEX_DIR)
INDEX_DIR.mkdir(parents=True, exist_ok=True)

_embeddings: Optional[GoogleGenerativeAIEmbeddings] = None
_vectorstore: Optional[FAISS] = None


class VectorStoreError(Exception):
    """Raised when embedding or FAISS operations fail."""


def _get_embeddings() -> GoogleGenerativeAIEmbeddings:
    global _embeddings
    if _embeddings is None:
        if not settings.GOOGLE_API_KEY:
            raise VectorStoreError(
                "GOOGLE_API_KEY is not set. Add it to backend/.env to enable the AI Copilot."
            )
        _embeddings = GoogleGenerativeAIEmbeddings(
            model=settings.GEMINI_EMBEDDING_MODEL,
            google_api_key=settings.GOOGLE_API_KEY,
        )
    return _embeddings


def _index_files_exist() -> bool:
    return (INDEX_DIR / "index.faiss").exists() and (INDEX_DIR / "index.pkl").exists()


def _load_or_none() -> Optional[FAISS]:
    if not _index_files_exist():
        return None
    return FAISS.load_local(
        str(INDEX_DIR),
        _get_embeddings(),
        allow_dangerous_deserialization=True,
    )


def get_vectorstore() -> Optional[FAISS]:
    """Returns the shared FAISS store, loading it from disk on first use."""
    global _vectorstore
    if _vectorstore is None:
        _vectorstore = _load_or_none()
    return _vectorstore


def chunk_text(text: str) -> List[str]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.CHUNK_SIZE,
        chunk_overlap=settings.CHUNK_OVERLAP,
    )
    return splitter.split_text(text)


def add_document_chunks(document_id: int, filename: str, text: str) -> int:
    """
    Chunks `text`, embeds each chunk, and adds it to the shared FAISS
    index. Returns the number of chunks added. Persists the index to
    disk before returning.
    """
    global _vectorstore

    chunks = chunk_text(text)
    if not chunks:
        return 0

    lc_documents = [
        LCDocument(
            page_content=chunk,
            metadata={"document_id": document_id, "filename": filename, "chunk_index": i},
        )
        for i, chunk in enumerate(chunks)
    ]

    embeddings = _get_embeddings()

    try:
        store = get_vectorstore()
        if store is None:
            store = FAISS.from_documents(lc_documents, embeddings)
        else:
            store.add_documents(lc_documents)
        store.save_local(str(INDEX_DIR))
    except Exception as exc:
        raise VectorStoreError(f"Embedding/storage failed: {exc}") from exc

    _vectorstore = store
    return len(chunks)


def similarity_search(
    query: str, k: int = 5, document_ids: Optional[List[int]] = None
) -> List[Tuple[LCDocument, float]]:
    store = get_vectorstore()
    if store is None:
        return []

    fetch_k = k * 5 if document_ids else k
    try:
        results = store.similarity_search_with_score(query, k=fetch_k)
    except Exception as exc:
        raise VectorStoreError(f"Retrieval failed: {exc}") from exc

    if document_ids:
        results = [
            (doc, score)
            for doc, score in results
            if doc.metadata.get("document_id") in document_ids
        ]

    return results[:k]


def remove_document(document_id: int) -> None:
    """
    Removes all chunks belonging to a document from the FAISS index.
    FAISS has no direct "delete by metadata" operation in this version,
    so this rebuilds the index from the remaining chunks.
    """
    global _vectorstore

    store = get_vectorstore()
    if store is None:
        return

    remaining = [
        doc
        for doc in store.docstore._dict.values()  # noqa: SLF001 -- no public iterator API
        if doc.metadata.get("document_id") != document_id
    ]

    if not remaining:
        for name in ("index.faiss", "index.pkl"):
            path = INDEX_DIR / name
            if path.exists():
                path.unlink()
        _vectorstore = None
        return

    embeddings = _get_embeddings()
    new_store = FAISS.from_documents(remaining, embeddings)
    new_store.save_local(str(INDEX_DIR))
    _vectorstore = new_store