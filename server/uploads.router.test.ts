import { describe, expect, it, vi } from "vitest";

vi.mock("./ai/uploadService", () => ({
  UploadServiceError: class UploadServiceError extends Error { status = 400; },
  ingestText: vi.fn(async () => ({ docId: "doc-text", sourceId: "doc-text", sourceType: "text", title: "Notes", status: "complete", chunks: 1 })),
  ingestPdf: vi.fn(async () => ({ docId: "doc-pdf", sourceId: "doc-pdf", sourceType: "pdf", title: "Guide", status: "complete", chunks: 2 })),
  listDocuments: vi.fn(async () => []),
  getDocumentStatus: vi.fn(() => null),
  answerUploads: vi.fn(async () => ({ answer: "Grounded answer [1]", grounded: true, mode: "live", sources: [], retrieved: 1 })),
}));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const ctx = { user: null, deviceId: "test-device-123", req: { headers: { "x-device-id": "test-device-123" } } as unknown as TrpcContext["req"], res: {} as TrpcContext["res"] } as TrpcContext;

describe("uploads tRPC procedures", () => {
  it("accepts typed note ingestion and returns its document identity", async () => {
    const result = await appRouter.createCaller(ctx).uploads.ingestText({ title: "Notes", text: "Dynamic programming uses optimal substructure." });
    expect(result).toMatchObject({ docId: "doc-text", sourceType: "text", status: "complete" });
  });

  it("requires a selected document for upload and mixed scopes", async () => {
    const caller = appRouter.createCaller(ctx);
    await expect(caller.uploads.answer({ question: "What is DP?", scope: "uploads" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.uploads.answer({ question: "What is DP?", scope: "both" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("validates PDF request shape before forwarding", async () => {
    const caller = appRouter.createCaller(ctx);
    await expect(caller.uploads.ingestPdf({ title: "Guide", fileName: "a.pdf", contentType: "application/pdf", contentBase64: "" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
