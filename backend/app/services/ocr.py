"""
OCR / text-extraction service.

Strategy per file type:

- PDF: PyMuPDF (fitz) pulls the embedded text layer per page. If a page's
  embedded text is empty or near-empty (a strong signal the page is a
  scanned image with no text layer), that page is rasterized and passed
  through RapidOCR instead. A single PDF with a mix of real text pages
  and scanned pages is handled correctly, page by page.
- Images (png/jpg/jpeg/webp/gif): always go through RapidOCR directly.
- txt / docx: read directly, no OCR needed.

RapidOCR (onnxruntime-based) is used instead of pytesseract so no
external system binary (Tesseract) needs to be installed -- everything
is a pure pip install, self-contained inside the project's virtualenv.

This runs synchronously, inline with the upload request, for simplicity.
In production this would move to a background task queue (Celery / RQ)
so large scanned PDFs don't block the HTTP request.
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Optional

import fitz  # PyMuPDF
import numpy as np
from PIL import Image
from rapidocr_onnxruntime import RapidOCR

MIN_EMBEDDED_TEXT_CHARS = 20
OCR_RENDER_ZOOM = 2.0
IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp", ".gif"}

_ocr_engine: Optional[RapidOCR] = None


def _get_engine() -> RapidOCR:
    global _ocr_engine
    if _ocr_engine is None:
        _ocr_engine = RapidOCR()
    return _ocr_engine


class OcrError(Exception):
    """Raised when text extraction fails for a document."""


@dataclass
class OcrResult:
    text: str
    page_count: Optional[int]
    used_ocr: bool


def _ocr_image(image: Image.Image) -> str:
    engine = _get_engine()
    result, _elapse = engine(np.array(image.convert("RGB")))
    if not result:
        return ""
    return "\n".join(line[1] for line in result).strip()


def extract_text(file_path: Path, extension: str) -> OcrResult:
    ext = extension.lower()

    if ext == ".pdf":
        return _extract_from_pdf(file_path)
    if ext in IMAGE_EXTENSIONS:
        return _extract_from_image(file_path)
    if ext == ".txt":
        return _extract_from_txt(file_path)
    if ext == ".docx":
        return _extract_from_docx(file_path)

    raise OcrError(f"No text extraction strategy for '{ext}' files")


def _extract_from_pdf(file_path: Path) -> OcrResult:
    try:
        doc = fitz.open(file_path)
    except Exception as exc:
        raise OcrError(f"Could not open PDF: {exc}") from exc

    page_texts: list[str] = []
    used_ocr = False

    try:
        for page in doc:
            embedded_text = page.get_text().strip()

            if len(embedded_text) >= MIN_EMBEDDED_TEXT_CHARS:
                page_texts.append(embedded_text)
                continue

            used_ocr = True
            matrix = fitz.Matrix(OCR_RENDER_ZOOM, OCR_RENDER_ZOOM)
            pixmap = page.get_pixmap(matrix=matrix)
            image = Image.frombytes("RGB", (pixmap.width, pixmap.height), pixmap.samples)

            try:
                ocr_text = _ocr_image(image)
            except Exception as exc:
                raise OcrError(f"OCR failed on page {page.number + 1}: {exc}") from exc

            page_texts.append(ocr_text)

        page_count = doc.page_count
    finally:
        doc.close()

    combined = "\n\n".join(text for text in page_texts if text)
    return OcrResult(text=combined, page_count=page_count, used_ocr=used_ocr)


def _extract_from_image(file_path: Path) -> OcrResult:
    try:
        image = Image.open(file_path)
        image.load()
    except Exception as exc:
        raise OcrError(f"Could not open image: {exc}") from exc

    try:
        text = _ocr_image(image)
    except Exception as exc:
        raise OcrError(f"OCR failed: {exc}") from exc

    return OcrResult(text=text, page_count=1, used_ocr=True)


def _extract_from_txt(file_path: Path) -> OcrResult:
    try:
        text = file_path.read_text(encoding="utf-8", errors="replace")
    except OSError as exc:
        raise OcrError(f"Could not read text file: {exc}") from exc

    return OcrResult(text=text.strip(), page_count=None, used_ocr=False)


def _extract_from_docx(file_path: Path) -> OcrResult:
    try:
        import docx
    except ImportError as exc:
        raise OcrError(
            "python-docx is not installed. Add 'python-docx' to requirements.txt."
        ) from exc

    try:
        document = docx.Document(str(file_path))
    except Exception as exc:
        raise OcrError(f"Could not open DOCX: {exc}") from exc

    paragraphs = [p.text for p in document.paragraphs if p.text.strip()]
    return OcrResult(text="\n".join(paragraphs), page_count=None, used_ocr=False)