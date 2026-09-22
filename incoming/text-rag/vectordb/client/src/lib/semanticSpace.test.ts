import { describe, expect, it } from "vitest";
import { getSemanticSpaceState } from "./semanticSpace";

describe("semantic space state", () => {
  it("keeps loading distinct from empty", () => {
    expect(getSemanticSpaceState(true, 0)).toBe("loading");
  });

  it("shows empty only after loading completes without vectors", () => {
    expect(getSemanticSpaceState(false, 0)).toBe("empty");
  });

  it("shows ready when persisted vectors are available", () => {
    expect(getSemanticSpaceState(false, 20)).toBe("ready");
  });
});
