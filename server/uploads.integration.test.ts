import { describe, expect, it } from "vitest";
import {
  ingestText,
  ingestPdf,
  listDocuments,
  getDocumentStatus,
  answerUploads,
  UploadServiceError,
} from "./ai/uploadService";

// Minimal valid single-page PDF containing extractable text
const SAMPLE_PDF_BASE64 = Buffer.from(
  "%PDF-1.4\n" +
  "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n" +
  "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n" +
  "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n" +
  "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n" +
  "5 0 obj\n<< /Length 78 >>\nstream\n" +
  "BT\n/F1 12 Tf\n72 712 Td\n(Binary Search runs in O(log n) time by halving the search space.) Tj\nET\nendstream\nendobj\n" +
  "xref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000227 00000 n \n0000000294 00000 n \n" +
  "trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n422\n%%EOF"
).toString("base64");

const TEST_DEVICE_ID = "test-device-integration";

describe("In-process Upload & Grounded Answer Service", () => {
  it("ingests text notes, creates chunks, and lists documents", async () => {
    const doc = await ingestText({
      title: "Dynamic Programming Notes",
      text: "Dynamic programming solves problems by breaking them into overlapping subproblems. Memoization stores results in a table so each subproblem is solved only once.",
      deviceId: TEST_DEVICE_ID,
    });

    expect(doc.docId).toBeDefined();
    expect(doc.sourceType).toBe("text");
    expect(doc.status).toBe("complete");
    expect(doc.chunks).toBeGreaterThan(0);
    expect(doc.deviceId).toBe(TEST_DEVICE_ID);

    const status = getDocumentStatus(doc.docId, TEST_DEVICE_ID);
    expect(status).not.toBeNull();
    expect(status?.title).toBe("Dynamic Programming Notes");

    const docs = await listDocuments(TEST_DEVICE_ID);
    expect(docs.some((d) => d.docId === doc.docId)).toBe(true);
  });

  it("answers questions grounded in uploaded text notes", async () => {
    const doc = await ingestText({
      title: "Graph Algorithms",
      text: "Dijkstra algorithm finds the shortest path in a weighted graph with non-negative edge weights using a priority queue.",
      deviceId: TEST_DEVICE_ID,
    });

    const result = await answerUploads({
      question: "How does Dijkstra algorithm work?",
      scope: "uploads",
      docId: doc.docId,
      deviceId: TEST_DEVICE_ID,
    });

    expect(result.grounded).toBe(true);
    expect(result.sources.length).toBeGreaterThan(0);
    expect(result.sources[0].source_type).toBe("text");
    expect(result.answer).toContain("Dijkstra");
  });

  it("refuses honestly when a question is not covered in uploaded text", async () => {
    const doc = await ingestText({
      title: "Binary Tree Traversal",
      text: "Inorder traversal visits left subtree, root node, then right subtree. Preorder visits root first.",
      deviceId: TEST_DEVICE_ID,
    });

    const result = await answerUploads({
      question: "What is the capital of France and what is its population?",
      scope: "uploads",
      docId: doc.docId,
      deviceId: TEST_DEVICE_ID,
    });

    expect(result.grounded).toBe(false);
    expect(result.mode).toBe("refusal");
    expect(result.answer).toBe("It is not found in your material.");
  });

  it("ingests a PDF file, extracts pages, and attributes page citations", async () => {
    const doc = await ingestPdf({
      title: "Search Algorithms PDF",
      fileName: "search.pdf",
      contentType: "application/pdf",
      contentBase64: SAMPLE_PDF_BASE64,
      deviceId: TEST_DEVICE_ID,
    });

    expect(doc.docId).toBeDefined();
    expect(doc.sourceType).toBe("pdf");
    expect(doc.status).toBe("complete");
    expect(doc.chunks).toBeGreaterThan(0);
    expect(doc.deviceId).toBe(TEST_DEVICE_ID);

    const result = await answerUploads({
      question: "What is the time complexity of Binary Search?",
      scope: "uploads",
      docId: doc.docId,
      deviceId: TEST_DEVICE_ID,
    });

    expect(result.grounded).toBe(true);
    expect(result.sources.length).toBeGreaterThan(0);
    expect(result.sources[0].source_type).toBe("pdf");
    expect(result.sources[0].page).toBe(1);
    expect(result.answer).toMatch(/Binary Search|halving/i);
  });

  it("combines uploaded material and lecture clips in 'both' scope", async () => {
    const doc = await ingestText({
      title: "Two Pointer Notes",
      text: "The two-pointer technique maintains two indices moving towards each other to find pairs in sorted arrays.",
      deviceId: TEST_DEVICE_ID,
    });

    const result = await answerUploads({
      question: "Explain two pointer technique with sorted array",
      scope: "both",
      docId: doc.docId,
      deviceId: TEST_DEVICE_ID,
    });

    expect(result.grounded).toBe(true);
    expect(result.sources.some((s) => s.source_type === "text")).toBe(true);
  });

  it("validates PDF input properly", async () => {
    await expect(
      ingestPdf({
        fileName: "invalid.txt",
        contentType: "text/plain",
        contentBase64: "aGVsbG8=",
        deviceId: TEST_DEVICE_ID,
      })
    ).rejects.toThrow(UploadServiceError);
  });
});
