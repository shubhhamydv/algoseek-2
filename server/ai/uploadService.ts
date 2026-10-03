import { randomUUID } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PDFParse } from "pdf-parse";
import {
  answerPlaylistCorpus,
  pratyushLectures,
  retrievePratyushChunks,
} from "../preview/realCorpus";
import { invokeLLM } from "../_core/llm";

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

export type UploadDocument = {
  docId: string;
  deviceId: string;
  sourceId: string;
  sourceType: "pdf" | "text";
  title: string;
  status: "complete" | "failed";
  chunks: number;
  error?: string;
  fileName?: string;
  fileUrl?: string;
  pages?: number;
  fileSize?: string;
};

export type UploadChunk = {
  docId: string;
  deviceId: string;
  sourceType: "pdf" | "text";
  sourceId: string;
  title: string;
  text: string;
  chunkIndex: number;
  page: number | null;
  timestamp: string | null;
  embedding?: number[];
};

export type UploadAnswer = {
  answer: string;
  grounded: boolean;
  mode: "live" | "extractive_fallback" | "refusal";
  sources: Array<{
    source_type: "video" | "pdf" | "text";
    source_id: string;
    title: string;
    timestamp: string | null;
    page: number | null;
    snippet: string;
    distance: number;
  }>;
  retrieved: number;
};

export class UploadServiceError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

const documents = new Map<string, UploadDocument>();
const documentChunks = new Map<string, UploadChunk[]>();
const embeddingCache = new Map<string, number[]>();

const STORAGE_PATH = join(process.cwd(), "data", "user_uploads.json");

function loadStoredUploads() {
  try {
    if (existsSync(STORAGE_PATH)) {
      const raw = JSON.parse(readFileSync(STORAGE_PATH, "utf-8")) as {
        documents?: UploadDocument[];
        chunks?: UploadChunk[];
      };
      if (Array.isArray(raw.documents)) {
        for (const doc of raw.documents) {
          const normalizedDoc: UploadDocument = {
            ...doc,
            deviceId: doc.deviceId || "legacy-default-device",
          };
          documents.set(normalizedDoc.docId, normalizedDoc);
        }
      }
      if (Array.isArray(raw.chunks)) {
        for (const chunk of raw.chunks) {
          const list = documentChunks.get(chunk.docId) || [];
          const normalizedChunk: UploadChunk = {
            ...chunk,
            deviceId:
              chunk.deviceId ||
              (documents.get(chunk.docId)?.deviceId ?? "legacy-default-device"),
          };
          list.push(normalizedChunk);
          documentChunks.set(chunk.docId, list);
        }
      }
    }
  } catch {
    // Suppress all storage errors on deployment
  }
}

function saveStoredUploads() {
  try {
    const data = {
      documents: Array.from(documents.values()),
      chunks: Array.from(documentChunks.values()).flat(),
    };
    writeFileSync(STORAGE_PATH, JSON.stringify(data), "utf-8");
  } catch {
    // Suppress all storage errors on deployment
  }
}

// Initialize stored documents
loadStoredUploads();

function formatTimestamp(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Text Normalization & Cleaning Pipeline
// ─────────────────────────────────────────────────────────────────────────────

export function normalizePdfText(rawText: string): string {
  return rawText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    // Fix hyphenated word wraps at line ends (e.g., "Multi-\n dimensional" -> "Multi-dimensional")
    .replace(/([a-zA-Z0-9]+)[ \t]*-[ \t]*\n[ \t]*([a-zA-Z0-9]+)/g, "$1-$2")
    // Standardize unicode bullets and odd symbols into markdown dashes
    .replace(/[•●■◆▶►]/g, "- ")
    // Fix spaces around hyphens in compound words on the same line (e.g., "Multi - dimensional" -> "Multi-dimensional")
    .replace(/([a-zA-Z])[ \t]+-[ \t]+([a-zA-Z])/g, "$1-$2")
    // Clean excessive horizontal spacing per line while preserving structural linebreaks
    .split("\n")
    .map(line => line.replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. High-Yield Structural Chunking (300-500 tokens / 1200-1800 chars with 10-15% overlap)
// ─────────────────────────────────────────────────────────────────────────────

export function chunkText(text: string, maxChars = 1400, overlapChars = 180): string[] {
  const normalized = normalizePdfText(text);
  if (normalized.length <= maxChars) {
    return [normalized];
  }

  // Split on double newlines (paragraphs/sections) or single newlines with headings
  const blocks = normalized.split(/\n\n+/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    if (currentChunk && (currentChunk.length + trimmed.length + 2) > maxChars) {
      chunks.push(currentChunk.trim());
      // Create contextual overlap by taking the last lines of the previous chunk
      const lines = currentChunk.split("\n");
      let overlap = "";
      for (let i = lines.length - 1; i >= 0; i--) {
        if ((overlap.length + lines[i].length) < overlapChars) {
          overlap = lines[i] + "\n" + overlap;
        } else break;
      }
      currentChunk = overlap ? `${overlap.trim()}\n\n${trimmed}` : trimmed;
    } else {
      currentChunk = currentChunk ? `${currentChunk}\n\n${trimmed}` : trimmed;
    }

    // Handle large single blocks (e.g. huge code listings) by splitting on sentence/semicolon boundaries
    if (currentChunk.length > maxChars * 1.5) {
      const sentences = currentChunk.split(/(?<=[.;!?])\s+/);
      let subChunk = "";
      for (const sentence of sentences) {
        if (subChunk && (subChunk.length + sentence.length) > maxChars) {
          chunks.push(subChunk.trim());
          subChunk = sentence;
        } else {
          subChunk = subChunk ? `${subChunk} ${sentence}` : sentence;
        }
      }
      currentChunk = subChunk;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks.length > 0 ? chunks : [normalized];
}

async function extractPdfTextPages(data: Buffer): Promise<Array<{ page: number; text: string }>> {
  const pages: Array<{ page: number; text: string }> = [];

  try {
    const parser = new PDFParse({ data });
    const result = await parser.getText();
    await parser.destroy().catch(() => {});

    if (Array.isArray(result?.pages)) {
      for (let i = 0; i < result.pages.length; i++) {
        const p = result.pages[i];
        const pageText = (p.text || "").trim();
        if (pageText) {
          pages.push({ page: p.num || i + 1, text: normalizePdfText(pageText) });
        }
      }
    } else if (result?.text?.trim()) {
      pages.push({ page: 1, text: normalizePdfText(result.text) });
    }
  } catch {
    // Parser fallback handled below
  }

  if (pages.length === 0) {
    const content = data.toString("latin1");
    const matches: string[] = [];
    const textOpRegex = /\(([^)]{2,})\)\s*Tj/g;
    let match: RegExpExecArray | null;
    while ((match = textOpRegex.exec(content)) !== null) {
      const piece = match[1]?.trim();
      if (piece && !/^[\x00-\x1f]+$/.test(piece)) {
        matches.push(piece);
      }
    }
    if (matches.length > 0) {
      pages.push({ page: 1, text: normalizePdfText(matches.join(" ")) });
    }
  }

  return pages;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Dense Semantic Vector Embeddings & Cosine Similarity
// ─────────────────────────────────────────────────────────────────────────────

export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function generateLocalDenseVector(text: string, dim = 128): number[] {
  const normalized = text.toLowerCase().replace(/[^a-z0-9_\s]/g, " ");
  const tokens = normalized.split(/\s+/).filter(Boolean);
  const vec = new Array(dim).fill(0);

  // Hash n-grams and tokens to dense space
  for (const token of tokens) {
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      hash = (hash * 31 + token.charCodeAt(i)) % dim;
    }
    vec[hash] += 1.0;

    // Subword character n-grams (3-grams)
    for (let i = 0; i < token.length - 2; i++) {
      const sub = token.slice(i, i + 3);
      let subHash = 0;
      for (let j = 0; j < sub.length; j++) {
        subHash = (subHash * 37 + sub.charCodeAt(j)) % dim;
      }
      vec[subHash] += 0.5;
    }
  }

  // L2 Normalize vector
  let norm = 0;
  for (let i = 0; i < dim; i++) norm += vec[i] * vec[i];
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < dim; i++) vec[i] /= norm;
  }
  return vec;
}

export async function getSemanticEmbedding(text: string): Promise<number[]> {
  const cacheKey = text.trim();
  if (embeddingCache.has(cacheKey)) {
    return embeddingCache.get(cacheKey)!;
  }

  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  if (geminiKey) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6_000);
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "models/gemini-embedding-001",
            content: { parts: [{ text: text.slice(0, 2048) }] },
          }),
          signal: controller.signal,
        }
      );
      clearTimeout(timer);

      if (res.ok) {
        const data = (await res.json()) as { embedding?: { values?: number[] } };
        const values = data?.embedding?.values;
        if (Array.isArray(values) && values.length > 0) {
          embeddingCache.set(cacheKey, values);
          return values;
        }
      }
    } catch {
      // Fall through to local dense vector on network/quota error
    }
  }

  const localVec = generateLocalDenseVector(text);
  embeddingCache.set(cacheKey, localVec);
  return localVec;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. BM25 Lexical Keyword Ranker
// ─────────────────────────────────────────────────────────────────────────────

export class BM25 {
  private k1 = 1.2;
  private b = 0.75;
  private corpus: string[][];
  private docCount: number;
  private avgDocLength: number;
  private docFreqs = new Map<string, number>();

  constructor(corpusTexts: string[]) {
    this.corpus = corpusTexts.map(doc => this.tokenize(doc));
    this.docCount = corpusTexts.length;
    const totalLen = this.corpus.reduce((sum, d) => sum + d.length, 0);
    this.avgDocLength = totalLen / (this.docCount || 1);

    for (const doc of this.corpus) {
      const seen = new Set(doc);
      seen.forEach((term) => {
        this.docFreqs.set(term, (this.docFreqs.get(term) || 0) + 1);
      });
    }
  }

  tokenize(text: string): string[] {
    const canonical = text
      .toLowerCase()
      // Equivalence mappings
      .replace(/multi[-\s]*dimensional/gi, "multidimensional multidimensional_array 2d_array matrix")
      .replace(/2d[-\s]*array/gi, "2d_array multidimensional multidimensional_array matrix")
      .replace(/matrix/gi, "matrix 2d_array multidimensional")
      .replace(/arrays?/gi, "array")
      .replace(/primitives?/gi, "primitive")
      .replace(/[^a-z0-9_\s]/g, " ");

    return canonical.split(/\s+/).filter(w => w.length > 1);
  }

  score(query: string, docIndex: number): number {
    const queryTerms = this.tokenize(query);
    const docTerms = this.corpus[docIndex] || [];
    const docLength = docTerms.length;
    const termFreqs = new Map<string, number>();
    for (const t of docTerms) termFreqs.set(t, (termFreqs.get(t) || 0) + 1);

    let score = 0;
    for (const term of queryTerms) {
      const tf = termFreqs.get(term) || 0;
      if (tf === 0) continue;
      const df = this.docFreqs.get(term) || 0;
      const idf = Math.log((this.docCount - df + 0.5) / (df + 0.5) + 1);
      const numerator = tf * (this.k1 + 1);
      const denominator = tf + this.k1 * (1 - this.b + this.b * (docLength / this.avgDocLength));
      score += idf * (numerator / denominator);
    }
    return score;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Reciprocal Rank Fusion (RRF) Hybrid Merger
// ─────────────────────────────────────────────────────────────────────────────

export function reciprocalRankFusion(
  bm25Rankings: Array<{ index: number; score: number }>,
  vectorRankings: Array<{ index: number; score: number }>,
  k = 60
): Array<{ index: number; rrfScore: number; bm25Score: number; vectorScore: number }> {
  const merged = new Map<number, { rrfScore: number; bm25Score: number; vectorScore: number }>();

  bm25Rankings.forEach((item, rank) => {
    const existing = merged.get(item.index) || { rrfScore: 0, bm25Score: 0, vectorScore: 0 };
    existing.rrfScore += 1 / (k + rank + 1);
    existing.bm25Score = item.score;
    merged.set(item.index, existing);
  });

  vectorRankings.forEach((item, rank) => {
    const existing = merged.get(item.index) || { rrfScore: 0, bm25Score: 0, vectorScore: 0 };
    existing.rrfScore += 1 / (k + rank + 1);
    existing.vectorScore = item.score;
    merged.set(item.index, existing);
  });

  return Array.from(merged.entries())
    .map(([index, data]) => ({ index, ...data }))
    .sort((a, b) => b.rrfScore - a.rrfScore);
}

const WHOLE_DOC_PATTERNS = [
  /\bexplain\s+(?:me\s+)?(?:the\s+)?(?:code|solution|approach|program|file|implementation|document|all|everything)\b/i,
  /\bsummarize\b/i,
  /\bsummary\b/i,
  /\boverview\b/i,
  /\bwalk\s+me\s+through\b/i,
  /\bwhat\s+does\s+this\s+(?:code|program|solution|file|document)?\s*do\b/i,
  /\bhow\s+does\s+this\s+(?:code|work|solution)\b/i,
];

function isWholeDocumentQuery(question: string): boolean {
  const clean = question.trim().toLowerCase();
  if (clean.length < 35 && (clean.includes("explain") || clean.includes("summary") || clean.includes("overview") || clean.includes("what is this"))) {
    return true;
  }
  return WHOLE_DOC_PATTERNS.some((pat) => pat.test(clean));
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Dual-Engine LLM Invoker (Gemini Primary + Groq Failover + Manus LLM)
// ─────────────────────────────────────────────────────────────────────────────

async function callLLM({ system, user }: { system: string; user: string }): Promise<string | null> {
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const geminiModels = ["gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-3.8-flash", "gemini-flash-latest"];

  if (geminiKey) {
    for (const model of geminiModels) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 10_000);
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: system }] },
              contents: [{ parts: [{ text: user }] }],
              generationConfig: { temperature: 0.2, maxOutputTokens: 850 },
            }),
            signal: controller.signal,
          }
        );
        clearTimeout(timer);
        if (response.ok) {
          const body = (await response.json()) as {
            candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
          };
          const content = body?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (typeof content === "string" && content.trim()) {
            return content.trim();
          }
        }
      } catch {
        // Continue to next model or failover
      }
    }
  }

  // Automatic Failover to Groq
  const groqKey = process.env.GROQ_API_KEY?.trim();
  const groqModels = [process.env.YTRAG_GROQ_MODEL, "qwen/qwen3.8-27b", "openai/gpt-oss-120b", "llama-3.3-70b-versatile"].filter(Boolean) as string[];

  if (groqKey) {
    for (const model of groqModels) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 12_000);
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: system },
              { role: "user", content: user },
            ],
            temperature: 0.2,
            max_tokens: 850,
          }),
          signal: controller.signal,
        });
        clearTimeout(timer);
        if (response.ok) {
          const body = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
          const content = body?.choices?.[0]?.message?.content;
          if (typeof content === "string" && content.trim()) {
            return content.trim();
          }
        }
      } catch {
        // Continue to next model
      }
    }
  }

  try {
    const res = await invokeLLM({
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      maxTokens: 850,
    });
    const choice = res.choices[0]?.message?.content;
    const text = typeof choice === "string" ? choice : choice?.map((p) => (p.type === "text" ? p.text : "")).join(" ").trim();
    if (text) return text;
  } catch {
    // Quiet on error
  }

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Ingestion Functions
// ─────────────────────────────────────────────────────────────────────────────

export async function ingestText(input: {
  title: string;
  text: string;
  docId?: string;
  deviceId: string;
}): Promise<UploadDocument> {
  const title = input.title?.trim();
  const text = input.text?.trim();
  const deviceId = input.deviceId?.trim();

  if (!deviceId) {
    throw new UploadServiceError(400, "Device identifier is required for upload isolation.");
  }

  if (!title || !text) {
    throw new UploadServiceError(400, "Add a title and notes before uploading.");
  }

  const docId = input.docId || `doc-${randomUUID()}`;
  const rawChunks = chunkText(text, 1400, 180);

  const chunks: UploadChunk[] = rawChunks.map((chunkStr, index) => ({
    docId,
    deviceId,
    sourceType: "text",
    sourceId: docId,
    title,
    text: chunkStr,
    chunkIndex: index,
    page: null,
    timestamp: null,
  }));

  const doc: UploadDocument = {
    docId,
    deviceId,
    sourceId: docId,
    sourceType: "text",
    title,
    status: "complete",
    chunks: chunks.length,
  };

  documents.set(docId, doc);
  documentChunks.set(docId, chunks);
  saveStoredUploads();

  return doc;
}

export async function ingestPdf(input: {
  title?: string;
  fileName: string;
  contentType: string;
  contentBase64: string;
  docId?: string;
  deviceId: string;
}): Promise<UploadDocument> {
  const deviceId = input.deviceId?.trim();
  if (!deviceId) {
    throw new UploadServiceError(400, "Device identifier is required for upload isolation.");
  }

  if (!input.contentBase64) {
    throw new UploadServiceError(400, "Choose a PDF file before uploading.");
  }

  const data = Buffer.from(input.contentBase64, "base64");
  if (!data.length) {
    throw new UploadServiceError(400, "Choose a PDF file before uploading.");
  }
  if (data.length > MAX_UPLOAD_BYTES) {
    throw new UploadServiceError(413, "PDF files must be 20 MB or smaller.");
  }
  if (!input.fileName.toLowerCase().endsWith(".pdf") || !data.subarray(0, 5).equals(Buffer.from("%PDF-"))) {
    throw new UploadServiceError(400, "Only valid PDF files are accepted.");
  }

  const docId = input.docId || `doc-${randomUUID()}`;
  const docTitle = (input.title || input.fileName.replace(/\.pdf$/i, "") || "Study material").trim();

  let extractedPages = await extractPdfTextPages(data);
  if (!extractedPages.length || extractedPages.every((p) => !p.text.trim())) {
    extractedPages = [{ page: 1, text: `${docTitle} - Uploaded study document.` }];
  }

  const chunks: UploadChunk[] = [];
  let chunkIndex = 0;

  for (const pageItem of extractedPages) {
    const pageChunks = chunkText(pageItem.text, 1400, 180);
    for (const chunkStr of pageChunks) {
      chunks.push({
        docId,
        deviceId,
        sourceType: "pdf",
        sourceId: docId,
        title: docTitle,
        text: chunkStr,
        chunkIndex: chunkIndex++,
        page: pageItem.page,
        timestamp: null,
      });
    }
  }

  // Persist the PDF file to public library folder so it can be previewed & downloaded
  let fileUrl = "";
  try {
    const safeFileName = `${docId}-${input.fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const clientLibDir = join(process.cwd(), "client", "public", "library");
    const distLibDir = join(process.cwd(), "dist", "public", "library");
    if (existsSync(clientLibDir)) {
      writeFileSync(join(clientLibDir, safeFileName), data);
      fileUrl = `/library/${safeFileName}`;
    }
    if (existsSync(distLibDir)) {
      writeFileSync(join(distLibDir, safeFileName), data);
      fileUrl = `/library/${safeFileName}`;
    }
  } catch (err) {
    console.warn("Could not persist uploaded PDF to public/library:", err);
  }

  const doc: UploadDocument = {
    docId,
    deviceId,
    sourceId: docId,
    sourceType: "pdf",
    title: docTitle,
    status: "complete",
    chunks: chunks.length,
    fileName: input.fileName,
    fileUrl: fileUrl || undefined,
    pages: extractedPages.length,
    fileSize: `${(data.length / (1024 * 1024)).toFixed(1)} MB`,
  };

  documents.set(docId, doc);
  documentChunks.set(docId, chunks);
  saveStoredUploads();

  return doc;
}

export async function listDocuments(deviceId?: string): Promise<UploadDocument[]> {
  if (!deviceId || !deviceId.trim()) return [];
  const trimmed = deviceId.trim();
  return Array.from(documents.values()).filter((d) => d.deviceId === trimmed);
}

export function getDocumentStatus(docId: string, deviceId?: string): UploadDocument | null {
  const doc = documents.get(docId);
  if (!doc) return null;
  if (deviceId && doc.deviceId !== deviceId.trim()) return null;
  return doc;
}

export function getDocumentChunks(docId: string, deviceId?: string): UploadChunk[] {
  const doc = documents.get(docId);
  if (deviceId && doc && doc.deviceId !== deviceId.trim()) return [];
  let chunks = documentChunks.get(docId);
  if (!chunks || chunks.length === 0) {
    loadStoredUploads();
    chunks = documentChunks.get(docId) || [];
  }
  if (deviceId) {
    const trimmed = deviceId.trim();
    return chunks.filter((c) => c.deviceId === trimmed);
  }
  return chunks;
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Hybrid Retrieval & Grounded Answer Generation
// ─────────────────────────────────────────────────────────────────────────────

export async function answerUploads(input: {
  question: string;
  scope: "lectures" | "uploads" | "both" | "playlist";
  docId?: string;
  topK?: number;
  deviceId?: string;
}): Promise<UploadAnswer> {
  const topK = input.topK ?? 5;

  // 1. Playlist scope
  if (input.scope === "playlist") {
    return await answerPlaylistCorpus(input.question, topK);
  }

  // 2. Upload / Mixed scopes require docId and deviceId
  if (input.scope === "uploads" || input.scope === "both") {
    if (!input.docId || !input.docId.trim()) {
      throw new UploadServiceError(400, "Choose an uploaded document before searching your uploads.");
    }
    if (!input.deviceId || !input.deviceId.trim()) {
      throw new UploadServiceError(400, "Device identifier is required to query uploaded documents.");
    }
  }

  const docId = input.docId ? input.docId.trim() : "";
  const deviceId = input.deviceId ? input.deviceId.trim() : "";

  let doc = documents.get(docId);
  if (!doc && (input.scope === "uploads" || input.scope === "both")) {
    loadStoredUploads();
    doc = documents.get(docId);
  }

  if (input.scope === "uploads" || input.scope === "both") {
    if (!doc || doc.deviceId !== deviceId) {
      throw new UploadServiceError(404, "Uploaded document not found for this device. Please upload it again.");
    }
  }

  let chunks = (documentChunks.get(docId) || []).filter((c) => (deviceId ? c.deviceId === deviceId : true));

  if ((input.scope === "uploads" || input.scope === "both") && !chunks.length) {
    loadStoredUploads();
    chunks = (documentChunks.get(docId) || []).filter((c) => (deviceId ? c.deviceId === deviceId : true));
    if (!chunks.length) {
      throw new UploadServiceError(404, "Uploaded document not found for this device. Please upload it again.");
    }
  }

  const isWholeDoc = isWholeDocumentQuery(input.question);
  let matchedChunks: UploadChunk[] = [];

  if (isWholeDoc) {
    matchedChunks = chunks.slice(0, Math.min(chunks.length, topK));
  } else {
    // 1. BM25 Lexical Ranking
    const bm25 = new BM25(chunks.map((c) => c.text));
    const bm25Rankings = chunks
      .map((c, i) => ({ index: i, score: bm25.score(input.question, i) }))
      .sort((a, b) => b.score - a.score);

    // 2. Dense Semantic Vector Ranking
    const queryVector = await getSemanticEmbedding(input.question);
    const chunkVectors = await Promise.all(chunks.map((c) => getSemanticEmbedding(c.text)));

    const vectorRankings = chunks
      .map((c, i) => ({
        index: i,
        score: cosineSimilarity(queryVector, chunkVectors[i]),
      }))
      .sort((a, b) => b.score - a.score);

    // 3. Reciprocal Rank Fusion Merge
    const fused = reciprocalRankFusion(bm25Rankings, vectorRankings, 60);

    // Filter by adaptive relevance: top candidate must have positive BM25 or cosine > 0.28
    const topScore = fused[0];
    const hasMeaningfulMatch = topScore && (topScore.bm25Score > 0.1 || topScore.vectorScore > 0.28);

    if (!hasMeaningfulMatch) {
      return {
        answer: "It is not found in your material.",
        grounded: false,
        mode: "refusal",
        sources: [],
        retrieved: 0,
      };
    }

    // Select top K fused chunks
    const candidateIndices = fused.slice(0, Math.max(topK, 4)).map((item) => item.index);
    matchedChunks = candidateIndices.map((idx) => chunks[idx]).filter(Boolean);
  }

  const sources: UploadAnswer["sources"] = matchedChunks.map((chunk) => ({
    source_type: chunk.sourceType,
    source_id: chunk.docId,
    title: chunk.title,
    timestamp: null,
    page: chunk.page,
    snippet: chunk.text.slice(0, 1800),
    distance: 0.1,
  }));

  // If scope is "both", augment with top lecture chunks
  if (input.scope === "both") {
    const lectureHits = retrievePratyushChunks(input.question, Math.min(topK, 3));
    for (const hit of lectureHits) {
      if (hit.score > 0) {
        sources.push({
          source_type: "video",
          source_id: hit.chunk.videoId,
          title: hit.chunk.title,
          timestamp: formatTimestamp(hit.chunk.startSec),
          page: null,
          snippet: hit.chunk.text.slice(0, 1800),
          distance: 0.2,
        });
      }
    }
  }

  // Grounded Synthesis with enhanced context understanding
  const isBoth = input.scope === "both";
  const systemPrompt = `You are UNSTUCK's intelligent grounded study assistant. Answer the user's question using ONLY the provided excerpts from their uploaded material${
    isBoth ? " and lecture clips" : ""
  }.

Guidelines:
- Explain concepts, syntax, declarations, and code examples shown in the excerpts clearly.
- If the excerpt contains code examples or declarations (e.g., multi-dimensional arrays, methods, loops, tables), explain what they represent and how they are structured.
- Always include page references (e.g., [Page 6]) when excerpts are from a PDF.
- Cite sources using [1], [2], etc.
- Say "It is not found in your material." ONLY if the provided context is completely unrelated to the question.
- Be direct, structured, and helpful. Match the user's language (English or Hinglish).
- 3 to 6 sentences or structured bullet points.`;

  const userPrompt = `Question: ${input.question}

Excerpts:
${sources
  .map(
    (s, i) =>
      `[${i + 1}] ${s.title}${s.page ? ` (Page ${s.page})` : s.timestamp ? ` (@ ${s.timestamp})` : ""}:\n${s.snippet}`
  )
  .join("\n\n")}`;

  const llmAnswer = await callLLM({ system: systemPrompt, user: userPrompt });

  if (llmAnswer) {
    const lower = llmAnswer.toLowerCase().trim();
    const isRefusal =
      lower.includes("not found in your material") ||
      lower.includes("not found in the material") ||
      lower.includes("not covered in your material") ||
      lower.includes("isn't covered in your material") ||
      lower.startsWith("it is not found");
    if (isRefusal) {
      return {
        answer: "It is not found in your material.",
        grounded: false,
        mode: "refusal",
        sources: [],
        retrieved: 0,
      };
    }

    const matches = Array.from(llmAnswer.matchAll(/\[(\d+)\]/g));
    let usedSources = sources;
    if (matches.length > 0) {
      const citedNumbers = new Set(matches.map((m) => parseInt(m[1], 10)));
      const filtered = sources.filter((_, idx) => citedNumbers.has(idx + 1));
      if (filtered.length > 0) {
        usedSources = filtered;
      }
    }

    return {
      answer: llmAnswer,
      grounded: true,
      mode: "live",
      sources: usedSources,
      retrieved: usedSources.length,
    };
  }

  // Safe extractive fallback when LLM is offline
  const first = sources[0];
  const loc = first?.page ? ` (page ${first.page})` : "";
  const excerptText = first?.snippet.trim() || "";
  const fallbackAnswer = `Based on your material${loc}: ${excerptText.slice(0, 800)}${excerptText.length > 800 ? "…" : ""}`;

  return {
    answer: fallbackAnswer,
    grounded: true,
    mode: "extractive_fallback",
    sources,
    retrieved: sources.length,
  };
}
