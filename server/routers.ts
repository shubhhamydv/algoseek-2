import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { generateGroundedAnswer } from "./ai/boundary";
import { requestPythonRag } from "./ai/pythonService";
import { UploadServiceError, answerUploads, getDocumentStatus, ingestPdf, ingestText, listDocuments } from "./ai/uploadService";
import { generateGroundedQuiz } from "./ai/quizService";
import { askAITutor, getTutorConfigStatus } from "./ai/tutorService";
import { pratyushChunks, pratyushLectures, retrievePratyushChunks } from "./preview/realCorpus";

function formatTimestamp(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
}

function getTopicTaxonomy() {
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

function toCitation(chunk: (typeof pratyushChunks)[number]) {
  const lecture = pratyushLectures.find(item => item.id === chunk.lectureId);
  return {
    id: chunk.id,
    title: chunk.title,
    timestamp: formatTimestamp(chunk.startSec),
    startSec: chunk.startSec,
    videoId: chunk.videoId,
    text: chunk.text,
    url: `https://www.youtube.com/watch?v=${chunk.videoId}&t=${chunk.startSec}s`,
    durationSec: lecture?.durationSec ?? 0,
  };
}

function toPublicCitation(citation: { id: string; title: string; timestamp: string; startSec: number; videoId: string; text?: string; url: string; durationSec?: number }) {
  const { text: _internalText, ...publicCitation } = citation;
  return publicCitation;
}

function toPublicAnswer<T extends { citations: Array<{ text?: string; [key: string]: unknown }> }>(answer: T) {
  return { ...answer, citations: answer.citations.map(citation => toPublicCitation(citation as Parameters<typeof toPublicCitation>[0])) };
}

function buildGroundedPreview(question: string, topK: number) {
  const retrieved = retrievePratyushChunks(question, topK);
  if (!retrieved.length || retrieved.every(item => item.score === 0)) {
    return { answer: "Ye topic in Pratyush lectures me cover nahi hua.", grounded: false, citations: [], retrieval: { chunks: 0, latencyMs: 24, model: "BGE-M3 · local corpus retrieval" } };
  }
  const selected = retrieved.map(item => toCitation(item.chunk));
  const excerpt = selected[0]?.text ?? "";
  const answer = `Pratyush ke lecture excerpt ke hisaab se: ${excerpt.slice(0, 620)}${excerpt.length > 620 ? "…" : ""}`;
  return { answer, grounded: true, citations: selected, retrieval: { chunks: selected.length, latencyMs: 24 + selected.length * 6, model: "BGE-M3 · local corpus retrieval" } };
}

async function runAnswer(question: string, topK: number) {
  try {
    const remote = await requestPythonRag(question, topK);
    if (remote) {
      return toPublicAnswer({
        answer: remote.answer,
        grounded: remote.grounded,
        mode: "live" as const,
        citations: (remote.citations ?? []).map((citation, index) => ({ id: `${citation.video_id}:${citation.start_sec}`, title: citation.title, timestamp: citation.timestamp, startSec: citation.start_sec, videoId: citation.video_id, text: `Retrieved from the Pratyush transcript index · source ${index + 1}`, url: `https://www.youtube.com/watch?v=${citation.video_id}&t=${citation.start_sec}s`, durationSec: pratyushLectures.find(item => item.id === citation.video_id)?.durationSec ?? 0 })),
        retrieval: { chunks: remote.retrieved ?? remote.citations?.length ?? 0, latencyMs: 0, model: remote.model ?? "Python Qdrant + Groq" },
        boundaryVersion: remote.boundary_version ?? "lecture-rag.ai.v1",
        providerConfigured: true,
      });
    }
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[lecture-rag] Python service unavailable; using local corpus", error);
    }
  }
  const grounded = buildGroundedPreview(question, topK);
  const answer = await generateGroundedAnswer({ question, citations: grounded.citations, previewAnswer: grounded.answer, topK });
  return toPublicAnswer(answer);
}

function uploadError(error: unknown): never {
  if (error instanceof UploadServiceError) {
    throw new TRPCError({
      code:
        error.status === 404
          ? "NOT_FOUND"
          : error.status === 413
          ? "PAYLOAD_TOO_LARGE"
          : error.status === 503
          ? "SERVICE_UNAVAILABLE"
          : "BAD_REQUEST",
      message: error.message,
    });
  }
  throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Unable to process your material." });
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  lecture: router({
    list: publicProcedure.query(() => pratyushLectures),
    topics: publicProcedure.query(() => {
      const list = getTopicTaxonomy();
      return { total: list.length, topics: list };
    }),
    chunks: publicProcedure.input(z.object({ lectureId: z.string().optional() }).optional()).query(({ input }) => (input?.lectureId ? pratyushChunks.filter(chunk => chunk.lectureId === input.lectureId) : pratyushChunks.slice(0, 50)).map(toCitation).map(toPublicCitation)),
    workspace: publicProcedure.query(() => ({ lectures: pratyushLectures.length, chunks: pratyushChunks.length, hitRate: "source corpus", aiBoundary: "lecture-rag.ai.v1", providerConfigured: process.env.LIVE_AI_ENABLED === "true" })),
    search: publicProcedure.input(z.object({ question: z.string().trim().min(3).max(500), topK: z.number().int().min(1).max(10).default(5) })).mutation(({ input }) => runAnswer(input.question, input.topK)),
    answer: publicProcedure.input(z.object({ question: z.string().trim().min(3).max(500), topK: z.number().int().min(1).max(10).default(5) })).mutation(({ input }) => runAnswer(input.question, input.topK)),
  }),
  uploads: router({
    ingestText: publicProcedure
      .input(
        z.object({
          title: z.string().trim().min(1).max(240),
          text: z.string().trim().min(1).max(2_000_000),
          docId: z.string().trim().min(1).max(120).optional(),
          deviceId: z.string().trim().min(1).max(120).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const deviceId = input.deviceId || ctx.deviceId;
        if (!deviceId) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Device identifier required." });
        }
        try {
          return await ingestText({ ...input, deviceId });
        } catch (error) {
          return uploadError(error);
        }
      }),
    ingestPdf: publicProcedure
      .input(
        z.object({
          title: z.string().trim().min(1).max(240).optional(),
          fileName: z.string().trim().min(5).max(255),
          contentType: z.string().trim().max(120),
          contentBase64: z.string().min(1).max(28_000_000),
          docId: z.string().trim().min(1).max(120).optional(),
          deviceId: z.string().trim().min(1).max(120).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const deviceId = input.deviceId || ctx.deviceId;
        if (!deviceId) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Device identifier required." });
        }
        try {
          return await ingestPdf({ ...input, deviceId });
        } catch (error) {
          return uploadError(error);
        }
      }),
    list: publicProcedure
      .input(z.object({ deviceId: z.string().trim().min(1).max(120).optional() }).optional())
      .query(async ({ input, ctx }) => {
        const deviceId = input?.deviceId || ctx.deviceId || undefined;
        try {
          return await listDocuments(deviceId);
        } catch (error) {
          return uploadError(error);
        }
      }),
    status: publicProcedure
      .input(z.object({ docId: z.string().trim().min(1).max(120), deviceId: z.string().trim().min(1).max(120).optional() }))
      .query(({ input, ctx }) => getDocumentStatus(input.docId, input.deviceId || ctx.deviceId || undefined)),
    answer: publicProcedure
      .input(
        z.object({
          question: z.string().trim().min(3).max(500),
          scope: z.enum(["lectures", "uploads", "both", "playlist"]),
          docId: z.string().trim().min(1).max(120).optional(),
          deviceId: z.string().trim().min(1).max(120).optional(),
          topK: z.number().int().min(1).max(10).default(5),
        }).superRefine((value, context) => {
          if ((value.scope === "uploads" || value.scope === "both") && !value.docId) {
            context.addIssue({ code: "custom", path: ["docId"], message: "Choose an uploaded document before searching your uploads." });
          }
        })
      )
      .mutation(async ({ input, ctx }) => {
        const deviceId = input.deviceId || ctx.deviceId || undefined;
        try {
          return await answerUploads({ ...input, deviceId });
        } catch (error) {
          return uploadError(error);
        }
      }),
  }),
  quiz: router({
    generate: publicProcedure
      .input(
        z.object({
          scope: z.enum(["uploads", "playlist"]),
          docId: z.string().optional(),
          topicId: z.string().optional(),
          query: z.string().optional(),
          questionCount: z.number().int().min(3).max(8).default(5),
        })
      )
      .mutation(async ({ input }) => {
        try {
          return await generateGroundedQuiz(input);
        } catch (error) {
          return uploadError(error);
        }
      }),
  }),
  ops: router({
    ingest: publicProcedure.input(z.object({ playlistUrl: z.string().url(), limit: z.number().int().min(1).max(500).optional(), skipTranscribe: z.boolean().default(false) })).mutation(({ input }) => ({ id: `ingest-${Date.now()}`, type: "ingest", status: "queued", progress: 0, detail: `Queued ${input.playlistUrl}${input.limit ? ` · limit ${input.limit}` : ""}${input.skipTranscribe ? " · transcript cache only" : ""}` })),
    reindex: publicProcedure.input(z.object({ videoIds: z.array(z.string()).max(500).optional(), embeddingModel: z.string().min(2).max(120).default("all-MiniLM-L6-v2") })).mutation(({ input }) => ({ id: `reindex-${Date.now()}`, type: "reindex", status: "queued", progress: 0, detail: `Queued ${input.videoIds?.length ?? pratyushLectures.length} lectures · ${input.embeddingModel}` })),
    evaluate: publicProcedure.input(z.object({ goldenSetVersion: z.string().min(1).max(80).default("golden.json") })).mutation(({ input }) => ({ id: `eval-${Date.now()}`, type: "evaluate", status: "queued", progress: 0, detail: `Queued evaluation · ${input.goldenSetVersion}` })),
    jobs: publicProcedure.query(() => [
      { id: "job-001", label: "Pratyush transcript corpus · indexed", status: "complete", progress: 100, detail: `${pratyushLectures.length} lectures · ${pratyushChunks.length.toLocaleString()} chunks loaded` },
      { id: "job-002", label: "Qdrant semantic index · sync", status: "ready", progress: 100, detail: "Production boundary ready · credentials required" },
      { id: "job-003", label: "Golden set · evaluation", status: "queued", progress: 0, detail: "Add verified question/time pairs to eval/golden.json" },
    ]),
  }),
  tutor: router({
    ask: publicProcedure
      .input(
        z.object({
          question: z.string().trim().min(2).max(1000),
          history: z
            .array(
              z.object({
                role: z.enum(["user", "assistant"]),
                content: z.string().max(4000),
              })
            )
            .optional(),
          track: z.string().max(80).optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await askAITutor({
          question: input.question,
          history: input.history,
          track: input.track,
        });
      }),
    status: publicProcedure.query(() => {
      return getTutorConfigStatus();
    }),
  }),
});

export type AppRouter = typeof appRouter;
