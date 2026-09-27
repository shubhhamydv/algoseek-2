import { describe, expect, it } from "vitest";

describe("AlgoSeek application title", () => {
  it("is configured for the current environment", () => {
    expect(["AlgoSeek", "UNSTUCK"]).toContain(process.env.VITE_APP_TITLE || "UNSTUCK");
  });
});
