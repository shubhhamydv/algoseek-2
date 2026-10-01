import { describe, expect, it } from "vitest";
import {
  DSA_PATTERNS,
  ALL_PRACTICE_PROBLEMS,
  searchPracticeProblems,
} from "../client/src/data/dsaPatterns";

describe("DSA Practice Patterns & Sheet", () => {
  it("loads all 16 core DSA patterns", () => {
    expect(DSA_PATTERNS.length).toBe(16);
    const patternNames = DSA_PATTERNS.map((p) => p.name);
    expect(patternNames).toContain("Two Pointers");
    expect(patternNames).toContain("Sliding Window");
    expect(patternNames).toContain("Binary Search");
    expect(patternNames).toContain("Dynamic Programming (DP)");
    expect(patternNames).toContain("Graphs");
    expect(patternNames).toContain("Tree Pattern");
    expect(patternNames).toContain("Heap Pattern");
    expect(patternNames).toContain("Kadane Pattern");
    expect(patternNames).toContain("Prefix Sum");
    expect(patternNames).toContain("Merge Intervals");
    expect(patternNames).toContain("In-place Reversal of LinkedList");
    expect(patternNames).toContain("Fast & Slow Pointers");
    expect(patternNames).toContain("Stack");
    expect(patternNames).toContain("Hash Maps");
    expect(patternNames).toContain("Recursion & Backtracking");
    expect(patternNames).toContain("Greedy");
  });

  it("contains over 190 curated problems with valid URLs", () => {
    expect(ALL_PRACTICE_PROBLEMS.length).toBeGreaterThanOrEqual(190);
    for (const prob of ALL_PRACTICE_PROBLEMS) {
      expect(prob.title).toBeTruthy();
      expect(prob.pattern).toBeTruthy();
      expect(prob.links.length).toBeGreaterThanOrEqual(1);
      for (const link of prob.links) {
        expect(link.url).toMatch(/^https?:\/\//);
        expect(["leetcode", "geeksforgeeks", "youtube", "other"]).toContain(link.platform);
      }
    }
  });

  it("searches by topic and retrieves matching problems with proper links", () => {
    const twoPointers = searchPracticeProblems("Two Pointers");
    expect(twoPointers.totalMatches).toBeGreaterThanOrEqual(10);
    expect(twoPointers.matchedProblems.some((p) => p.title.includes("Pair with Target Sum"))).toBe(true);

    const slidingWindow = searchPracticeProblems("Sliding Window");
    expect(slidingWindow.totalMatches).toBeGreaterThanOrEqual(10);

    const dp = searchPracticeProblems("DP");
    expect(dp.totalMatches).toBeGreaterThanOrEqual(10);

    const tree = searchPracticeProblems("Invert Tree");
    expect(tree.matchedProblems.some((p) => p.title.toLowerCase().includes("invert tree"))).toBe(true);
    const invertProb = tree.matchedProblems.find((p) => p.title.toLowerCase().includes("invert tree"));
    expect(invertProb?.links[0].url).toContain("leetcode.com/problems/invert-binary-tree");
  });
});
