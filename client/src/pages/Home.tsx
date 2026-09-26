import { useMemo, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { selectedLecturePlayback } from "@/lib/youtube";
import { validateLectureQuestion } from "@/lib/questionValidation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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
  Loader2,
  LockKeyhole,
  Menu,
  Network,
  Play,
  Search,
  Sparkles,
  X,
  Zap,
} from "lucide-react";

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

function formatDuration(seconds = 0) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  return `${hours ? `${hours}:` : ""}${minutes.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
}

const DEFAULT_RESULT: SearchResult = {
  answer: "",
  grounded: false,
  mode: "preview",
  citations: [],
  retrieval: { chunks: 0, latencyMs: 0, model: "BGE-M3 · local corpus retrieval" },
};

function CitationCard({ citation, active, onSelect }: { citation: Citation; active: boolean; onSelect: () => void }) {
  return (
    <button onClick={onSelect} className={`lecture-card group w-full text-left ${active ? "citation-active" : ""}`} aria-label={`Play full lecture ${citation.title} from ${citation.timestamp}`}>
      <span className="lecture-thumb"><img src={`https://i.ytimg.com/vi/${citation.videoId}/hqdefault.jpg`} alt="" loading="lazy" /><span className="thumb-play"><Play className="h-3.5 w-3.5 fill-current" /></span></span>
      <span className="lecture-card-copy min-w-0 flex-1">
        <span className="lecture-card-title">{citation.title}<ArrowUpRight className="h-3.5 w-3.5 text-emerald-300 opacity-0 transition-opacity group-hover:opacity-100" /></span>
        <span className="lecture-card-meta"><span className="full-lecture-label">Full lecture</span><span>starts at <strong>{citation.timestamp}</strong></span></span>
        <span className="lecture-card-action">Click to play from this moment · opens YouTube at {citation.timestamp}</span>
      </span>
      <span className="timecode">{citation.timestamp ?? "--:--"}</span>
    </button>
  );
}

function SourceCard({ citation, active, onSelect }: { citation: Citation; active: boolean; onSelect: () => void }) {
  if (citation.sourceType === "video" || citation.videoId) return <CitationCard citation={citation} active={active} onSelect={onSelect} />;
  return <div className={`lecture-card ${active ? "citation-active" : ""}`}>
    <span className="lecture-thumb"><FileText className="h-5 w-5" /></span>
    <span className="lecture-card-copy min-w-0 flex-1">
      <span className="lecture-card-title">{citation.title}</span>
      <span className="lecture-card-meta"><span className="full-lecture-label">{citation.sourceType === "pdf" ? `PDF · page ${citation.page}` : "Uploaded notes"}</span></span>
      <span className="lecture-card-action">{citation.text}</span>
    </span>
    <span className="timecode">{citation.sourceType === "pdf" ? `p. ${citation.page}` : "note"}</span>
  </div>;
}

function formatAnswerText(text: string) {
  const lines = text.split("\n");
  return lines.map((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("### ")) {
      return (
        <span key={idx} className="block mt-4 mb-1.5 text-sm font-semibold text-emerald-300 tracking-wide uppercase">
          {trimmed.slice(4)}
        </span>
      );
    }
    if (trimmed.startsWith("- ")) {
      return (
        <span key={idx} className="block pl-3 text-sm text-emerald-100/90 leading-relaxed before:content-['•'] before:mr-2 before:text-emerald-400">
          {trimmed.slice(2)}
        </span>
      );
    }
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <span key={idx} className="block min-h-[1.2em]">
        {parts.map((part, pIdx) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={pIdx} className="text-emerald-300 font-semibold">{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
      </span>
    );
  });
}

export default function Home() {
  const [question, setQuestion] = useState("");
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [activeCitation, setActiveCitation] = useState(0);
  const [result, setResult] = useState<SearchResult>(DEFAULT_RESULT);
  const [mobileNav, setMobileNav] = useState(false);
  const [scope, setScope] = useState<"lectures" | "uploads" | "both" | "playlist">("lectures");
  const [selectedDocId, setSelectedDocId] = useState<string>("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteText, setNoteText] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const answerRef = useRef<HTMLDivElement>(null);

  const scrollToAnswer = () => {
    setTimeout(() => {
      answerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 60);
  };

  const searchMutation = trpc.lecture.search.useMutation({
    onSuccess: (data) => {
      setResult(data as SearchResult);
      setActiveCitation(0);
      scrollToAnswer();
    },
  });
  const uploadAnswerMutation = trpc.uploads.answer.useMutation({
    onSuccess: (data) => {
      setResult({
        answer: data.answer,
        grounded: data.grounded,
        mode: data.mode === "live" ? "live" : "preview",
        citations: data.sources.map((source, index) => {
          const parsedSec = source.timestamp
            ? source.timestamp.split(":").reduce((t, p) => t * 60 + Number(p), 0)
            : undefined;
          return {
            id: `${source.source_id}-${index}`,
            title: source.title,
            timestamp: source.timestamp ?? undefined,
            startSec: parsedSec,
            videoId: source.source_type === "video" ? source.source_id : undefined,
            url: source.source_type === "video" && parsedSec !== undefined
              ? `https://www.youtube.com/watch?v=${source.source_id}&t=${parsedSec}s`
              : undefined,
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
  const queryLabel = useMemo(() => question || "Memoization aur tabulation ka difference?", [question]);

  const runSearch = (value = question) => {
    const normalized = value.trim();
    const validationError = validateLectureQuestion(normalized);
    if (validationError) {
      setValidationMessage(validationError);
      return;
    }
    if (searchMutation.isPending || uploadAnswerMutation.isPending) return;
    setValidationMessage(null);
    setQuestion(normalized);
    if (scope === "lectures") {
      searchMutation.mutate({ question: normalized, topK: 5 });
      return;
    }
    if (scope === "playlist") {
      uploadAnswerMutation.mutate({ question: normalized, scope: "playlist", topK: 5 });
      return;
    }
    if (!selectedDocId) {
      setValidationMessage("Upload and select study material before searching your uploads.");
      return;
    }
    uploadAnswerMutation.mutate({ question: normalized, scope, docId: selectedDocId, topK: 5 });
  };

  const isBusy = searchMutation.isPending || uploadAnswerMutation.isPending;
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

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="topbar">
        <a href="#top" className="brand" aria-label="AlgoSeek home">
          <span className="brand-mark"><Network className="h-4 w-4" /></span>
          <span>AlgoSeek</span>
        </a>
        <nav className={`topnav ${mobileNav ? "topnav-open" : ""}`}>
          <a className="nav-link active" href="#search">Search</a>
          <a className="nav-link" href="#library">Library</a>
          <a className="nav-link" href="#operations">Operations</a>
          <a className="nav-link" href="#about">About</a>
        </nav>
        <div className="top-actions">
          <span className="status-pill"><span className="status-pulse" /> Preview index online</span>
          <Button variant="outline" className="login-button"><LockKeyhole className="h-3.5 w-3.5" /> Sign in</Button>
          <button className="mobile-menu" onClick={() => setMobileNav(!mobileNav)} aria-label="Toggle navigation">
            {mobileNav ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      <main id="top" className="main-content">
        <section className="hero-grid" id="search">
          <div className="hero-copy">
            <div className="eyebrow"><Sparkles className="h-3.5 w-3.5" /> Grounded lecture intelligence</div>
            <h1>Study the <span>why.</span><br />Not just the what.</h1>
            <p className="hero-lede">Ask questions across your DSA lectures in English or Hinglish. Get a clear answer, then jump straight to the moment it was explained.</p>
            <div className="hero-meta">
              <span><CheckCircle2 className="h-4 w-4" /> Answers from your lectures</span>
              <span><CheckCircle2 className="h-4 w-4" /> Timestamp-level sources</span>
            </div>
          </div>
          <div className="network-art" aria-hidden="true">
            <div className="network-orbit orbit-a" />
            <div className="network-orbit orbit-b" />
            <span className="node node-a" /><span className="node node-b" /><span className="node node-c" /><span className="node node-d" /><span className="node node-e" />
            <span className="node-label label-a">RETRIEVAL</span><span className="node-label label-b">CONTEXT</span><span className="node-label label-c">ANSWER</span>
          </div>
        </section>

        <section className="search-panel" aria-label="Study material search">
          <div className="search-panel-top"><span className="panel-kicker"><Command className="h-3.5 w-3.5" /> Ask your study material</span><span className="shortcut"><kbd>⌘</kbd><kbd>K</kbd> to focus</span></div>
          <div className="flex flex-wrap gap-2 pb-4" aria-label="Choose sources">
            {(["lectures", "playlist", "uploads", "both"] as const).map((option) => <Button key={option} type="button" variant={scope === option ? "default" : "outline"} size="sm" onClick={() => { setScope(option); setResult(DEFAULT_RESULT); setValidationMessage(null); }}>
              {option === "lectures" ? "Pratyush lectures" : option === "playlist" ? "DSA Playlist Chat" : option === "uploads" ? "My uploads" : "Both"}
            </Button>)}
            {scope === "uploads" || scope === "both" ? <select className="rounded-md border bg-background px-3 text-sm" value={selectedDocId} onChange={(event) => setSelectedDocId(event.target.value)} aria-label="Choose uploaded document">
              <option value="">Choose uploaded material</option>
              {(uploadedDocuments ?? []).map((document) => <option key={document.docId} value={document.docId}>{document.title}</option>)}
            </select> : null}
          </div>
          <div className="search-input-wrap">
            <Search className="search-icon h-5 w-5" />
            <Input
              value={question}
              onChange={(e) => {
                const value = e.target.value;
                setQuestion(value);
                if (validationMessage && !validateLectureQuestion(value)) setValidationMessage(null);
              }}
              onKeyDown={(e) => { if (e.key === "Enter") runSearch(); }}
              placeholder={scope === "playlist" ? "Ask any DSA pattern (e.g. when to use two pointers, sliding window, recursion, DP)..." : "Try: DP mein overlapping subproblems kya hote hain?"}
              className="search-input"
              aria-label="Ask a question about the lectures"
              aria-invalid={Boolean(validationMessage)}
              aria-describedby={validationMessage ? "question-validation" : undefined}
            />
            <Button onClick={() => runSearch()} disabled={isBusy} className="search-button">
              {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              {isBusy ? "Retrieving" : "Ask material"}
            </Button>
          </div>
          {validationMessage ? <p id="question-validation" className="question-validation" role="alert">{validationMessage}</p> : null}
          <div className="suggested-row"><span>Suggested</span>{(scope === "playlist" ? PLAYLIST_SUGGESTIONS : SUGGESTIONS).map((suggestion) => <button key={suggestion} onClick={() => runSearch(suggestion)}>{suggestion}<ChevronRight className="h-3 w-3" /></button>)}</div>
          {scope === "uploads" || scope === "both" ? (
            <div className="mt-5 rounded-lg border border-border bg-background/50 p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium"><FileText className="h-4 w-4 text-emerald-300" /> Add your study material</div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Input value={noteTitle} onChange={(event) => setNoteTitle(event.target.value)} placeholder="Notes title" aria-label="Notes title" />
                  <textarea value={noteText} onChange={(event) => setNoteText(event.target.value)} placeholder="Paste notes or a DSA topic writeup…" className="min-h-24 w-full rounded-md border bg-background p-3 text-sm" aria-label="Paste notes" />
                  <Button type="button" variant="outline" onClick={uploadNotes} disabled={isIngesting}>{isIngesting ? "Processing your material…" : "Upload notes"}</Button>
                </div>
                <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                  <FileText className="h-6 w-6 text-emerald-300" />
                  <span>Choose a text-based PDF (max 20 MB)</span>
                  <input type="file" accept="application/pdf,.pdf" className="sr-only" onChange={(event) => uploadPdf(event.target.files?.[0])} disabled={isIngesting} />
                  <span className="text-xs">{isIngesting ? "Processing your material…" : "PDF page citations included"}</span>
                </label>
              </div>
              {uploadError ? <p className="mt-3 text-sm text-rose-300" role="alert">{uploadError}</p> : null}
            </div>
          ) : scope === "playlist" ? (
            <div className="mt-4 flex items-center gap-2 rounded-md border border-emerald-500/20 bg-emerald-950/20 px-3 py-2 text-xs text-emerald-300">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
              <span><strong>DSA Playlist Mode Active:</strong> Grounded strictly in the 126 lecture transcripts. Exact video and timestamp citations will be provided below.</span>
            </div>
          ) : null}
        </section>

        <section className="content-grid" ref={answerRef}>
          <div className="answer-column">
            <div className="section-heading"><div><div className="section-eyebrow">Your grounded answer</div><h2>{searchMutation.isError || uploadAnswerMutation.isError ? "Something went wrong" : isBusy ? "Searching playlist transcripts…" : "Here's the short version."}</h2></div><Badge className={`grounded-badge ${result.grounded ? "" : "not-grounded"}`}><span className="badge-dot" /> {result.grounded ? "Grounded in material" : "Not found in material"}</Badge></div>
            {searchMutation.isError || uploadAnswerMutation.isError ? <div className="state-card error-state"><CircleDot className="h-5 w-5 text-rose-300" /><div><strong>We couldn't reach the retrieval layer.</strong><p>Try again in a moment. Your lecture preview remains available without provider credentials.</p></div><Button variant="outline" onClick={() => setResult(DEFAULT_RESULT)}>Clear answer</Button></div> : isBusy ? <div className="state-card loading-state"><Loader2 className="h-5 w-5 animate-spin text-emerald-400" /><div><strong>Searching {scope === "playlist" ? "DSA Lecture Playlist" : "material"}…</strong><p>Finding exact timestamped moments and extracting grounded answer.</p></div></div> : !result.grounded || !result.answer.trim() ? <div className="state-card empty-state"><Search className="h-5 w-5 text-emerald-300" /><div><strong>{result.answer || "This answer is not found in your material."}</strong><p>{scope === "playlist" ? "Try a DSA topic covered in the lecture playlist." : "Try a phrase from the selected lectures or uploaded document."}</p></div></div> : <div className="answer-card"><div className="answer-card-head"><span className="answer-label"><Sparkles className="h-4 w-4 text-emerald-300" /> {result.mode === "live" ? "Grounded synthesis" : "Material-only fallback"}</span><span className="answer-model">{result.retrieval.model}</span></div><div className="answer-text">{formatAnswerText(result.answer)}</div><div className="answer-footer"><span><FileText className="h-3.5 w-3.5" /> {result.citations.length} sources</span><span><Clock3 className="h-3.5 w-3.5" /> {result.retrieval.latencyMs}ms retrieval</span><button onClick={() => navigator.clipboard?.writeText(result.answer)} className="copy-button">Copy answer</button></div></div>}
            <div className="sources-heading"><div><div className="section-eyebrow">Evidence trail</div><h3>Source moments</h3></div><span className="source-count">{result.citations.length.toString().padStart(2, "0")} sources</span></div>
            {result.citations.length > 0 ? <div className="citation-list">{result.citations.map((citation, index) => <SourceCard key={citation.id} citation={citation} active={index === activeCitation} onSelect={() => { setActiveCitation(index); if (citation.sourceType === "video" && citation.videoId && citation.startSec !== undefined) window.open(selectedLecturePlayback({ videoId: citation.videoId, startSec: citation.startSec }).watchUrl, "_blank", "noopener,noreferrer"); }} />)}</div> : <div className="state-card empty-state"><Search className="h-5 w-5 text-emerald-300" /><div><strong>No source matched this question.</strong><p>Try a topic, pattern, or phrase from the selected material.</p></div></div>}
          </div>

          <aside className="player-column" id="library">
            <div className="player-heading"><div><div className="section-eyebrow">Playback context</div><h3>Watch it click.</h3></div><span className="live-dot"><span /> live link</span></div>
            <div className="video-card"><div className="video-screen">{active?.videoId && active.startSec !== undefined ? <iframe className="video-embed" title="Selected lecture playback context" src={selectedLecturePlayback({ videoId: active.videoId, startSec: active.startSec }).embedUrl} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /> : <div className="video-placeholder"><Network className="h-6 w-6" /><span>Search to load a real Pratyush source</span></div>}<div className="video-grid-lines" /><div className="video-center"><div className="play-orb"><Play className="h-5 w-5 fill-current" /></div><span>lecture context</span></div><div className="video-top-label">DSA / DYNAMIC PROGRAMMING</div><div className="video-time">{active?.timestamp ?? "--:--"} <span>/ {formatDuration(active?.durationSec)}</span></div></div><div className="video-info"><span className="video-live-tag">YOU TUBE</span><h4>{active?.title ?? "No source selected yet"}</h4><p>{active ? `Selected source · playback starts at ${active.timestamp ?? "--:--"}` : "Your next grounded lecture moment will appear here."}</p>{active?.url ? <a href={active.url} target="_blank" rel="noreferrer" className="watch-link">Open in YouTube <ExternalLink className="h-3.5 w-3.5" /></a> : null}</div></div>
            <div className="context-note"><div className="context-icon"><BookOpen className="h-4 w-4" /></div><div><strong>Why this source?</strong><p>It directly covers the difference between storing recursive states and building them bottom-up.</p></div></div>
          </aside>
        </section>

        <section className="operations-section" id="operations">
          <div className="ops-header"><div><div className="section-eyebrow">Operator console</div><h2>Index health at a glance.</h2></div><div className="ops-actions"><span className="tiny-status"><span /> all systems nominal</span><Button variant="outline" className="reindex-button"><Zap className="h-3.5 w-3.5" /> Reindex</Button></div></div>
          <div className="ops-grid"><div className="metric-card"><span className="metric-label">Indexed lectures</span><strong>{workspace?.lectures ?? 24}</strong><span className="metric-foot"><ArrowUpRight className="h-3.5 w-3.5" /> 4 this week</span></div><div className="metric-card"><span className="metric-label">Transcript chunks</span><strong>{(workspace?.chunks ?? 2933).toLocaleString()}</strong><span className="metric-foot">all-MiniLM-L6-v2 · 384 dim</span></div><div className="metric-card"><span className="metric-label">Retrieval hit rate</span><strong>{workspace?.hitRate ?? "87%"}</strong><span className="metric-foot">golden set · top 5</span></div><div className="job-card"><div className="job-card-top"><span className="metric-label">Latest pipeline job</span><Badge className="job-badge">{jobs?.[0]?.status ?? "running"}</Badge></div><strong>{jobs?.[0]?.label ?? "DP playlist · reindex"}</strong><div className="job-progress"><Progress value={jobs?.[0]?.progress ?? 68} /><span>{jobs?.[0]?.progress ?? 68}%</span></div><span className="metric-foot">{jobs?.[0]?.detail ?? "1,992 of 2,933 chunks embedded"}</span></div></div>
        </section>
      </main>
      <footer className="footer" id="about"><span>AlgoSeek / RAG for the way you learn.</span><span>Preview mode · No credentials required <span className="footer-dot" /></span></footer>
    </div>
  );
}
