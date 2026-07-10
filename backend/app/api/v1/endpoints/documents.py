"""
Document endpoints.

- POST   /documents             upload one or more files, save to disk,
                                 run OCR/text extraction, embed into FAISS,
                                 persist metadata
- GET    /documents              list all documents (most recent first)
- GET    /documents/{id}/text    fetch just the extracted text for one document
- POST   /documents/{id}/ocr     re-run OCR/text extraction for one document
- POST   /documents/{id}/embed   re-run embedding for one document
- DELETE /documents/{id}         remove a document's file, FAISS chunks, and DB row
"""

import uuid
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.document import Document
from app.schemas.document import DocumentOut, DocumentUploadResult, OcrTextOut
from app.services.ocr import OcrError, extract_text
from app.services.vectorstore import VectorStoreError, add_document_chunks, remove_document

router = APIRouter()

UPLOAD_DIR = Path(settings.UPLOAD_DIR)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


def _validate_file(filename: str, size_bytes: int) -> str:
    ext = Path(filename).suffix.lower()
    if ext not in settings.allowed_extensions_list:
        allowed = ", ".join(settings.allowed_extensions_list)
        raise ValueError(f"'{ext or 'unknown'}' is not supported. Allowed types: {allowed}")

    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if size_bytes > max_bytes:
        raise ValueError(f"File exceeds the {settings.MAX_UPLOAD_SIZE_MB}MB limit")

    if size_bytes == 0:
        raise ValueError("File is empty")

    return ext


def _run_ocr(document: Document, db: Session) -> None:
    document.ocr_status = "processing"
    db.add(document)
    db.commit()

    file_path = UPLOAD_DIR / document.stored_filename

    try:
        result = extract_text(file_path, document.extension)
    except OcrError as exc:
        document.ocr_status = "error"
        document.ocr_error = str(exc)
        db.add(document)
        db.commit()
        return
    except Exception as exc:
        document.ocr_status = "error"
        document.ocr_error = f"Unexpected error: {exc}"
        db.add(document)
        db.commit()
        return

    document.extracted_text = result.text
    document.page_count = result.page_count
    document.ocr_status = "done"
    document.ocr_error = None
    db.add(document)
    db.commit()
    db.refresh(document)


def _run_embedding(document: Document, db: Session) -> None:
    if not document.extracted_text or not document.extracted_text.strip():
        document.embedding_status = "error"
        document.embedding_error = "No extracted text to embed (run OCR first)"
        db.add(document)
        db.commit()
        return

    document.embedding_status = "processing"
    db.add(document)
    db.commit()

    try:
        chunk_count = add_document_chunks(
            document.id, document.original_filename, document.extracted_text
        )
    except VectorStoreError as exc:
        document.embedding_status = "error"
        document.embedding_error = str(exc)
        db.add(document)
        db.commit()
        return
    except Exception as exc:
        document.embedding_status = "error"
        document.embedding_error = f"Unexpected error: {exc}"
        db.add(document)
        db.commit()
        return

    document.embedding_status = "done"
    document.embedding_error = None
    document.chunk_count = chunk_count
    db.add(document)
    db.commit()
    db.refresh(document)


@router.post("", response_model=List[DocumentUploadResult])
async def upload_documents(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
) -> List[DocumentUploadResult]:
    results: List[DocumentUploadResult] = []

    for upload in files:
        original_name = upload.filename or "unknown"
        raw = await upload.read()

        try:
            ext = _validate_file(original_name, len(raw))
        except ValueError as exc:
            results.append(
                DocumentUploadResult(filename=original_name, success=False, error=str(exc))
            )
            continue

        stored_filename = f"{uuid.uuid4().hex}{ext}"
        destination = UPLOAD_DIR / stored_filename

        try:
            destination.write_bytes(raw)
        except OSError as exc:
            results.append(
                DocumentUploadResult(
                    filename=original_name, success=False, error=f"Could not save file: {exc}"
                )
            )
            continue

        document = Document(
            original_filename=original_name,
            stored_filename=stored_filename,
            content_type=upload.content_type or "application/octet-stream",
            extension=ext,
            size_bytes=len(raw),
            status="uploaded",
            ocr_status="pending",
            embedding_status="pending",
        )
        db.add(document)
        db.commit()
        db.refresh(document)

        _run_ocr(document, db)
        if document.ocr_status == "done":
            _run_embedding(document, db)

        results.append(
            DocumentUploadResult(
                filename=original_name,
                success=True,
                document=DocumentOut.model_validate(document),
            )
        )

    return results


@router.get("", response_model=List[DocumentOut])
def list_documents(db: Session = Depends(get_db)) -> List[Document]:
    stmt = select(Document).order_by(Document.uploaded_at.desc())
    return list(db.execute(stmt).scalars().all())


@router.get("/{document_id}/text", response_model=OcrTextOut)
def get_document_text(document_id: int, db: Session = Depends(get_db)) -> Document:
    document: Optional[Document] = db.get(Document, document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found")
    return document


@router.post("/{document_id}/ocr", response_model=DocumentOut)
def rerun_ocr(document_id: int, db: Session = Depends(get_db)) -> Document:
    document: Optional[Document] = db.get(Document, document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found")

    _run_ocr(document, db)
    return document


@router.post("/{document_id}/embed", response_model=DocumentOut)
def rerun_embedding(document_id: int, db: Session = Depends(get_db)) -> Document:
    document: Optional[Document] = db.get(Document, document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found")

    _run_embedding(document, db)
    return document


@router.delete("/{document_id}", status_code=204)
def delete_document(document_id: int, db: Session = Depends(get_db)) -> None:
    document: Optional[Document] = db.get(Document, document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found")

    file_path = UPLOAD_DIR / document.stored_filename
    if file_path.exists():
        file_path.unlink()

    try:
        remove_document(document_id)
    except Exception:
        pass

    db.delete(document)
    db.commit()
    return None