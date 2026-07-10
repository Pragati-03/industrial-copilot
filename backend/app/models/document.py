"""
Document model.

Tracks upload metadata, OCR extraction results, and AI Copilot embedding
status. The binary file lives on disk under settings.UPLOAD_DIR; chunk
vectors live in the FAISS index under settings.FAISS_INDEX_DIR. This row
ties both together.
"""

from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import String, Integer, DateTime, BigInteger, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class Document(Base):
    __tablename__ = "documents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    original_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    stored_filename: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)

    content_type: Mapped[str] = mapped_column(String(150), nullable=False)
    extension: Mapped[str] = mapped_column(String(20), nullable=False)
    size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)

    status: Mapped[str] = mapped_column(String(20), nullable=False, default="uploaded")
    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    # --- OCR / text extraction -------------------------------------------
    ocr_status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")
    extracted_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    page_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    ocr_error: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # --- AI Copilot / RAG embedding ---------------------------------------
    embedding_status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")
    embedding_error: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    chunk_count: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)