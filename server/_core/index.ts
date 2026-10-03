import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { ingestText, ingestPdf, listDocuments, answerUploads } from "../ai/uploadService";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
  // Cloud PaaS health check endpoint
  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", service: "algoseek-web" });
  });

  function getReqDeviceId(req: express.Request): string {
    const header = req.headers["x-device-id"];
    if (typeof header === "string" && header.trim()) return header.trim();
    if (Array.isArray(header) && header[0]?.trim()) return header[0].trim();
    if (req.body?.device_id && typeof req.body.device_id === "string") return req.body.device_id.trim();
    if (req.body?.deviceId && typeof req.body.deviceId === "string") return req.body.deviceId.trim();
    if (req.query?.device_id && typeof req.query.device_id === "string") return req.query.device_id.trim();
    if (req.query?.deviceId && typeof req.query.deviceId === "string") return req.query.deviceId.trim();
    return "";
  }

  // Native upload & AI service REST endpoints (ensures full compatibility on deployment)
  app.post("/ingest/text", async (req, res) => {
    try {
      const { title, text, doc_id, device_id, deviceId } = req.body || {};
      const devId = device_id || deviceId || getReqDeviceId(req);
      const result = await ingestText({ title, text, docId: doc_id, deviceId: devId });
      res.status(200).json({
        doc_id: result.docId,
        source_id: result.sourceId,
        source_type: result.sourceType,
        title: result.title,
        status: result.status,
        chunks: result.chunks,
      });
    } catch (err: any) {
      res.status(err?.status || 500).json({ detail: err?.message || "Ingest failed" });
    }
  });

  app.post("/ingest/pdf", async (req, res) => {
    try {
      const { title, fileName, contentType, contentBase64, doc_id, device_id, deviceId } = req.body || {};
      const devId = device_id || deviceId || getReqDeviceId(req);
      const result = await ingestPdf({
        title,
        fileName: fileName || "upload.pdf",
        contentType: contentType || "application/pdf",
        contentBase64: contentBase64 || "",
        docId: doc_id,
        deviceId: devId,
      });
      res.status(200).json({
        doc_id: result.docId,
        source_id: result.sourceId,
        source_type: result.sourceType,
        title: result.title,
        status: result.status,
        chunks: result.chunks,
      });
    } catch (err: any) {
      res.status(err?.status || 500).json({ detail: err?.message || "PDF ingest failed" });
    }
  });

  app.get("/uploads/documents", async (req, res) => {
    try {
      const devId = getReqDeviceId(req);
      const docs = await listDocuments(devId);
      res.status(200).json({
        documents: docs.map((d) => ({
          doc_id: d.docId,
          source_id: d.sourceId,
          source_type: d.sourceType,
          title: d.title,
          chunks: d.chunks,
        })),
      });
    } catch {
      res.status(500).json({ detail: "Failed to list documents" });
    }
  });

  app.post("/v1/answers/scoped", async (req, res) => {
    try {
      const { question, scope, doc_id, top_k, device_id, deviceId } = req.body || {};
      const devId = device_id || deviceId || getReqDeviceId(req);
      const result = await answerUploads({ question, scope, docId: doc_id, topK: top_k, deviceId: devId });
      res.status(200).json(result);
    } catch (err: any) {
      res.status(err?.status || 500).json({ detail: err?.message || "Scoped answer failed" });
    }
  });

  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${port}/`);
  });
}

startServer().catch(console.error);
