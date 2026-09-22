import { describe, expect, it } from "vitest";
import { canRunAiMutation } from "./aiGuards";

describe("AI mutation availability guard", () => {
  it("blocks mutations while status is loading or unavailable", () => {
    expect(canRunAiMutation(undefined, true)).toBe(false);
    expect(canRunAiMutation({ available: false }, false)).toBe(false);
  });

  it("allows mutations only after confirmed availability", () => {
    expect(canRunAiMutation({ available: true }, false)).toBe(true);
  });
});
