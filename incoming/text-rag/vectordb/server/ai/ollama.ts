import { getDistance } from "../vector/metrics";
import { invokeLLM } from "../_core/llm";

export type OllamaFailureKind = "OFFLINE" | "TIMEOUT" | "MODEL" | "RESPONSE";
export class OllamaServiceError extends Error { constructor(public readonly kind: OllamaFailureKind, message: string) { super(message); } }

const endpoint = () => (process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434").replace(/\/$/, "");
export const ollamaConfig = () => ({ embedModel: process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text", genModel: process.env.OLLAMA_GEN_MODEL || "llama3.2" });
const fallbackEnabled = () => process.env.ENABLE_LOCAL_AI_FALLBACK !== "false";

function localEmbedding(text: string) { const vector = Array(16).fill(0) as number[]; for (let i = 0; i < text.length; i += 1) vector[(text.charCodeAt(i) + i * 17) % 16] += ((text.charCodeAt(i) % 31) + 1) / 100; const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1; return vector.map(value => value / norm); }

async function post(path: string, body: unknown, timeoutMs: number) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(`${endpoint()}${path}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), signal: controller.signal });
    if (!response.ok) throw new Error(`Ollama returned HTTP ${response.status}`);
    return await response.json() as Record<string, unknown>;
  } finally { clearTimeout(timeout); }
}

export async function ollamaStatus() {
  try { const response = await fetch(`${endpoint()}/api/tags`, { signal: AbortSignal.timeout(2000) }); if (response.ok) return { available: true, provider: "ollama" as const, ...ollamaConfig() }; }
  catch { /* use the managed fallback below */ }
  return { available: fallbackEnabled(), provider: fallbackEnabled() ? "built-in" as const : "ollama" as const, ...ollamaConfig() };
}

export async function embedText(text: string) {
  try {
    const data = await post("/api/embeddings", { model: ollamaConfig().embedModel, prompt: text }, 30000);
    const embedding = data.embedding;
    if (!Array.isArray(embedding) || !embedding.every(value => typeof value === "number")) throw new Error("invalid embedding response");
    return embedding as number[];
  } catch (error) { if (fallbackEnabled()) return localEmbedding(text); const message = error instanceof Error ? error.message : "unknown error"; const kind: OllamaFailureKind = message.includes("aborted") || message.includes("timed out") ? "TIMEOUT" : message.includes("HTTP") ? "MODEL" : message.includes("invalid") ? "RESPONSE" : "OFFLINE"; throw new OllamaServiceError(kind, `Ollama embedding ${kind.toLowerCase()}: ${message}. Ensure ${ollamaConfig().embedModel} is installed.`); }
}

export async function generateAnswer(prompt: string) {
  try {
    const data = await post("/api/generate", { model: ollamaConfig().genModel, prompt, stream: false }, 180000);
    if (typeof data.response !== "string") throw new Error("invalid generation response");
    return data.response;
  } catch (error) { if (fallbackEnabled()) { const response = await invokeLLM({ messages: [{ role: "system", content: "Answer using the supplied retrieval context. Be concise and honest about uncertainty." }, { role: "user", content: prompt }] }); const content = response.choices?.[0]?.message?.content; return typeof content === "string" ? content : "The built-in AI provider returned no text."; } const message = error instanceof Error ? error.message : "unknown error"; const kind: OllamaFailureKind = message.includes("aborted") || message.includes("timed out") ? "TIMEOUT" : message.includes("HTTP") ? "MODEL" : message.includes("invalid") ? "RESPONSE" : "OFFLINE"; throw new OllamaServiceError(kind, `Ollama generation ${kind.toLowerCase()}: ${message}. Ensure ${ollamaConfig().genModel} is installed.`); }
}

export function ollamaError(error: unknown) { return `Ollama unavailable. Check OLLAMA_BASE_URL and ensure model ${ollamaConfig().embedModel} / ${ollamaConfig().genModel} is installed.`; }

export const cosineDistance = getDistance("cosine");
