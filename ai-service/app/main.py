from __future__ import annotations

import os
import uuid
from typing import Any, Literal

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from pydantic import BaseModel, Field

from ytrag.answer import answer as rag_answer, answer_from_context
from ytrag.config import EMBED_MODEL, TOP_K
from ytrag.index import search as qdrant_search
from ytrag.ingestion import (
    UploadValidationError,
    extract_pdf_pages,
    make_pdf_chunks,
    make_text_chunks,
    validate_pdf_upload,
)
from ytrag.uploads import UploadChunk, list_documents as list_uploaded_documents, search_document, upsert_chunks

app = FastAPI(title="Pratyush Lecture RAG AI Service", version="lecture-rag.ai.v1")

class AnswerRequest(BaseModel):
    question: str = Field(min_length=3, max_length=500)
    top_k: int = Field(default=TOP_K, ge=1, le=10)
    video_id: str | None = None

class SearchRequest(BaseModel):
    question: str = Field(min_length=3, max_length=500)
    top_k: int = Field(default=TOP_K, ge=1, le=10)
    video_id: str | None = None


class TextIngestRequest(BaseModel):
    title: str = Field(min_length=1, max_length=240)
    text: str = Field(min_length=1, max_length=2_000_000)
    doc_id: str | None = Field(default=None, min_length=1, max_length=120)


class ScopedAnswerRequest(BaseModel):
    question: str = Field(min_length=3, max_length=500)
    scope: Literal["lectures", "uploads", "both"] = "lectures"
    doc_id: str | None = Field(default=None, min_length=1, max_length=120)
    top_k: int = Field(default=TOP_K, ge=1, le=10)


NOT_FOUND = "It is not found in your material."

@app.get("/health")
def health() -> dict[str, Any]:
    return {"ok": True, "service": "pratyush-lecture-rag", "boundary_version": "lecture-rag.ai.v1"}

@app.get("/ready")
def ready() -> dict[str, Any]:
    configured = bool(os.getenv("QDRANT_URL") and os.getenv("QDRANT_API_KEY"))
    if not configured:
        raise HTTPException(status_code=503, detail="Qdrant credentials are not configured")
    return {"ready": True, "embedding_model": EMBED_MODEL}

@app.post("/v1/answers")
def answer(request: AnswerRequest) -> dict[str, Any]:
    result = rag_answer(request.question, top_k=request.top_k, video_id=request.video_id)
    return {**result, "boundary_version": "lecture-rag.ai.v1", "model": os.getenv("YTRAG_LLM_MODEL", "configured-ytrag-provider")}

@app.post("/v1/search")
def search(request: SearchRequest) -> dict[str, Any]:
    hits = qdrant_search(request.question, top_k=request.top_k, video_id=request.video_id)
    return {
        "boundary_version": "lecture-rag.ai.v1",
        "embedding_model": EMBED_MODEL,
        "results": [{
            "id": f"{chunk.video_id}:{chunk.start_sec}",
            "title": chunk.title,
            "video_id": chunk.video_id,
            "start_sec": chunk.start_sec,
            "end_sec": chunk.end_sec,
            "timestamp": chunk.timestamp,
            "url": chunk.url,
            "distance": distance,
        } for chunk, distance in hits],
    }


def _ingest_response(doc_id: str, source_type: str, chunks: list[UploadChunk], title: str) -> dict[str, Any]:
    upserted = upsert_chunks(chunks)
    return {
        "doc_id": doc_id,
        "source_id": doc_id,
        "source_type": source_type,
        "title": title,
        "status": "complete",
        "chunks": upserted,
    }


@app.post("/ingest/text")
def ingest_text(request: TextIngestRequest) -> dict[str, Any]:
    doc_id = request.doc_id or str(uuid.uuid4())
    try:
        chunks = make_text_chunks(doc_id, request.title.strip(), request.text)
        return _ingest_response(doc_id, "text", chunks, request.title.strip())
    except UploadValidationError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@app.post("/ingest/pdf")
async def ingest_pdf(
    file: UploadFile = File(...),
    title: str | None = Form(default=None, max_length=240),
    doc_id: str | None = Form(default=None, min_length=1, max_length=120),
) -> dict[str, Any]:
    data = await file.read(20 * 1024 * 1024 + 1)
    try:
        validate_pdf_upload(file.filename, file.content_type, data)
        document_id = doc_id or str(uuid.uuid4())
        document_title = (title or os.path.splitext(file.filename or "Study material")[0]).strip()
        chunks = make_pdf_chunks(document_id, document_title, extract_pdf_pages(data))
        return _ingest_response(document_id, "pdf", chunks, document_title)
    except UploadValidationError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    finally:
        await file.close()


@app.get("/uploads/documents")
def documents() -> dict[str, Any]:
    return {"documents": list_uploaded_documents()}


def _lecture_sources(question: str, top_k: int) -> list[tuple[dict[str, Any], dict[str, str]]]:
    sources: list[tuple[dict[str, Any], dict[str, str]]] = []
    for chunk, distance in qdrant_search(question, top_k=top_k):
        citation = {
            "source_type": "video",
            "source_id": chunk.video_id,
            "title": chunk.video_title,
            "timestamp": chunk.timestamp,
            "page": None,
            "snippet": chunk.text[:500],
            "distance": round(distance, 4),
        }
        excerpt = {"label": f"{chunk.video_title} @ {chunk.timestamp}", "text": chunk.text}
        sources.append((citation, excerpt))
    return sources


def _upload_sources(question: str, doc_id: str, top_k: int) -> list[tuple[dict[str, Any], dict[str, str]]]:
    sources: list[tuple[dict[str, Any], dict[str, str]]] = []
    for chunk, distance in search_document(question, doc_id=doc_id, top_k=top_k):
        citation = {
            "source_type": chunk.source_type,
            "source_id": chunk.source_id,
            "title": chunk.title,
            "timestamp": chunk.timestamp,
            "page": chunk.page,
            "snippet": chunk.text[:500],
            "distance": round(distance, 4),
        }
        location = f"page {chunk.page}" if chunk.page is not None else "uploaded text"
        excerpt = {"label": f"{chunk.title} ({location})", "text": chunk.text}
        sources.append((citation, excerpt))
    return sources


def _extractive_fallback(excerpts: list[dict[str, str]]) -> str:
    """A safe provider-failure fallback: quote retrieved material, never infer."""
    if not excerpts:
        return NOT_FOUND
    text = excerpts[0]["text"].strip()
    return f"Based on your material: {text[:700]}{'…' if len(text) > 700 else ''}"


@app.post("/v1/answers/scoped")
def scoped_answer(request: ScopedAnswerRequest) -> dict[str, Any]:
    if request.scope in {"uploads", "both"} and not request.doc_id:
        raise HTTPException(status_code=422, detail="doc_id is required when searching uploads.")

    matches: list[tuple[dict[str, Any], dict[str, str]]] = []
    if request.scope in {"lectures", "both"}:
        matches.extend(_lecture_sources(request.question, request.top_k))
    if request.scope in {"uploads", "both"} and request.doc_id:
        matches.extend(_upload_sources(request.question, request.doc_id, request.top_k))

    if not matches:
        return {
            "answer": NOT_FOUND,
            "grounded": False,
            "mode": "refusal",
            "sources": [],
            "retrieved": 0,
        }

    citations, excerpts = zip(*matches)
    try:
        answer_text = answer_from_context(request.question, list(excerpts), NOT_FOUND)
        if NOT_FOUND.lower() in answer_text.lower():
            return {"answer": NOT_FOUND, "grounded": False, "mode": "refusal", "sources": [], "retrieved": len(matches)}
        mode = "live"
    except Exception:
        answer_text = _extractive_fallback(list(excerpts))
        mode = "extractive_fallback"
    return {
        "answer": answer_text,
        "grounded": True,
        "mode": mode,
        "sources": list(citations),
        "retrieved": len(matches),
    }
