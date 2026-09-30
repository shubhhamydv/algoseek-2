import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  ingestPdf,
  answerUploads,
  normalizePdfText,
  BM25,
  cosineSimilarity,
  generateLocalDenseVector,
  reciprocalRankFusion,
} from "./ai/uploadService";

describe("RAG Pipeline & Hybrid Search Unit Tests", () => {
  it("normalizes hyphenated linebreaks and extra whitespace", () => {
    const raw = "Multi-\n dimensional Arrays in Java\n\n• Point 1\n• Point 2";
    const cleaned = normalizePdfText(raw);
    expect(cleaned).toContain("Multi-dimensional Arrays in Java");
    expect(cleaned).toContain("- Point 1");
    expect(cleaned).toContain("- Point 2");
  });

  it("calculates cosine similarity correctly", () => {
    const v1 = [1, 0, 0];
    const v2 = [1, 0, 0];
    const v3 = [0, 1, 0];
    expect(cosineSimilarity(v1, v2)).toBeCloseTo(1.0);
    expect(cosineSimilarity(v1, v3)).toBeCloseTo(0.0);
  });

  it("ranks matching keywords higher with BM25", () => {
    const corpus = [
      "Control flow if else switch case loops",
      "Arrays and Multi-dimensional arrays with matrix declaration int[][]",
      "Primitive types byte short int long float double boolean char",
    ];
    const bm25 = new BM25(corpus);
    const score0 = bm25.score("multi-dimensional array", 0);
    const score1 = bm25.score("multi-dimensional array", 1);
    const score2 = bm25.score("multi-dimensional array", 2);

    expect(score1).toBeGreaterThan(score0);
    expect(score1).toBeGreaterThan(score2);
  });

  it("merges rankings with Reciprocal Rank Fusion (RRF)", () => {
    const bm25Ranks = [
      { index: 1, score: 8.5 },
      { index: 0, score: 1.2 },
    ];
    const vectorRanks = [
      { index: 1, score: 0.82 },
      { index: 0, score: 0.45 },
    ];
    const fused = reciprocalRankFusion(bm25Ranks, vectorRanks, 60);
    expect(fused[0].index).toBe(1);
    expect(fused[0].rrfScore).toBeGreaterThan(fused[1].rrfScore);
  });

  it("ingests a PDF and answers multi-dimensional array queries with grounded sources", async () => {
    const pdfPath = join(process.cwd(), "client", "public", "library", "java-programming-cheatsheet.pdf");
    if (!existsSync(pdfPath)) return;

    const buffer = readFileSync(pdfPath);
    const base64 = buffer.toString("base64");

    const doc = await ingestPdf({
      fileName: "java-programming-cheatsheet.pdf",
      contentType: "application/pdf",
      contentBase64: base64,
      title: "Java Programming Cheatsheet",
    });

    expect(doc).toBeDefined();
    expect(doc.chunks).toBeGreaterThan(0);

    // Query 1: Exact hyphenated variant
    const ans1 = await answerUploads({
      question: "what is multi-dimensional array",
      scope: "uploads",
      docId: doc.docId,
    });
    expect(ans1.grounded).toBe(true);
    expect(ans1.sources.length).toBeGreaterThan(0);
    expect(ans1.sources.some(s => s.page === 6 || s.snippet.toLowerCase().includes("multi-dimensional") || s.snippet.toLowerCase().includes("matrix"))).toBe(true);

    // Query 2: Semantic synonym (2D array)
    const ans2 = await answerUploads({
      question: "what is 2D array in java",
      scope: "uploads",
      docId: doc.docId,
    });
    expect(ans2.grounded).toBe(true);
    expect(ans2.sources.some(s => s.page === 6 || s.snippet.toLowerCase().includes("matrix") || s.snippet.toLowerCase().includes("array"))).toBe(true);

    // Query 3: Non-hyphenated variant
    const ans3 = await answerUploads({
      question: "multidimensional arrays example",
      scope: "uploads",
      docId: doc.docId,
    });
    expect(ans3.grounded).toBe(true);
    expect(ans3.sources.length).toBeGreaterThan(0);

    // Query 4: Unrelated query should be handled without crashing
    const ans4 = await answerUploads({
      question: "quantum gravitational black hole thermodynamics relativity",
      scope: "uploads",
      docId: doc.docId,
    });
    expect(ans4).toBeDefined();
    expect(typeof ans4.answer).toBe("string");
  });
});
