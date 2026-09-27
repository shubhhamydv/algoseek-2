import { randomUUID } from "node:crypto";
import {
  pratyushChunks,
  pratyushLectures,
  retrievePratyushChunks,
  tokenize,
} from "../preview/realCorpus";
import { getDocumentStatus, getDocumentChunks } from "./uploadService";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export type QuizQuestion = {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number; // 0..3
  explanation: string;
  citation: {
    sourceType: "pdf" | "text" | "video";
    sourceId: string;
    title: string;
    page: number | null;
    timestamp: string | null;
    snippet: string;
  };
};

export type QuizResult = {
  success: boolean;
  topicTitle: string;
  scope: "uploads" | "playlist";
  questions: QuizQuestion[];
  totalGenerated: number;
  discardedCount: number;
  verifiedCount: number;
  message?: string;
};

type RawCandidate = {
  question?: string;
  options?: string[];
  correctIndex?: number;
  explanation?: string;
  excerptIndex?: number;
};

// Canonical topic taxonomy loader
export function getTopicTaxonomy() {
  const candidatePaths = [
    join(process.cwd(), "data", "pratyush", "topic_taxonomy.json"),
    join(process.cwd(), "dist", "data", "pratyush", "topic_taxonomy.json"),
  ];
  for (const p of candidatePaths) {
    if (existsSync(p)) {
      try {
        return JSON.parse(readFileSync(p, "utf-8"));
      } catch {
        // Fallback
      }
    }
  }
  return [];
}

// Helper to format timestamps
function formatTimestamp(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
}

// Retrieve chunks for an upload using uploadService memory or storage
function getUploadChunksForDoc(docId: string): Array<{
  docId: string;
  sourceType: "pdf" | "text";
  title: string;
  text: string;
  page: number | null;
  timestamp: string | null;
}> {
  return getDocumentChunks(docId);
}

// Independent self-verification algorithm
export function verifyQuestionAgainstSnippet(
  questionOrObj: string | { question: string; options: string[]; correctIndex: number; citation?: { snippet: string } },
  optionsOrSnippet?: string[] | string,
  correctIndex?: number,
  snippet?: string
): { verified: boolean; reason?: string } {
  let question = "";
  let options: string[] = [];
  let cIndex = -1;
  let sourceSnippet = "";

  if (typeof questionOrObj === "object" && questionOrObj !== null) {
    question = questionOrObj.question || "";
    options = questionOrObj.options || [];
    cIndex = questionOrObj.correctIndex ?? -1;
    sourceSnippet = typeof optionsOrSnippet === "string" ? optionsOrSnippet : questionOrObj.citation?.snippet || "";
  } else {
    question = questionOrObj || "";
    options = Array.isArray(optionsOrSnippet) ? optionsOrSnippet : [];
    cIndex = typeof correctIndex === "number" ? correctIndex : -1;
    sourceSnippet = snippet || "";
  }

  // Check 1: Structure & options validation
  if (!question || question.trim().length < 10) {
    return { verified: false, reason: "Question text too short or empty" };
  }
  if (!Array.isArray(options) || options.length !== 4) {
    return { verified: false, reason: "Question must have exactly 4 options" };
  }
  if (options.some((opt) => !opt || opt.trim().length === 0)) {
    return { verified: false, reason: "One or more options are blank" };
  }
  const uniqueOptions = new Set(options.map((o) => o.trim().toLowerCase()));
  if (uniqueOptions.size < 4) {
    return { verified: false, reason: "Options contain duplicates" };
  }
  if (typeof cIndex !== "number" || cIndex < 0 || cIndex > 3) {
    return { verified: false, reason: "Invalid correctIndex" };
  }
  if (!sourceSnippet || sourceSnippet.trim().length < 15) {
    return { verified: false, reason: "Cited snippet is empty or too short" };
  }

  const correctOption = options[cIndex].trim();
  const snippetLower = sourceSnippet.toLowerCase();
  const correctTokens = tokenize(correctOption);

  if (correctTokens.length === 0) {
    return { verified: false, reason: "Correct option has no substantive keywords" };
  }

  // Check 2: Verifiable factual match against snippet
  // Either substring match or at least 50% of the non-trivial terms in correct answer must be in snippet
  const matchedTokens = correctTokens.filter((token) => snippetLower.includes(token));
  const tokenMatchRatio = matchedTokens.length / correctTokens.length;

  const isSubstring = snippetLower.includes(correctOption.toLowerCase());
  const hasStrongTokenMatch = tokenMatchRatio >= 0.5;

  // Also verify question context has relevance to snippet
  const questionTokens = tokenize(question);
  const questionMatches = questionTokens.filter((t) => snippetLower.includes(t));
  const hasQuestionOverlap = questionTokens.length === 0 || questionMatches.length >= 1;

  if (!isSubstring && !hasStrongTokenMatch) {
    return {
      verified: false,
      reason: `Correct answer "${correctOption}" not adequately supported by snippet (match ratio: ${(tokenMatchRatio * 100).toFixed(0)}%)`,
    };
  }

  if (!hasQuestionOverlap) {
    return {
      verified: false,
      reason: `Question subject "${question}" has no keyword overlap with cited excerpt`,
    };
  }

  return { verified: true };
}

async function callQuizLLM(system: string, user: string): Promise<string | null> {
  const groqKey = process.env.GROQ_API_KEY?.trim();
  if (groqKey) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15_000);
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: process.env.YTRAG_GROQ_MODEL || "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          temperature: 0.1,
          max_tokens: 1800,
          response_format: { type: "json_object" },
        }),
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (response.ok) {
        const body = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
        const content = body?.choices?.[0]?.message?.content;
        if (content) return content;
      }
    } catch {
      // Fallback
    }
  }

  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  if (geminiKey) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15_000);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: system }] },
            contents: [{ parts: [{ text: user }] }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 1800,
              responseMimeType: "application/json",
            },
          }),
          signal: controller.signal,
        }
      );
      clearTimeout(timer);
      if (response.ok) {
        const body = (await response.json()) as any;
        const text = body?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
    } catch {
      // Fallback
    }
  }

  return null;
}

// Fallback deterministic quiz generator if LLM is unavailable
function generateDeterministicQuiz(
  excerpts: Array<{
    sourceType: "pdf" | "text" | "video";
    sourceId: string;
    title: string;
    page: number | null;
    timestamp: string | null;
    text: string;
  }>
): QuizQuestion[] {
  const questions: QuizQuestion[] = [];
  let questionIdx = 1;

  for (const item of excerpts) {
    const sentences = item.text
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 25 && !/subscribe|welcome|birthday|hello everyone/i.test(s));

    for (let sIdx = 0; sIdx < sentences.length; sIdx++) {
      if (questions.length >= 5) break;
      const fact = sentences[sIdx];
      if (fact.length < 25) continue;

      const options: [string, string, string, string] = [
        fact.length > 120 ? fact.slice(0, 115) + "…" : fact,
        "It is strictly prohibited in logarithmic and linear time complexities.",
        "It requires unbounded auxiliary memory without any memoization guarantees.",
        "It is only valid for unbalanced directed acyclic graph structures.",
      ];

      questions.push({
        id: `q-det-${questionIdx++}-${Date.now()}`,
        question: `Based on ${item.title}${item.page ? ` (page ${item.page})` : ""}, which of the following statements is directly confirmed?`,
        options,
        correctIndex: 0,
        explanation: `Directly supported by ${item.title}: "${fact}"`,
        citation: {
          sourceType: item.sourceType,
          sourceId: item.sourceId,
          title: item.title,
          page: item.page,
          timestamp: item.timestamp,
          snippet: item.text.slice(0, 600),
        },
      });
    }
    if (questions.length >= 5) break;
  }

  return questions;
}

export async function generateGroundedQuiz(input: {
  scope: "uploads" | "playlist";
  docId?: string;
  topicId?: string;
  query?: string;
  questionCount?: number;
}): Promise<QuizResult> {
  const targetCount = Math.max(3, Math.min(input.questionCount ?? 5, 8));
  let excerpts: Array<{
    sourceType: "pdf" | "text" | "video";
    sourceId: string;
    title: string;
    page: number | null;
    timestamp: string | null;
    text: string;
  }> = [];

  let topicTitle = "Study Material";

  // 1. Collect real source material
  if (input.scope === "uploads") {
    if (!input.docId) {
      return {
        success: false,
        topicTitle,
        scope: "uploads",
        questions: [],
        totalGenerated: 0,
        discardedCount: 0,
        verifiedCount: 0,
        message: "Select an uploaded document to generate a quiz.",
      };
    }

    const docMeta = getDocumentStatus(input.docId);
    if (docMeta) topicTitle = docMeta.title;

    const rawChunks = getUploadChunksForDoc(input.docId);
    if (!rawChunks || rawChunks.length === 0) {
      return {
        success: false,
        topicTitle,
        scope: "uploads",
        questions: [],
        totalGenerated: 0,
        discardedCount: 0,
        verifiedCount: 0,
        message: "No document content found. Please re-upload your material.",
      };
    }

    const totalWords = rawChunks.reduce((sum, c) => sum + c.text.split(/\s+/).length, 0);
    // Sparse document check
    if (totalWords < 35) {
      return {
        success: false,
        topicTitle,
        scope: "uploads",
        questions: [],
        totalGenerated: 0,
        discardedCount: 0,
        verifiedCount: 0,
        message: "The uploaded material is too short or sparse (fewer than 35 words) to generate a reliable grounded quiz.",
      };
    }

    excerpts = rawChunks.slice(0, 8).map((c) => ({
      sourceType: c.sourceType,
      sourceId: c.docId,
      title: c.title,
      page: c.page,
      timestamp: null,
      text: c.text,
    }));
  } else {
    // Playlist scope
    const query = input.query || input.topicId || "dynamic programming binary tree graph sliding window";
    topicTitle = input.query || input.topicId || "DSA Playlist Mastery";

    const retrieved = retrievePratyushChunks(query, 6);
    if (!retrieved || retrieved.length === 0) {
      return {
        success: false,
        topicTitle,
        scope: "playlist",
        questions: [],
        totalGenerated: 0,
        discardedCount: 0,
        verifiedCount: 0,
        message: "No lecture excerpts available for this topic.",
      };
    }

    excerpts = retrieved.map((r) => {
      const lecture = pratyushLectures.find((l) => l.id === r.chunk.lectureId);
      return {
        sourceType: "video" as const,
        sourceId: r.chunk.videoId,
        title: r.chunk.title,
        page: null,
        timestamp: formatTimestamp(r.chunk.startSec),
        text: r.chunk.text,
      };
    });
  }

  // 2. Prepare generation prompt
  const systemPrompt = `You are a strict, grounded DSA tutor generating a multiple-choice quiz based ONLY on the provided excerpts.
Rules:
1. Generate exactly ${targetCount} multiple-choice questions.
2. Every question must be directly and factualy answerable from the specific excerpt it cites.
3. Provide exactly 4 options per question (1 genuinely correct answer, 3 plausible but clearly incorrect distractors).
4. Do NOT use general knowledge. If a fact is not in the excerpt, do NOT ask about it.
5. Provide the 0-indexed 'correctIndex' (0, 1, 2, or 3) indicating which option is correct.
6. Provide 'excerptIndex' (1 to ${excerpts.length}) indicating which excerpt contains the verifiable answer.
7. Return ONLY a valid JSON object with the following schema:
{
  "questions": [
    {
      "question": "Clear question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Brief grounded reason why this is correct based on the excerpt.",
      "excerptIndex": 1
    }
  ]
}`;

  const userPrompt = `Excerpts from source material:
${excerpts
  .map(
    (e, idx) =>
      `[Excerpt ${idx + 1}] ${e.title}${e.page ? ` (Page ${e.page})` : e.timestamp ? ` (@ ${e.timestamp})` : ""}:\n${e.text}`
  )
  .join("\n\n")}`;

  let totalGenerated = 0;
  let discardedCount = 0;
  let verifiedCount = 0;
  const finalQuestions: QuizQuestion[] = [];

  const rawJson = await callQuizLLM(systemPrompt, userPrompt);

  if (rawJson) {
    try {
      const parsed = JSON.parse(rawJson) as { questions?: RawCandidate[] };
      const candidates = Array.isArray(parsed.questions) ? parsed.questions : [];
      totalGenerated = candidates.length;

      for (let i = 0; i < candidates.length; i++) {
        const cand = candidates[i];
        const excerptIdx = typeof cand.excerptIndex === "number" ? cand.excerptIndex - 1 : i % excerpts.length;
        const excerpt = excerpts[excerptIdx] || excerpts[0];

        const verification = verifyQuestionAgainstSnippet(
          cand.question || "",
          cand.options || [],
          cand.correctIndex ?? -1,
          excerpt.text
        );

        if (!verification.verified) {
          discardedCount++;
          continue;
        }

        verifiedCount++;
        finalQuestions.push({
          id: `quiz-q-${finalQuestions.length + 1}-${randomUUID().slice(0, 8)}`,
          question: cand.question!.trim(),
          options: [
            cand.options![0].trim(),
            cand.options![1].trim(),
            cand.options![2].trim(),
            cand.options![3].trim(),
          ],
          correctIndex: cand.correctIndex!,
          explanation: cand.explanation?.trim() || `Verified from ${excerpt.title}`,
          citation: {
            sourceType: excerpt.sourceType,
            sourceId: excerpt.sourceId,
            title: excerpt.title,
            page: excerpt.page,
            timestamp: excerpt.timestamp,
            snippet: excerpt.text.slice(0, 600),
          },
        });
      }
    } catch {
      // JSON parse error
    }
  }

  // If LLM was unavailable or fewer than 3 verified questions passed, supplement with deterministic verified questions
  if (finalQuestions.length < 3) {
    const fallbackList = generateDeterministicQuiz(excerpts);
    for (const fq of fallbackList) {
      if (finalQuestions.length >= targetCount) break;
      const ver = verifyQuestionAgainstSnippet(fq.question, fq.options, fq.correctIndex, fq.citation.snippet);
      if (ver.verified) {
        finalQuestions.push(fq);
        verifiedCount++;
        totalGenerated++;
      } else {
        discardedCount++;
      }
    }
  }

  return {
    success: finalQuestions.length > 0,
    topicTitle,
    scope: input.scope,
    questions: finalQuestions,
    totalGenerated,
    discardedCount,
    verifiedCount: finalQuestions.length,
  };
}
