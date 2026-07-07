import uuid
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.db.session import get_db
from app.models.document import Document
from app.schemas.document import DocumentOut, DocumentUploadResult

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
        )
        db.add(document)
        db.commit()
        db.refresh(document)

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


@router.delete("/{document_id}", status_code=204)
def delete_document(document_id: int, db: Session = Depends(get_db)) -> None:
    document: Optional[Document] = db.get(Document, document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found")

    file_path = UPLOAD_DIR / document.stored_filename
    if file_path.exists():
        file_path.unlink()

    db.delete(document)
    db.commit()
    return None