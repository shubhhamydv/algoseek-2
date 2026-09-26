import { retrievePratyushChunks } from "../server/preview/realCorpus";

const questions = [
  "What is the two pointer pattern?",
  "How does the sliding window pattern work?",
  "Why do we need a base case in recursion?",
  "How does BFS or graph traversal work?",
  "What is the intuition behind dynamic programming and memoization?",
  "How does linked list reversal work?",
];

for (const q of questions) {
  const hits = retrievePratyushChunks(q, 3);
  console.log(`\n======================================================`);
  console.log(`QUESTION: ${q}`);
  if (hits.length === 0) {
    console.log("NO HITS FOUND!");
  } else {
    hits.forEach((h, i) => {
      console.log(`\n[Hit ${i + 1}] Title: ${h.chunk.title} @ ${h.chunk.timestamp} (Score: ${h.score})`);
      console.log(`Text excerpt: ${h.chunk.text.replace(/\\n/g, " ").slice(0, 250)}...`);
    });
  }
}
