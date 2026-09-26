import { describe, expect, it, vi } from "vitest";

// vi.mock factories are hoisted, so we cannot reference module-scope variables.
// Use vi.hoisted() to create the mock function in the hoisted scope.
const { mockAnswerUploads } = vi.hoisted(() => ({
  mockAnswerUploads: vi.fn(),
}));

vi.mock("./ai/uploadService", () => ({
  UploadServiceError: class UploadServiceError extends Error { status = 400; },
  ingestText: vi.fn(async () => ({ docId: "doc-text", sourceId: "doc-text", sourceType: "text", title: "Notes", status: "complete", chunks: 1 })),
  ingestPdf: vi.fn(async () => ({ docId: "doc-pdf", sourceId: "doc-pdf", sourceType: "pdf", title: "Guide", status: "complete", chunks: 2 })),
  listDocuments: vi.fn(async () => []),
  getDocumentStatus: vi.fn(() => null),
  answerUploads: mockAnswerUploads,
}));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const ctx = { user: null, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] } as TrpcContext;

describe("playlist-only scope", () => {
  it("accepts scope='playlist' and forwards to the scoped answer endpoint", async () => {
    mockAnswerUploads.mockResolvedValueOnce({
      answer: "Sliding window is a technique where you maintain a window of elements...",
      grounded: true,
      mode: "live",
      sources: [{
        source_type: "video",
        source_id: "abc123",
        title: "Sliding Window Patterns",
        timestamp: "08:35",
        page: null,
        snippet: "Sliding window is useful for contiguous ranges...",
        distance: 0.23,
      }],
      retrieved: 3,
    });

    const caller = appRouter.createCaller(ctx);
    const result = await caller.uploads.answer({
      question: "What is the sliding window pattern?",
      scope: "playlist",
      topK: 5,
    });

    // Verify the call went through with correct scope and no docId
    expect(mockAnswerUploads).toHaveBeenCalledWith(
      expect.objectContaining({ scope: "playlist", question: "What is the sliding window pattern?" })
    );
    // No docId should have been passed
    const callArg = mockAnswerUploads.mock.calls[0][0];
    expect(callArg.docId).toBeUndefined();

    // Verify the response has video sources with timestamps
    expect(result.grounded).toBe(true);
    expect(result.sources).toHaveLength(1);
    expect(result.sources[0].source_type).toBe("video");
    expect(result.sources[0].timestamp).toBe("08:35");
    expect(result.sources[0].title).toContain("Sliding Window");
  });

  it("does not require docId for playlist scope (unlike uploads/both)", async () => {
    mockAnswerUploads.mockResolvedValueOnce({
      answer: "This isn't covered in the lecture playlist.",
      grounded: false,
      mode: "refusal",
      sources: [],
      retrieved: 0,
    });

    const caller = appRouter.createCaller(ctx);
    // This should NOT throw, unlike scope="uploads" without docId
    const result = await caller.uploads.answer({
      question: "What is React server components?",
      scope: "playlist",
      topK: 5,
    });

    expect(result.grounded).toBe(false);
    expect(result.mode).toBe("refusal");
    expect(result.answer).toContain("isn't covered");
  });

  it("returns playlist-specific refusal for off-topic questions", async () => {
    mockAnswerUploads.mockResolvedValueOnce({
      answer: "This isn't covered in the lecture playlist.",
      grounded: false,
      mode: "refusal",
      sources: [],
      retrieved: 0,
    });

    const caller = appRouter.createCaller(ctx);
    const result = await caller.uploads.answer({
      question: "Explain quantum entanglement",
      scope: "playlist",
      topK: 5,
    });

    expect(result.grounded).toBe(false);
    expect(result.sources).toEqual([]);
    expect(result.answer).toBe("This isn't covered in the lecture playlist.");
  });

  it("still requires docId for upload and mixed scopes (existing behaviour preserved)", async () => {
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.uploads.answer({ question: "What is DP?", scope: "uploads" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(
      caller.uploads.answer({ question: "What is DP?", scope: "both" })
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
