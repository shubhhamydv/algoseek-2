import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

describe("tutor router", () => {
  const caller = appRouter.createCaller({
    req: {} as any,
    res: {} as any,
    user: null,
  });

  it("returns tutor status indicating configured providers", async () => {
    const status = await caller.tutor.status();
    expect(status).toBeDefined();
    expect(typeof status.configured).toBe("boolean");
    expect(status.providers).toHaveProperty("groq");
    expect(status.providers).toHaveProperty("gemini");
  });

  it("handles a general question and returns an answer with a model and provider", async () => {
    const response = await caller.tutor.ask({
      question: "Explain two pointers technique in DSA",
      track: "dsa",
    });

    expect(response).toBeDefined();
    expect(response.answer).toBeTruthy();
    expect(typeof response.answer).toBe("string");
    expect(["groq", "gemini", "offline-knowledge"]).toContain(response.provider);
    expect(response.model).toBeTruthy();
  });
});
