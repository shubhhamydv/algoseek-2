import { describe, expect, it } from "vitest";
import {
  ingestText,
  ingestPdf,
  listDocuments,
  getDocumentStatus,
  getDocumentChunks,
  answerUploads,
  UploadServiceError,
} from "./ai/uploadService";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Sample valid PDF for tests
const SAMPLE_PDF_DEVICE_A = Buffer.from(
  "%PDF-1.4\n" +
  "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n" +
  "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n" +
  "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n" +
  "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n" +
  "5 0 obj\n<< /Length 110 >>\nstream\n" +
  "BT\n/F1 12 Tf\n72 712 Td\n(Device Alpha Protocol: Quantum Encryption uses entanglement pairs with Key Alpha-9988.) Tj\nET\nendstream\nendobj\n" +
  "xref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000227 00000 n \n0000000294 00000 n \n" +
  "trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n450\n%%EOF"
).toString("base64");

const SAMPLE_PDF_DEVICE_B = Buffer.from(
  "%PDF-1.4\n" +
  "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n" +
  "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n" +
  "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n" +
  "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n" +
  "5 0 obj\n<< /Length 115 >>\nstream\n" +
  "BT\n/F1 12 Tf\n72 712 Td\n(Device Beta Manual: Deep Sea Submersible navigation uses Sonar Echo with Beacon Beta-4422.) Tj\nET\nendstream\nendobj\n" +
  "xref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000227 00000 n \n0000000294 00000 n \n" +
  "trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n455\n%%EOF"
).toString("base64");

function createMockContext(deviceId: string): TrpcContext {
  return {
    user: null,
    deviceId,
    req: {
      headers: {
        "x-device-id": deviceId,
      },
    } as unknown as TrpcContext["req"],
    res: {} as unknown as TrpcContext["res"],
  };
}

describe("Phase 4: Real Concurrent Multi-Device Data Isolation", () => {
  const DEVICE_A_ID = "device-profile-alpha-1111";
  const DEVICE_B_ID = "device-profile-beta-2222";

  const callerA = appRouter.createCaller(createMockContext(DEVICE_A_ID));
  const callerB = appRouter.createCaller(createMockContext(DEVICE_B_ID));

  let docA_Id = "";
  let docB_Id = "";

  // ── Test 1: Device A uploads a document and asks a question about it ──
  it("Test 1: Device A uploads a document and gets a correct, grounded answer", async () => {
    const docA = await callerA.uploads.ingestPdf({
      title: "Alpha Quantum Encryption Guide",
      fileName: "alpha_quantum.pdf",
      contentType: "application/pdf",
      contentBase64: SAMPLE_PDF_DEVICE_A,
    });

    expect(docA.docId).toBeDefined();
    expect(docA.deviceId).toBe(DEVICE_A_ID);
    expect(docA.status).toBe("complete");
    expect(docA.chunks).toBeGreaterThan(0);
    docA_Id = docA.docId;

    const queryResultA = await callerA.uploads.answer({
      question: "What key is used in Quantum Encryption?",
      scope: "uploads",
      docId: docA_Id,
    });

    expect(queryResultA.grounded).toBe(true);
    expect(queryResultA.sources.length).toBeGreaterThan(0);
    expect(queryResultA.sources[0].source_id).toBe(docA_Id);
    expect(queryResultA.answer).toMatch(/Alpha-9988|entanglement|Quantum/i);
  });

  // ── Test 2: Device B uploads a DIFFERENT document and queries it ──
  it("Test 2: Device B uploads a DIFFERENT document and gets answers only from Device B's document, never Device A's", async () => {
    const docB = await callerB.uploads.ingestPdf({
      title: "Beta Submersible Sonar Manual",
      fileName: "beta_sonar.pdf",
      contentType: "application/pdf",
      contentBase64: SAMPLE_PDF_DEVICE_B,
    });

    expect(docB.docId).toBeDefined();
    expect(docB.deviceId).toBe(DEVICE_B_ID);
    expect(docB.status).toBe("complete");
    expect(docB.chunks).toBeGreaterThan(0);
    docB_Id = docB.docId;

    // Device B asks about Device B's material
    const queryResultB = await callerB.uploads.answer({
      question: "What beacon is used for submarine navigation?",
      scope: "uploads",
      docId: docB_Id,
    });

    expect(queryResultB.grounded).toBe(true);
    expect(queryResultB.sources.length).toBeGreaterThan(0);
    expect(queryResultB.sources[0].source_id).toBe(docB_Id);
    expect(queryResultB.answer).toMatch(/Beta-4422|Sonar Echo|Submersible/i);
    // Crucial: Must NEVER contain Device A's content
    expect(queryResultB.answer).not.toContain("Alpha-9988");
    expect(queryResultB.answer).not.toContain("Quantum Encryption");
  });

  // ── Test 3: Device B attempts to query Device A's document ID directly ──
  it("Test 3: Attempting to query Device A's document ID directly with Device B's device ID is explicitly refused with NOT_FOUND", async () => {
    expect(docA_Id).toBeTruthy();

    // Device B attempts to access docA_Id
    await expect(
      callerB.uploads.answer({
        question: "What key is used in Quantum Encryption?",
        scope: "uploads",
        docId: docA_Id, // Device A's document!
      })
    ).rejects.toMatchObject({
      code: "NOT_FOUND",
      message: expect.stringMatching(/not found for this device/i),
    });

    // Also direct service level verification
    await expect(
      answerUploads({
        question: "What key is used?",
        scope: "uploads",
        docId: docA_Id,
        deviceId: DEVICE_B_ID,
      })
    ).rejects.toThrow(UploadServiceError);

    try {
      await answerUploads({
        question: "What key is used?",
        scope: "uploads",
        docId: docA_Id,
        deviceId: DEVICE_B_ID,
      });
      expect.unreachable("Should have thrown 404 UploadServiceError");
    } catch (err: any) {
      expect(err.status).toBe(404);
      expect(err.message).toContain("Uploaded document not found for this device");
    }
  });

  // ── Test 4: Document List strictly scoped per device ──
  it("Test 4: Device A's document list never shows Device B's uploads and vice versa", async () => {
    const listA = await callerA.uploads.list();
    const listB = await callerB.uploads.list();

    const listADocIds = listA.map((d) => d.docId);
    const listBDocIds = listB.map((d) => d.docId);

    // Device A's list contains docA_Id and NOT docB_Id
    expect(listADocIds).toContain(docA_Id);
    expect(listADocIds).not.toContain(docB_Id);

    // Device B's list contains docB_Id and NOT docA_Id
    expect(listBDocIds).toContain(docB_Id);
    expect(listBDocIds).not.toContain(docA_Id);

    // Status check scoping
    const statusA_from_A = await callerA.uploads.status({ docId: docA_Id });
    const statusA_from_B = await callerB.uploads.status({ docId: docA_Id });
    expect(statusA_from_A).not.toBeNull();
    expect(statusA_from_A?.title).toBe("Alpha Quantum Encryption Guide");
    expect(statusA_from_B).toBeNull(); // Refused to Device B

    // Direct service list check
    const rawListA = await listDocuments(DEVICE_A_ID);
    const rawListB = await listDocuments(DEVICE_B_ID);
    expect(rawListA.every((d) => d.deviceId === DEVICE_A_ID)).toBe(true);
    expect(rawListB.every((d) => d.deviceId === DEVICE_B_ID)).toBe(true);
  });

  // ── Test 5: Concurrent simultaneous uploads from both devices (stress-test race conditions) ──
  it("Test 5: Concurrent simultaneous uploads from multiple devices maintain strict isolation with zero race condition leakage", async () => {
    const CONCURRENT_CLIENTS = 10;
    const uploadPromises = [];

    // Launch 10 simultaneous uploads across 10 distinct device sessions at the exact same millisecond
    for (let i = 0; i < CONCURRENT_CLIENTS; i++) {
      const devId = `stress-device-${i}-${Date.now()}`;
      const uniqueSecret = `SECRET-PAYLOAD-${i}-${Math.random().toString(36).slice(2)}`;
      const uniqueTopic = `Topic_${i}_Study_Notes`;

      const promise = (async () => {
        const caller = appRouter.createCaller(createMockContext(devId));
        // Concurrent Ingest
        const doc = await caller.uploads.ingestText({
          title: uniqueTopic,
          text: `Here are the notes for ${uniqueTopic}. The critical private credential is ${uniqueSecret}. Make sure this never leaks to any other user.`,
        });

        // Concurrent List
        const list = await caller.uploads.list();
        expect(list.length).toBe(1);
        expect(list[0].docId).toBe(doc.docId);
        expect(list[0].title).toBe(uniqueTopic);

        // Concurrent Retrieval
        const answer = await caller.uploads.answer({
          question: `What is the critical credential for ${uniqueTopic}?`,
          scope: "uploads",
          docId: doc.docId,
        });

        expect(answer.grounded).toBe(true);
        expect(answer.answer).toContain(uniqueSecret);

        return { devId, docId: doc.docId, uniqueSecret, caller };
      })();

      uploadPromises.push(promise);
    }

    const results = await Promise.all(uploadPromises);
    expect(results.length).toBe(CONCURRENT_CLIENTS);

    // Cross-verification: Every device attempts to query every other device's docId -> MUST ALL BE REFUSED
    const crossCheckPromises = [];
    for (let i = 0; i < results.length; i++) {
      for (let j = 0; j < results.length; j++) {
        if (i !== j) {
          const clientI = results[i];
          const clientJ = results[j];
          const crossPromise = (async () => {
            // Client I attempts to query Client J's docId
            await expect(
              clientI.caller.uploads.answer({
                question: "What is the secret?",
                scope: "uploads",
                docId: clientJ.docId,
              })
            ).rejects.toMatchObject({
              code: "NOT_FOUND",
            });
          })();
          crossCheckPromises.push(crossPromise);
        }
      }
    }

    await Promise.all(crossCheckPromises);
  });
});
