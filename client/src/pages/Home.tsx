import { useCallback, useMemo, useRef, useState, useEffect, lazy, Suspense, memo } from "react";
import { trpc } from "@/lib/trpc";
import { selectedLecturePlayback } from "@/lib/youtube";
import { validateLectureQuestion } from "@/lib/questionValidation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollVideo } from "@/components/ScrollVideo";
import { RagBesideScrollVideo } from "@/components/RagBesideScrollVideo";
import type { QuizData } from "@/components/QuizModal";
import {
  useTopicProgress,
  TopicCoverageBadge,
  TopicCoverageModal,
  TopicTransitionToast,
  TopicItem,
} from "@/components/TopicCoverage";

const QuizModal = lazy(() => import("@/components/QuizModal").then(m => ({ default: m.QuizModal })));
import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Clock3,
  Command,
  Copy,
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
  playlist: { label: "DSA Playlist Chat", icon: FileText, color: "lecture" },
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
        <span key={lineIdx} className="block mt-4 mb-2 text-xs font-bold tracking-widest uppercase font-regal text-[#B8860B]">
          {trimmed.slice(4)}
        </span>
      );
    }
    if (trimmed.startsWith("- ")) {
      return (
        <span key={lineIdx} className="block pl-4 relative text-[#1C1814]" style={{ lineHeight: "1.75" }}>
          <span className="absolute left-0 text-[#B8860B] font-bold">•</span>
          {renderInlineParts(trimmed.slice(2), onHoverCitation, onClickCitation)}
        </span>
      );
    }
    return (
      <span key={lineIdx} className="block min-h-[1.2em] text-[#1C1814]">
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
  const parts = text.split(/(\*\*[^*]+\*\*|\[\d+\])/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={idx} className="text-[#B8860B] font-bold">{part.slice(2, -2)}</strong>;
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
const CitationCard = memo(function CitationCard({
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
        <img src={`https://i.ytimg.com/vi/${citation.videoId}/hqdefault.jpg`} alt="" width="48" height="36" loading="lazy" decoding="async" />
        <span className="thumb-play"><Play className="h-3 w-3 fill-current" /></span>
      </span>
      <span className="lecture-card-copy min-w-0 flex-1">
        <span className="lecture-card-title">
          <span className="truncate">{citation.title}</span>
          <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100 text-[#B8860B]" />
        </span>
        <span className="lecture-card-meta">
          <span className="full-lecture-label">Source {index + 1}</span>
          <span>starts at <strong>{citation.timestamp}</strong></span>
        </span>
      </span>
      <span className="timecode">{citation.timestamp ?? "--:--"}</span>
    </button>
  );
});

/* ─── Source Card (PDF/text/video router) ─── */
const SourceCard = memo(function SourceCard({
  citation, index, active, highlighted, onSelect,
}: {
  citation: Citation; index: number; active: boolean; highlighted: boolean; onSelect: () => void;
}) {
  if (citation.sourceType === "video" || citation.videoId) {
    return <CitationCard citation={citation} index={index} active={active} highlighted={highlighted} onSelect={onSelect} />;
  }

  const [copied, setCopied] = useState(false);
  const classes = [
    "lecture-card source-card-interactive group w-full text-left",
    active ? "citation-active" : "",
    highlighted ? "citation-highlight" : "",
  ].filter(Boolean).join(" ");

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (citation.text) {
      navigator.clipboard?.writeText(citation.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`source-card-wrapper ${active ? "is-active" : ""}`}>
      <button
        type="button"
        onClick={onSelect}
        className={classes}
        aria-label={`View excerpt from ${citation.title} page ${citation.page ?? 1}`}
        aria-expanded={active}
      >
        <span className="lecture-thumb document-thumb">
          <FileText className="h-5 w-5 document-thumb-icon" />
          {citation.page ? <span className="thumb-page-badge">p.{citation.page}</span> : null}
        </span>
        <span className="lecture-card-copy min-w-0 flex-1">
          <span className="lecture-card-title flex items-center justify-between">
            <span className="truncate">{citation.title}</span>
            <span className="source-click-hint">
              {active ? "Showing brief" : "Click to view brief"}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${active ? "rotate-180" : ""}`} />
            </span>
          </span>
          <span className="lecture-card-meta">
            <span className="full-lecture-label">
              {citation.sourceType === "pdf" ? `PDF · PAGE ${citation.page}` : "Uploaded notes"}
            </span>
            <span className="text-[#756858] text-xs">Click to read brief</span>
          </span>
          {citation.text ? (
            <span className="text-xs text-[#756858] line-clamp-2 mt-1">
              {citation.text}
            </span>
          ) : null}
        </span>
        <span className="timecode">
          {citation.sourceType === "pdf" ? `p.${citation.page}` : "note"}
        </span>
      </button>

      {active && citation.text && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="p-3 bg-[#FBF3E4] border-t border-[rgba(212,175,55,0.3)] rounded-b-xl"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold font-regal text-[#B8860B] uppercase tracking-wider">
              <BookOpen className="h-3.5 w-3.5" />
              <span>Brief — {citation.sourceType === "pdf" ? `Page ${citation.page}` : "Note"}</span>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-xs text-[#1C1814] bg-white border border-[rgba(212,175,55,0.35)] px-2 py-1 rounded-md hover:bg-[#FAF1DF]"
            >
              {copied ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3 text-[#B8860B]" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
          <pre className="text-xs font-mono text-[#1C1814] whitespace-pre-wrap max-h-48 overflow-y-auto">
            {citation.text}
          </pre>
        </motion.div>
      )}
    </div>
  );
});

/* ─── Hero Section (Full-Screen Scroll Video Experience) ─── */
const HeroSection = memo(function HeroSection() {
  return (
    <section className="hero-section">
      <ScrollVideo src="/scroll-hero.mp4" sectionHeight="300vh" />
    </section>
  );
});

/* ─── Mode Selector ─── */
const ModeSelector = memo(function ModeSelector({
  scope, onChange,
}: {
  scope: Scope; onChange: (s: Scope) => void;
}) {
  return (
    <div className="mode-selector" role="tablist" aria-label="Choose source mode">
      {(Object.keys(SCOPE_META) as Scope[]).map((key) => {
        const meta = SCOPE_META[key];
        const Icon = meta.icon;
        const isActive = scope === key;
        return (
          <button
            key={key}
            role="tab"
            aria-selected={isActive}
            data-mode={key}
            className={`mode-btn ${isActive ? "active" : ""}`}
            onClick={() => onChange(key)}
          >
            <Icon className="h-4 w-4" />
            <span>{meta.label}</span>
          </button>
        );
      })}

      {/* Library Button that opens in a new window */}
      <a
        href="/library"
        target="_blank"
        rel="noopener noreferrer"
        className="mode-btn library-mode-btn group"
        aria-label="Open DSA Library in a new window"
        title="Open Curated DSA & Algorithmic Library in a new window"
      >
        <BookOpen className="h-4 w-4 text-[#B8860B] group-hover:scale-110 transition-transform" />
        <span className="font-semibold text-[#1C1814]">Library</span>
        <ExternalLink className="h-3 w-3 text-[#B8860B]/70 ml-0.5" />
      </a>
    </div>
  );
});

/* ─── Answer Card ─── */
function AnswerCard({
  result, isBusy, isError, errorMessage, scope, onClear, highlightedCitation, onHoverCitation, onClickCitation, onStartQuiz, isQuizGenerating,
}: {
  result: SearchResult;
  isBusy: boolean;
  isError: boolean;
  errorMessage?: string | null;
  scope: Scope;
  onClear: () => void;
  highlightedCitation: number | null;
  onHoverCitation: (idx: number | null) => void;
  onClickCitation: (idx: number) => void;
  onStartQuiz?: () => void;
  isQuizGenerating?: boolean;
}) {
  if (isError || errorMessage) {
    return (
      <div className="academic-card">
        <div className="card-header-row">
          <div className="card-header-left">
            <div className="card-header-icon-box" style={{ background: "rgba(220, 38, 38, 0.1)", borderColor: "rgba(220, 38, 38, 0.3)", color: "#DC2626" }}>
              <CircleDot className="h-4 w-4" />
            </div>
            <span className="card-header-title">YOUR GROUNDED ANSWER</span>
          </div>
          <span className="status-badge-pill" style={{ background: "rgba(220, 38, 38, 0.1)", color: "#DC2626" }}>
            <span className="dot" /> Error
          </span>
        </div>
        <div className="academic-empty-state">
          <div className="empty-illustration-circle" style={{ background: "rgba(220, 38, 38, 0.1)", color: "#DC2626" }}>
            <CircleDot className="h-8 w-8" />
          </div>
          <h4 className="academic-empty-title">{errorMessage || "Something went wrong"}</h4>
          <p className="academic-empty-desc">Please check your query or verify your uploaded documents.</p>
          <Button variant="outline" onClick={onClear} size="sm" className="mt-4 border-[rgba(212,175,55,0.4)]">Try Again</Button>
        </div>
      </div>
    );
  }

  if (isBusy) {
    return (
      <div className="academic-card">
        <div className="card-header-row">
          <div className="card-header-left">
            <div className="card-header-icon-box">
              <Loader2 className="h-4 w-4 animate-spin text-[#B8860B]" />
            </div>
            <span className="card-header-title">YOUR GROUNDED ANSWER</span>
          </div>
          <span className="status-badge-pill is-active-brief">
            <span className="dot" /> Searching
          </span>
        </div>
        <div className="academic-empty-state">
          <div className="empty-illustration-circle animate-pulse">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
          <h4 className="academic-empty-title">Searching {scope === "playlist" ? "DSA Playlist" : "your material"}…</h4>
          <p className="academic-empty-desc">Retrieving exact timestamped moments and synthesizing a verified answer.</p>
        </div>
      </div>
    );
  }

  if (!result.grounded || !result.answer.trim()) {
    return (
      <div className="academic-card">
        <div className="card-header-row">
          <div className="card-header-left">
            <div className="card-header-icon-box">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="card-header-title">YOUR GROUNDED ANSWER</span>
          </div>
          <span className="status-badge-pill is-not-grounded">
            <span className="dot" /> Not grounded
          </span>
        </div>
        <div className="academic-empty-state">
          <div className="empty-illustration-circle">
            <Search className="h-8 w-8 text-[#B8860B]" />
          </div>
          <h4 className="academic-empty-title">
            {result.answer ? "Topic not found in material." : "Ask a question to begin."}
          </h4>
          <p className="academic-empty-desc">
            {result.answer
              ? "This topic isn't covered in your selected resources. Try a different question or upload more notes."
              : "Ask a question in the search bar above to get a source-grounded answer with citations."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="answer-card"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="card-header-row">
        <div className="card-header-left">
          <div className="card-header-icon-box">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="card-header-title">YOUR GROUNDED ANSWER</span>
        </div>
        <span className="status-badge-pill is-grounded">
          <span className="dot" /> Grounded
        </span>
      </div>

      <div className="answer-text">
        {renderAnswerWithCitations(result.answer, onHoverCitation, onClickCitation)}
      </div>

      <div className="answer-footer">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 font-medium text-[#1C1814]">
            <FileText className="h-3.5 w-3.5 text-[#B8860B]" /> {result.citations.length} sources
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium text-[#756858]">
            <Clock3 className="h-3.5 w-3.5" /> {result.retrieval.latencyMs}ms retrieval
          </span>
        </div>
        <div className="flex items-center gap-2">
          {result.grounded && onStartQuiz && (
            <button
              onClick={onStartQuiz}
              disabled={isQuizGenerating}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#B8860B] via-[#C59A3F] to-[#E2B855] text-[#1C1814] shadow-[0_4px_14px_rgba(197,154,63,0.35)] hover:shadow-[0_6px_20px_rgba(212,175,55,0.45)] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Generate a verified practice quiz from this material"
            >
              {isQuizGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
              {isQuizGenerating ? "Generating…" : "Practice Quiz"}
            </button>
          )}
          <button
            onClick={() => navigator.clipboard?.writeText(result.answer)}
            className="copy-button inline-flex items-center gap-1"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy answer
          </button>
        </div>
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
      <div className="card-header-row">
        <div className="card-header-left">
          <div className="card-header-icon-box">
            <Play className="h-4 w-4 fill-current" />
          </div>
          <div>
            <span className="card-header-title">PLAYBACK CONTEXT</span>
            <span className="card-header-subtitle">/ Watch it click</span>
          </div>
        </div>
        <span className="status-badge-pill is-active-brief">
          <span className="dot" /> Live Video
        </span>
      </div>

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
          <div className="academic-empty-state h-full">
            <div className="empty-illustration-circle">
              <Play className="h-7 w-7 text-[#B8860B]" />
            </div>
            <h4 className="academic-empty-title">Select a video source</h4>
            <p className="academic-empty-desc">Your grounded lecture timestamp will automatically play here.</p>
          </div>
        )}
      </div>

      <div className="video-info">
        <span className="video-live-tag">YOUTUBE LECTURE</span>
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

/* ─── Document Brief Viewer (for PDF/Notes) ─── */
function DocumentBriefViewer({ citation }: { citation: Citation | undefined }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (citation?.text) {
      navigator.clipboard?.writeText(citation.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="document-reader-card">
      <div className="card-header-row">
        <div className="card-header-left">
          <div className="card-header-icon-box">
            <FileText className="h-4 w-4" />
          </div>
          <div>
            <span className="card-header-title">DOCUMENT CONTEXT</span>
            <span className="card-header-subtitle">/ Source in brief</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="status-badge-pill is-active-brief">
            <span className="dot" /> ACTIVE_BRIEF
          </span>
          <button onClick={handleCopy} className="doc-copy-btn" title="Copy brief" type="button">
            {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-[#B8860B]" />}
            <span>{copied ? "Copied!" : "Copy brief"}</span>
          </button>
        </div>
      </div>

      <div className="document-reader-screen">
        <div className="document-reader-toolbar">
          <div className="flex items-center gap-2">
            <span className="doc-reader-badge">
              <FileText className="h-3.5 w-3.5" />
              {citation?.sourceType === "pdf" ? `PDF · PAGE ${citation.page ?? 1}` : "UPLOADED NOTES"}
            </span>
            <span className="text-[#756858] text-xs">{citation?.text ? `${citation.text.length} chars` : ""}</span>
          </div>
        </div>
        <div className="document-reader-content">
          {citation?.text ? (
            <pre className="document-reader-pre">{citation.text}</pre>
          ) : (
            <div className="academic-empty-state h-full">
              <div className="empty-illustration-circle">
                <FileText className="h-7 w-7 text-[#B8860B]" />
              </div>
              <h4 className="academic-empty-title">Select a source above to read its brief.</h4>
              <p className="academic-empty-desc">Direct citations from your uploaded PDFs and notes will appear here.</p>
            </div>
          )}
        </div>
      </div>

      <div className="video-info">
        <span className="video-live-tag">
          {citation?.sourceType === "pdf" ? `DOCUMENT EXCERPT (PAGE ${citation.page ?? 1})` : "NOTES EXCERPT"}
        </span>
        <h4>{citation?.title ?? "No source selected"}</h4>
        <p>
          {citation
            ? "Direct grounded material cited in the answer."
            : "Your grounded source moment will appear here."}
        </p>
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
  const [scope, setScope] = useState<Scope>("playlist");
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteText, setNoteText] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [lastErrorMessage, setLastErrorMessage] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const answerRef = useRef<HTMLDivElement>(null);
  const showcaseRef = useRef<HTMLElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  /* ─── Keyboard Shortcut: Command / Ctrl + K to focus search ─── */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  /* ─── Topic Coverage & Quiz State ─── */
  const { data: topicsData } = trpc.lecture.topics.useQuery();
  const topics = useMemo(() => (topicsData?.topics || []) as TopicItem[], [topicsData]);
  const { progress, exploredCount, totalTopics, recordInteraction, recentTransition } = useTopicProgress(topics);

  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);
  const [activeQuizData, setActiveQuizData] = useState<QuizData | null>(null);
  const [activeQuizTopicId, setActiveQuizTopicId] = useState<string | null>(null);

  const scrollToAnswer = useCallback(() => {
    setTimeout(() => {
      answerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }, []);

  const findMatchingTopic = useCallback((queryText: string, citationsList?: Citation[]): TopicItem | undefined => {
    if (!topics || topics.length === 0) return undefined;
    const lower = queryText.toLowerCase();

    if (citationsList && citationsList.length > 0) {
      for (const cit of citationsList) {
        if (cit.videoId) {
          const match = topics.find((t) => t.lectureIds && t.lectureIds.includes(cit.videoId!));
          if (match) return match;
        }
      }
    }

    for (const t of topics) {
      if (t.keywords.some((kw) => lower.includes(kw.toLowerCase()))) {
        return t;
      }
    }

    for (const t of topics) {
      if (lower.includes(t.title.toLowerCase())) {
        return t;
      }
    }

    return undefined;
  }, [topics]);

  /* ─── Mutations ─── */
  const uploadAnswerMutation = trpc.uploads.answer.useMutation({
    onSuccess: (data) => {
      setLastErrorMessage(null);
      setHasSearched(true);
      const citations = data.sources.map((source, index) => {
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
      });

      setResult({
        answer: data.answer,
        grounded: data.grounded,
        mode: data.mode === "live" ? "live" : "preview",
        citations,
        retrieval: { chunks: data.retrieved, latencyMs: 0, model: data.mode === "live" ? (scope === "playlist" ? "DSA playlist retrieval" : "Grounded upload retrieval") : "Material-only fallback" },
      });
      setActiveCitation(0);
      scrollToAnswer();

      if (scope === "playlist") {
        const matched = findMatchingTopic(question, citations);
        if (matched) {
          recordInteraction(matched.id, "query");
        }
      }
    },
    onError: (err) => {
      setLastErrorMessage(err.message || "Failed to retrieve an answer. Please try again.");
      setHasSearched(true);
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

  const quizMutation = trpc.quiz.generate.useMutation({
    onSuccess: (data) => {
      setActiveQuizData(data as QuizData);
    },
    onError: (err) => {
      setActiveQuizData({
        success: false,
        topicTitle: "Grounded Quiz",
        scope: scope === "playlist" ? "playlist" : "uploads",
        questions: [],
        totalGenerated: 0,
        discardedCount: 0,
        verifiedCount: 0,
        message: err.message || "Failed to generate grounded quiz.",
      });
    },
  });

  const { data: uploadedDocuments, refetch: refetchDocuments } = trpc.uploads.list.useQuery();
  const { data: jobs } = trpc.ops.jobs.useQuery();
  const { data: workspace } = trpc.lecture.workspace.useQuery();

  const active = result.citations[activeCitation] ?? result.citations[0];

  const runSearch = useCallback((value = question) => {
    const normalized = value.trim();
    const validationError = validateLectureQuestion(normalized);
    if (validationError) { setValidationMessage(validationError); return; }
    if (uploadAnswerMutation.isPending) return;
    setValidationMessage(null);
    setQuestion(normalized);

    if (scope === "playlist") {
      const matched = findMatchingTopic(normalized);
      if (matched) {
        recordInteraction(matched.id, "query");
      }
      uploadAnswerMutation.mutate({ question: normalized, scope: "playlist", topK: 5 });
      return;
    }
    if (!selectedDocId) { setValidationMessage("Upload and select study material before searching."); return; }
    uploadAnswerMutation.mutate({ question: normalized, scope, docId: selectedDocId, topK: 5 });
  }, [question, scope, selectedDocId, uploadAnswerMutation, findMatchingTopic, recordInteraction]);

  const isBusy = uploadAnswerMutation.isPending;
  const isError = uploadAnswerMutation.isError;
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
        if (scope === "playlist") {
          const matched = topics.find((t) => t.lectureIds && t.lectureIds.includes(cit.videoId!));
          if (matched) {
            recordInteraction(matched.id, "citation_click");
          }
        }
        window.open(selectedLecturePlayback({ videoId: cit.videoId, startSec: cit.startSec }).watchUrl, "_blank", "noopener,noreferrer");
      }
    }
  }, [result.citations, scope, topics, recordInteraction]);

  const handleScopeChange = useCallback((newScope: Scope) => {
    setScope(newScope);
    setResult(DEFAULT_RESULT);
    setValidationMessage(null);
    setHighlightedCitation(null);
    setLastErrorMessage(null);
    setHasSearched(false);
  }, []);

  /* ─── Quiz Handlers ─── */
  const handleStartTopicQuiz = (topic: TopicItem) => {
    setActiveQuizTopicId(topic.id);
    setActiveQuizData(null);
    setIsQuizModalOpen(true);
    quizMutation.mutate({
      scope: "playlist",
      topicId: topic.id,
    });
  };

  const handleStartDocQuiz = (docId: string) => {
    setActiveQuizTopicId(null);
    setActiveQuizData(null);
    setIsQuizModalOpen(true);
    quizMutation.mutate({
      scope: "uploads",
      docId,
    });
  };

  const handleStartAnswerQuiz = () => {
    setActiveQuizData(null);
    setIsQuizModalOpen(true);
    if (scope === "playlist") {
      const matched = findMatchingTopic(question, result.citations);
      if (matched) {
        setActiveQuizTopicId(matched.id);
        quizMutation.mutate({
          scope: "playlist",
          topicId: matched.id,
          query: question,
        });
      } else {
        quizMutation.mutate({
          scope: "playlist",
          query: question,
        });
      }
    } else if (scope === "uploads" || scope === "both") {
      quizMutation.mutate({
        scope: "uploads",
        docId: selectedDocId || undefined,
        query: question,
      });
    } else {
      quizMutation.mutate({
        scope: "playlist",
        query: question,
      });
    }
  };

  return (
    <div className="app-shell">
      {/* ─── Top Bar / Header ─── */}
      <header className="topbar">
        <a href="#top" className="brand-wrapper" aria-label="Unstuck — Ask Your Study Material">
          <video
            src="/brand-logo.mp4"
            poster="/brand-logo-poster.webp"
            preload="metadata"
            autoPlay
            loop
            muted
            playsInline
            width="40"
            height="40"
            className="brand-logo-video"
          />
          <div className="brand-text-col">
            <span className="brand-title">ASK YOUR STUDY MATERIAL</span>
            <span className="brand-subtitle">Your notes · Your lectures · Your AI tutor</span>
          </div>
        </a>

        <nav className={`topnav ${mobileNav ? "topnav-open" : ""}`}>
          <a className="nav-link active" href="#search">Search</a>
          <a
            className="nav-link inline-flex items-center gap-1 text-[#B8860B] font-semibold hover:text-[#8C6208]"
            href="/library"
            target="_blank"
            rel="noopener noreferrer"
            title="Open Curated Study Library in a new window"
          >
            <span>Library</span>
            <ExternalLink className="h-3 w-3" />
          </a>
          <a className="nav-link" href="#library">Sources</a>
          <a className="nav-link" href="#operations">System</a>
        </nav>

        <div className="top-actions">
          <div className="focus-shortcut-pill" title="Press ⌘K or Ctrl+K to focus search">
            <kbd>⌘ K</kbd> <span>to focus</span>
          </div>
          <span className="status-pill"><span className="status-pulse" /> Index online</span>
          <Button variant="outline" className="login-button"><LockKeyhole className="h-3.5 w-3.5 mr-1" /> Sign in</Button>
          <button className="mobile-menu" onClick={() => setMobileNav(!mobileNav)} aria-label="Toggle navigation">
            {mobileNav ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      <main id="top" className="main-content">
        {/* ─── Hero Section: Full-Screen Scroll-Controlled Video ─── */}
        <HeroSection />

        {/* ─── RAG Showcase: Side-by-Side Value Proposition & 3D Interactive Scroll Video ─── */}
        <section ref={showcaseRef} className="rag-showcase-section">
          <div className="rag-showcase-sticky">
            <div className="rag-showcase-grid">
              {/* Feature Copy Card */}
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

              {/* Scroll-Controlled Beside Video */}
              <motion.div
                className="rag-3d-wrapper"
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                <RagBesideScrollVideo src="/rag-scroll.mp4" containerRef={showcaseRef} />
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─── Main Rounded Workspace Desk Mat ─── */}
        <section className="workspace-mat" id="search">
          <div className="workspace-mat-inner">
            {/* Mode Selector */}
            <ModeSelector scope={scope} onChange={handleScopeChange} />

            {/* Mode context indicators */}
            {scope === "playlist" && (
              <div className="mode-indicator lecture-mode flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 shrink-0 text-[#B8860B]" />
                  <span><strong>Playlist Mode:</strong> Answers grounded in 126 DSA lecture transcripts with exact timestamp citations.</span>
                </div>
                <TopicCoverageBadge
                  exploredCount={exploredCount}
                  totalTopics={totalTopics}
                  onClick={() => setIsTopicModalOpen(true)}
                />
              </div>
            )}

            {(scope === "uploads" || scope === "both") && (
              <div className="mode-indicator upload-mode">
                <Upload className="h-4 w-4 shrink-0 text-[#B8860B]" />
                <span><strong>Upload Mode:</strong> Answers grounded strictly in your uploaded material with exact page citations.</span>
              </div>
            )}

            {/* Document selector for upload modes */}
            {(scope === "uploads" || scope === "both") && (
              <div className="flex items-center gap-2">
                <select
                  className="w-full rounded-xl border bg-white px-4 py-2.5 text-sm font-medium text-[#1C1814] shadow-sm"
                  style={{ borderColor: "rgba(212, 175, 55, 0.45)" }}
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  aria-label="Choose uploaded document"
                >
                  <option value="">Choose uploaded material…</option>
                  {(uploadedDocuments ?? []).map((doc) => (
                    <option key={doc.docId} value={doc.docId}>{doc.title}</option>
                  ))}
                </select>
                {selectedDocId && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleStartDocQuiz(selectedDocId)}
                    disabled={quizMutation.isPending}
                    className="shrink-0 text-xs font-semibold border-[rgba(212,175,55,0.45)] bg-white text-[#B8860B] hover:bg-[#FAF1DF] h-10 px-4 rounded-xl flex items-center gap-1.5"
                    title="Generate a grounded quiz for this uploaded document"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    Quiz Document
                  </Button>
                )}
              </div>
            )}

            {/* ─── Search Bar ─── */}
            <div className="search-input-wrap">
              <Search className="search-icon h-5 w-5" />
              <Input
                ref={searchInputRef}
                value={question}
                onChange={(e) => {
                  setQuestion(e.target.value);
                  if (validationMessage && !validateLectureQuestion(e.target.value)) setValidationMessage(null);
                }}
                onKeyDown={(e) => { if (e.key === "Enter") runSearch(); }}
                placeholder={scope === "playlist"
                  ? "binary search"
                  : scope === "uploads" || scope === "both"
                    ? "Ask a question about your uploaded material…"
                    : "binary search"}
                className="search-input"
                aria-label="Ask a question"
                aria-invalid={Boolean(validationMessage)}
                aria-describedby={validationMessage ? "question-validation" : undefined}
              />
              <Button onClick={() => runSearch()} disabled={isBusy} className="search-button">
                {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span>{isBusy ? "Searching…" : "Ask"}</span>
              </Button>
            </div>

            {validationMessage && (
              <p id="question-validation" className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg" role="alert">
                {validationMessage}
              </p>
            )}

            {/* ─── Suggestion Chips ─── */}
            <div className="suggested-row">
              {(scope === "playlist" ? PLAYLIST_SUGGESTIONS : SUGGESTIONS).map((s) => (
                <button
                  key={s}
                  onClick={() => runSearch(s)}
                  className="suggested-chip"
                >
                  <span className="chip-sparkle">✦</span>
                  <span>{s}</span>
                </button>
              ))}
            </div>

            {/* ─── Upload Panel Drawer (only for upload modes) ─── */}
            {(scope === "uploads" || scope === "both") && (
              <div className="upload-panel">
                <div className="upload-panel-head">
                  <FileText className="h-4 w-4 text-[#B8860B]" />
                  <span>Add your study material</span>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Input
                      value={noteTitle}
                      onChange={(e) => setNoteTitle(e.target.value)}
                      placeholder="Notes title"
                      aria-label="Notes title"
                      className="bg-white border-[rgba(212,175,55,0.35)] rounded-xl"
                    />
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Paste notes or a DSA topic writeup…"
                      className="min-h-24 w-full rounded-xl border border-[rgba(212,175,55,0.35)] bg-white p-3 text-sm text-[#1C1814]"
                      aria-label="Paste notes"
                    />
                    <Button type="button" variant="outline" onClick={uploadNotes} disabled={isIngesting} className="rounded-xl border-[rgba(212,175,55,0.45)] text-[#B8860B] bg-white hover:bg-[#FAF1DF]">
                      {isIngesting ? "Processing…" : "Upload notes"}
                    </Button>
                  </div>
                  <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[rgba(212,175,55,0.4)] bg-white/70 p-4 text-center text-sm hover:bg-white text-[#756858]">
                    <FileText className="h-6 w-6 text-[#B8860B]" />
                    <span className="font-semibold text-[#1C1814]">Choose a text-based PDF (max 20 MB)</span>
                    <input type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(e) => uploadPdf(e.target.files?.[0])} disabled={isIngesting} />
                    <span className="text-xs">{isIngesting ? "Processing…" : "Page citations included automatically"}</span>
                  </label>
                </div>
                {uploadError && <p className="mt-3 text-xs font-semibold text-red-600 bg-red-50 p-2 rounded-lg" role="alert">{uploadError}</p>}
              </div>
            )}

            {/* ─── Content Grid: Answer Card + Document Context / Player ─── */}
            <div className="content-grid" ref={answerRef}>
              {/* Left Column: Answer Card + Evidence Trail */}
              <div className="answer-column">
                <AnimatePresence mode="wait">
                  <AnswerCard
                    key={isBusy ? "busy" : (isError || lastErrorMessage) ? "error" : result.answer || "empty"}
                    result={result}
                    isBusy={isBusy}
                    isError={isError || Boolean(lastErrorMessage)}
                    errorMessage={lastErrorMessage || uploadAnswerMutation.error?.message}
                    scope={scope}
                    onClear={() => {
                      setResult(DEFAULT_RESULT);
                      setLastErrorMessage(null);
                      setHasSearched(false);
                    }}
                    highlightedCitation={highlightedCitation}
                    onHoverCitation={setHighlightedCitation}
                    onClickCitation={handleCitationClick}
                    onStartQuiz={handleStartAnswerQuiz}
                    isQuizGenerating={quizMutation.isPending}
                  />
                </AnimatePresence>

                {/* Evidence Trail / Source Moments */}
                <div className="evidence-trail-card" id="library">
                  <div className="card-header-row">
                    <div className="card-header-left">
                      <div className="card-header-icon-box">
                        <Clock3 className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="card-header-title">EVIDENCE TRAIL</span>
                        <span className="card-header-subtitle">/ Source moments</span>
                      </div>
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
                    <div className="academic-empty-state">
                      <div className="empty-illustration-circle">
                        <FileText className="h-7 w-7 text-[#B8860B]" />
                      </div>
                      <h4 className="academic-empty-title">No sources yet.</h4>
                      <p className="academic-empty-desc">
                        Ask a question above — matching source moments will appear here with timestamps.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Document Context / Player */}
              <aside className="player-column">
                {active?.sourceType === "video" ? (
                  <VideoPlayer citation={active} />
                ) : (
                  <DocumentBriefViewer citation={active} />
                )}

                <div className="context-note">
                  <div className="context-icon"><BookOpen className="h-4 w-4" /></div>
                  <div>
                    <strong>Why this source?</strong>
                    <p>
                      {active?.sourceType === "video"
                        ? "It directly covers the concept from your question — click the timestamp to verify in the original lecture."
                        : "This exact excerpt from your study material was cited to generate the grounded answer. Click any source card on the left to read its brief."}
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* ─── Operations / System Status Section ─── */}
        <section className="operations-section" id="operations">
          <div className="ops-header">
            <div>
              <div className="section-eyebrow">System status</div>
              <h2>Index health</h2>
            </div>
            <div className="ops-actions">
              <span className="tiny-status"><span /> all systems nominal</span>
              <Button variant="outline" className="reindex-button bg-white"><Zap className="h-3.5 w-3.5" /> Reindex</Button>
            </div>
          </div>
          <div className="ops-grid">
            <div className="metric-card">
              <span className="metric-label">Indexed lectures</span>
              <strong>{workspace?.lectures ?? 24}</strong>
              <span className="metric-foot"><ArrowUpRight className="h-3.5 w-3.5 text-[#B8860B]" /> corpus loaded</span>
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
        <span>Ask Your Study Material — RAG-grounded educational study assistant</span>
        <span>Source-grounded answers only <span className="footer-dot" /></span>
      </footer>

      {/* ─── Quiz Modal ─── */}
      <Suspense fallback={null}>
        <QuizModal
          isOpen={isQuizModalOpen}
          onClose={() => setIsQuizModalOpen(false)}
          quizData={activeQuizData}
          isLoading={quizMutation.isPending}
          onQuizCompleted={(_score, _total) => {
            const topicId = activeQuizTopicId || activeQuizData?.topicId;
            if (topicId) {
              recordInteraction(topicId, "quiz_completed");
            }
          }}
        />
      </Suspense>

      {/* ─── Topic Coverage Map Modal ─── */}
      <TopicCoverageModal
        isOpen={isTopicModalOpen}
        onClose={() => setIsTopicModalOpen(false)}
        topics={topics}
        progress={progress}
        onSelectTopic={(t) => {
          setIsTopicModalOpen(false);
          setScope("playlist");
          setQuestion(`Explain ${t.title}`);
          runSearch(`Explain ${t.title}`);
        }}
        onStartQuiz={(t) => {
          setIsTopicModalOpen(false);
          handleStartTopicQuiz(t);
        }}
      />

      {/* ─── Topic Tier Transition Toast ─── */}
      <TopicTransitionToast
        transition={recentTransition}
      />
    </div>
  );
}
