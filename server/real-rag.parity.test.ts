import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { pratyushChunks, pratyushLectures } from "./preview/realCorpus";
import type { TrpcContext } from "./_core/context";

const ctx = { user: null, req: {} as TrpcContext["req"], res: {} as TrpcContext["res"] } as TrpcContext;

describe("real Pratyush RAG parity", () => {
  it("loads the supplied corpus and preserves the source chunk cardinality", () => {
    expect(pratyushLectures).toHaveLength(126);
    expect(pratyushChunks).toHaveLength(2933);
    expect(pratyushChunks[0]?.text).toContain(pratyushChunks[0]?.title ?? "");
    expect(pratyushChunks[0]?.url).toContain("youtube.com/watch?v=");
    expect(pratyushChunks[0]?.url).toContain("&t=0s");
  });

  it("refuses unmatched questions without inventing citations", async () => {
    const result = await appRouter.createCaller(ctx).lecture.search({ question: "Explain quantum chromodynamics and hadronization", topK: 5 });
    expect(result.grounded).toBe(false);
    expect(result.citations).toEqual([]);
    expect(result.answer).toContain("Ye topic");
  });
});
