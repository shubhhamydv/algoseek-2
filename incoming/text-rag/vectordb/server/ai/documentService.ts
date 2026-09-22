import { countDocumentChunks, deleteDocumentChunk, insertDocumentChunk, listDocumentChunks } from "../db";
import { cosineDistance, embedText, generateAnswer, ollamaError } from "./ollama";

export function chunkText(text: string, chunkWords = 250, overlapWords = 30) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  if (words.length <= chunkWords) return [text];
  const chunks: string[] = [];
  const step = chunkWords - overlapWords;
  for (let start = 0; start < words.length; start += step) {
    const end = Math.min(start + chunkWords, words.length);
    chunks.push(words.slice(start, end).join(" "));
    if (end === words.length) break;
  }
  return chunks;
}

export async function insertDocument(title: string, text: string) {
  const chunks = chunkText(text);
  if (!chunks.length) throw new Error("need title and text");
  const ids: number[] = [];
  for (let index = 0; index < chunks.length; index += 1) {
    const embedding = await embedText(chunks[index]);
    const id = await insertDocumentChunk({ title: chunks.length > 1 ? `${title} [${index + 1}/${chunks.length}]` : title, text: chunks[index], embedding });
    if (id !== undefined) ids.push(id);
  }
  return { ids, chunks: chunks.length, dims: (await listDocumentChunks())[0]?.embedding.length ?? 0 };
}

export async function listDocuments() {
  const rows = await listDocumentChunks();
  return rows.map(row => ({ id: row.id, title: row.title, preview: row.text.slice(0, 120) + (row.text.length > 120 ? "…" : ""), words: row.text.split(/\s+/).filter(Boolean).length }));
}

export async function retrieve(question: string, k = 3) {
  const query = await embedText(question);
  const rows = await listDocumentChunks();
  return rows.map(row => ({ ...row, distance: cosineDistance(query, row.embedding) })).filter(row => row.distance <= 0.7).sort((a, b) => a.distance - b.distance || a.id - b.id).slice(0, k);
}

export async function ask(question: string, k = 3) {
  const hits = await retrieve(question, k);
  const context = hits.map((hit, index) => `[${index + 1}] ${hit.title}:\n${hit.text}`).join("\n\n");
  const prompt = `You are a helpful assistant. Answer the user's question directly. Use the provided context if it contains relevant information. If it doesn't, just use your own general knowledge. IMPORTANT: Do NOT mention the context or provided text.\n\nContext:\n${context}\nQuestion: ${question}\n\nAnswer:`;
  const answer = await generateAnswer(prompt);
  return { answer, contexts: hits.map(({ embedding, ...hit }) => hit), docCount: await countDocumentChunks() };
}

export async function deleteDocument(id: number) { return deleteDocumentChunk(id); }
export { ollamaError };
