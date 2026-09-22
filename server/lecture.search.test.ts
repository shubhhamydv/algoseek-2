import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const ctx = {
  user: null,
  req: {} as TrpcContext["req"],
  res: {} as TrpcContext["res"],
} as TrpcContext;

describe("lecture.search", () => {
  it("returns grounded preview answers with timestamp citations without provider credentials", async () => {
    const result = await appRouter.createCaller(ctx).lecture.search({
      question: "memoization aur tabulation ka difference?",
      topK: 5,
    });

    expect(result.grounded).toBe(true);
    expect(result.mode).toBe("preview");
    expect(result.citations.length).toBeGreaterThan(0);
    expect(result.citations[0]?.url).toContain("t=");
    expect(result.retrieval.model).toContain("preview");
    expect(result.citations[0]?.videoId).toBeTruthy();
    expect(result.citations[0]?.url).toContain(`v=${result.citations[0]?.videoId}`);
    expect(result.citations[0]?.url).toContain(`t=${result.citations[0]?.startSec}`);
  });

  it("returns lecture-level citations without exposing raw transcript chunks", async () => {
    const caller = appRouter.createCaller(ctx);
    const result = await caller.lecture.search({ question: "memoization aur tabulation ka difference?", topK: 3 });
    const citation = result.citations[0];

    expect(citation?.url).toMatch(/^https:\/\/www\.youtube\.com\/watch\?v=[^&]+&t=\d+s$/);
    expect(citation?.title).toBeTruthy();
    expect(citation?.videoId).toBeTruthy();
    expect(citation?.startSec).toBeTypeOf("number");
    expect("text" in (citation ?? {})).toBe(false);

    const chunks = await caller.lecture.chunks({ lectureId: citation?.videoId });
    expect(chunks[0]?.url).toContain("youtube.com/watch?v=");
    expect("text" in (chunks[0] ?? {})).toBe(false);
  });

  it("keeps alternate English/Hinglish topic searches grounded in representative data", async () => {
    const result = await appRouter.createCaller(ctx).lecture.search({
      question: "Sliding window kab use karna chahiye?",
      topK: 3,
    });

    expect(result.answer.toLowerCase()).toContain("sliding window");
    expect(result.retrieval.chunks).toBe(3);
  });
});
