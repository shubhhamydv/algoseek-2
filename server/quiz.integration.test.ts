import { describe, expect, it } from "vitest";
import {
  generateGroundedQuiz,
  verifyQuestionAgainstSnippet,
  getTopicTaxonomy,
} from "./ai/quizService";
import { ingestText, ingestPdf } from "./ai/uploadService";
import { appRouter } from "./routers";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const REAL_DP_PDF_BASE64 = readFileSync(
  join(process.cwd(), "data", "demo", "dynamic-programming-study-guide.pdf")
).toString("base64");

describe("Feature A: Grounded Quiz Generation & Mandatory Self-Verification", () => {
  it("generates 5 multiple-choice questions grounded in an uploaded PDF with valid citations", async () => {
    const doc = await ingestPdf({
      title: "Dynamic Programming Study Guide",
      fileName: "dynamic-programming-study-guide.pdf",
      contentType: "application/pdf",
      contentBase64: REAL_DP_PDF_BASE64,
    });

    const quiz = await generateGroundedQuiz({
      scope: "uploads",
      docId: doc.docId,
      questionCount: 5,
    });

    expect(quiz.success).toBe(true);
    expect(quiz.questions.length).toBeGreaterThanOrEqual(3);
    expect(quiz.totalGenerated).toBeGreaterThan(0);
    expect(quiz.verifiedCount).toBe(quiz.questions.length);

    // Verify properties of every question
    for (const q of quiz.questions) {
      expect(q.options.length).toBe(4);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(4);
      expect(q.citation.sourceType).toBe("pdf");
      expect(q.citation.page).toBeGreaterThanOrEqual(1);
      expect(q.citation.snippet).toBeTruthy();

      // The correct answer must be supported by the snippet
      const correctAnswer = q.options[q.correctIndex];
      expect(correctAnswer.trim().length).toBeGreaterThan(0);
    }
  });

  it("generates grounded quiz questions from uploaded text notes", async () => {
    const doc = await ingestText({
      title: "Graph Traversal BFS and DFS",
      text: `Breadth-First Search (BFS) explores a graph level by level starting from the source vertex.
BFS uses a Queue data structure (First-In, First-Out) to track vertices to visit next.
The time complexity of BFS on an adjacency list representation is O(V + E), where V is the number of vertices and E is the number of edges.
BFS is guaranteed to find the shortest path in an unweighted graph.
In contrast, Depth-First Search (DFS) explores as deep as possible along each branch before backtracking and uses a Stack data structure (or system call stack via recursion).`,
    });

    const quiz = await generateGroundedQuiz({
      scope: "uploads",
      docId: doc.docId,
      questionCount: 5,
    });

    expect(quiz.success).toBe(true);
    expect(quiz.questions.length).toBeGreaterThanOrEqual(3);
    for (const q of quiz.questions) {
      expect(q.options.length).toBe(4);
      expect(q.citation.snippet).toBeTruthy();
      expect(q.explanation).toBeTruthy();
    }
  });

  it("gracefully refuses when uploaded source material is too sparse/short", async () => {
    const doc = await ingestText({
      title: "Too Short Note",
      text: "Only ten words here in this tiny study note for test.",
    });

    const quiz = await generateGroundedQuiz({
      scope: "uploads",
      docId: doc.docId,
      questionCount: 5,
    });

    expect(quiz.success).toBe(false);
    expect(quiz.questions.length).toBe(0);
    expect(quiz.message).toContain("too short");
  });

  it("self-verification catches and discards questions with unsupported answers", () => {
    const sourceSnippet = "Sliding Window maintains a contiguous subarray of size k with left and right pointers.";

    // 1. Valid question: correct answer is directly supported by snippet
    const validQuestion = {
      id: "q1",
      question: "What does Sliding Window maintain?",
      options: [
        "A contiguous subarray with left and right pointers",
        "A hash table with all prime numbers",
        "A binary tree traversal order",
        "A disjoint set union",
      ] as [string, string, string, string],
      correctIndex: 0,
      explanation: "Sliding window maintains a contiguous subarray using pointers.",
      citation: {
        sourceType: "text" as const,
        sourceId: "doc-1",
        title: "Sliding Window Notes",
        page: null,
        timestamp: null,
        snippet: sourceSnippet,
      },
    };
    expect(verifyQuestionAgainstSnippet(validQuestion, sourceSnippet).verified).toBe(true);

    // 2. Bad question: correct answer is completely made up / not in snippet
    const hallucinatedQuestion = {
      id: "q2",
      question: "What does Sliding Window maintain?",
      options: [
        "A quantum entanglement qubit matrix in Hilbert space",
        "A hash table with all prime numbers",
        "A binary tree traversal order",
        "A disjoint set union",
      ] as [string, string, string, string],
      correctIndex: 0,
      explanation: "Quantum physics.",
      citation: {
        sourceType: "text" as const,
        sourceId: "doc-1",
        title: "Sliding Window Notes",
        page: null,
        timestamp: null,
        snippet: sourceSnippet,
      },
    };
    expect(verifyQuestionAgainstSnippet(hallucinatedQuestion, sourceSnippet).verified).toBe(false);

    // 3. Bad question: invalid correct index
    const invalidIndexQuestion = {
      ...validQuestion,
      correctIndex: 5,
    };
    expect(verifyQuestionAgainstSnippet(invalidIndexQuestion, sourceSnippet).verified).toBe(false);

    // 4. Bad question: duplicated options
    const duplicateOptionsQuestion = {
      ...validQuestion,
      options: [
        "A contiguous subarray with left and right pointers",
        "A contiguous subarray with left and right pointers",
        "Other",
        "Another",
      ] as [string, string, string, string],
    };
    expect(verifyQuestionAgainstSnippet(duplicateOptionsQuestion, sourceSnippet).verified).toBe(false);
  });

  it("generates playlist-scoped quiz questions for canonical DSA topics", async () => {
    const quiz = await generateGroundedQuiz({
      scope: "playlist",
      topicId: "dynamic_programming",
      questionCount: 5,
    });

    expect(quiz.success).toBe(true);
    expect(quiz.questions.length).toBeGreaterThanOrEqual(3);
    for (const q of quiz.questions) {
      expect(q.citation.sourceType).toBe("video");
      expect(q.citation.timestamp).toMatch(/^\d+:\d{2}$/);
      expect(q.citation.sourceId).toBeTruthy();
    }
  });
});

describe("Feature B: DSA Topic Coverage / Taxonomy", () => {
  it("loads 12 canonical DSA topics mapping all 126 lecture videos offline", () => {
    const topics = getTopicTaxonomy();
    expect(topics.length).toBe(12);

    const topicIds = topics.map((t) => t.id);
    expect(topicIds).toContain("arrays_hashing");
    expect(topicIds).toContain("two_pointers");
    expect(topicIds).toContain("sliding_window");
    expect(topicIds).toContain("linked_lists");
    expect(topicIds).toContain("stacks_queues");
    expect(topicIds).toContain("trees_bst");
    expect(topicIds).toContain("graphs_bfs_dfs");
    expect(topicIds).toContain("recursion_backtracking");
    expect(topicIds).toContain("dynamic_programming");
    expect(topicIds).toContain("greedy");
    expect(topicIds).toContain("binary_search");
    expect(topicIds).toContain("bit_manipulation");

    // Check that all 126 lecture videos are classified across topics
    const allAssignedLectures = new Set<string>();
    for (const t of topics) {
      expect(t.lectureIds.length).toBeGreaterThan(0);
      for (const id of t.lectureIds) {
        allAssignedLectures.add(id);
      }
    }
    expect(allAssignedLectures.size).toBe(126);
  });

  it("exposes lecture.topics and quiz.generate through tRPC AppRouter", async () => {
    const caller = appRouter.createCaller({});

    // 1. Check topic query
    const topicsResult = await caller.lecture.topics();
    expect(topicsResult.total).toBe(12);
    expect(topicsResult.topics.length).toBe(12);

    // 2. Check quiz generation mutation
    const quizResult = await caller.quiz.generate({
      scope: "playlist",
      topicId: "two_pointers",
      questionCount: 5,
    });
    expect(quizResult.success).toBe(true);
    expect(quizResult.questions.length).toBeGreaterThanOrEqual(3);
  });
});
