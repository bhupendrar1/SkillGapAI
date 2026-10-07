"""
PDF Text Extraction Service using PyMuPDF (fitz).

Extracts raw and normalized text from candidate resumes uploaded in PDF format.
Includes validation and edge case handling (empty files, scanned documents without text).
"""

import re
import io
from typing import Tuple

try:
    import pymupdf as fitz
except ImportError:
    import fitz


class PDFExtractionError(Exception):
    """Custom exception raised when PDF parsing encounters an unrecoverable issue."""
    pass


def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> Tuple[str, int]:
    """
    Extracts text from PDF byte content.
    
    Args:
        pdf_bytes: Raw bytes of uploaded PDF.
        
    Returns:
        Tuple of (extracted_text, page_count)
        
    Raises:
        PDFExtractionError: If PDF cannot be opened, is empty, or is corrupted.
    """
    if not pdf_bytes or len(pdf_bytes) == 0:
        raise PDFExtractionError("Uploaded PDF file is empty (0 bytes).")

    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    except Exception as e:
        raise PDFExtractionError(f"Failed to open PDF document: {str(e)}")

    page_count = len(doc)
    if page_count == 0:
        doc.close()
        raise PDFExtractionError("PDF document contains no pages.")

    extracted_pages = []
    for page_idx in range(page_count):
        try:
            page = doc[page_idx]
            text = page.get_text("text")
            if text:
                extracted_pages.append(text)
        except Exception as e:
            # Continue extracting remaining pages if a single page fails
            continue

    doc.close()

    full_text = "\n".join(extracted_pages).strip()

    if not full_text:
        raise PDFExtractionError(
            "No extractable text found in PDF. The document may be an image scan or protected."
        )

    # Normalize whitespace while preserving paragraphs
    normalized_text = clean_extracted_text(full_text)
    return normalized_text, page_count


def clean_extracted_text(text: str) -> str:
    """
    Cleans raw text extracted from PDF:
    - Normalizes line breaks and whitespace
    - Strips non-printable artifacts
    - Retains semantic punctuation and casing
    """
    # Replace carriage returns
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    # Replace multiple blank lines with double newline
    text = re.sub(r"\n\s*\n+", "\n\n", text)
    # Replace multiple inline spaces/tabs with single space
    text = re.sub(r"[ \t]+", " ", text)
    return text.strip()

