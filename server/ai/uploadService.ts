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

function serviceUrl() {
  return (process.env.AI_SERVICE_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
}

async function request(path: string, init: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);
  try {
    const response = await fetch(`${serviceUrl()}${path}`, { ...init, signal: controller.signal });
    const body = await response.json().catch(() => null) as { detail?: string } | null;
    if (!response.ok) {
      throw new UploadServiceError(response.status, body?.detail || "The AI service could not process this material.");
    }
    return body as Record<string, unknown>;
  } catch (error) {
    if (error instanceof UploadServiceError) throw error;
    const message = error instanceof Error && error.name === "AbortError"
      ? "Processing timed out. Please try a smaller file."
      : "The upload AI service is unavailable. Start the FastAPI service and try again.";
    throw new UploadServiceError(503, message);
  } finally {
    clearTimeout(timeout);
  }
}

function register(response: Record<string, unknown>): UploadDocument {
  const document: UploadDocument = {
    docId: String(response.doc_id),
    sourceId: String(response.source_id),
    sourceType: response.source_type === "pdf" ? "pdf" : "text",
    title: String(response.title),
    status: "complete",
    chunks: Number(response.chunks),
  };
  documents.set(document.docId, document);
  return document;
}

export async function ingestText(input: { title: string; text: string; docId?: string }) {
  const response = await request("/ingest/text", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ title: input.title, text: input.text, doc_id: input.docId }),
  });
  return register(response);
}

export async function ingestPdf(input: { title?: string; fileName: string; contentType: string; contentBase64: string; docId?: string }) {
  const data = Buffer.from(input.contentBase64, "base64");
  if (!data.length) throw new UploadServiceError(400, "Choose a PDF file before uploading.");
  if (data.length > MAX_UPLOAD_BYTES) throw new UploadServiceError(413, "PDF files must be 20 MB or smaller.");
  if (!input.fileName.toLowerCase().endsWith(".pdf") || !data.subarray(0, 5).equals(Buffer.from("%PDF-"))) {
    throw new UploadServiceError(400, "Only valid PDF files are accepted.");
  }
  const form = new FormData();
  form.append("file", new Blob([data], { type: input.contentType || "application/pdf" }), input.fileName);
  if (input.title) form.append("title", input.title);
  if (input.docId) form.append("doc_id", input.docId);
  const response = await request("/ingest/pdf", { method: "POST", body: form });
  return register(response);
}

export async function listDocuments() {
  try {
    const response = await request("/uploads/documents", { method: "GET" });
    const remote = Array.isArray(response.documents) ? response.documents : [];
    return remote.map((document) => ({
      docId: String((document as Record<string, unknown>).doc_id),
      sourceId: String((document as Record<string, unknown>).source_id),
      sourceType: (document as Record<string, unknown>).source_type === "pdf" ? "pdf" as const : "text" as const,
      title: String((document as Record<string, unknown>).title),
      status: "complete" as const,
      chunks: Number((document as Record<string, unknown>).chunks),
    }));
  } catch (error) {
    // The in-process registry keeps a just-completed upload visible if a
    // transient Qdrant/service error occurs during an immediate UI refresh.
    if (documents.size) return Array.from(documents.values());
    throw error;
  }
}

export function getDocumentStatus(docId: string) {
  return documents.get(docId) ?? null;
}

export async function answerUploads(input: { question: string; scope: "lectures" | "uploads" | "both"; docId?: string; topK?: number }) {
  return await request("/v1/answers/scoped", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ question: input.question, scope: input.scope, doc_id: input.docId, top_k: input.topK ?? 5 }),
  }) as unknown as UploadAnswer;
}
