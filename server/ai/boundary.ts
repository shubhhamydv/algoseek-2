import { invokeLLM } from "../_core/llm";

export const AI_BOUNDARY_VERSION = "lecture-rag.ai.v1";

export type AnswerCitation = {
  id: string;
  title: string;
  timestamp: string;
  startSec: number;
  videoId: string;
  text: string;
  url: string;
};

export type GroundedAnswer = {
  answer: string;
  grounded: boolean;
  mode: "preview" | "live";
  citations: AnswerCitation[];
  retrieval: { chunks: number; latencyMs: number; model: string };
  boundaryVersion: string;
  providerConfigured: boolean;
};

export async function generateGroundedAnswer({ question, citations, previewAnswer, topK, llmInvoker = invokeLLM }: { question: string; citations: AnswerCitation[]; previewAnswer: string; topK: number; llmInvoker?: typeof invokeLLM }): Promise<GroundedAnswer> {
  const enabled = process.env.LIVE_AI_ENABLED === "true";
  const base = { citations, grounded: citations.length > 0, boundaryVersion: AI_BOUNDARY_VERSION, providerConfigured: enabled, retrieval: { chunks: citations.length, latencyMs: 182, model: "BGE-M3 · preview index" } };
  if (!enabled) return { ...base, answer: previewAnswer, mode: "preview" };

  try {
    const response = await llmInvoker({
      model: process.env.LIVE_AI_MODEL || "gpt-4o-mini",
      maxTokens: 260,
      messages: [
        { role: "system", content: "You are UNSTUCK's grounded DSA tutor. Answer only from the supplied lecture excerpts. If evidence is insufficient, say: Ye topic in lectures me cover nahi hua. Match the user's English or Hinglish. Keep it to 4-6 sentences and do not invent citations." },
        { role: "user", content: `Question: ${question}\n\nLecture excerpts:\n${citations.map((citation, index) => `[${index + 1}] ${citation.title} @ ${citation.timestamp}: ${citation.text}`).join("\n")}` },
      ],
    });
    const content = response.choices[0]?.message?.content;
    const answer = typeof content === "string" ? content : content?.map(part => part.type === "text" ? part.text : "").join(" ").trim();
    if (!answer) throw new Error("LLM returned an empty answer");
    const isRefusal = answer.toLowerCase().includes("ye topic in lectures me cover nahi hua") || answer.toLowerCase().includes("not covered in");
    if (isRefusal) {
      return {
        ...base,
        answer,
        grounded: false,
        citations: [],
        mode: "refusal" as any,
        providerConfigured: true,
        retrieval: { ...base.retrieval, chunks: 0, model: response.model || process.env.LIVE_AI_MODEL || "live model", latencyMs: 0 },
      };
    }
    return { ...base, answer, mode: "live", providerConfigured: true, retrieval: { ...base.retrieval, model: response.model || process.env.LIVE_AI_MODEL || "live model", latencyMs: 0 } };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[lecture-rag] live answer failed; returning preview", error);
    }
    return { ...base, answer: previewAnswer, mode: "preview", providerConfigured: false };
  }
}
