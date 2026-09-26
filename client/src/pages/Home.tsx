import { useCallback, useMemo, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { selectedLecturePlayback } from "@/lib/youtube";
import { validateLectureQuestion } from "@/lib/questionValidation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollVideo } from "@/components/ScrollVideo";
import { RagInteractive3D } from "@/components/RagInteractive3D";
import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  CircleDot,
  Clock3,
  Command,
  ExternalLink,
  FileText,
  Library,
  Loader2,
  LockKeyhole,
  Menu,
  Network,
  Play,
  Search,
  Shield,
  Sparkles,
  Upload,
  X,
  Zap,
} from "lucide-react";

/* ─── Types ─── */

type Citation = {
  id: string;
  title: string;
  timestamp?: string;
  startSec?: number;
  videoId?: string;
  text?: string;
  url?: string;
  durationSec?: number;
  sourceType?: "video" | "pdf" | "text";
  page?: number;
};

type SearchResult = {
  answer: string;
  grounded: boolean;
  mode: "preview" | "live";
  citations: Citation[];
  retrieval: { chunks: number; latencyMs: number; model: string };
};

/* ─── Constants ─── */

const SUGGESTIONS = [
  "Memoization aur tabulation ka difference?",
  "Sliding window kab use karna chahiye?",
  "Binary search on answer explain karo",
];

const PLAYLIST_SUGGESTIONS = [
  "When should I use two pointers?",
  "What is the sliding window pattern?",
  "Which pattern is used for subarray sum problems?",
  "Explain linked list reversal",
];

const SCOPE_META = {
  lectures: { label: "Pratyush Lectures", icon: Library, color: "lecture" },
  playlist: { label: "DSA Playlist Chat", icon: Sparkles, color: "lecture" },
  uploads:  { label: "My Uploads",        icon: Upload,   color: "upload" },
  both:     { label: "Both",              icon: Zap,      color: "upload" },
} as const;

type Scope = keyof typeof SCOPE_META;

const DEFAULT_RESULT: SearchResult = {
  answer: "",
  grounded: false,
  mode: "preview",
  citations: [],
  retrieval: { chunks: 0, latencyMs: 0, model: "BGE-M3 · local corpus retrieval" },
};

/* ─── Helpers ─── */

function formatDuration(seconds = 0) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  return `${hours ? `${hours}:` : ""}${minutes.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
}

/* Parse [1], [2] citation markers from answer text and render inline chips */
function renderAnswerWithCitations(
  text: string,
  onHoverCitation: (index: number | null) => void,
  onClickCitation: (index: number) => void,
) {
  const lines = text.split("\n");
  return lines.map((line, lineIdx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("### ")) {
      return (
        <span key={lineIdx} className="block mt-5 mb-2 text-xs font-bold tracking-widest uppercase" style={{ color: "var(--primary)" }}>
          {trimmed.slice(4)}
        </span>
      );
    }
    if (trimmed.startsWith("- ")) {
      return (
        <span key={lineIdx} className="block pl-4 relative" style={{ lineHeight: "1.8" }}>
          <span className="absolute left-0" style={{ color: "var(--primary)" }}>•</span>
          {renderInlineParts(trimmed.slice(2), onHoverCitation, onClickCitation)}
        </span>
      );
    }
    return (
      <span key={lineIdx} className="block min-h-[1.2em]">
        {renderInlineParts(line, onHoverCitation, onClickCitation)}
      </span>
    );
  });
}

function renderInlineParts(
  text: string,
  onHoverCitation: (index: number | null) => void,
  onClickCitation: (index: number) => void,
) {
  // Split on bold markers (**...**) and citation refs [1], [2], etc.
  const parts = text.split(/(\*\*[^*]+\*\*|\[\d+\])/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={idx} style={{ color: "var(--primary)", fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
    }
    const citMatch = part.match(/^\[(\d+)\]$/);
    if (citMatch) {
      const citIndex = parseInt(citMatch[1], 10) - 1;
      return (
        <button
          key={idx}
          className="citation-ref"
          onMouseEnter={() => onHoverCitation(citIndex)}
          onMouseLeave={() => onHoverCitation(null)}
          onClick={() => onClickCitation(citIndex)}
          aria-label={`Go to source ${citIndex + 1}`}
        >
          {citIndex + 1}
        </button>
      );
    }
    return part;
  });
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

/* ─── Citation Card (video sources) ─── */
function CitationCard({
  citation, index, active, highlighted, onSelect,
}: {
  citation: Citation; index: number; active: boolean; highlighted: boolean; onSelect: () => void;
}) {
  const classes = [
    "lecture-card group w-full text-left",
    active ? "citation-active" : "",
    highlighted ? "citation-highlight" : "",
  ].filter(Boolean).join(" ");

  return (
    <button onClick={onSelect} className={classes} aria-label={`Play ${citation.title} from ${citation.timestamp}`}>
      <span className="lecture-thumb">
        <img src={`https://i.ytimg.com/vi/${citation.videoId}/hqdefault.jpg`} alt="" loading="lazy" />
        <span className="thumb-play"><Play className="h-3 w-3 fill-current" /></span>
      </span>
      <span className="lecture-card-copy min-w-0 flex-1">
        <span className="lecture-card-title">
          <span className="truncate">{citation.title}</span>
          <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" style={{ color: "var(--primary)" }} />
        </span>
        <span className="lecture-card-meta">
          <span className="full-lecture-label">Source {index + 1}</span>
          <span>starts at <strong>{citation.timestamp}</strong></span>
        </span>
      </span>
      <span className="timecode">{citation.timestamp ?? "--:--"}</span>
    </button>
  );
}

/* ─── Source Card (PDF/text/video router) ─── */
function SourceCard({
  citation, index, active, highlighted, onSelect,
}: {
  citation: Citation; index: number; active: boolean; highlighted: boolean; onSelect: () => void;
}) {
  if (citation.sourceType === "video" || citation.videoId) {
    return <CitationCard citation={citation} index={index} active={active} highlighted={highlighted} onSelect={onSelect} />;
  }
  const classes = [
    "lecture-card",
    active ? "citation-active" : "",
    highlighted ? "citation-highlight" : "",
  ].filter(Boolean).join(" ");

  return (
    <div className={classes}>
      <span className="lecture-thumb" style={{ display: "grid", placeItems: "center" }}>
        <FileText className="h-5 w-5" style={{ color: "var(--muted-foreground)" }} />
      </span>
      <span className="lecture-card-copy min-w-0 flex-1">
        <span className="lecture-card-title">{citation.title}</span>
        <span className="lecture-card-meta">
          <span className="full-lecture-label">{citation.sourceType === "pdf" ? `PDF · page ${citation.page}` : "Uploaded notes"}</span>
        </span>
        {citation.text ? <span className="lecture-card-action">{citation.text}</span> : null}
      </span>
      <span className="timecode">{citation.sourceType === "pdf" ? `p.${citation.page}` : "note"}</span>
    </div>
  );
}

/* ─── Hero Section ─── */
function HeroSection() {
  return (
    <section className="hero-section">
      <ScrollVideo src="/scroll-hero.mp4" sectionHeight="300vh" />
    </section>
  );
}

/* ─── Mode Selector ─── */
function ModeSelector({
  scope, onChange,
}: {
  scope: Scope; onChange: (s: Scope) => void;
}) {
  return (
    <div className="mode-selector" role="tablist" aria-label="Choose source mode">
      {(Object.keys(SCOPE_META) as Scope[]).map((key) => {
        const meta = SCOPE_META[key];
        const Icon = meta.icon;
        return (
          <button
            key={key}
            role="tab"
            aria-selected={scope === key}
            data-mode={key}
            className={`mode-btn ${scope === key ? "active" : ""}`}
            onClick={() => onChange(key)}
          >
            <Icon className="h-3.5 w-3.5" />
            {meta.label}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Answer Card ─── */
function AnswerCard({
  result, isBusy, isError, scope, onClear, highlightedCitation, onHoverCitation, onClickCitation,
}: {
  result: SearchResult;
  isBusy: boolean;
  isError: boolean;
  scope: Scope;
  onClear: () => void;
  highlightedCitation: number | null;
  onHoverCitation: (idx: number | null) => void;
  onClickCitation: (idx: number) => void;
}) {
  if (isError) {
    return (
      <motion.div className="state-card error-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <CircleDot className="h-5 w-5" style={{ color: "var(--error)" }} />
        <div>
          <strong>Couldn't reach the retrieval layer.</strong>
          <p>Try again in a moment. Your lecture corpus remains available locally.</p>
        </div>
        <Button variant="outline" onClick={onClear} size="sm">Clear</Button>
      </motion.div>
    );
  }

  if (isBusy) {
    return (
      <motion.div className="state-card loading-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--primary)" }} />
        <div>
          <strong>Searching {scope === "playlist" ? "DSA Playlist" : "your material"}…</strong>
          <p>Finding exact timestamped moments and building a grounded answer.</p>
        </div>
      </motion.div>
    );
  }

  if (!result.grounded || !result.answer.trim()) {
    return (
      <motion.div className="state-card empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <Search className="h-6 w-6" style={{ color: "var(--muted-foreground)" }} />
        <div>
          <strong>{result.answer || "This topic isn't covered in your material."}</strong>
          <p>{scope === "playlist"
            ? "Try a DSA concept from the lecture playlist — patterns, data structures, algorithms."
            : "Try a phrase or concept from your selected source material."}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="answer-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="answer-card-head">
        <span className="answer-label">
          <Sparkles className="h-4 w-4" />
          {result.mode === "live" ? "Grounded synthesis" : "Material-only fallback"}
        </span>
        <span className="answer-model">{result.retrieval.model}</span>
      </div>
      <div className="answer-text">
        {renderAnswerWithCitations(result.answer, onHoverCitation, onClickCitation)}
      </div>
      <div className="answer-footer">
        <span><FileText className="h-3.5 w-3.5" /> {result.citations.length} sources</span>
        <span><Clock3 className="h-3.5 w-3.5" /> {result.retrieval.latencyMs}ms retrieval</span>
        <button onClick={() => navigator.clipboard?.writeText(result.answer)} className="copy-button">Copy answer</button>
      </div>
    </motion.div>
  );
}

/* ─── Video Player Panel ─── */
function VideoPlayer({ citation }: { citation: Citation | undefined }) {
  const playback = citation?.videoId && citation.startSec !== undefined
    ? selectedLecturePlayback({ videoId: citation.videoId, startSec: citation.startSec })
    : null;

  return (
    <div className="video-card">
      <div className="video-screen">
        {playback ? (
          <iframe
            className="video-embed"
            title="Lecture playback"
            src={playback.embedUrl}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="video-placeholder">
            <Network className="h-6 w-6" />
            <span>Ask a question to load a source</span>
          </div>
        )}
      </div>
      <div className="video-info">
        <span className="video-live-tag">YOUTUBE</span>
        <h4>{citation?.title ?? "No source selected"}</h4>
        <p>{citation ? `Playback starts at ${citation.timestamp ?? "--:--"}` : "Your grounded lecture moment will appear here."}</p>
        {citation?.url ? (
          <a href={citation.url} target="_blank" rel="noreferrer" className="watch-link">
            Open in YouTube <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : null}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function Home() {
  const [question, setQuestion] = useState("");
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [activeCitation, setActiveCitation] = useState(0);
  const [highlightedCitation, setHighlightedCitation] = useState<number | null>(null);
  const [result, setResult] = useState<SearchResult>(DEFAULT_RESULT);
  const [mobileNav, setMobileNav] = useState(false);
  const [scope, setScope] = useState<Scope>("lectures");
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteText, setNoteText] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const answerRef = useRef<HTMLDivElement>(null);

  const scrollToAnswer = useCallback(() => {
    setTimeout(() => {
      answerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }, []);

  /* ─── Mutations ─── */
  const searchMutation = trpc.lecture.search.useMutation({
    onSuccess: (data) => { setResult(data as SearchResult); setActiveCitation(0); scrollToAnswer(); },
  });
  const uploadAnswerMutation = trpc.uploads.answer.useMutation({
    onSuccess: (data) => {
      setResult({
        answer: data.answer,
        grounded: data.grounded,
        mode: data.mode === "live" ? "live" : "preview",
        citations: data.sources.map((source, index) => {
          const parsedSec = source.timestamp ? source.timestamp.split(":").reduce((t, p) => t * 60 + Number(p), 0) : undefined;
          return {
            id: `${source.source_id}-${index}`,
            title: source.title,
            timestamp: source.timestamp ?? undefined,
            startSec: parsedSec,
            videoId: source.source_type === "video" ? source.source_id : undefined,
            url: source.source_type === "video" && parsedSec !== undefined ? `https://www.youtube.com/watch?v=${source.source_id}&t=${parsedSec}s` : undefined,
            text: source.snippet,
            sourceType: source.source_type,
            page: source.page ?? undefined,
          };
        }),
        retrieval: { chunks: data.retrieved, latencyMs: 0, model: data.mode === "live" ? (scope === "playlist" ? "DSA playlist retrieval" : "Grounded upload retrieval") : "Material-only fallback" },
      });
      setActiveCitation(0);
      scrollToAnswer();
    },
  });
  const ingestTextMutation = trpc.uploads.ingestText.useMutation({
    onSuccess: (document) => { setSelectedDocId(document.docId); setUploadError(null); setNoteText(""); },
    onError: (error) => setUploadError(error.message),
  });
  const ingestPdfMutation = trpc.uploads.ingestPdf.useMutation({
    onSuccess: (document) => { setSelectedDocId(document.docId); setUploadError(null); },
    onError: (error) => setUploadError(error.message),
  });
  const { data: uploadedDocuments, refetch: refetchDocuments } = trpc.uploads.list.useQuery();
  const { data: jobs } = trpc.ops.jobs.useQuery();
  const { data: workspace } = trpc.lecture.workspace.useQuery();

  const active = result.citations[activeCitation] ?? result.citations[0];

  const runSearch = useCallback((value = question) => {
    const normalized = value.trim();
    const validationError = validateLectureQuestion(normalized);
    if (validationError) { setValidationMessage(validationError); return; }
    if (searchMutation.isPending || uploadAnswerMutation.isPending) return;
    setValidationMessage(null);
    setQuestion(normalized);
    if (scope === "lectures") { searchMutation.mutate({ question: normalized, topK: 5 }); return; }
    if (scope === "playlist") { uploadAnswerMutation.mutate({ question: normalized, scope: "playlist", topK: 5 }); return; }
    if (!selectedDocId) { setValidationMessage("Upload and select study material before searching."); return; }
    uploadAnswerMutation.mutate({ question: normalized, scope, docId: selectedDocId, topK: 5 });
  }, [question, scope, selectedDocId, searchMutation, uploadAnswerMutation]);

  const isBusy = searchMutation.isPending || uploadAnswerMutation.isPending;
  const isError = searchMutation.isError || uploadAnswerMutation.isError;
  const isIngesting = ingestTextMutation.isPending || ingestPdfMutation.isPending;

  const uploadNotes = () => {
    if (!noteTitle.trim() || !noteText.trim()) { setUploadError("Add a title and notes before uploading."); return; }
    ingestTextMutation.mutate({ title: noteTitle.trim(), text: noteText.trim() }, { onSuccess: () => { refetchDocuments(); } });
  };
  const uploadPdf = (file: File | undefined) => {
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) { setUploadError("PDF files must be 20 MB or smaller."); return; }
    if (!file.name.toLowerCase().endsWith(".pdf")) { setUploadError("Choose a PDF file."); return; }
    const reader = new FileReader();
    reader.onerror = () => setUploadError("We could not read that PDF.");
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      const contentBase64 = dataUrl.split(",")[1];
      if (!contentBase64) { setUploadError("We could not read that PDF."); return; }
      ingestPdfMutation.mutate({ title: file.name.replace(/\.pdf$/i, ""), fileName: file.name, contentType: file.type || "application/pdf", contentBase64 }, { onSuccess: () => { refetchDocuments(); } });
    };
    reader.readAsDataURL(file);
  };

  const handleCitationClick = useCallback((index: number) => {
    if (index >= 0 && index < result.citations.length) {
      setActiveCitation(index);
      const cit = result.citations[index];
      if (cit.videoId && cit.startSec !== undefined) {
        window.open(selectedLecturePlayback({ videoId: cit.videoId, startSec: cit.startSec }).watchUrl, "_blank", "noopener,noreferrer");
      }
    }
  }, [result.citations]);

  const handleScopeChange = useCallback((newScope: Scope) => {
    setScope(newScope);
    setResult(DEFAULT_RESULT);
    setValidationMessage(null);
    setHighlightedCitation(null);
  }, []);

  /* ─── Render ─── */
  return (
    <div className="app-shell">
      {/* ─── Top Bar ─── */}
      <header className="topbar">
        <a href="#top" className="brand" aria-label="Unstuck home">
          <video
            src="/brand-logo.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="brand-logo-video"
          />
        </a>
        <nav className={`topnav ${mobileNav ? "topnav-open" : ""}`}>
          <a className="nav-link active" href="#search">Search</a>
          <a className="nav-link" href="#library">Sources</a>
          <a className="nav-link" href="#operations">System</a>
        </nav>
        <div className="top-actions">
          <span className="status-pill"><span className="status-pulse" /> Index online</span>
          <Button variant="outline" className="login-button"><LockKeyhole className="h-3.5 w-3.5" /> Sign in</Button>
          <button className="mobile-menu" onClick={() => setMobileNav(!mobileNav)} aria-label="Toggle navigation">
            {mobileNav ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      <main id="top" className="main-content">
        {/* ─── Hero (Clean Full-Screen Scroll Video) ─── */}
        <HeroSection />

        {/* ─── RAG Showcase: Existing Card + 3D Spatial Visual Side-by-Side ─── */}
        <section className="rag-showcase-section">
          <div className="rag-showcase-grid">
            {/* Existing Card (Left Half: 45–50%) */}
            <motion.div
              className="hero-copy hero-copy-static"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <div className="eyebrow"><Shield className="h-3.5 w-3.5" /> Source-grounded answers only</div>
              <h1 className="text-display">
                Every answer<br />
                <span>cites its source.</span>
              </h1>
              <p className="hero-lede">
                Upload your PDF, paste your notes, or search 126 indexed DSA lectures.
                Ask a question — get an answer grounded strictly in your material, with
                the exact page or timestamp so you can verify it yourself.
              </p>
              <div className="hero-trust-signals">
                <span className="trust-signal"><CheckCircle2 className="h-4 w-4" /> Never guesses — refuses when unsure</span>
                <span className="trust-signal"><CheckCircle2 className="h-4 w-4" /> Clickable timestamp + page citations</span>
                <span className="trust-signal"><CheckCircle2 className="h-4 w-4" /> Each source mode isolated</span>
              </div>
            </motion.div>

            {/* 3D RAG Visualization (Right Half: 45–50%) */}
            <motion.div
              className="rag-3d-wrapper"
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <RagInteractive3D />
            </motion.div>
          </div>
        </section>

        {/* ─── Search Panel ─── */}
        <motion.section
          className="search-panel"
          id="search"
          aria-label="Study material search"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <div className="search-panel-top">
            <span className="panel-kicker"><Command className="h-3.5 w-3.5" /> Ask your study material</span>
            <span className="shortcut"><kbd>⌘</kbd><kbd>K</kbd> to focus</span>
          </div>

          <ModeSelector scope={scope} onChange={handleScopeChange} />

          {/* Mode context indicator */}
          {scope === "playlist" && (
            <div className="mode-indicator lecture-mode">
              <Sparkles className="h-3.5 w-3.5 shrink-0" />
              <span><strong>Playlist Mode:</strong> Answers grounded in 126 DSA lecture transcripts with exact video + timestamp citations.</span>
            </div>
          )}
          {(scope === "uploads" || scope === "both") && (
            <div className="mode-indicator upload-mode">
              <Upload className="h-3.5 w-3.5 shrink-0" />
              <span><strong>Upload Mode:</strong> Answers grounded strictly in your uploaded material with page/section citations.</span>
            </div>
          )}

          {/* Document selector for upload modes */}
          {(scope === "uploads" || scope === "both") && (
            <select
              className="w-full rounded-lg border bg-background px-4 py-2.5 text-sm mb-3"
              style={{ borderColor: "var(--border)" }}
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              aria-label="Choose uploaded document"
            >
              <option value="">Choose uploaded material…</option>
              {(uploadedDocuments ?? []).map((doc) => (
                <option key={doc.docId} value={doc.docId}>{doc.title}</option>
              ))}
            </select>
          )}

          <div className="search-input-wrap">
            <Search className="search-icon h-5 w-5" />
            <Input
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value);
                if (validationMessage && !validateLectureQuestion(e.target.value)) setValidationMessage(null);
              }}
              onKeyDown={(e) => { if (e.key === "Enter") runSearch(); }}
              placeholder={scope === "playlist"
                ? "Ask any DSA concept — two pointers, sliding window, DP, recursion…"
                : scope === "uploads" || scope === "both"
                  ? "Ask a question about your uploaded material…"
                  : "Try: DP mein overlapping subproblems kya hote hain?"}
              className="search-input"
              aria-label="Ask a question"
              aria-invalid={Boolean(validationMessage)}
              aria-describedby={validationMessage ? "question-validation" : undefined}
            />
            <Button onClick={() => runSearch()} disabled={isBusy} className="search-button">
              {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              {isBusy ? "Searching…" : "Ask"}
            </Button>
          </div>

          {validationMessage && <p id="question-validation" className="question-validation" role="alert">{validationMessage}</p>}

          <div className="suggested-row">
            <span>Try:</span>
            {(scope === "playlist" ? PLAYLIST_SUGGESTIONS : SUGGESTIONS).map((s) => (
              <button key={s} onClick={() => runSearch(s)}>{s}<ChevronRight className="h-3 w-3" /></button>
            ))}
          </div>

          {/* Upload panel (only for upload modes) */}
          {(scope === "uploads" || scope === "both") && (
            <div className="upload-panel">
              <div className="upload-panel-head">
                <FileText className="h-4 w-4" style={{ color: "var(--primary)" }} />
                Add your study material
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Input value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} placeholder="Notes title" aria-label="Notes title" />
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Paste notes or a DSA topic writeup…"
                    className="min-h-24 w-full rounded-lg border p-3 text-sm"
                    style={{ background: "var(--background)", borderColor: "var(--border)", color: "var(--foreground)" }}
                    aria-label="Paste notes"
                  />
                  <Button type="button" variant="outline" onClick={uploadNotes} disabled={isIngesting}>
                    {isIngesting ? "Processing…" : "Upload notes"}
                  </Button>
                </div>
                <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-4 text-center text-sm" style={{ color: "var(--muted-foreground)", borderColor: "var(--border)" }}>
                  <FileText className="h-6 w-6" style={{ color: "var(--primary)" }} />
                  <span>Choose a text-based PDF (max 20 MB)</span>
                  <input type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(e) => uploadPdf(e.target.files?.[0])} disabled={isIngesting} />
                  <span className="text-xs">{isIngesting ? "Processing…" : "Page citations included"}</span>
                </label>
              </div>
              {uploadError && <p className="mt-3 text-sm" style={{ color: "var(--error)" }} role="alert">{uploadError}</p>}
            </div>
          )}
        </motion.section>

        {/* ─── Content Grid: Answer + Player ─── */}
        <section className="content-grid" ref={answerRef}>
          <div className="answer-column">
            {/* Section heading */}
            <div className="section-heading">
              <div>
                <div className="section-eyebrow">Your grounded answer</div>
                <h2>
                  {isError ? "Something went wrong" : isBusy ? "Searching…" : result.grounded ? "Here's what your material says." : "Ask a question to begin."}
                </h2>
              </div>
              <Badge className={`grounded-badge ${result.grounded ? "" : "not-grounded"}`}>
                <span className="badge-dot" /> {result.grounded ? "Grounded" : "Not grounded"}
              </Badge>
            </div>

            {/* Answer card */}
            <AnimatePresence mode="wait">
              <AnswerCard
                key={isBusy ? "busy" : isError ? "error" : result.answer || "empty"}
                result={result}
                isBusy={isBusy}
                isError={isError}
                scope={scope}
                onClear={() => setResult(DEFAULT_RESULT)}
                highlightedCitation={highlightedCitation}
                onHoverCitation={setHighlightedCitation}
                onClickCitation={handleCitationClick}
              />
            </AnimatePresence>

            {/* Source list */}
            <div className="sources-heading" id="library">
              <div>
                <div className="section-eyebrow">Evidence trail</div>
                <h3>Source moments</h3>
              </div>
              <span className="source-count">{result.citations.length.toString().padStart(2, "0")} sources</span>
            </div>

            {result.citations.length > 0 ? (
              <div className="citation-list">
                {result.citations.map((citation, index) => (
                  <SourceCard
                    key={citation.id}
                    citation={citation}
                    index={index}
                    active={index === activeCitation}
                    highlighted={index === highlightedCitation}
                    onSelect={() => {
                      setActiveCitation(index);
                      if (citation.sourceType === "video" && citation.videoId && citation.startSec !== undefined) {
                        window.open(selectedLecturePlayback({ videoId: citation.videoId, startSec: citation.startSec }).watchUrl, "_blank", "noopener,noreferrer");
                      }
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="state-card empty-state" style={{ marginTop: "var(--sp-4)" }}>
                <Search className="h-5 w-5" style={{ color: "var(--muted-foreground)" }} />
                <div>
                  <strong>No sources yet.</strong>
                  <p>Ask a question above — matching source moments will appear here with timestamps.</p>
                </div>
              </div>
            )}
          </div>

          {/* ─── Player Column ─── */}
          <aside className="player-column">
            <div className="player-heading">
              <div>
                <div className="section-eyebrow">Playback context</div>
                <h3>Watch it click.</h3>
              </div>
              <span className="live-dot"><span /> live</span>
            </div>

            <VideoPlayer citation={active} />

            <div className="context-note">
              <div className="context-icon"><BookOpen className="h-4 w-4" /></div>
              <div>
                <strong>Why this source?</strong>
                <p>It directly covers the concept from your question — click the timestamp to verify in the original lecture.</p>
              </div>
            </div>
          </aside>
        </section>

        {/* ─── Operations Section ─── */}
        <section className="operations-section" id="operations">
          <div className="ops-header">
            <div>
              <div className="section-eyebrow">System status</div>
              <h2>Index health</h2>
            </div>
            <div className="ops-actions">
              <span className="tiny-status"><span /> all systems nominal</span>
              <Button variant="outline" className="reindex-button"><Zap className="h-3.5 w-3.5" /> Reindex</Button>
            </div>
          </div>
          <div className="ops-grid">
            <div className="metric-card">
              <span className="metric-label">Indexed lectures</span>
              <strong>{workspace?.lectures ?? 24}</strong>
              <span className="metric-foot"><ArrowUpRight className="h-3.5 w-3.5" /> corpus loaded</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Transcript chunks</span>
              <strong>{(workspace?.chunks ?? 2933).toLocaleString()}</strong>
              <span className="metric-foot">all-MiniLM-L6-v2 · 384 dim</span>
            </div>
            <div className="metric-card">
              <span className="metric-label">Hit rate</span>
              <strong>{workspace?.hitRate ?? "87%"}</strong>
              <span className="metric-foot">golden set · top 5</span>
            </div>
            <div className="job-card">
              <div className="job-card-top">
                <span className="metric-label">Latest pipeline job</span>
                <Badge className="job-badge">{jobs?.[0]?.status ?? "running"}</Badge>
              </div>
              <strong>{jobs?.[0]?.label ?? "DP playlist · reindex"}</strong>
              <div className="job-progress">
                <Progress value={jobs?.[0]?.progress ?? 68} />
                <span>{jobs?.[0]?.progress ?? 68}%</span>
              </div>
              <span className="metric-foot">{jobs?.[0]?.detail ?? "1,992 of 2,933 chunks embedded"}</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer" id="about">
        <span>Unstuck / Team Unstoppable — RAG-grounded study assistant</span>
        <span>Answers only from your material <span className="footer-dot" /></span>
      </footer>
    </div>
  );
}
