import { answerPlaylistCorpus } from "../server/preview/realCorpus";

const questions = [
  { topic: "Two Pointers", query: "What is the two pointer pattern?" },
  { topic: "Sliding Window", query: "How does the sliding window pattern work?" },
  { topic: "Recursion Base Case", query: "Why do we need a base case in recursion?" },
  { topic: "Graph Traversal (BFS)", query: "How does BFS or graph traversal work?" },
  { topic: "Dynamic Programming & Memoization", query: "What is the intuition behind dynamic programming and memoization?" },
  { topic: "Linked List Reversal", query: "How does linked list reversal work?" },
];

async function runEval() {
  for (const item of questions) {
    console.log(`\n######################################################################`);
    console.log(`TOPIC: ${item.topic}`);
    console.log(`QUERY: "${item.query}"`);
    console.log(`######################################################################\n`);
    
    const result = await answerPlaylistCorpus(item.query, 4);
    
    console.log(`--- RETRIEVED SOURCES (${result.sources.length}) ---`);
    result.sources.forEach((s, idx) => {
      console.log(`[Source ${idx + 1}] ${s.title} @ ${s.timestamp}`);
      console.log(`Citation Link: ${s.url}`);
      console.log(`Content Excerpt: ${s.snippet.slice(0, 250)}...\n`);
    });

    console.log(`--- GENERATED ANSWER ---`);
    console.log(result.answer);
    console.log(`\n` + "=".repeat(70) + `\n`);
  }
}

runEval().catch(console.error);
