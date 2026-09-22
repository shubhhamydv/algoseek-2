import { describe, expect, it } from "vitest";
import { generateGroundedAnswer, AI_BOUNDARY_VERSION } from "./ai/boundary";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const ctx = { user: null, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] } as TrpcContext;
const sampleCitation = [{ id: "sample-1", title: "DP Lecture", timestamp: "01:20", startSec: 80, videoId: "sample", text: "A grounded excerpt.", url: "https://youtube.com/watch?v=sample&t=80s" }];

describe("lecture-rag AI boundary", () => {
  it("returns preview mode with stable version metadata when live AI is disabled", async () => {
    const result = await generateGroundedAnswer({ question: "What is DP?", citations: sampleCitation, previewAnswer: "Preview answer", topK: 5 });
    expect(result.mode).toBe("preview");
    expect(result.boundaryVersion).toBe(AI_BOUNDARY_VERSION);
    expect(result.providerConfigured).toBe(false);
    expect(result.citations[0]?.url).toContain("t=80s");
  });

  it("falls back to preview mode when the configured live provider fails", async () => {
    const previous = process.env.LIVE_AI_ENABLED;
    process.env.LIVE_AI_ENABLED = "true";
    const result = await generateGroundedAnswer({ question: "What is DP?", citations: sampleCitation, previewAnswer: "Safe preview answer", topK: 5, llmInvoker: async () => { throw new Error("provider unavailable"); } });
    if (previous === undefined) delete process.env.LIVE_AI_ENABLED; else process.env.LIVE_AI_ENABLED = previous;
    expect(result.mode).toBe("preview");
    expect(result.answer).toBe("Safe preview answer");
    expect(result.providerConfigured).toBe(false);
    expect(result.citations[0]?.startSec).toBe(80);
  });

  it("exposes lecture and transcript chunk records through typed procedures", async () => {
    const caller = appRouter.createCaller(ctx);
    const lectures = await caller.lecture.list();
    const chunks = await caller.lecture.chunks({ lectureId: lectures[0]?.id });
    expect(lectures.length).toBeGreaterThan(0);
    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks[0]?.videoId).toBeTruthy();
    expect(chunks[0]?.url).toMatch(/^https:\/\/www\.youtube\.com\/watch\?v=[^&]+&t=\d+s$/);
    expect(chunks[0]?.startSec).toBeTypeOf("number");
    expect("text" in (chunks[0] ?? {})).toBe(false);
  });
});
