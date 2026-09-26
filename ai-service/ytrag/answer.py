"""Retrieve -> grounded answer + citations.

The important part of this module is what it does when retrieval comes back
empty: it returns the refusal without calling the LLM at all.

The model knows DSA perfectly well. If it is handed junk context it will
happily answer from its own training and attach your timestamps to it — the
student clicks the link and you are talking about something else entirely.
That is strictly worse than saying "cover nahi hua".
"""

import re

from groq import Groq

from ytrag.config import (
    CONFIDENT_DISTANCE,
    GEMINI_API_KEY,
    GEMINI_MODEL,
    GROQ_API_KEY,
    GROQ_MODEL,
    LLM_BACKEND,
    LLM_MODEL,
    MAX_DISTANCE,
    REFUSAL,
    TOP_K,
)
from ytrag.index import search, title_overlap
from ytrag.models import Chunk

_CLIENT: Groq | None = None

SYSTEM_PROMPT = f"""You are answering using ONLY the transcript excerpts below, which come from
Pratyush's DSA lectures. The transcripts are auto-generated and may contain
minor errors — read past obvious mis-transcriptions of technical terms.

Rules:
- Answer only from the excerpts. If they don't cover it, say exactly:
  "{REFUSAL}"
- Cite with [1], [2] inline, using the excerpt numbers given below.
- Match the language of the question (Hinglish question -> Hinglish answer).
- 4-6 sentences max.
- Never invent a timestamp or a lecture name."""

_CITATION_RE = re.compile(r"\[(\d+)\]")


def get_client() -> Groq:
    global _CLIENT
    if _CLIENT is None:
        if not GROQ_API_KEY:
            raise RuntimeError("GROQ_API_KEY is not set. Add it to the repo-root .env.")
        _CLIENT = Groq(api_key=GROQ_API_KEY)
    return _CLIENT


def _chat(system: str, user: str) -> str:
    """One completion, from whichever backend is configured.

    Kept deliberately small: the explanation is a garnish on top of retrieval,
    so swapping providers should never be more than this function.
    """
    backend = LLM_BACKEND.lower()

    if backend == "none":
        raise RuntimeError("Explanations are disabled (YTRAG_LLM_BACKEND=none).")

    if backend == "gemini":
        if not GEMINI_API_KEY:
            raise RuntimeError("GEMINI_API_KEY is not set.")
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=GEMINI_API_KEY)
        response = client.models.generate_content(
            model=LLM_MODEL or GEMINI_MODEL,
            contents=user,
            config=types.GenerateContentConfig(
                system_instruction=system, temperature=0.2
            ),
        )
        return (response.text or "").strip()

    response = get_client().chat.completions.create(
        model=LLM_MODEL or GROQ_MODEL,
        messages=[{"role": "system", "content": system},
                  {"role": "user", "content": user}],
        temperature=0.2,
    )
    return (response.choices[0].message.content or "").strip()


def build_context(chunks: list[Chunk]) -> str:
    blocks = []
    for i, chunk in enumerate(chunks, start=1):
        blocks.append(f'[{i}] "{chunk.video_title}" @ {chunk.timestamp}\n{chunk.text}')
    return "\n\n".join(blocks)


def answer_from_context(question: str, excerpts: list[dict[str, str]], refusal: str) -> str:
    """Answer from generic source excerpts without exposing any outside knowledge.

    Uploads and mixed scopes share this helper with lectures. Callers must
    perform their retrieval threshold check before invoking it.
    """
    if not excerpts:
        return refusal
    context = "\n\n".join(
        f"[{index}] {excerpt['label']}\n{excerpt['text']}"
        for index, excerpt in enumerate(excerpts, start=1)
    )
    system = f"""You are a study assistant. Answer ONLY from the supplied material.
Rules:
- If the material does not answer the question, say exactly: \"{refusal}\"
- Do not use general knowledge, make assumptions, or invent facts.
- Cite the supplied excerpt numbers such as [1] inline.
- Keep the answer concise and preserve the question's language where possible."""
    return _chat(system, f"MATERIAL\n{context}\n\nQUESTION: {question.strip()}")


PLAYLIST_TUTOR_SYSTEM = """You are AlgoSeek's DSA teacher for beginners. Your job is to take the ideas taught in Pratyush's lecture transcripts and explain them fresh, as if teaching an 8th-grade student who has never heard of this concept before.

CORE TEACHING INSTRUCTIONS:
1. Target Audience: An 8th-grade student. Use simple, everyday words. Define any technical term the first time you use it. Prefer short, clear sentences.
2. Anti-Transcript Shape: Do NOT follow the order, phrasing, or conversational chatter of the lecture sentence-by-sentence. Fully digest what the lecture teaches, then reconstruct the explanation from scratch in your own clean structure. If your answer could be produced by lightly rewording or reordering the transcript lines, it is WRONG — rewrite it.
3. Building Intuition: Focus on WHY this approach exists and what problem it solves in relatable terms. Do not just state the mechanics; explain why a beginner would want to use this instead of checking every possibility one by one.
4. Grounding Boundary: Every step, complexity claim, and technique name must come strictly from the provided lecture excerpts. Do not add outside algorithms, advanced variants, or data structures not taught in the excerpts. You may use a simple clarifying analogy or minimal illustrative example only if it helps explain the SAME idea taught in the lecture without adding new technical claims. If the excerpts do not answer the question, reply ONLY with:
  "__REFUSAL__"

REQUIRED ANSWER STRUCTURE:
### 💡 Concept & Plain Definition
[Exactly one simple sentence defining the concept in plain English.]

### 🎯 The Intuition (Why It Exists)
[Explain the core "why" in relatable terms: What problem are we trying to solve? Why would a naive brute-force attempt be wasteful or slow? What clever trick makes this technique work?]

### ⚙️ How It Works (Step-by-Step Approach)
[Clear, numbered or bulleted steps describing the exact approach taught in the lecture. Keep each step focused and easy to follow.]

### 🔍 Short Worked Example
[A small, concrete walkthrough using numbers or items. Use the lecture's own example if present; otherwise, use a minimal, clear example that directly illustrates the lecture's steps without contradicting anything taught.]

### ⏱️ Complexity & Takeaway
[Mention time and space complexity ONLY if explicitly stated in the lecture excerpts. If not analyzed, state: "Complexity was not analyzed in these timestamps."]

---
FEW-SHOT EXAMPLE:

[Input Excerpts]:
"[1] "Episode 05 | Prefix Sum Pattern" @ 02:15:
So guys, why prefix sum? Suppose you have an array 2, 4, 1, 7. Now someone asks give me sum from index 1 to 3. You will run a loop, right? But what if they ask 100 times? 1000 times? Every time running a loop is very bad, order of n into q queries, it will give TLE in interview. So what do we do? We make a prefix array beforehand. In prefix array, at index i we store sum of all elements up to i. Then for any range l to r, you just do prefix[r] minus prefix[l-1]. That's it! In one step, constant time O(1). Time complexity for query becomes O(1) and making prefix array is O(n)."

[Output Response]:
In **Episode 05 | Prefix Sum Pattern** (@ 02:15):

### 💡 Concept & Plain Definition
A prefix sum is a running total list where each position stores the sum of all numbers from the start of the array up to that point.

### 🎯 The Intuition (Why It Exists)
Imagine someone keeps asking you to add up numbers in different sections of a shopping bill over and over again. If you add them up from scratch every single time, you waste a huge amount of time doing repeated work. Instead, if you write down the running total after every item beforehand, you can find the sum of any section in a single subtraction—just take the running total at the end of the section and subtract the running total just before the section began.

### ⚙️ How It Works (Step-by-Step Approach)
- **Step 1 (Precalculate)**: Build a new list of running totals where each spot `i` holds the sum of all elements from index 0 through `i`.
- **Step 2 (Answer Range Queries)**: To find the sum between start index `L` and end index `R`, take the total at `R` and subtract the total before `L` (`prefix[L - 1]`).
- **Step 3 (Immediate Answer)**: Return the difference instantly without looping through the elements again.

### 🔍 Short Worked Example
Given the list `[2, 4, 1, 7]`:
- The running totals become `[2, 6, 7, 14]`.
- To find the sum of numbers from index 1 to 3 (`[4, 1, 7]`): take total up to index 3 (which is 14) and subtract total up to index 0 (which is 2).
- `14 - 2 = 12`. That matches `4 + 1 + 7 = 12` in one quick subtraction!

### ⏱️ Complexity & Takeaway
- **Time Complexity**: The instructor highlights that answering each query takes O(1) constant time, while building the initial prefix array takes O(n) linear time.
"""


def answer_playlist_from_context(question: str, excerpts: list[dict[str, str]], refusal: str) -> str:
    """Answer specifically for playlist tutor mode with pedagogical structure."""
    if not excerpts:
        return refusal
    context = "\n\n".join(
        f"[{index}] {excerpt['label']}\n{excerpt['text']}"
        for index, excerpt in enumerate(excerpts, start=1)
    )
    system = PLAYLIST_TUTOR_SYSTEM.replace("__REFUSAL__", refusal)
    return _chat(system, f"LECTURE EXCERPTS:\n{context}\n\nSTUDENT QUESTION: {question.strip()}")



def _citation(chunk: Chunk, distance: float) -> dict:
    return {
        "title": chunk.video_title,
        "timestamp": chunk.timestamp,
        "url": chunk.url,
        "start_sec": chunk.link_sec,
        "video_id": chunk.video_id,
        "distance": round(distance, 4),
    }


def _renumber(text: str, hits: list[tuple[Chunk, float]]) -> tuple[str, list[dict]]:
    """Keep only the citations the model actually used, and renumber them 1..N.

    Without this the student sees six links under an answer that only used
    one, and stops trusting any of them.
    """
    order: list[int] = []
    for match in _CITATION_RE.finditer(text):
        idx = int(match.group(1))
        if 1 <= idx <= len(hits) and idx not in order:
            order.append(idx)

    if not order:
        return text, []

    remap = {old: new for new, old in enumerate(order, start=1)}
    rewritten = _CITATION_RE.sub(
        lambda m: f"[{remap[int(m.group(1))]}]" if int(m.group(1)) in remap else "",
        text,
    )
    citations = [_citation(*hits[old - 1]) for old in order]
    return rewritten, citations


def answer(
    question: str,
    top_k: int = TOP_K,
    video_id: str | None = None,
    max_distance: float | None = None,
) -> dict:
    """-> {"answer", "citations", "grounded", "retrieved"}"""
    question = question.strip()
    if not question:
        return {"answer": REFUSAL, "citations": [], "grounded": False, "retrieved": 0}

    hits = search(question, top_k=top_k, video_id=video_id, max_distance=max_distance)

    # Guard one: nothing survived the distance cutoff, so there is nothing to
    # ground an answer in. Return the refusal and never call the LLM.
    if not hits:
        return {"answer": REFUSAL, "citations": [], "grounded": False, "retrieved": 0}

    chunks = [chunk for chunk, _ in hits]
    user_prompt = f"EXCERPTS\n{build_context(chunks)}\n\nQUESTION: {question}"

    text = _chat(SYSTEM_PROMPT, user_prompt)

    # Guard two: the model read the excerpts and said they don't cover it.
    if REFUSAL.lower() in text.lower():
        return {"answer": REFUSAL, "citations": [], "grounded": False, "retrieved": len(hits)}

    text, citations = _renumber(text, hits)

    # Guard three: an answer with no citation at all is the model talking from
    # its own knowledge. Show it, but don't dress it up with links.
    return {
        "answer": text,
        "citations": citations,
        "grounded": bool(citations),
        "retrieved": len(hits),
    }


def retrieve_only(question: str, top_k: int = TOP_K, filtered: bool = False) -> list[tuple[Chunk, float]]:
    """Retrieval without the LLM — used by evaluate.py and `ytrag search`.

    Unfiltered by default: 2.0 is the maximum possible cosine distance, so
    nothing is dropped. Eval wants to see what retrieval actually returned,
    including the results the MAX_DISTANCE cutoff would have thrown away.
    """
    return search(question, top_k=top_k, max_distance=None if filtered else 2.0)

def _is_confident(question: str, hits: list[tuple[Chunk, float]]) -> bool:
    """Is the top result trustworthy enough to present without a caveat?

    Distance alone cannot answer this — measured on the real index, off-topic
    questions score *better* than some genuine ones ("React hooks" 0.463 beats
    "number of islands" 0.568), so any single cutoff mislabels one group.

    Two signals together work far better. Either the lecture title actually
    mentions what was asked, or the match is close enough that the topic is
    unambiguous even when no title names it.
    """
    if not hits:
        return False
    chunk, distance = hits[0]
    return title_overlap(question, chunk.video_title) > 0 or distance <= CONFIDENT_DISTANCE


def search_only(question: str, top_k: int = TOP_K, video_id: str | None = None) -> dict:
    """Retrieval with no LLM at all — the timestamps, ranked.

    This is the main path. The timestamps *are* the product: a student wants
    to land on the moment the thing was explained, not read a paraphrase of
    it. Skipping the model makes this instant, free, unlimited, and incapable
    of hallucinating, since nothing is generated.

    `confident` reports whether the best match is close enough to be worth
    trusting. It is advisory, not a gate — a weak match still gets shown,
    because a ranked list the student can dismiss in one glance is far less
    harmful than a confident sentence that is wrong.
    """
    question = question.strip()
    if not question:
        return {"results": [], "confident": False, "query": question}

    hits = search(question, top_k=top_k, video_id=video_id)
    return {
        "query": question,
        "confident": _is_confident(question, hits),
        "results": [
            {
                "title": chunk.video_title,
                "timestamp": chunk.timestamp,
                "url": chunk.url,
                "start_sec": chunk.link_sec,
                "end_sec": chunk.end_sec,
                "video_id": chunk.video_id,
                "distance": round(distance, 4),
                "preview": chunk.text.split(chr(10) + chr(10), 1)[-1][:240].strip(),
            }
            for chunk, distance in hits
        ],
    }
