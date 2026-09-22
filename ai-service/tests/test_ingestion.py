from __future__ import annotations

import io

import pymupdf
import pytest
from fastapi.testclient import TestClient
from reportlab.pdfgen import canvas

from app import main
from ytrag.ingestion import ScannedPdfError, chunk_text, extract_pdf_pages, make_pdf_chunks
from ytrag.uploads import UploadChunk, document_filter


def sample_pdf() -> bytes:
    output = io.BytesIO()
    pdf = canvas.Canvas(output)
    pdf.drawString(72, 720, "AlgoSeek Study Guide")
    pdf.drawString(72, 690, "Dynamic programming stores answers to overlapping subproblems.")
    pdf.showPage()
    pdf.drawString(72, 720, "AlgoSeek Study Guide")
    pdf.drawString(72, 690, "Binary search repeatedly halves a sorted search space.")
    pdf.save()
    return output.getvalue()


def test_pdf_extractor_keeps_one_based_pages_and_removes_repeated_header():
    pages = extract_pdf_pages(sample_pdf())
    assert [page.page for page in pages] == [1, 2]
    assert "Dynamic programming" in pages[0].text
    assert "Binary search" in pages[1].text
    assert "AlgoSeek Study Guide" not in pages[0].text
    chunks = make_pdf_chunks("doc-a", "Guide", pages)
    assert [chunk.page for chunk in chunks] == [1, 2]


def test_scanned_pdf_is_refused_without_ocr_guessing():
    document = pymupdf.open()
    document.new_page()
    with pytest.raises(ScannedPdfError, match="scanned"):
        extract_pdf_pages(document.tobytes())


def test_chunker_keeps_code_block_and_definition_intact():
    material = "Definition: memoization caches results.\n\n```python\ndef solve(n):\n    return n + 1\n```\n\n" + ("A regular sentence about dynamic programming. " * 350)
    chunks = chunk_text(material)
    assert any("Definition: memoization caches results." in chunk and "return n + 1" in chunk for chunk in chunks)
    assert all(chunk.count("```") in {0, 2} for chunk in chunks)


def test_upload_payload_requires_page_for_pdf_and_keeps_doc_id_filter():
    chunk = UploadChunk(doc_id="doc-a", source_type="pdf", source_id="doc-a", title="Guide", text="Binary search", chunk_index=0, page=1)
    assert chunk.to_payload()["doc_id"] == "doc-a"
    assert chunk.to_payload()["page"] == 1
    predicate = document_filter("doc-a").must[0]
    assert predicate.key == "doc_id"
    assert predicate.match.value == "doc-a"


def test_scoped_answer_refuses_empty_retrieval_for_each_scope(monkeypatch):
    monkeypatch.setattr(main, "_lecture_sources", lambda *args: [])
    monkeypatch.setattr(main, "_upload_sources", lambda *args: [])
    client = TestClient(main.app)
    for scope, doc_id in (("lectures", None), ("uploads", "doc-a"), ("both", "doc-a")):
        response = client.post("/v1/answers/scoped", json={"question": "Explain quantum chromodynamics", "scope": scope, "doc_id": doc_id})
        assert response.status_code == 200
        assert response.json() == {"answer": main.NOT_FOUND, "grounded": False, "mode": "refusal", "sources": [], "retrieved": 0}


def test_scoped_answer_passes_only_requested_doc_id_to_upload_retrieval(monkeypatch):
    observed: list[str] = []

    def uploaded(_question: str, doc_id: str, _top_k: int):
        observed.append(doc_id)
        return [
            ({"source_type": "text", "source_id": doc_id, "title": "Private notes", "timestamp": None, "page": None, "snippet": "Only this document", "distance": 0.1}, {"label": "Private notes", "text": "Only this document"})
        ]

    monkeypatch.setattr(main, "_upload_sources", uploaded)
    monkeypatch.setattr(main, "answer_from_context", lambda *_args: "Only this document [1]")
    client = TestClient(main.app)
    response = client.post("/v1/answers/scoped", json={"question": "What is in this?", "scope": "uploads", "doc_id": "doc-a"})
    assert response.status_code == 200
    assert observed == ["doc-a"]
    assert response.json()["sources"][0]["source_id"] == "doc-a"
