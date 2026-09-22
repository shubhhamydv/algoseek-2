import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import { embedText, ollamaStatus } from "./ai/ollama";

describe("typed API validation and AI error paths", () => {
  const caller = appRouter.createCaller({ user: undefined, req: {} as any, res: {} as any });

  it("rejects vector queries that are not exactly 16-dimensional", async () => {
    await expect(caller.vector.search({ query: [1, 2, 3], k: 3, metric: "cosine", algo: "hnsw" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects empty RAG questions", async () => {
    await expect(caller.ai.ask({ question: "", k: 3 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("uses the built-in embedding fallback when Ollama is offline", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    const embedding = await embedText("hello");
    expect(embedding).toHaveLength(16);
    expect(embedding.every(value => Number.isFinite(value))).toBe(true);
    vi.unstubAllGlobals();
  });

  it("reports the built-in provider when Ollama is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    await expect(ollamaStatus()).resolves.toMatchObject({ available: true, provider: "built-in" });
    vi.unstubAllGlobals();
  });

  it("inserts document chunks with fallback embeddings while Ollama is offline", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    const result = await caller.ai.insertDocument({ title: "Fallback integration test", text: "This document verifies that embedding insertion works when the optional Ollama service is offline." });
    expect(result.chunks).toBeGreaterThan(0);
    expect(result.dims).toBe(16);
    for (const id of result.ids) await caller.ai.deleteDocument({ id });
    vi.unstubAllGlobals();
  });

  it("surfaces a clear Ollama error when the fallback is disabled", async () => {
    vi.stubEnv("ENABLE_LOCAL_AI_FALLBACK", "false");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    await expect(embedText("hello")).rejects.toThrow(/Ollama embedding offline/);
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });
});
