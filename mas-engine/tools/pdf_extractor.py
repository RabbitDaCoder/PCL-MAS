# Downloads a material's PDF file and extracts its text — the only place PDF parsing happens.
import requests
from pypdf import PdfReader
from io import BytesIO

_MAX_CHARS_PER_DOC = 8000
_DOWNLOAD_TIMEOUT_SECONDS = 15


def extract_text_from_pdf_url(url: str) -> str:
    """Downloads the PDF at `url` and returns its extracted text, truncated to a safe prompt
    size. Returns an empty string (never raises) if the download or parse fails — a bad material
    shouldn't block generation for the rest of the class's materials."""
    try:
        response = requests.get(url, timeout=_DOWNLOAD_TIMEOUT_SECONDS)
        response.raise_for_status()
        reader = PdfReader(BytesIO(response.content))
        text = "\n".join(page.extract_text() or "" for page in reader.pages)
        return text[:_MAX_CHARS_PER_DOC]
    except Exception:
        return ""


def extract_text_from_pdf_urls(urls: list[str]) -> str:
    """Extracts and concatenates text from multiple material PDFs, each labeled so the LLM can
    still tell which material a chunk of text came from."""
    chunks = []
    for index, url in enumerate(urls, start=1):
        text = extract_text_from_pdf_url(url)
        if text:
            chunks.append(f"--- Material {index} ---\n{text}")
    return "\n\n".join(chunks)
