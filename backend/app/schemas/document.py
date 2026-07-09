"""Pydantic schemas for the documents API."""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class DocumentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    original_filename: str
    content_type: str
    extension: str
    size_bytes: int
    status: str
    uploaded_at: datetime

    ocr_status: str
    extracted_text: Optional[str] = None
    page_count: Optional[int] = None
    ocr_error: Optional[str] = None


class DocumentUploadResult(BaseModel):
    filename: str
    success: bool
    document: Optional[DocumentOut] = None
    error: Optional[str] = None


class OcrTextOut(BaseModel):
    id: int
    ocr_status: str
    extracted_text: Optional[str] = None
    page_count: Optional[int] = None
    ocr_error: Optional[str] = None