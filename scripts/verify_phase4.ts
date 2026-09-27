import { ingestPdf, ingestText, answerUploads } from "../server/ai/uploadService";
import { generateGroundedQuiz, verifyQuestionAgainstSnippet } from "../server/ai/quizService";
import { readFileSync } from "node:fs";
import { join } from "node:path";

async function runPhase4Verification() {
  console.log("=================================================");
  console.log("PHASE 4 VERIFICATION EXECUTION");
  console.log("=================================================");

  // 1. Real PDF upload and Quiz Generation
  console.log("\n[Test 1] Real PDF Upload & Grounded Quiz Generation");
  const pdfPath = join(process.cwd(), "data", "demo", "dynamic-programming-study-guide.pdf");
  const pdfBase64 = readFileSync(pdfPath).toString("base64");
  const pdfDoc = await ingestPdf({
    title: "Dynamic Programming Study Guide",
    fileName: "dynamic-programming-study-guide.pdf",
    contentType: "application/pdf",
    contentBase64: pdfBase64,
  });
  console.log(`- Uploaded PDF docId: ${pdfDoc.docId} (${pdfDoc.chunks} chunks indexed)`);

  const pdfQuiz = await generateGroundedQuiz({
    scope: "uploads",
    docId: pdfDoc.docId,
    questionCount: 5,
  });

  console.log(`- Quiz generated: ${pdfQuiz.questions.length} questions (Total Generated: ${pdfQuiz.totalGenerated}, Discarded: ${pdfQuiz.discardedCount}, Verified: ${pdfQuiz.verifiedCount})`);
  pdfQuiz.questions.slice(0, 3).forEach((q, idx) => {
    console.log(`\n  Q${idx + 1}: ${q.question}`);
    console.log(`  Options:`);
    q.options.forEach((opt, oIdx) => console.log(`    ${oIdx === q.correctIndex ? "✓" : " "} [${oIdx + 1}] ${opt}`));
    console.log(`  Citation: ${q.citation.title}, Page ${q.citation.page}`);
    console.log(`  Excerpt: "${q.citation.snippet.slice(0, 140)}..."`);
    console.log(`  Explanation: ${q.explanation}`);
  });

  // 2. Self-verification Discard Test
  console.log("\n[Test 2] Self-Verification Bad Question Discard Test");
  const sampleSnippet = "Sliding Window maintains a contiguous subarray of size k with left and right pointers.";
  const badQuestion = {
    id: "q-hallucinated",
    question: "What does Sliding Window maintain?",
    options: [
      "A quantum entanglement qubit matrix in Hilbert space",
      "A hash table of prime numbers",
      "A binary tree traversal order",
      "A disjoint set union",
    ] as [string, string, string, string],
    correctIndex: 0,
    explanation: "Quantum physics.",
    citation: {
      sourceType: "text" as const,
      sourceId: "doc-test",
      title: "Notes",
      page: null,
      timestamp: null,
      snippet: sampleSnippet,
    },
  };
  const badVer = verifyQuestionAgainstSnippet(badQuestion, sampleSnippet);
  console.log(`- Unsupported Question Verification Result: verified = ${badVer.verified}, reason = "${badVer.reason}"`);

  // 3. Sparse Document Handling
  console.log("\n[Test 3] Sparse Document Graceful Refusal Test");
  const sparseDoc = await ingestText({
    title: "Sparse Note",
    text: "Very short note with only eight words.",
  });
  const sparseQuiz = await generateGroundedQuiz({
    scope: "uploads",
    docId: sparseDoc.docId,
  });
  console.log(`- Sparse Doc Quiz Result: success = ${sparseQuiz.success}, message = "${sparseQuiz.message}"`);

  // 4. Playlist Mode Topic Quiz Generation
  console.log("\n[Test 4] Playlist Topic Quiz Generation (Two Pointers & DP)");
  const tpQuiz = await generateGroundedQuiz({
    scope: "playlist",
    topicId: "two_pointers",
    questionCount: 5,
  });
  console.log(`- Two Pointers Quiz: ${tpQuiz.questions.length} questions, Video Citations: ${tpQuiz.questions[0]?.citation.timestamp} (${tpQuiz.questions[0]?.citation.sourceId})`);

  // 5. Existing Q&A Non-regression Spot Checks
  console.log("\n[Test 5] Existing Q&A Spot Checks (PDF, Text, Playlist Modes)");
  const pdfAns = await answerUploads({
    question: "What is the difference between memoization and tabulation?",
    scope: "uploads",
    docId: pdfDoc.docId,
  });
  console.log(`- Upload PDF Q&A: grounded = ${pdfAns.grounded}, mode = ${pdfAns.mode}, sources = ${pdfAns.sources.length}`);
  console.log(`  Snippet: "${pdfAns.answer.slice(0, 100)}..."`);

  const playAns = await answerUploads({
    question: "When should I use two pointers?",
    scope: "playlist",
  });
  console.log(`- Playlist Q&A: grounded = ${playAns.grounded}, mode = ${playAns.mode}, sources = ${playAns.sources.length}`);
  console.log(`  Snippet: "${playAns.answer.slice(0, 100)}..."`);

  console.log("\n=================================================");
  console.log("PHASE 4 VERIFICATION COMPLETE");
  console.log("=================================================");
}

runPhase4Verification().catch(console.error);
