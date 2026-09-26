import { answerPlaylistCorpus, retrievePratyushChunks, chunksByVideo } from "../server/preview/realCorpus";

async function test() {
  const q = "What is the two pointer pattern?";
  const res = await answerPlaylistCorpus(q, 5);
  console.log("=== QUESTION ===");
  console.log(q);
  console.log("\n=== RETRIEVED SOURCE EXCERPTS ===");
  res.sources.forEach((s, i) => {
    console.log(`[Source ${i+1}] Title: ${s.title} @ ${s.timestamp}`);
    console.log(`Snippet: ${s.snippet}\n`);
  });
  console.log("=== GENERATED ANSWER ===");
  console.log(res.answer);
}

test();
