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

---

## Phase 10: Fix Non-Interactive Search Panel (z-index stacking collision) (completed)

### Root Cause
`.video-placeholder` inside `DocumentBriefViewer` used `position: absolute; inset: 0` but its parent `.document-reader-screen` had **no CSS styles at all** — no `position: relative`. This caused the absolutely-positioned placeholder to escape its container and overlay the entire page, intercepting all pointer events (clicks, focuses) on mode buttons, search input, suggestions, and the Ask button. Additionally, `.rag-showcase-section` had `z-index: 20` while `.search-panel` and `.content-grid` had no z-index, allowing the tall sticky showcase section to stack above interactive elements.

### Fix Applied

| File | Action | Reason |
|---|---|---|
| `client/src/index.css` | Modified | Lowered `.rag-showcase-section` z-index from 20 to 10; added `position: relative; z-index: 30; pointer-events: auto` to `.search-panel` and `.content-grid`; added `pointer-events: none` to `.video-placeholder`; added full styles for `.document-reader-card`, `.document-reader-screen` (with `position: relative`), `.document-reader-toolbar`, `.document-reader-content`, `.document-reader-pre`, `.doc-copy-btn`, `.doc-reader-badge`, `.doc-reader-chars`; added styles for `.source-card-wrapper`, `.source-card-interactive`, `.source-click-hint`, `.source-read-tag`, `.truncate-preview`, `.document-thumb`, `.thumb-page-badge`, `.source-brief-drawer`, `.source-brief-header`, `.source-brief-label`, `.source-brief-copy-btn`, `.source-brief-body`, `.source-brief-text`. |

### Verified
- `elementFromPoint` hit test confirms mode buttons, search input, and Ask button all receive clicks correctly.
- Full browser interaction test passed: mode switching, suggestion clicks, text input, query submission, and grounded answer display all functional.

---

## Phase 11: Production Bundle Size Optimization & Code-Splitting (completed)

### Root Cause
1. `server/preview/realCorpus.ts` was statically importing `chunks.json` (4.94 MB), causing esbuild to inline the entire 5MB transcript database into `dist/index.js`.
2. Vite produced a single monolithic JavaScript bundle triggering Rollup chunk size warnings during Vercel deployment.

### Fix Applied

| File | Action | Reason |
|---|---|---|
| `server/preview/realCorpus.ts` | Modified | Switched from static JSON import to runtime `fs.readFileSync` + `JSON.parse` so esbuild does not bundle the 4.94MB transcript database into `dist/index.js`. |
| `package.json` | Modified | Updated build script to copy `data/` directory to `dist/data/` alongside the server bundle. |
| `vite.config.ts` | Modified | Configured `build.rollupOptions.output.manualChunks` for vendor code-splitting (`vendor-react`, `vendor-radix`, `vendor-motion`) and set `chunkSizeWarningLimit: 600`. |

### Results
- `dist/index.js` (Server): reduced from **5.0 MB → 73.2 kB** (~98.5% reduction).
- Client bundle: split into cached vendor chunks (`vendor-react`: 17.5 kB, `vendor-radix`: 43.0 kB, `vendor-motion`: 115.5 kB, app code: 410.9 kB). All chunk warnings resolved.

---

## Phase 12: Feature A (Grounded Quiz / Flashcards) & Feature B (DSA Topic Coverage / Progress Map)

### Overview
Added two additive features alongside existing RAG grounded Q&A with zero regressions:
1. **Feature A (Grounded Quiz / Flashcards)**: Multi-source grounded multiple-choice quiz engine with mandatory independent self-verification (`verifyQuestionAgainstSnippet`), verifiable page and timestamp citations, and interactive Quiz Modal.
2. **Feature B (DSA Topic Coverage / Progress Map)**: 12-topic canonical taxonomy mapping all 126 lecture videos offline, persistent compact badge ("Coverage: X/12") in playlist mode, slide-over topic grid modal, client-side progress tracking (`localStorage`), and 2-second auto-dismissing toast notifications on tier transitions.

### Files Created & Modified

| File | Action | Reason |
|---|---|---|
| `data/pratyush/topic_taxonomy.json` | Created | Canonical 12-topic DSA taxonomy mapping all 126 lecture videos offline with title, description, keywords, and lecture IDs. |
| `scripts/classify_taxonomy.ts` | Created | Offline classifier script mapping all 126 lecture videos into the canonical 12-pattern taxonomy. |
| `server/ai/quizService.ts` | Created | Grounded quiz generation engine with mandatory independent self-verification (`verifyQuestionAgainstSnippet`), LLM cascade, deterministic fallback, and sparse document guard. |
| `client/src/components/QuizModal.tsx` | Created | Step-by-step quiz UI modal with option selection, immediate correct/incorrect reveal, grounded excerpt citation display, and final score summary. |
| `client/src/components/TopicCoverage.tsx` | Created | Topic Coverage Badge, Topic Coverage Modal, `useTopicProgress` hook (`localStorage`), and `TopicTransitionToast`. |
| `server/routers.ts` | Modified | Added `lecture.topics` query and `quiz.generate` mutation procedures. |
| `server/ai/uploadService.ts` | Modified | Exported `getDocumentChunks` for reliable document chunk access across services. |
| `client/src/pages/Home.tsx` | Modified | Integrated Topic Coverage Badge in playlist mode, Practice Quiz button on grounded answers, Document Quiz button in upload panel, and modals. |
| `server/quiz.integration.test.ts` | Created | Vitest integration test suite verifying quiz generation, citation accuracy, self-verification discards, sparse handling, and topic taxonomy. |
| `scripts/verify_phase4.ts` | Created | End-to-end verification harness executing all Phase 4 verification steps against live uploaded files and playlist corpus. |
| `CHANGES.md` | Modified | Logged all created and changed files with one-line reasons. |

---

## Phase 13: Visual Theme Transformation to Academic AI Workspace

### Overview
Transformed the presentation layer to match the visual reference ("Premium educational AI workspace + soft glassmorphism + modern academic dashboard + light blue/cyan technology aesthetic") with zero functional regressions.

### Changes Applied

| File | Action | Reason |
|---|---|---|
| `client/src/index.css` | Modified | Re-engineered design tokens for warm off-white workspace background (`#f5f7f4`), deep navy typography (`#18324a`), academic blue accent (`#0878d1` / `#168fe0`), cyan glows (`#8edaf0` / `#b8eaf6`), desk mat workspace container (`.workspace-mat`), deep blue search bar (`linear-gradient(135deg, #13426b, #184d7b)`), translucent suggestion chips (`✦`), and soft glassmorphism cards. |
| `client/src/pages/Home.tsx` | Modified | Updated header branding to `ASK YOUR STUDY MATERIAL` with subtitle `Your notes · Your lectures · Your AI tutor` and `⌘ K to focus` pill; encased core interactions in `.workspace-mat`; added icon badges to card headers; preserved all existing search, upload, AI grounding, playback, quiz, and topic coverage capabilities. |
| `client/src/components/QuizModal.tsx` | Modified | Redesigned quiz flashcard modal with bright academic glassmorphism theme (`bg-white/95`, `text-[#18324A]`, `border-[#B4D7EE]`, soft blue accents). |
---

## Phase 14: Replace Live LLM Quiz with Static 120-Question Bank & Option Shuffling (completed)

### Overview
Replaced the live LLM-based quiz generator with a pre-written, hand-crafted DSA question bank (`data/dsa-quiz-question-bank.json` & `dsa-quiz-question-bank.json`) containing 12 topics × 10 verified multiple-choice questions (120 total). Fully removed live LLM generation for quizzes, eliminating nonsensical questions, invalid distractors, and fixed answer positions.

### Key Enhancements
1. **Static Question Bank Loader**: Loads 120 hand-crafted, verified DSA questions across all 12 canonical topics from `dsa-quiz-question-bank.json` with zero LLM API invocations.
2. **Runtime Randomization & Option Shuffling**:
   - Randomly samples 5 questions without replacement per quiz attempt using the Fisher-Yates algorithm.
   - For every question, the 4 options are shuffled into a fresh permutation at runtime, and `correctIndex` (0..3) is dynamically recomputed so the correct answer is uniformly distributed across positions A, B, C, and D (never fixed at A).
3. **Taxonomy & Coverage Map Reconciliation**: Bidirectional mapping between question bank topic IDs (`arrays-strings`, `trees`, `graphs`, `sorting-searching`, etc.) and coverage map taxonomy IDs (`arrays_hashing`, `trees_bst`, `graphs_bfs_dfs`, `binary_search`, etc.), ensuring completing any quiz updates the topic tier to "Practiced".
4. **Accurate Scoring & Explanations**: Instant feedback on answer selection with accurate scoring against dynamically-recomputed correct indices and matching static explanations.

### Files Modified & Created

| File | Action | Reason |
|---|---|---|
| `server/ai/quizService.ts` | Modified | Replaced live LLM prompt calls (`callQuizLLM`) with static question bank loading (`loadQuestionBank`), Fisher-Yates sampling (`sampleWithoutReplacement`), runtime option shuffling (`prepareQuestionForSession`), and topic reconciliation (`resolveTopic`). |
| `client/src/components/QuizModal.tsx` | Modified | Updated `QuizData` type with `topicId` and refined explanation card display. |
| `client/src/pages/Home.tsx` | Modified | Updated `onQuizCompleted` handler to record topic interaction with either `activeQuizTopicId` or `activeQuizData.topicId`. |
| `server/quiz.integration.test.ts` | Modified | Vitest integration tests verifying 120-question bank integrity, 5-question sampling without replacement, option shuffling, position distribution, scoring, and taxonomy reconciliation. |
| `scripts/verify_phase3_checks.ts` | Created | Automated verification script executing all Phase 3 verification checks (3 repeated attempts, A/B/C/D distribution across 40 questions, scoring verification, explanation matching, and zero-LLM confirmation). |
| `CHANGES.md` | Modified | Logged all Phase 14 changes. |

---

## Phase 15: Hero Section Scroll Jank Diagnosis, Optimization & Phase 4 Decoupled Architecture (completed)

### Overview
Diagnosed and resolved scroll-animation stutter and frame drops in the hero section (`<ScrollVideo />`). Profiling revealed severe compositor raster stalls caused by continuous video decoder seeks (`video.currentTime = targetTime`). Implemented Phase 4's decoupled architecture: native hardware-accelerated autoplaying video coupled with 100% GPU-composited transform/opacity scroll parallax.

### Diagnosis Baseline (Chrome DevTools Protocol Profiling)
- **Normal 1x CPU**:
  - FPS: 54.8 FPS (1% Low: 3.2 FPS)
  - Max Frame Time Spike: 310.4 ms
  - Painting / Rasterization Time: 4,839.0 ms
  - Longest Raster Tasks: 1,710.7 ms, 1,014.8 ms, 440.4 ms
  - Long Tasks (>50ms): 15 trace long tasks (including 296 ms main-thread task)
- **4x CPU Throttling**:
  - FPS: 48.3 FPS (1% Low: 10.2 FPS)
  - Dropped Frames: 45 frames (26.8% dropped)
  - Severe Jank Frames (>33ms): 17 frames
  - Main-Thread Long Tasks: 5 blocking tasks (962 ms, 670 ms, 104 ms, 93 ms, 62 ms)

### Key Enhancements Applied
1. **Decoupled Video Autoplay (Phase 4)**:
   - Eliminated `video.currentTime` seeking completely, terminating hardware decoder pipeline stalls.
   - Video autoplays smoothly on a dedicated hardware queue when visible.
   - `IntersectionObserver` automatically pauses playback when scrolled out of view to conserve CPU, GPU, and battery.
2. **100% GPU-Composited Scroll Motion**:
   - Scroll position drives lightweight parallax: `translate3d(0, -70px, 0)`, subtle contraction `scale(0.96)`, and opacity fade.
   - Direct DOM ref updates inside throttled `requestAnimationFrame` callback with `{ passive: true }` scroll listener.
   - Zero layout-triggering properties (no `top`, `left`, `width`, `height`, `margin`).
   - `will-change: transform, opacity` and `contain: paint layout` ensure hardware layer promotion.
3. **Asset Preloading & Resource Hints**:
   - Added `<link rel="preload" as="video">` and `<link rel="preload" as="image">` in `client/index.html` to eliminate mid-scroll loading stutter.
4. **Full Reduced-Motion Support**:
   - Responds to `prefers-reduced-motion: reduce` by pausing video, canceling motion transforms, and displaying crisp static poster frame.

### Post-Fix Verification (Chrome DevTools Protocol Profiling)
- **Painting Time Reduction**: Dropped from 4,839.0 ms to 82.9 ms (**98.3% reduction**)!
- **Raster Spikes**: 0 ms (all 1,000ms+ `RasterTask` spikes completely eliminated).
- **Hero Scroll Main-Thread Long Tasks**: Reduced from 823 ms / 296 ms spikes to 0 blocking tasks during hero scroll.
- **Max Frame Time**: Dropped from 310.4 ms down to 33.1 ms on normal CPU.
- **Functional Integrity**: All 45 vitest tests across 14 test suites passing; TypeScript 0 errors.

### Files Modified

| File | Action | Reason |
|---|---|---|
| `client/src/components/ScrollVideo.tsx` | Modified | Rewrote to decouple video playback from scroll seeking; added GPU-composited translate3d/scale parallax, IntersectionObserver visibility pause, passive scroll listener, and reduced-motion handling. |
| `client/index.html` | Modified | Added preload hints for `/scroll-hero.mp4` and `/scroll-hero-poster.webp`. |
| `CHANGES.md` | Modified | Documented baseline metrics, root cause analysis, Phase 4 implementation, and verification results. |

---

## Phase 16: Single Source of Truth for Answer Screen Grounding & Refusal Across All Modes (completed)

### Overview
Fixed a consistency bug where ungrounded/refused queries (e.g. asking "What is React?" against a hackathon rule book or off-topic questions against lecture/PDF material) correctly output refusal answer text, but still rendered conflicting positive signals:
- A green "GROUNDED" status pill in the AnswerCard header
- 5 source cards in the Evidence Trail / Source Moments section
- Retrieved excerpt in the Document Context / Source in Brief panel

The core retrieval and refusal decision logic was preserved. All surrounding UI elements and API response shapes were unified under a single source of truth (`isRefusal` / `isGrounded` / `effectiveGrounded`).

### Key Enhancements Applied
1. **Design System & Status Pill (`client/src/index.css`)**:
   - Added `.status-badge-pill.is-refused` with a muted red theme (`#dc2626`, `rgba(220, 38, 38, 0.1)`, `rgba(220, 38, 38, 0.2)` border).
   - Ensured clean visual distinction between grounded (green) and ungrounded/refusal (red) states.
2. **Shared UI Single Source of Truth (`client/src/pages/Home.tsx`)**:
   - Added `isRefusalText` detector for canonical refusal language and phrases.
   - Added `extractAndAlignUsedCitations` helper: extracts citations actually referenced in the answer (e.g., `[1]`, `[2]`), filters down to only those chunks, and re-numbers in-text markers so indexes match the rendered cards without out-of-bounds errors.
   - In `uploadAnswerMutation.onSuccess`: unified `effectiveGrounded = !isRefusal && (raw.grounded ?? (raw.sources.length > 0))` and cleared `citations: []` when refused.
   - In `AnswerCard`: wired status pill to `isRefusal ? "Not Grounded" (is-refused)` vs `"Grounded"`. Displayed `0 sources` on refusal and hid the "Quiz me on this" button.
   - In `Evidence Trail`: conditioned on `isGrounded`. If ungrounded or refused, displays `00 sources` and the empty-state fallback ("No sources used for this answer.").
   - In `Document Context`: conditioned on `isGrounded && active`. If ungrounded or refused, displays empty state ("No relevant source found for this question", badge `NOT_GROUNDED`, and helpful explanation that no source was cited because the question is not covered in the material).
3. **Backend Response Standardization**:
   - `server/ai/uploadService.ts`: Standardized LLM and pipeline refusal variations to return `grounded: false, mode: "refusal", sources: [], retrieved: 0`. Preserved candidate retrieval for offline extractive fallbacks.
   - `server/preview/realCorpus.ts`: Standardized playlist refusal response to return `grounded: false, mode: "refusal", sources: [], retrieved: 0`.
   - `server/ai/boundary.ts`: Standardized boundary test helper refusal to return `grounded: false, citations: [], mode: "refusal"`.
4. **Verification Test Suite (`server/verify_consistency.test.ts`)**:
   - Validated both Text Mode (Hackathon Rule Book) and PDF Mode (Search PDF) for:
     - Case 1 (Refusal): Unrelated queries ("What is React?", "Who painted the Mona Lisa?") correctly yield refusal text, `grounded: false`, `sources: []`, status pill "Not Grounded", empty Evidence Trail, and empty Document Context.
     - Case 2 (Grounded): Genuinely answerable queries ("team size", "Binary Search time complexity") yield grounded answer text, `grounded: true`, non-empty sources, green "Grounded" pill, populated Evidence Trail, and active Document Context.
   - Verified that all existing unit and pipeline tests (14 test suites, 45 tests) remain passing.

### Files Modified & Created

| File | Action | Reason |
|---|---|---|
| `client/src/index.css` | Modified | Added `.status-badge-pill.is-refused` styling for ungrounded/refusal pill. |
| `client/src/pages/Home.tsx` | Modified | Unified AnswerCard, Evidence Trail, and Document Context under single source of truth; aligned citations to used chunks. |
| `server/ai/uploadService.ts` | Modified | Refusal responses explicitly set `grounded: false`, `mode: "refusal"`, `sources: []`. |
| `server/preview/realCorpus.ts` | Modified | Playlist refusal responses explicitly set `grounded: false`, `mode: "refusal"`, `sources: []`. |
| `server/ai/boundary.ts` | Modified | Boundary refusal responses set `grounded: false`, `citations: []`. |
| `server/verify_consistency.test.ts` | Created | Concrete end-to-end verification test suite covering Text, PDF, and Playlist modes for both refusal and grounded cases. |
| `CHANGES.md` | Modified | Documented root cause, architecture changes, and verification. |

---

## Phase 17: Per-Device Data Isolation for Uploaded Documents (completed)

### Overview
Added end-to-end per-device data isolation to the RAG study assistant's PDF/text upload feature without requiring user accounts or logins. A document uploaded from one browser/device is strictly isolated and can never be answered from, visible to, or mixed with another browser/device's session — even under high-load concurrent usage.

### Key Implementation Details
1. **Frontend Anonymous Persistent Device Identifier (`client/src/lib/deviceId.ts`)**:
   - Implemented `getDeviceId()` which generates a unique UUID using `crypto.randomUUID()` on first load and stores it in browser `localStorage` (`unstuck_device_id`).
   - Persists across page reloads and browser visits in that profile.
2. **Dual-Layer Request Forwarding**:
   - `client/src/main.tsx`: Automatically attaches the `x-device-id` header to all tRPC HTTP batch requests.
   - `client/src/pages/Home.tsx`: Passes `deviceId` in `uploads.list.useQuery({ deviceId })`, `uploadAnswerMutation.mutate({ ..., deviceId })`, `ingestTextMutation.mutate({ ..., deviceId })`, and `ingestPdfMutation.mutate({ ..., deviceId })`.
3. **Backend Scope & Isolation Enforcement**:
   - `server/_core/context.ts`: Extracts `x-device-id` header into `TrpcContext.deviceId`.
   - `server/ai/uploadService.ts`:
     - Added `deviceId: string` to `UploadDocument` and `UploadChunk` data models.
     - `ingestText` & `ingestPdf`: Require non-empty `deviceId`, tagging documents and chunks upon ingestion.
     - `listDocuments(deviceId)`: Strictly filters returned documents by the requesting device ID; returns `[]` when no device ID is supplied.
     - `getDocumentStatus(docId, deviceId)` & `getDocumentChunks(docId, deviceId)`: Enforce device matching.
     - `answerUploads({ question, scope, docId, deviceId })`: Verifies that `docId` exists and belongs to the requesting `deviceId`. Throws `UploadServiceError(404, "Uploaded document not found for this device. Please upload it again.")` on cross-device access attempts, explicitly refusing unauthorized retrieval.
4. **REST Endpoints (`server/_core/index.ts`)**:
   - `/ingest/text`, `/ingest/pdf`, `/uploads/documents`, and `/v1/answers/scoped` extract `x-device-id` header or body/query params and enforce device-level isolation.
5. **tRPC Router (`server/routers.ts`)**:
   - `uploads.ingestText`, `uploads.ingestPdf`, `uploads.list`, `uploads.status`, and `uploads.answer` validate and enforce `deviceId` from context or input.

### Verification (All 5 Concurrent Test Scenarios Passed)
Implemented dedicated test suite in `server/device.isolation.test.ts` verifying:
1. **Test 1 (Device A Grounded Retrieval)**: Device A uploads quantum encryption PDF and asks a question; receives correct grounded answer citing Key `Alpha-9988`.
2. **Test 2 (Device B Isolated Retrieval)**: Device B uploads sonar navigation PDF; answers come strictly from Device B's document (`Beta-4422`), with zero leakage of Device A's data.
3. **Test 3 (Cross-Device Refusal)**: Device B queries Device A's document ID directly; backend explicitly refuses with `NOT_FOUND` (404) error.
4. **Test 4 (Isolated Document Listing)**: Device A's list only contains Device A's upload; Device B's list only contains Device B's upload; status queries for another device's document return `null`.
5. **Test 5 (Simultaneous Concurrent Uploads & Stress Test)**: 10 concurrent distinct device clients uploading and querying simultaneously at the exact same millisecond with unique secret payloads; all queries strictly isolated, and 90/90 cross-device unauthorized retrieval attempts explicitly refused.

### Files Modified & Created

| File | Action | Reason |
|---|---|---|
| `client/src/lib/deviceId.ts` | Created | Persistent anonymous device ID generation and `localStorage` caching helper. |
| `client/src/main.tsx` | Modified | Attached `x-device-id` header to tRPC client links. |
| `client/src/pages/Home.tsx` | Modified | Forwarded `deviceId` to document listing, ingestion, and search mutations. |
| `server/_core/context.ts` | Modified | Extracted `x-device-id` header into `TrpcContext.deviceId`. |
| `server/ai/uploadService.ts` | Modified | Added `deviceId` to data models; enforced device filtering on listing, status, chunks, and retrieval. |
| `server/routers.ts` | Modified | Updated `uploads` router procedures and error handling for device isolation. |
| `server/_core/index.ts` | Modified | Added device ID extraction and filtering to REST endpoints. |
| `server/device.isolation.test.ts` | Created | Comprehensive multi-device concurrent isolation and stress test suite. |
| `server/uploads.integration.test.ts` | Modified | Updated test assertions and helpers to pass test `deviceId`. |
| `server/uploads.router.test.ts` | Modified | Updated mock context with test `deviceId`. |
| `server/rag.pipeline.test.ts` | Modified | Updated test pipeline calls to include test `deviceId`. |
| `server/verify_consistency.test.ts` | Modified | Updated test cases to include test `deviceId`. |
| `CHANGES.md` | Modified | Documented Phase 17 changes and test results. |




