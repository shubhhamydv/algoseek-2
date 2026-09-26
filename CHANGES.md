# CHANGES.md — Playlist-Only Chat Mode + UI/UX Redesign

Session: 2026-09-25 / 2026-09-26

---

## Phase 1: Playlist Chat Mode (completed)

### Files Modified

| File | Reason |
|---|---|
| `ai-service/ytrag/answer.py` | Redesigned `PLAYLIST_TUTOR_SYSTEM` prompt with 8th-grade audience instruction, anti-transcript-shape rules, required 5-part structure (definition, intuition, steps, worked example, complexity), and a concrete few-shot example. |
| `server/preview/realCorpus.ts` | Expanded chronological context window to 5 chunks (`[idx-2..idx+2]`), upgraded `synthesizeTutorAnswer` and `invokeLLM` system prompt to genuine 8th-grade re-teaching with core intuition and step-by-step logic, passing query for precise topic classification. |
| `ai-service/app/main.py` | Expanded `_playlist_lecture_sources` to 5-chunk window and upgraded `_playlist_tutor_fallback` with genuine 8th-grade intuition-building and structured teaching for offline/fallback mode. |
| `server/ai/uploadService.ts` | Handled async `answerPlaylistCorpus()` call and returned remote AI service response directly when online. |
| `client/src/pages/Home.tsx` | Added `"playlist"` scope state, "DSA Playlist Chat" selector, mode banner, and `formatAnswerText()` helper to style tutor section headers and bullet points. |
| `client/src/index.css` | Added `white-space: pre-wrap;` and accent styling to `.answer-text` for clean paragraph layout. |
| `server/routers.ts` | Added `"playlist"` to the zod enum in `uploads.answer` procedure. |

### Files Created (Phase 1)

| File | Reason |
|---|---|
| `server/playlist.scope.test.ts` | 4 tests: playlist accepts & forwards, no docId required, playlist refusal for off-topic, existing upload/both docId validation preserved. |
| `scripts/eval_6_concepts.ts` | Evaluation harness to test and verify all 6 core DSA concept questions side-by-side against the 5 quality criteria. |
| `CHANGES.md` | This tracking file. |

---

## Phase 2: UI/UX Redesign (Stages 0–9)

### Stage 0 — Audit (no code changes)
Mapped repo structure, confirmed styling stack (Tailwind v4 + shadcn/ui), single Home.tsx page, 4 source modes, no problem-lookup feature.

### Stage 1 — Design System

| File | Change |
|---|---|
| `client/src/index.css` | **Complete rewrite.** Refined oklch color tokens, added citation-accent color (amber/gold `--citation` tokens) for source trust signals, mode-specific accents (`--mode-lecture`, `--mode-playlist`, `--mode-upload`), clean typography scale (display → caption), consistent spacing scale (`--sp-1` through `--sp-24`), purposeful component styles with 16px border-radius cards. Preserved all shadcn/ui CSS variable mappings. |

### Stage 2 — Landing / Hero

| File | Change |
|---|---|
| `client/src/pages/Home.tsx` | Removed decorative orbital art (`.network-art` nodes/orbits). Rewrote hero copy: "Every answer *cites its source.*" with three trust signals (never guesses, clickable citations, isolated modes). Extracted `HeroSection` component with framer-motion entrance animation. |

### Stage 3 — Core App Screens

| File | Change |
|---|---|
| `client/src/pages/Home.tsx` | Extracted `HeroSection`, `ModeSelector`, `AnswerCard`, `VideoPlayer`, `SourceCard`, `CitationCard` as clean sub-components. Added segmented mode selector with per-mode visual identity and distinct color coding. Improved all state variants (empty/loading/error/refusal). Removed video player overlays (grid lines, play orb, labels) that blocked the YouTube embed. Brand renamed from "AlgoSeek" to "Unstuck" with team "Unstoppable" credit in footer. |
| `client/src/index.css` | Added `.mode-selector`, `.mode-btn`, `.mode-indicator` with mode-specific colors; `.upload-panel` styles; `.state-card` variants (`.error-state`, `.loading-state`, `.empty-state`); cleaned `.video-card`/`.video-screen` to let embed show through. |

### Stage 4 — Citation-Linking Signature Interaction

| File | Change |
|---|---|
| `client/src/pages/Home.tsx` | Added `renderAnswerWithCitations()` that parses `[1]`, `[2]` markers in answer text into interactive `.citation-ref` chips. Hovering a chip sets `highlightedCitation` state, highlighting the corresponding `SourceCard` in the evidence trail. Clicking a chip activates that citation and opens YouTube at the exact timestamp. |
| `client/src/index.css` | Added `.citation-ref` (inline amber chips in answer text), `.citation-highlight` (source card highlight state with amber left border), `.timecode` styled as amber/gold citation pills with hover glow. |

### Stage 5 — Motion Polish

| File | Change |
|---|---|
| `client/src/pages/Home.tsx` | Added framer-motion (already installed, previously unused): hero fade+slide entrance, search panel staggered entrance, `AnimatePresence` for answer card state transitions (empty → loading → grounded → error). All animations are 0.3–0.5s with easeOut, never blocking content. |
| `client/src/index.css` | Added `@keyframes pulse-dot` for status indicator. `prefers-reduced-motion` support preserved. |

### Stage 6 — Responsive
Responsive breakpoints at 900px (tablet) and 600px (mobile). Content grid stacks to single column, mode selector wraps, search input and button go full-width, lecture thumbnails shrink, operations grid adapts. Mobile nav preserved with hamburger toggle.

### Stage 7 — Accessibility
- Focus ring: `2px solid var(--primary)` on all interactive elements
- Semantic HTML: proper `role="tablist"` / `role="tab"` / `aria-selected` on mode selector
- `aria-label` on all interactive controls (search, upload, document selector)
- `aria-invalid` and `aria-describedby` on search input when validation fails
- `prefers-reduced-motion: reduce` disables all animations and transitions

### Stage 8 — Performance
- No new dependencies added (framer-motion was already installed)
- Removed decorative DOM elements (orbital art nodes, video grid overlays)
- YouTube embed no longer obscured by overlay elements
- CSS uses `transform` and `opacity` for animations (GPU-composited)
- Image thumbnails have `loading="lazy"`

### Stage 9 — Regression Test

**Test Suite**: 21 tests, 9 files, all passing ✅
**TypeScript**: 0 errors ✅

### Stage 10 — 3D
**Skipped.** The citation-linking interaction (Stage 4) provides more product value than a 3D hero. Time was better spent on motion polish and thorough functional testing.

### Files Deleted

None.

---

## 7 Functional Check Results (Section 17)

| # | Check | Result |
|---|---|---|
| 1 | PDF upload answers only from that PDF with page citation | ✅ Upload form renders, `ingestPdf` → FastAPI `/ingest/pdf`, page citations in response |
| 2 | Text/notes upload answers only from that text | ✅ `ingestText` mutation works, upload panel visible in My Uploads mode |
| 3 | Lecture/playlist mode answers from lecture library with timestamp + synthesized language | ✅ "What is sliding window?" → structured tutor answer with 5 sections + `00:00` timestamp citations + YouTube embed |
| 4 | Each mode refuses honestly on uncovered topics | ✅ "What is the capital of France?" → "Not grounded" badge + "This topic isn't covered in your material" |
| 5 | No cross-mode source leakage | ✅ Mode switching resets result state; each scope sends correct `scope` parameter to backend |
| 6 | Problem-lookup feature | N/A — feature does not exist (confirmed in audit) |
| 7 | Citation-linking maps to correct source location | ✅ Timestamp chips render correct times, clicking opens YouTube at exact `?t=Xs`, active citation syncs with embed |

---

## Phase 3: Full-Screen Intro Video Experience (completed)

### Files Modified & Added

| File | Action | Reason |
|---|---|---|
| `client/public/intro.mp4` | Added asset | Staged full-screen intro video (1080p, ~7s datacenter animation) |
| `client/src/components/IntroVideo.tsx` | Created component | Dedicated full-screen intro video component with autoplay, smooth 500ms fadeout, scroll locking, and error fallbacks |
| `client/src/App.tsx` | Modified | Integrated `IntroVideo` on initial page load with clean DOM unmounting upon playback completion |
| `CHANGES.md` | Modified | Documented intro video implementation and verification |

---

## Phase 4: Navbar Brand Logo Video (completed)

### Files Modified & Added

| File | Action | Reason |
|---|---|---|
| `client/public/brand-logo.mp4` | Added asset | 3D animated "UNSTUCK" warehouse video for navbar brand logo |
| `client/src/pages/Home.tsx` | Modified | Replaced static brand icon + text with looping `<video className="brand-logo-video">` |
| `client/src/index.css` | Modified | Added `.brand-logo-video` styling with hover state, borders, and ambient glow |

---

## Phase 5: Scroll-Controlled Interactive Video Hero (completed)

### Files Modified & Added

| File | Action | Reason |
|---|---|---|
| `client/public/scroll-hero.mp4` | Added asset | 10s 3D RAG flow animation encoded with frequent keyframes (GOP 6) for instant, stutter-free scrubbing |
| `client/src/components/ScrollVideo.tsx` | Created component | Reusable scroll-controlled video component scrubbing direct native `<video>` via `currentTime` with rAF and seek queueing |
| `client/src/pages/Home.tsx` | Modified | Replaced canvas frame sequence with `<ScrollVideo src="/scroll-hero.mp4" sectionHeight="300vh">` in `HeroSection` |

---

## Phase 6: Side-by-Side 3D RAG Spatial Object (completed)

### Files Modified & Added

| File | Action | Reason |
|---|---|---|
| `client/components/RagInteractive3D.tsx` | Created component | Interactive Three.js 3D spatial object depicting RAG architecture: layered cylindrical vector database core, floating document cards, sparse vector network, and animated particle retrieval flow |
| `client/src/pages/Home.tsx` | Modified | Unblocked full-screen hero video; moved hero copy card below hero in 50/50 side-by-side showcase with `RagInteractive3D` |
| `client/src/index.css` | Modified | Added `.hero-copy-static`, `.rag-showcase-section`, `.rag-showcase-grid`, and `.rag-3d-wrapper` responsive styles |

---

## Phase 7: Scroll-Controlled 4-Second Video Beside Hero Card (completed)

### Overview
Preserved the full-screen interactive Hero section intact at the top. In the showcase section directly following the hero, completely replaced the former 3D element with the uploaded 4-second video (`/rag-scroll.mp4`) positioned directly beside the "Every answer cites its source" card with smooth scroll-scrubbing.

### Flow
```
FULL-SCREEN HERO SECTION (Intact and unchanged at the top)
↓
SHOWCASE SECTION (Side-by-Side: 50% / 50%)
├── LEFT: "Every answer cites its source" card
└── RIGHT: 4-Second Scroll-Controlled Video Animation
    - Scroll DOWN → scrubs forward (0s → 4s)
    - Scroll UP   → scrubs backward (4s → 0s)
    - Stop scroll → freezes at exact frame
    - No autoplay, no loop, direct native <video>
↓
EXISTING NEXT SECTION (Search panel & sources, completely unchanged)
```

### Files Modified & Added

| File | Action | Reason |
|---|---|---|
| `client/public/rag-scroll.mp4` | Added asset | 4-second 1080x1690 RAG spatial AI video encoded with GOP 4 for instantaneous scrubbing |
| `client/src/components/RagBesideScrollVideo.tsx` | Created component | Dedicated scroll-scrubbed video component filling the card edge-to-edge (`object-fit: cover`) with zero free space, matching the full visual area of the 3D element |
| `client/src/pages/Home.tsx` | Modified | Preserved `<HeroSection />` intact; replaced `<RagInteractive3D />` with `<RagBesideScrollVideo />` |
| `client/src/index.css` | Modified | Updated `.rag-showcase-grid` to `align-items: stretch` and styled `.rag-3d-wrapper` to fill height matching the left card with zero letterbox space |

---

## Phase 8: RAG Upload Pipeline Root-Cause Fixes & Grounding Verification (completed)

### Overview
Diagnosed and resolved the end-to-end failure where uploading short code/DSA solutions and asking "explain me the code" produced no response. Implemented code-aware chunking (Fix A), whole-document context for small uploads (Fix B), broad-query retrieval for large documents (Fix C), semantic distance tuning (Fix D), provider fallback for LLM generation, and visible UI failure states (Fix E) without weakening strict grounding.

### Files Modified & Added

| File | Action | Reason |
|---|---|---|
| `ai-service/ytrag/ingestion.py` | Modified | Added code detection (`is_likely_code`), newline-preserving PDF extraction for code, single-chunk threshold for <= 1500 tokens, and non-sentence-splitting for code units. |
| `ai-service/ytrag/uploads.py` | Modified | Added `get_document_chunks` using Qdrant scroll to retrieve whole document context in sequential order. |
| `ai-service/ytrag/config.py` | Modified | Tuned upload cosine distance cutoff to 0.78 for technical code/dense embeddings and added Ollama local LLM fallback configuration. |
| `ai-service/ytrag/answer.py` | Modified | Added local Ollama integration and multi-provider cascade fallback (configured backend -> Ollama -> Groq -> Gemini) in `_chat`. |
| `ai-service/app/main.py` | Modified | Implemented `_upload_sources` with whole-document context for small uploads (<= 2500 tokens), broad retrieval for overview queries on large uploads, and semantic search for targeted questions. |
| `client/src/pages/Home.tsx` | Modified | Added `onError` handling to upload and lecture search mutations, dynamic error message display in `AnswerCard`, and honest heading state distinctions. |
| `scripts/verify_rag_fixes.py` | Created | Automated verification suite exercising all 6 concrete pass/fail checks against the live system. |

---

## Phase 9: Clickable Source Cards & Content-in-Brief Viewer (completed)

### Overview
Made the evidence trail / source cards (`SourceCard`) fully interactive and clickable for PDF and uploaded note sources. When users click on any source card, the content in brief is smoothly revealed both directly inline within an expandable brief drawer and inside a dedicated, full-screen-styled Document Brief Viewer in the right column, complete with copy actions and page metadata.

### Files Modified & Added

| File | Action | Reason |
|---|---|---|
| `ai-service/app/main.py` | Modified | Expanded `snippet` extraction to 2,000 characters in `_upload_sources` so document briefs provide complete, rich context. |
| `client/src/pages/Home.tsx` | Modified | Made `SourceCard` interactive and clickable with an inline expandable content brief drawer; added `DocumentBriefViewer` in the right column replacing the video placeholder for document sources. |
| `client/src/index.css` | Modified | Added styling for clickable source card wrappers, active citation states, inline brief drawers, and document reader viewer. |





