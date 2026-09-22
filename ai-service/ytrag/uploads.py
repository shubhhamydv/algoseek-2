"""Qdrant data model and storage boundary for user-provided material.

Lecture points remain owned by :mod:`ytrag.index`.  This module has a separate
collection namespace so uploads can be filtered by document without ever
altering or mixing with the lecture corpus.
"""

from __future__ import annotations

import uuid
from dataclasses import dataclass
from typing import Literal

from qdrant_client.models import (
    Distance,
    FieldCondition,
    Filter,
    MatchValue,
    PayloadSchemaType,
    PointStruct,
    VectorParams,
)

from ytrag.config import (
    QDRANT_URL,
    UPLOAD_COLLECTION,
    UPLOAD_PDF_MAX_DISTANCE,
    UPLOAD_TEXT_MAX_DISTANCE,
    UPLOAD_UPSERT_BATCH,
)
from ytrag.index import get_client
from ytrag.embed import get_embedder
from ytrag.util import with_retry

UploadSourceType = Literal["video", "pdf", "text"]

# A separate namespace avoids a UUID collision with lecture chunk IDs even if
# two human-readable identifiers happen to have the same text.
_UPLOAD_NAMESPACE = uuid.UUID("1593c932-a735-4a8c-a51d-8c8afc07a71d")


@dataclass(frozen=True)
class UploadChunk:
    """One source-attributed chunk from a single uploaded document.

    ``doc_id`` is deliberately present in addition to ``source_id``. The
    latter is the public source identifier required by the common payload
    contract; the former is the mandatory retrieval boundary used to prevent
    chunks from one upload appearing in another upload's answer.
    """

    doc_id: str
    source_type: UploadSourceType
    source_id: str
    title: str
    text: str
    chunk_index: int
    timestamp: int | None = None
    page: int | None = None

    def __post_init__(self) -> None:
        if not self.doc_id.strip():
            raise ValueError("doc_id must not be blank")
        if not self.source_id.strip():
            raise ValueError("source_id must not be blank")
        if not self.title.strip():
            raise ValueError("title must not be blank")
        if not self.text.strip():
            raise ValueError("text must not be blank")
        if self.chunk_index < 0:
            raise ValueError("chunk_index must be non-negative")
        if self.source_type == "video":
            if self.timestamp is None or self.timestamp < 0 or self.page is not None:
                raise ValueError("video chunks require a non-negative timestamp and no page")
        elif self.source_type == "pdf":
            if self.page is None or self.page < 1 or self.timestamp is not None:
                raise ValueError("PDF chunks require a one-based page and no timestamp")
        elif self.source_type == "text":
            if self.timestamp is not None or self.page is not None:
                raise ValueError("text chunks cannot have a timestamp or page")
        else:
            raise ValueError(f"unsupported source_type: {self.source_type}")

    @property
    def point_id(self) -> str:
        return str(uuid.uuid5(_UPLOAD_NAMESPACE, f"{self.doc_id}:{self.chunk_index}"))

    def to_payload(self) -> dict[str, str | int]:
        payload: dict[str, str | int] = {
            "source_type": self.source_type,
            "source_id": self.source_id,
            "doc_id": self.doc_id,
            "title": self.title,
            "text": self.text,
            "chunk_index": self.chunk_index,
        }
        if self.timestamp is not None:
            payload["timestamp"] = self.timestamp
        if self.page is not None:
            payload["page"] = self.page
        return payload

    @classmethod
    def from_payload(cls, payload: dict) -> "UploadChunk":
        return cls(
            doc_id=str(payload["doc_id"]),
            source_type=payload["source_type"],
            source_id=str(payload["source_id"]),
            title=str(payload["title"]),
            text=str(payload["text"]),
            chunk_index=int(payload["chunk_index"]),
            timestamp=int(payload["timestamp"]) if payload.get("timestamp") is not None else None,
            page=int(payload["page"]) if payload.get("page") is not None else None,
        )


def collection_name() -> str:
    """Name the isolated uploads collection for the active embedding space."""
    return f"{UPLOAD_COLLECTION}_{get_embedder().dim}"


def ensure_collection() -> str:
    """Create the uploads collection and its filter indexes if missing.

    This never reads, writes, recreates, or otherwise changes the lecture
    collection. Qdrant's embedded mode supports payload filtering without
    secondary indexes, so indexes are created only for a server deployment.
    """
    client = get_client()
    name = collection_name()
    if not client.collection_exists(name):
        client.create_collection(
            collection_name=name,
            vectors_config=VectorParams(
                size=get_embedder().dim,
                distance=Distance.COSINE,
            ),
        )
        if QDRANT_URL:
            for field_name in ("source_id", "source_type", "doc_id"):
                client.create_payload_index(
                    collection_name=name,
                    field_name=field_name,
                    field_schema=PayloadSchemaType.KEYWORD,
                )
    return name


def upsert_chunks(chunks: list[UploadChunk], batch_size: int = UPLOAD_UPSERT_BATCH) -> int:
    """Embed and idempotently upsert chunks into the uploads collection."""
    if not chunks:
        return 0
    if batch_size < 1:
        raise ValueError("batch_size must be positive")

    name = ensure_collection()
    client = get_client()
    embedder = get_embedder()
    total = 0
    for start in range(0, len(chunks), batch_size):
        batch = chunks[start : start + batch_size]
        vectors = embedder.embed_documents([chunk.text for chunk in batch])
        points = [
            PointStruct(id=chunk.point_id, vector=vector, payload=chunk.to_payload())
            for chunk, vector in zip(batch, vectors)
        ]
        with_retry(
            lambda: client.upsert(collection_name=name, points=points, wait=True),
            label=f"upsert {len(points)} upload chunks",
        )
        total += len(points)
    return total


def document_filter(doc_id: str) -> Filter:
    """Return the mandatory Qdrant filter for one uploaded document."""
    if not doc_id.strip():
        raise ValueError("doc_id must not be blank")
    return Filter(must=[FieldCondition(key="doc_id", match=MatchValue(value=doc_id))])


def max_distance_for(source_type: UploadSourceType) -> float:
    """Return the configured grounding cutoff for one upload source type."""
    if source_type == "pdf":
        return UPLOAD_PDF_MAX_DISTANCE
    if source_type in {"text", "video"}:
        return UPLOAD_TEXT_MAX_DISTANCE
    raise ValueError(f"unsupported source_type: {source_type}")


def search_document(query: str, doc_id: str, top_k: int = 6) -> list[tuple[UploadChunk, float]]:
    """Retrieve only chunks belonging to one document, already thresholded."""
    if not query.strip():
        return []
    if not 1 <= top_k <= 10:
        raise ValueError("top_k must be between 1 and 10")
    name = ensure_collection()
    results = get_client().query_points(
        collection_name=name,
        query=get_embedder().embed_query(query),
        query_filter=document_filter(doc_id),
        limit=max(top_k * 4, 20),
        with_payload=True,
    ).points
    hits: list[tuple[UploadChunk, float]] = []
    for point in results:
        chunk = UploadChunk.from_payload(point.payload or {})
        distance = 1.0 - float(point.score)
        if distance <= max_distance_for(chunk.source_type):
            hits.append((chunk, distance))
    return hits[:top_k]


def list_documents() -> list[dict[str, str | int]]:
    """List upload metadata reconstructed from the isolated Qdrant collection."""
    name = ensure_collection()
    documents: dict[str, dict[str, str | int]] = {}
    offset = None
    while True:
        points, offset = get_client().scroll(
            collection_name=name,
            limit=256,
            offset=offset,
            with_payload=["doc_id", "source_id", "source_type", "title"],
            with_vectors=False,
        )
        for point in points:
            payload = point.payload or {}
            doc_id = str(payload.get("doc_id", ""))
            if not doc_id:
                continue
            entry = documents.setdefault(
                doc_id,
                {
                    "doc_id": doc_id,
                    "source_id": str(payload.get("source_id", doc_id)),
                    "source_type": str(payload.get("source_type", "text")),
                    "title": str(payload.get("title", "Untitled upload")),
                    "chunks": 0,
                },
            )
            entry["chunks"] = int(entry["chunks"]) + 1
        if offset is None:
            break
    return sorted(documents.values(), key=lambda document: str(document["title"]).lower())
