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


class DocumentUploadResult(BaseModel):
    filename: str
    success: bool
    document: Optional[DocumentOut] = None
    error: Optional[str] = None