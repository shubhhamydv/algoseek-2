import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { listDocuments, ask, deleteDocument, insertDocument, ollamaError, retrieve } from "./ai/documentService";
import { ollamaStatus, OllamaServiceError } from "./ai/ollama";
import { vectorService } from "./vector/vectorService";
import { isDistanceMetric } from "./vector/metrics";

const metric = z.enum(["cosine", "euclidean", "manhattan"]);
const algo = z.enum(["hnsw", "kdtree", "bruteforce"]);
const vector = z.array(z.number().finite()).min(1);
const handle = async <T>(fn: () => Promise<T>) => { try { return await fn(); } catch (error) { if (error instanceof OllamaServiceError) throw new TRPCError({ code: error.kind === "TIMEOUT" ? "TIMEOUT" : "INTERNAL_SERVER_ERROR", message: `[${error.kind}] ${error.message}` }); throw new TRPCError({ code: "BAD_REQUEST", message: error instanceof Error ? error.message : ollamaError(error) }); } };

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => { const cookieOptions = getSessionCookieOptions(ctx.req); ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 }); return { success: true } as const; }),
  }),
  vector: router({
    list: publicProcedure.query(() => vectorService.all()),
    insert: publicProcedure.input(z.object({ metadata: z.string().min(1), category: z.string().min(1), embedding: z.array(z.number().finite()).length(16) })).mutation(({ input }) => handle(() => vectorService.insert(input.metadata, input.category, input.embedding))),
    delete: publicProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => handle(() => vectorService.remove(input.id))),
    search: publicProcedure.input(z.object({ query: vector.length(16), k: z.number().int().min(1).max(100).default(5), metric, algo })).query(({ input }) => handle(() => vectorService.search(input.query, input.k, input.metric, input.algo))),
    benchmark: publicProcedure.input(z.object({ query: vector.length(16), k: z.number().int().min(1).max(100).default(5), metric })).query(({ input }) => handle(() => vectorService.benchmark(input.query, input.k, input.metric))),
    graph: publicProcedure.query(() => vectorService.graphInfo()),
    stats: publicProcedure.query(() => vectorService.stats()),
  }),
  ai: router({
    status: publicProcedure.query(() => ollamaStatus()),
    documents: publicProcedure.query(() => listDocuments()),
    insertDocument: publicProcedure.input(z.object({ title: z.string().min(1), text: z.string().min(1) })).mutation(({ input }) => handle(() => insertDocument(input.title, input.text))),
    deleteDocument: publicProcedure.input(z.object({ id: z.number().int().positive() })).mutation(({ input }) => handle(() => deleteDocument(input.id))),
    searchDocuments: publicProcedure.input(z.object({ question: z.string().min(1), k: z.number().int().min(1).max(20).default(3) })).mutation(({ input }) => handle(() => retrieve(input.question, input.k))),
    ask: publicProcedure.input(z.object({ question: z.string().min(1), k: z.number().int().min(1).max(20).default(3) })).mutation(({ input }) => handle(() => ask(input.question, input.k))),
  }),
});

export type AppRouter = typeof appRouter;
