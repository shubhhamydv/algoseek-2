"""Safe extraction and structure-aware chunking for user uploads."""

from __future__ import annotations

import io
import math
import re
from collections import Counter
from dataclasses import dataclass
from typing import Iterable

import pymupdf

from ytrag.uploads import UploadChunk

MAX_UPLOAD_BYTES = 20 * 1024 * 1024
DEFAULT_CHUNK_TOKENS = 650
DEFAULT_OVERLAP_TOKENS = 100
_TOKEN_RE = re.compile(r"\w+|[^\w\s]", re.UNICODE)
_FENCED_CODE_RE = re.compile(r"```.*?```", re.DOTALL)
_HEADING_RE = re.compile(r"^(?:#{1,6}\s+|(?:definition|theorem|lemma|proof|note)\s*[:.-])", re.IGNORECASE)


class UploadValidationError(ValueError):
    """Raised when a supplied upload is not an acceptable source document."""


class ScannedPdfError(UploadValidationError):
    """Raised when a PDF contains no extractable text layer."""


@dataclass(frozen=True)
class ExtractedPage:
    page: int
    text: str


def validate_pdf_upload(filename: str | None, content_type: str | None, data: bytes) -> None:
    """Validate the file name, MIME type, signature, and 20 MB size limit."""
    if not filename or not filename.lower().endswith(".pdf"):
        raise UploadValidationError("Only .pdf files are accepted.")
    if content_type and content_type.lower() not in {"application/pdf", "application/octet-stream"}:
        raise UploadValidationError("The uploaded file must have PDF content type.")
    if not data:
        raise UploadValidationError("The uploaded PDF is empty.")
    if len(data) > MAX_UPLOAD_BYTES:
        raise UploadValidationError("PDF files must be 20 MB or smaller.")
    if not data.startswith(b"%PDF-"):
        raise UploadValidationError("The uploaded file does not have a valid PDF signature.")


def _normalise_edge_line(line: str) -> str:
    return re.sub(r"\s+", " ", line).strip().lower()


def _repeated_edge_lines(raw_pages: Iterable[str]) -> set[str]:
    pages = list(raw_pages)
    if len(pages) < 2:
        return set()
    edges: list[str] = []
    for raw in pages:
        lines = [line.strip() for line in raw.splitlines() if line.strip()]
        if lines:
            edges.extend((_normalise_edge_line(lines[0]), _normalise_edge_line(lines[-1])))
    minimum = max(2, math.ceil(len(pages) * 0.6))
    return {line for line, count in Counter(edges).items() if line and count >= minimum}


def clean_page_text(raw_text: str, repeated_edges: set[str] | None = None) -> str:
    """Remove layout noise while retaining paragraph boundaries and content."""
    repeated_edges = repeated_edges or set()
    lines = raw_text.replace("\r\n", "\n").replace("\r", "\n").split("\n")
    nonempty = [index for index, line in enumerate(lines) if line.strip()]
    edge_indexes = {nonempty[0], nonempty[-1]} if nonempty else set()
    kept = [
        line.rstrip()
        for index, line in enumerate(lines)
        if not (index in edge_indexes and _normalise_edge_line(line) in repeated_edges)
    ]
    text = "\n".join(kept)
    # PDF generators commonly wrap a hyphenated word at the end of a line.
    text = re.sub(r"(?<=\w)-\s*\n\s*(?=\w)", "", text)
    # Preserve actual paragraph breaks, but turn line-wrapped prose into one
    # readable line before chunking.
    paragraphs = []
    for paragraph in re.split(r"\n\s*\n+", text):
        flattened = re.sub(r"[ \t]*\n[ \t]*", " ", paragraph)
        flattened = re.sub(r"[ \t]+", " ", flattened).strip()
        if flattened:
            paragraphs.append(flattened)
    return "\n\n".join(paragraphs)


def extract_pdf_pages(data: bytes) -> list[ExtractedPage]:
    """Extract clean, one-based pages; fail clearly instead of guessing OCR text."""
    try:
        with pymupdf.open(stream=io.BytesIO(data), filetype="pdf") as document:
            raw_pages = [page.get_text("text", sort=True) for page in document]
    except Exception as exc:  # PyMuPDF exposes several low-level error types.
        raise UploadValidationError("The uploaded file could not be read as a PDF.") from exc

    repeated_edges = _repeated_edge_lines(raw_pages)
    pages = [
        ExtractedPage(page=index + 1, text=clean_page_text(raw, repeated_edges))
        for index, raw in enumerate(raw_pages)
    ]
    extracted_characters = sum(len(re.sub(r"\s+", "", page.text)) for page in pages)
    if not extracted_characters:
        raise ScannedPdfError(
            "This PDF appears to be scanned or image-only; no extractable text was found. "
            "Please upload a text-based PDF or OCR it first."
        )
    return pages


def estimate_tokens(text: str) -> int:
    """A deterministic local token estimate without adding another model dependency."""
    return len(_TOKEN_RE.findall(text))


def _split_regular_prose(text: str, target_tokens: int) -> list[str]:
    """Split only ordinary oversized prose at sentence boundaries."""
    if estimate_tokens(text) <= target_tokens:
        return [text]
    sentences = re.split(r"(?<=[.!?])\s+", text)
    chunks: list[str] = []
    current: list[str] = []
    current_tokens = 0
    for sentence in sentences:
        sentence = sentence.strip()
        if not sentence:
            continue
        tokens = estimate_tokens(sentence)
        if current and current_tokens + tokens > target_tokens:
            chunks.append(" ".join(current))
            current, current_tokens = [], 0
        # A single unusually long sentence is kept together. Splitting it
        # mechanically would be worse for a definition than exceeding target.
        current.append(sentence)
        current_tokens += tokens
    if current:
        chunks.append(" ".join(current))
    return chunks


def _structural_units(text: str, target_tokens: int) -> list[tuple[str, bool]]:
    """Return atomic chunks, marking code/definition units as non-splittable."""
    units: list[tuple[str, bool]] = []
    position = 0
    for match in _FENCED_CODE_RE.finditer(text):
        units.extend(_paragraph_units(text[position : match.start()], target_tokens))
        units.append((match.group(0).strip(), True))
        position = match.end()
    units.extend(_paragraph_units(text[position:], target_tokens))
    return [(unit, atomic) for unit, atomic in units if unit.strip()]


def _paragraph_units(text: str, target_tokens: int) -> list[tuple[str, bool]]:
    paragraphs = [part.strip() for part in re.split(r"\n\s*\n+", text) if part.strip()]
    units: list[tuple[str, bool]] = []
    pending_heading: str | None = None
    for paragraph in paragraphs:
        if _HEADING_RE.match(paragraph):
            if pending_heading:
                units.append((pending_heading, True))
            pending_heading = paragraph
            continue
        if pending_heading:
            units.append((f"{pending_heading}\n\n{paragraph}", True))
            pending_heading = None
        else:
            units.extend((piece, False) for piece in _split_regular_prose(paragraph, target_tokens))
    if pending_heading:
        units.append((pending_heading, True))
    return units


def chunk_text(text: str, target_tokens: int = DEFAULT_CHUNK_TOKENS, overlap_tokens: int = DEFAULT_OVERLAP_TOKENS) -> list[str]:
    """Chunk text near 650 tokens without splitting fenced code or definitions."""
    if not 500 <= target_tokens <= 800:
        raise ValueError("target_tokens must be between 500 and 800")
    if overlap_tokens < 0 or overlap_tokens >= target_tokens:
        raise ValueError("overlap_tokens must be non-negative and smaller than target_tokens")

    units = _structural_units(text.strip(), target_tokens)
    if not units:
        return []
    chunks: list[str] = []
    current: list[tuple[str, bool]] = []
    current_tokens = 0
    for unit, atomic in units:
        unit_tokens = estimate_tokens(unit)
        if current and current_tokens + unit_tokens > target_tokens:
            chunks.append("\n\n".join(item[0] for item in current))
            overlap: list[tuple[str, bool]] = []
            overlap_count = 0
            for previous in reversed(current):
                overlap.insert(0, previous)
                overlap_count += estimate_tokens(previous[0])
                if overlap_count >= overlap_tokens:
                    break
            current = overlap
            current_tokens = overlap_count
        # Code and definition units are never split, even if they are larger
        # than the target. Regular prose has already been sentence-split.
        current.append((unit, atomic))
        current_tokens += unit_tokens
    if current:
        chunks.append("\n\n".join(item[0] for item in current))
    return chunks


def make_text_chunks(doc_id: str, title: str, text: str) -> list[UploadChunk]:
    chunks = chunk_text(text)
    if not chunks:
        raise UploadValidationError("No text was found to ingest.")
    return [
        UploadChunk(
            doc_id=doc_id,
            source_type="text",
            source_id=doc_id,
            title=title,
            text=chunk,
            chunk_index=index,
        )
        for index, chunk in enumerate(chunks)
    ]


def make_pdf_chunks(doc_id: str, title: str, pages: list[ExtractedPage]) -> list[UploadChunk]:
    chunks: list[UploadChunk] = []
    for extracted_page in pages:
        for text in chunk_text(extracted_page.text):
            chunks.append(
                UploadChunk(
                    doc_id=doc_id,
                    source_type="pdf",
                    source_id=doc_id,
                    title=title,
                    text=text,
                    chunk_index=len(chunks),
                    page=extracted_page.page,
                )
            )
    if not chunks:
        raise UploadValidationError("No readable text was found in this PDF.")
    return chunks
