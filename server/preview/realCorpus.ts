import lecturesJson from "../../data/pratyush/lectures.json";
import chunksJson from "../../data/pratyush/chunks.json";

export type LectureRecord = (typeof lecturesJson)[number];
export type TranscriptChunk = (typeof chunksJson)[number];

export const pratyushLectures = lecturesJson as LectureRecord[];
export const pratyushChunks = chunksJson as TranscriptChunk[];

const stopWords = new Set(["what", "which", "where", "when", "does", "this", "that", "with", "from", "the", "and", "are", "hai", "kya", "ka", "ke", "mein", "how", "explain", "tell", "today", "question", "important", "lecture", "video", "understand"]);
const tokenize = (text: string) => text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(token => token.length > 2 && !stopWords.has(token));

export function retrievePratyushChunks(question: string, topK = 5) {
  const terms = tokenize(question);
  const scored = pratyushChunks.map(chunk => {
    const haystack = `${chunk.title} ${chunk.text}`.toLowerCase();
    const matches = terms.reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0);
    const titleBoost = terms.reduce((score, term) => score + (chunk.title.toLowerCase().includes(term) ? 2 : 0), 0);
    return { chunk, score: matches + titleBoost };
  }).filter(item => item.score > 0).sort((a, b) => b.score - a.score || a.chunk.startSec - b.chunk.startSec);
  return scored.slice(0, topK);
}
