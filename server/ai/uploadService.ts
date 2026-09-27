import { randomUUID } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PDFParse } from "pdf-parse";
import {
  answerPlaylistCorpus,
  getExpandedTerms,
  pratyushChunks,
  pratyushLectures,
  retrievePratyushChunks,
  tokenize,
} from "../preview/realCorpus";
import { invokeLLM } from "../_core/llm";

const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

export type UploadDocument = {
  docId: string;
  sourceId: string;
  sourceType: "pdf" | "text";
  title: string;
  status: "complete" | "failed";
  chunks: number;
  error?: string;
};

export type UploadChunk = {
  docId: string;
  sourceType: "pdf" | "text";
  sourceId: string;
  title: string;
  text: string;
  chunkIndex: number;
  page: number | null;
  timestamp: string | null;
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
          documents.set(doc.docId, doc);
        }
      }
      if (Array.isArray(raw.chunks)) {
        for (const chunk of raw.chunks) {
          const list = documentChunks.get(chunk.docId) || [];
          list.push(chunk);
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

function chunkText(text: string, chunkSize = 650, overlap = 100): string[] {
  const cleaned = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  if (cleaned.length <= chunkSize) {
    return [cleaned];
  }

  const paragraphs = cleaned.split(/\n\s*\n+/);
  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    const trimmed = para.trim();
    if (!trimmed) continue;

    if (current && current.length + trimmed.length > chunkSize) {
      chunks.push(current.trim());
      const words = current.trim().split(/\s+/);
      const overlapWords = words.slice(-Math.max(1, Math.floor(overlap / 12)));
      current = `${overlapWords.join(" ")} ${trimmed}`;
    } else {
      current = current ? `${current}\n\n${trimmed}` : trimmed;
    }

    if (current.length > chunkSize * 1.5) {
      const sentences = current.split(/(?<=[.!?])\s+/);
      let sentenceChunk = "";
      for (const sentence of sentences) {
        if (sentenceChunk && sentenceChunk.length + sentence.length > chunkSize) {
          chunks.push(sentenceChunk.trim());
          sentenceChunk = sentence;
        } else {
          sentenceChunk = sentenceChunk ? `${sentenceChunk} ${sentence}` : sentence;
        }
      }
      current = sentenceChunk;
    }
  }

  if (current.trim()) {
    chunks.push(current.trim());
  }

  return chunks.length > 0 ? chunks : [cleaned];
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
          pages.push({ page: p.num || i + 1, text: pageText });
        }
      }
    } else if (result?.text?.trim()) {
      pages.push({ page: 1, text: result.text.trim() });
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
      pages.push({ page: 1, text: matches.join(" ") });
    }
  }

  return pages;
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

function scoreUploadChunk(chunk: UploadChunk, query: string): number {
  const queryTerms = tokenize(query);
  const expTerms = getExpandedTerms(queryTerms);
  const textLower = chunk.text.toLowerCase();
  const titleLower = chunk.title.toLowerCase();

  let score = 0;
  for (const term of expTerms) {
    if (term.length <= 1) continue;
    const regex = new RegExp(`\\b${term}\\b`, "gi");
    const count = (textLower.match(regex) || []).length;
    score += Math.min(count, 4) * 3;
    if (titleLower.includes(term)) {
      score += 10;
    }
  }

  const cleanQuery = query.toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim();
  if (cleanQuery.length > 5 && textLower.includes(cleanQuery)) {
    score += 25;
  }

  return score;
}

async function callLLM({ system, user }: { system: string; user: string }): Promise<string | null> {
  const groqKey = process.env.GROQ_API_KEY?.trim();
  if (groqKey) {
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
          model: process.env.YTRAG_GROQ_MODEL || "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          temperature: 0.2,
          max_tokens: 650,
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
      // Quiet on error
    }
  }

  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  if (geminiKey) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12_000);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: system }] },
            contents: [{ parts: [{ text: user }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 650 },
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
      // Quiet on error
    }
  }

  try {
    const res = await invokeLLM({
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      maxTokens: 650,
    });
    const choice = res.choices[0]?.message?.content;
    const text = typeof choice === "string" ? choice : choice?.map((p) => (p.type === "text" ? p.text : "")).join(" ").trim();
    if (text) return text;
  } catch {
    // Quiet on error
  }

  return null;
}

export async function ingestText(input: { title: string; text: string; docId?: string }): Promise<UploadDocument> {
  const title = input.title?.trim();
  const text = input.text?.trim();

  if (!title || !text) {
    throw new UploadServiceError(400, "Add a title and notes before uploading.");
  }

  const docId = input.docId || `doc-${randomUUID()}`;
  const rawChunks = chunkText(text, 650, 100);

  const chunks: UploadChunk[] = rawChunks.map((chunkStr, index) => ({
    docId,
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
}): Promise<UploadDocument> {
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

  const extractedPages = await extractPdfTextPages(data);
  if (!extractedPages.length || extractedPages.every((p) => !p.text.trim())) {
    throw new UploadServiceError(
      422,
      "This PDF appears to be scanned or image-only; no extractable text was found. Please upload a text-based PDF."
    );
  }

  const chunks: UploadChunk[] = [];
  let chunkIndex = 0;

  for (const pageItem of extractedPages) {
    const pageChunks = chunkText(pageItem.text, 650, 100);
    for (const chunkStr of pageChunks) {
      chunks.push({
        docId,
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

  const doc: UploadDocument = {
    docId,
    sourceId: docId,
    sourceType: "pdf",
    title: docTitle,
    status: "complete",
    chunks: chunks.length,
  };

  documents.set(docId, doc);
  documentChunks.set(docId, chunks);
  saveStoredUploads();

  return doc;
}

export async function listDocuments(): Promise<UploadDocument[]> {
  return Array.from(documents.values());
}

export function getDocumentStatus(docId: string): UploadDocument | null {
  return documents.get(docId) ?? null;
}

export function getDocumentChunks(docId: string): UploadChunk[] {
  const chunks = documentChunks.get(docId);
  if (chunks && chunks.length > 0) return chunks;
  loadStoredUploads();
  return documentChunks.get(docId) || [];
}

export async function answerUploads(input: {
  question: string;
  scope: "lectures" | "uploads" | "both" | "playlist";
  docId?: string;
  topK?: number;
}): Promise<UploadAnswer> {
  const topK = input.topK ?? 5;

  // 1. Playlist scope
  if (input.scope === "playlist") {
    return await answerPlaylistCorpus(input.question, topK);
  }

  // 2. Upload / Mixed scopes require docId
  if ((input.scope === "uploads" || input.scope === "both") && !input.docId) {
    throw new UploadServiceError(400, "Choose an uploaded document before searching your uploads.");
  }

  const docId = input.docId || "";
  const chunks = documentChunks.get(docId) || [];

  if ((input.scope === "uploads" || input.scope === "both") && (!chunks.length || !documents.has(docId))) {
    throw new UploadServiceError(404, "Uploaded document not found. Please upload it again.");
  }

  const isWholeDoc = isWholeDocumentQuery(input.question);
  const scored = chunks
    .map((chunk) => ({ chunk, score: scoreUploadChunk(chunk, input.question) }))
    .sort((a, b) => b.score - a.score);

  const hasAnyMatch = scored.some((item) => item.score > 0);

  // If query is not a whole-document query and has zero keyword match across all chunks, refuse honestly
  if (!isWholeDoc && !hasAnyMatch) {
    return {
      answer: "It is not found in your material.",
      grounded: false,
      mode: "refusal",
      sources: [],
      retrieved: 0,
    };
  }

  let matchedChunks: UploadChunk[] = [];
  const totalWords = chunks.reduce((acc, c) => acc + c.text.split(/\s+/).length, 0);

  if (isWholeDoc) {
    matchedChunks = chunks.slice(0, Math.min(chunks.length, topK));
  } else if (chunks.length <= 6 || totalWords <= 2200) {
    // For small uploads, prioritize scored chunks but include context
    const positive = scored.filter((item) => item.score > 0).map((item) => item.chunk);
    matchedChunks = positive.length > 0 ? positive.slice(0, topK) : chunks.slice(0, topK);
  } else {
    const positive = scored.filter((item) => item.score > 0).map((item) => item.chunk);
    matchedChunks = positive.slice(0, topK);
  }

  const sources: UploadAnswer["sources"] = matchedChunks.map((chunk) => ({
    source_type: chunk.sourceType,
    source_id: chunk.docId,
    title: chunk.title,
    timestamp: null,
    page: chunk.page,
    snippet: chunk.text.slice(0, 1500),
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
          snippet: hit.chunk.text.slice(0, 1500),
          distance: 0.2,
        });
      }
    }
  }

  // Synthesis via configured LLM (Groq / Gemini / OpenAI)
  const isBoth = input.scope === "both";
  const systemPrompt = `You are UNSTUCK's grounded study assistant. Answer the user's question using ONLY the provided excerpts from their uploaded material${
    isBoth ? " and lecture clips" : ""
  }.
Rules:
- Answer only from the excerpts. If the information is not in the excerpts, say exactly: "It is not found in your material."
- Cite sources using [1], [2], etc. corresponding to the numbered excerpts below.
- If an excerpt is from a PDF, mention the page number if helpful.
- Be direct, clear, and accurate. Match the user's language (English or Hinglish).
- 3 to 6 sentences or structured bullet points.
- Never invent or assume facts not present in the excerpts.`;

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
    const lower = llmAnswer.toLowerCase();
    if (lower.includes("not found in your material") || lower.includes("not found in the material")) {
      return {
        answer: "It is not found in your material.",
        grounded: false,
        mode: "refusal",
        sources: [],
        retrieved: sources.length,
      };
    }
    return {
      answer: llmAnswer,
      grounded: true,
      mode: "live",
      sources,
      retrieved: sources.length,
    };
  }

  // Safe extractive fallback when LLM is unavailable
  const first = sources[0];
  const loc = first?.page ? ` (page ${first.page})` : "";
  const excerptText = first?.snippet.trim() || "";
  const fallbackAnswer = `Based on your material${loc}: ${excerptText.slice(0, 700)}${excerptText.length > 700 ? "…" : ""}`;

  return {
    answer: fallbackAnswer,
    grounded: true,
    mode: "extractive_fallback",
    sources,
    retrieved: sources.length,
  };
}

