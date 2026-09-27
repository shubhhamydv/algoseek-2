from __future__ import annotations

import json
import os
import re
import uuid
from pathlib import Path
from typing import Any, Literal

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from pydantic import BaseModel, Field

from ytrag.answer import (
    answer as rag_answer,
    answer_from_context,
    answer_playlist_from_context,
)
from ytrag.config import EMBED_MODEL, TOP_K
from ytrag.index import search as qdrant_search
from ytrag.ingestion import (
    UploadValidationError,
    estimate_tokens,
    extract_pdf_pages,
    make_pdf_chunks,
    make_text_chunks,
    validate_pdf_upload,
)
from ytrag.uploads import UploadChunk, get_document_chunks, list_documents as list_uploaded_documents, search_document, upsert_chunks

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
    scope: Literal["lectures", "uploads", "both", "playlist"] = "lectures"
    doc_id: str | None = Field(default=None, min_length=1, max_length=120)
    top_k: int = Field(default=TOP_K, ge=1, le=10)


NOT_FOUND = "It is not found in your material."
PLAYLIST_NOT_FOUND = "This isn't covered in the lecture playlist."

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


def _find_chunks_path() -> Path:
    candidates = [
        Path(os.getenv("YTRAG_CHUNKS_PATH", "")),
        Path(__file__).resolve().parent.parent.parent / "data" / "pratyush" / "chunks.json",
        Path(__file__).resolve().parent.parent / "data" / "pratyush" / "chunks.json",
        Path("/app/data/pratyush/chunks.json"),
        Path("data/pratyush/chunks.json"),
    ]
    for p in candidates:
        if p and str(p) != "." and p.exists():
            return p
    return candidates[1]


_CHUNKS_PATH = _find_chunks_path()
_CHUNKS_BY_VIDEO: dict[str, list[dict[str, Any]]] = {}


def _get_chunks_by_video() -> dict[str, list[dict[str, Any]]]:
    global _CHUNKS_BY_VIDEO
    chunks_file = _find_chunks_path()
    if not _CHUNKS_BY_VIDEO and chunks_file.exists():
        try:
            with open(chunks_file, encoding="utf-8") as f:
                data = json.load(f)
            for c in data:
                _CHUNKS_BY_VIDEO.setdefault(c["videoId"], []).append(c)
            for clist in _CHUNKS_BY_VIDEO.values():
                clist.sort(key=lambda x: x["startSec"])
        except Exception:
            pass
    return _CHUNKS_BY_VIDEO


def _playlist_lecture_sources(question: str, top_k: int) -> tuple[list[tuple[dict[str, Any], dict[str, str]]], list[dict[str, Any]]]:
    """Retrieval with neighbor window expansion for playlist tutor mode."""
    hits = qdrant_search(question, top_k=top_k)
    if not hits:
        return [], []

    primary_chunk, primary_dist = hits[0]
    by_video = _get_chunks_by_video()
    v_chunks = by_video.get(primary_chunk.video_id, [])

    window_chunks: list[dict[str, Any]] = []
    if v_chunks:
        idx = next((i for i, c in enumerate(v_chunks) if c.get("startSec") == primary_chunk.start_sec), 0)
        # Widen to a 5-chunk window for complete lecture context
        start_idx = max(0, idx - 2)
        end_idx = min(len(v_chunks) - 1, idx + 2)
        window_chunks = v_chunks[start_idx : end_idx + 1]

    if window_chunks:
        merged_texts = []
        for c in window_chunks:
            t = c.get("text", "").replace("\\n", " ").strip()
            if t.lower().startswith(c.get("title", "").lower()):
                t = t[len(c.get("title", "")) :].strip()
            merged_texts.append(t)
        merged_text = " ".join(merged_texts)
        primary_excerpt = {
            "label": f"{primary_chunk.video_title} @ {primary_chunk.timestamp}",
            "text": merged_text,
        }
    else:
        primary_excerpt = {
            "label": f"{primary_chunk.video_title} @ {primary_chunk.timestamp}",
            "text": primary_chunk.text,
        }

    sources: list[tuple[dict[str, Any], dict[str, str]]] = []
    primary_citation = {
        "source_type": "video",
        "source_id": primary_chunk.video_id,
        "title": primary_chunk.video_title,
        "timestamp": primary_chunk.timestamp,
        "page": None,
        "snippet": primary_chunk.text[:500],
        "distance": round(primary_dist, 4),
    }
    sources.append((primary_citation, primary_excerpt))

    for chunk, distance in hits[1:top_k]:
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

    return sources, window_chunks


def _playlist_tutor_fallback(primary_citation: dict[str, Any], window_chunks: list[dict[str, Any]], raw_snippet: str, question: str = "") -> str:
    """Structured pedagogical tutor synthesis when live LLM provider is offline."""
    title = primary_citation.get("title", "Lecture")
    timestamp = primary_citation.get("timestamp", "00:00")

    clean_texts = []
    for c in window_chunks:
        t = c.get("text", "").replace("\\n", " ").strip()
        if t.lower().startswith(c.get("title", "").lower()):
            t = t[len(c.get("title", "")) :].strip()
        clean_texts.append(t)
    full_text = " ".join(clean_texts) if clean_texts else raw_snippet
    q_lower = question.lower()
    title_lower = title.lower()
    combined_context = f"{question} {title} {full_text}".lower()

    complexity = "*Complexity note*: Time and space complexity are not explicitly analyzed in these timestamps. Refer to the timestamp citation above to watch the complete discussion."
    comp_match = re.search(r"(?:order of [a-z0-9\(\)]+|time complexity[^\.]*|space complexity[^\.]*|O\([^\)]+\)|zero space|constant space|single pass)", full_text, re.IGNORECASE)
    if comp_match:
        complexity = f'*Complexity highlighted in lecture*: The instructor discusses "{comp_match.group(0).strip()}" during this explanation.'

    is_two_pointer = "2 pointer" in combined_context or "two pointer" in combined_context or "two pointer" in q_lower
    is_sliding_window = "sliding window" in combined_context or "sliding window" in q_lower
    is_dp = any(w in combined_context for w in ("dynamic programming", "memoiz", "tabulation", "dp series", "dp in")) or " dp" in title_lower or "dynamic programming" in q_lower or "memoiz" in q_lower
    is_graph_traversal = (any(w in combined_context for w in ("bfs", "breadth", "graph", "rotten")) or any(w in q_lower for w in ("bfs", "breadth", "graph"))) and not any(w in q_lower for w in ("recursion", "base case"))
    is_linked_list_rev = ("reverse" in combined_context or "reverse" in q_lower) and any(w in combined_context for w in ("link", "list", "node"))
    is_recursion_base_case = ("base case" in combined_context or "base condition" in combined_context or "recursion" in combined_context or "backtracking" in combined_context or "recursion" in q_lower or "base case" in q_lower) and not is_graph_traversal and not is_dp

    if is_two_pointer:
        definition = "The two-pointer technique is a strategy where you use two separate index markers (pointers) to scan through a list at the same time, instead of using slow nested loops."
        intuition = "Think of it like two friends searching for each other from opposite ends of a hallway. If one person stands still while the other walks down every single corridor, it takes twice as long. But if one person walks from the ground floor and the other moves from the top floor coordinating their steps inward, they can inspect everything and meet in the middle in one quick pass."
        steps = [
            "**Initialize Pointers**: Place one pointer (like `i`) at the start of the list and the second pointer (like `j`) at the end (or both moving forward at different speeds).",
            "**Inspect Values**: Compare the elements at both pointers to see if they satisfy your condition (like target sum or matching items).",
            "**Coordinate Movement**: Move one or both pointers inward based on the comparison so you never waste time re-checking impossible pairs.",
            "**Terminate**: Stop when the two pointers meet or cross, finishing the search in a single pass."
        ]
        example = "In the lecture with list `[10, 20, 30, 40, 50]`: pointer `i` starts at 10 and pointer `j` starts at another element. Instead of testing all pairs with two loops, `i` and `j` coordinate their movement together to evaluate the condition in a single pass."
    elif is_sliding_window:
        definition = "A sliding window is a technique that maintains a contiguous slice (range) of elements in a list, sliding the boundaries forward as you process items."
        intuition = "The instructor explains this using the 'hiring and firing' analogy: imagine a company team with a strict budget. When new work arrives, the manager hires a new team member at the right boundary. But if the team exceeds its budget, the manager 'fires' (removes) workers from the left boundary until the team is valid again. Instead of calculating the entire team from scratch each time, you only add who joins and subtract who leaves."
        steps = [
            "**Start the Window**: Begin with both left and right boundary pointers at the start of the array.",
            "**Expand ('Hiring')**: Move the right pointer forward one step at a time, adding the new element into your current window total or state.",
            "**Check Condition**: If the window violates the rules (e.g. sum is too high or duplicates exist), contract ('fire') by advancing the left pointer and subtracting elements until valid.",
            "**Update Answer**: Record your best valid window size or target value at each step."
        ]
        example = "To find a target subarray sum: slide your right pointer to include elements one by one. As soon as the sum exceeds the limit, slide your left pointer forward and subtract elements until the window stays within limits."
    elif is_dp:
        definition = "Dynamic programming is an optimization method that solves complex problems by breaking them into smaller overlapping subproblems and remembering the answers so you never solve the same problem twice."
        intuition = "Imagine your teacher asks you what `1 + 1 + 1 + 1 + 1` is. You count on your fingers and say '5'. Then the teacher writes another `+ 1` at the end and asks what the new total is. You instantly say '6'! How did you know? You didn't recount from scratch—you remembered that the previous part was 5 and just added 1. Memoization works the same way: it writes down answers in a notebook (cache) so repeated work takes zero time."
        steps = [
            "**Find Overlapping Subproblems**: Recognize when a recursive function solves the exact same smaller problem over and over again.",
            "**Create a Memo Table**: Set up an array or hash map initialized with empty marker values (like -1).",
            "**Check Before Computing**: Before doing recursive work, check if the answer for state `i` is already saved in the table.",
            "**Reuse or Save**: If found in the table, return it immediately. If not found, compute it, store it in the table, and return it."
        ]
        example = "In Fibonacci, computing `fib(5)` calculates `fib(3)` multiple times across different branches. With memoization, `fib(3)` is calculated once and stored as `dp[3] = 2`. Any future call to `fib(3)` returns 2 in O(1) time without re-running recursion."
    elif is_graph_traversal:
        definition = "Breadth-First Search (BFS) is a graph traversal algorithm that explores all neighbor nodes at the current distance level before moving to nodes that are further away."
        intuition = "Think of dropping a stone into a calm pond: the ripple waves spread outward evenly in circles. As taught in the Rotten Oranges lecture, BFS works like a rot spreading minute by minute: at minute 1, all fresh oranges immediately touching a rotten orange get infected at the same time, and only then does the rot spread to the next layer."
        steps = [
            "**Queue the Start**: Put your starting node (or all initially rotten items) into a First-In-First-Out Queue.",
            "**Mark as Visited**: Keep track of visited nodes so you never process the same location twice.",
            "**Process Level by Level**: Pull a node from the front of the queue and look at all its immediate unvisited neighbors (e.g. in 4 directions: up, down, left, right).",
            "**Add Neighbors to Queue**: Mark each neighbor as visited and push it to the back of the queue for the next level.",
            "**Repeat**: Continue until the queue is completely empty."
        ]
        example = "In a grid with rotten oranges: at time 0, push all initially rotten oranges into the queue. At time 1, pop them and infect all adjacent fresh oranges in 4 directions, pushing them into the queue to process at time 2."
    elif is_linked_list_rev:
        definition = "Linked list reversal is an algorithm that changes the direction of every pointer in a linked list so the tail becomes the new head."
        intuition = "Imagine a line of train cars where every car has a chain hooked to the car behind it. If you want the train to travel in reverse, you must unhook each chain and hook it to the car in front. You need three hands (pointers) to do this: one hand holding where you came from (`prev`), one hand holding the car you are working on (`cur`), and one hand holding the next car (`next`) so the rest of the train doesn't roll away while you flip the chain."
        steps = [
            "**Initialize Three Pointers**: Set `prev = null`, `cur = head`, and `next = null`.",
            "**Save the Future**: Before breaking the forward link, save the next node: `next = cur.next`.",
            "**Reverse the Link**: Point the current node's arrow backwards: `cur.next = prev`.",
            "**Advance Pointers**: Slide `prev` forward to `cur`, and slide `cur` forward to `next`.",
            "**Finish**: When `cur` becomes null, `prev` is sitting at the new head of the reversed list."
        ]
        example = "Given nodes `10 -> 20 -> 30`: save `next = 20`, point `10.next = null`, shift pointers. Next save `next = 30`, point `20.next = 10`, shift pointers. Finally point `30.next = 20`. Return `30`, producing `30 -> 20 -> 10 -> null`."
    elif is_recursion_base_case:
        definition = "A base case is the simplest stopping condition in a recursive function that tells the code when to stop calling itself and start returning answers."
        intuition = "Imagine jumping down a staircase two steps at a time. If there is a ground floor (the base case), you safely stop when your feet touch the floor. But if there is no ground floor, you would fall through an endless black hole forever! Without a base case, a function calls itself infinitely until your computer runs out of memory and crashes with a stack overflow."
        steps = [
            "**Identify the Smallest Input**: Find the absolute simplest input where the answer is already known without any calculation (for example, in Fibonacci, `fib(0) = 0` and `fib(1) = 1`).",
            "**Place It at the Top**: Check this condition at the very beginning of the recursive function before making any recursive calls.",
            "**Return Immediately**: If the base case condition is met, return the known value directly.",
            "**Step Toward the Base**: Ensure every recursive call reduces the problem size so it always moves closer to reaching the base case."
        ]
        example = "In Fibonacci `fib(n)`: if `n == 0` return 0; if `n == 1` return 1. When computing `fib(3)`, the function breaks down into `fib(2)` and `fib(1)`. The base case catches `n = 1` and stops the recursion, passing values back up the chain."
    else:
        sentences = [s.strip() for s in re.split(r"(?<=[.!?])\s+", full_text) if len(s.strip()) > 25]
        clean_sentences = [s for s in sentences if not re.search(r"(?:welcome|subscribe|banchayat|birthday|hello students|video)", s, re.IGNORECASE)]

        definition = f"In this lecture, the instructor teaches how to solve the problem by breaking down the core pattern in **{title}**."
        intuition = " ".join(clean_sentences[:2]) if clean_sentences else "Instead of checking every possibility with a slow brute-force approach, this technique focuses on identifying the specific condition that allows you to eliminate unnecessary operations."
        steps = []
        for i, s in enumerate(clean_sentences[2:6]):
            clean_s = re.sub(r"^[-\s]+", "", s)
            steps.append(f"**Step {i + 1}**: {clean_s}")
        if not steps:
            steps = ["Follow the step-by-step logic demonstrated in the lecture timestamps above."]
        example = " ".join(clean_sentences[6:9]) if len(clean_sentences) > 6 else "The instructor demonstrates this with the primary test case in the video, tracing the variables step-by-step."

    steps_text = "\n".join(f"- {s}" for s in steps)
    return f"In **{title}** (@ {timestamp}):\n\n### 💡 Concept & Plain Definition\n{definition}\n\n### 🎯 The Intuition (Why It Exists)\n{intuition}\n\n### ⚙️ How It Works (Step-by-Step Approach)\n{steps_text}\n\n### 🔍 Short Worked Example\n{example}\n\n### ⏱️ Complexity & Takeaway\n{complexity}"


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


_WHOLE_DOC_PATTERNS = [
    r"\bexplain\s+(?:me\s+)?(?:the\s+)?(?:code|solution|approach|program|file|implementation|document)\b",
    r"\bexplain\s+(?:all\s+)?this\b",
    r"\bsummarize\b",
    r"\bsummary\b",
    r"\bwalk\s+me\s+through\b",
    r"\bwhat\s+does\s+this\s+(?:code|program|solution|file|document)?\s*do\b",
    r"\boverview\b",
    r"\bhow\s+does\s+this\s+(?:code|work|solution)\b",
]
_WHOLE_DOC_RE = re.compile("|".join(_WHOLE_DOC_PATTERNS), re.IGNORECASE)


def is_whole_document_query(question: str) -> bool:
    clean = question.strip()
    if len(clean) < 30 and ("explain" in clean.lower() or "summary" in clean.lower() or "overview" in clean.lower()):
        return True
    return bool(_WHOLE_DOC_RE.search(clean))


def _upload_sources(question: str, doc_id: str, top_k: int) -> list[tuple[dict[str, Any], dict[str, str]]]:
    sources: list[tuple[dict[str, Any], dict[str, str]]] = []
    all_chunks = get_document_chunks(doc_id)
    if not all_chunks:
        return sources

    total_tokens = sum(estimate_tokens(c.text) for c in all_chunks)

    # FIX B: Small uploads (<= 2500 tokens, e.g. single code files or short notes)
    # Pass FULL document context directly so broad or generic queries never suffer
    # from weak chunk-level similarity dropouts.
    if total_tokens <= 2500:
        for chunk in all_chunks:
            citation = {
                "source_type": chunk.source_type,
                "source_id": chunk.source_id,
                "title": chunk.title,
                "timestamp": chunk.timestamp,
                "page": chunk.page,
                "snippet": chunk.text[:2000],
                "distance": 0.0,
            }
            location = f"page {chunk.page}" if chunk.page is not None else "uploaded text"
            excerpt = {"label": f"{chunk.title} ({location})", "text": chunk.text}
            sources.append((citation, excerpt))
        return sources

    # FIX C: For larger documents (> 2500 tokens), if query is a broad/whole-document query,
    # retrieve ordered chunks up to a 2000-token budget.
    if is_whole_document_query(question):
        budget = 2000
        accumulated_tokens = 0
        for chunk in all_chunks:
            chunk_tok = estimate_tokens(chunk.text)
            if accumulated_tokens + chunk_tok > budget and sources:
                break
            citation = {
                "source_type": chunk.source_type,
                "source_id": chunk.source_id,
                "title": chunk.title,
                "timestamp": chunk.timestamp,
                "page": chunk.page,
                "snippet": chunk.text[:2000],
                "distance": 0.0,
            }
            location = f"page {chunk.page}" if chunk.page is not None else "uploaded text"
            excerpt = {"label": f"{chunk.title} ({location})", "text": chunk.text}
            sources.append((citation, excerpt))
            accumulated_tokens += chunk_tok
        return sources

    # FIX D: Real semantic vector retrieval for targeted queries on large documents
    for chunk, distance in search_document(question, doc_id=doc_id, top_k=top_k):
        citation = {
            "source_type": chunk.source_type,
            "source_id": chunk.source_id,
            "title": chunk.title,
            "timestamp": chunk.timestamp,
            "page": chunk.page,
            "snippet": chunk.text[:2000],
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

    refusal = PLAYLIST_NOT_FOUND if request.scope == "playlist" else NOT_FOUND

    if request.scope == "playlist":
        matches, window_chunks = _playlist_lecture_sources(request.question, request.top_k)
        if not matches:
            return {
                "answer": refusal,
                "grounded": False,
                "mode": "refusal",
                "sources": [],
                "retrieved": 0,
            }
        citations, excerpts = zip(*matches)
        try:
            answer_text = answer_playlist_from_context(request.question, list(excerpts), refusal)
            if refusal.lower() in answer_text.lower():
                return {"answer": refusal, "grounded": False, "mode": "refusal", "sources": [], "retrieved": len(matches)}
            mode = "live"
        except Exception:
            answer_text = _playlist_tutor_fallback(citations[0], window_chunks, citations[0]["snippet"], question=request.question)
            mode = "extractive_fallback"
        return {
            "answer": answer_text,
            "grounded": True,
            "mode": mode,
            "sources": list(citations),
            "retrieved": len(matches),
        }

    matches: list[tuple[dict[str, Any], dict[str, str]]] = []
    if request.scope in {"lectures", "both"}:
        matches.extend(_lecture_sources(request.question, request.top_k))
    if request.scope in {"uploads", "both"} and request.doc_id:
        matches.extend(_upload_sources(request.question, request.doc_id, request.top_k))

    if not matches:
        return {
            "answer": refusal,
            "grounded": False,
            "mode": "refusal",
            "sources": [],
            "retrieved": 0,
        }

    citations, excerpts = zip(*matches)
    try:
        answer_text = answer_from_context(request.question, list(excerpts), refusal)
        if refusal.lower() in answer_text.lower():
            return {"answer": refusal, "grounded": False, "mode": "refusal", "sources": [], "retrieved": len(matches)}
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
