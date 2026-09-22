import { describe, expect, it } from "vitest";
import { validateLectureQuestion } from "../client/src/lib/questionValidation";

describe("validateLectureQuestion", () => {
  it("rejects blank questions without calling the API", () => {
    expect(validateLectureQuestion("   ")).toBe("Enter a DSA question to search the lectures.");
  });

  it("rejects questions shorter than three characters", () => {
    expect(validateLectureQuestion("DP")).toBe("Please enter at least 3 characters.");
  });

  it("accepts a valid English or Hinglish question", () => {
    expect(validateLectureQuestion("DP mein memoization kya hai?")).toBeNull();
  });
});
