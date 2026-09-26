import fs from "fs";
import path from "path";
import { appRouter } from "../server/routers";
import type { TrpcContext } from "../server/_core/context";

const ctx = {
  user: null,
  req: {} as TrpcContext["req"],
  res: {} as TrpcContext["res"],
} as TrpcContext;

const caller = appRouter.createCaller(ctx);

async function runAudit() {
  console.log("=================== AUDIT CHECKS START ===================");

  // Check 1: Upload real PDF and ask answerable question
  console.log("\n--- Check 1: Real PDF Upload & Answerable Question ---");
  const pdfPath = path.resolve("data/demo/dynamic-programming-study-guide.pdf");
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfBase64 = pdfBytes.toString("base64");

  const pdfIngestStart = Date.now();
  const pdfDoc = await caller.uploads.ingestPdf({
    title: "Dynamic Programming Study Guide",
    fileName: "dynamic-programming-study-guide.pdf",
    contentType: "application/pdf",
    contentBase64: pdfBase64,
  });
  const pdfIngestDuration = Date.now() - pdfIngestStart;
  console.log(`PDF Ingested in ${pdfIngestDuration}ms:`, JSON.stringify(pdfDoc, null, 2));

  const pdfQ1Start = Date.now();
  const pdfAnswer1 = await caller.uploads.answer({
    question: "What does memoization store?",
    scope: "uploads",
    docId: pdfDoc.docId,
    topK: 5,
  });
  const pdfQ1Duration = Date.now() - pdfQ1Start;
  console.log(`PDF Answer 1 (${pdfQ1Duration}ms):`, JSON.stringify(pdfAnswer1, null, 2));

  // Check 2: Unanswerable question to the same PDF
  console.log("\n--- Check 2: PDF Session Unanswerable Question ---");
  const pdfQ2Start = Date.now();
  const pdfAnswer2 = await caller.uploads.answer({
    question: "How does Dijkstra's algorithm work?",
    scope: "uploads",
    docId: pdfDoc.docId,
    topK: 5,
  });
  const pdfQ2Duration = Date.now() - pdfQ2Start;
  console.log(`PDF Answer 2 (${pdfQ2Duration}ms):`, JSON.stringify(pdfAnswer2, null, 2));

  // Check 3: Text/notes file upload & both checks
  console.log("\n--- Check 3: Notes Upload & Both Checks ---");
  const notesPath = path.resolve("data/demo/dynamic-programming-notes.txt");
  const notesText = fs.readFileSync(notesPath, "utf-8");

  const notesIngestStart = Date.now();
  const notesDoc = await caller.uploads.ingestText({
    title: "Dynamic Programming Notes",
    text: notesText,
  });
  const notesIngestDuration = Date.now() - notesIngestStart;
  console.log(`Notes Ingested in ${notesIngestDuration}ms:`, JSON.stringify(notesDoc, null, 2));

  // 3a: Answerable question
  const notesQ1Start = Date.now();
  const notesAnswer1 = await caller.uploads.answer({
    question: "What is tabulation and what approach does it use?",
    scope: "uploads",
    docId: notesDoc.docId,
    topK: 5,
  });
  const notesQ1Duration = Date.now() - notesQ1Start;
  console.log(`Notes Answer 1 (${notesQ1Duration}ms):`, JSON.stringify(notesAnswer1, null, 2));

  // 3b: Unanswerable question
  const notesQ2Start = Date.now();
  const notesAnswer2 = await caller.uploads.answer({
    question: "What is the capital of France?",
    scope: "uploads",
    docId: notesDoc.docId,
    topK: 5,
  });
  const notesQ2Duration = Date.now() - notesQ2Start;
  console.log(`Notes Answer 2 (${notesQ2Duration}ms):`, JSON.stringify(notesAnswer2, null, 2));

  // Check 4: Playlist mode covered DSA pattern question
  console.log("\n--- Check 4: Playlist Mode - Covered DSA Pattern Question ---");
  const playlistQ1Start = Date.now();
  const playlistAnswer1 = await caller.uploads.answer({
    question: "How does the sliding window pattern work?",
    scope: "playlist",
    topK: 5,
  });
  const playlistQ1Duration = Date.now() - playlistQ1Start;
  console.log(`Playlist Answer 1 (${playlistQ1Duration}ms):`, JSON.stringify(playlistAnswer1, null, 2));

  // Check 5: Playlist mode uncovered question
  console.log("\n--- Check 5: Playlist Mode - Uncovered Question ---");
  const playlistQ2Start = Date.now();
  const playlistAnswer2 = await caller.uploads.answer({
    question: "How do React Server Components work in Next.js?",
    scope: "playlist",
    topK: 5,
  });
  const playlistQ2Duration = Date.now() - playlistQ2Start;
  console.log(`Playlist Answer 2 (${playlistQ2Duration}ms):`, JSON.stringify(playlistAnswer2, null, 2));

  // Check 6: Isolation check - PDF question in playlist mode, and vice-versa
  console.log("\n--- Check 6: Source Isolation Cross-Check ---");
  // Ingest a syllabus PDF with private non-lecture facts
  const syllabusPath = path.resolve("data/demo/syllabus_sample.pdf");
  // Create a 1-page sample PDF using python
  const syllabusBase64 = Buffer.from(
    "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>/Contents 4 0 R>>endobj\n4 0 obj<</Length 115>>stream\nBT /F1 12 Tf 72 712 Td (CS101 Final Exam is scheduled on December 18 in Room 405 with Professor Harrison.) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000056 00000 n \n0000000111 00000 n \n0000000212 00000 n \ntrailer<</Size 5/Root 1 0 R>>\nstartxref\n378\n%%EOF"
  ).toString("base64");

  const syllabusDoc = await caller.uploads.ingestPdf({
    title: "CS101 Syllabus",
    fileName: "cs101_syllabus.pdf",
    contentType: "application/pdf",
    contentBase64: syllabusBase64,
  });
  console.log("Syllabus PDF Ingested:", syllabusDoc.docId);

  // 6a: Ask PDF-only question to the PDF
  const isoQ1_PDF = await caller.uploads.answer({
    question: "Where is the CS101 Final Exam scheduled and with which professor?",
    scope: "uploads",
    docId: syllabusDoc.docId,
    topK: 5,
  });
  console.log("6a. PDF-only question asked in PDF mode:\n", JSON.stringify(isoQ1_PDF, null, 2));

  // 6b: Ask that SAME PDF question in Playlist mode (Must refuse and NOT leak PDF content)
  const isoQ1_Playlist = await caller.uploads.answer({
    question: "Where is the CS101 Final Exam scheduled and with which professor?",
    scope: "playlist",
    topK: 5,
  });
  console.log("6b. PDF-only question asked in Playlist mode:\n", JSON.stringify(isoQ1_Playlist, null, 2));

  // 6c: Ask a Playlist-only question (sliding window) in Syllabus PDF mode (Must refuse and NOT leak Playlist content)
  const isoQ2_PDF = await caller.uploads.answer({
    question: "How does the sliding window pattern work in DSA?",
    scope: "uploads",
    docId: syllabusDoc.docId,
    topK: 5,
  });
  console.log("6c. Playlist question asked in PDF mode:\n", JSON.stringify(isoQ2_PDF, null, 2));

  // Check 7: Off-topic question in each mode
  console.log("\n--- Check 7: Off-Topic Question (Weather) in Each Mode ---");
  const offTopicPDF = await caller.uploads.answer({
    question: "What is the weather forecast for tomorrow?",
    scope: "uploads",
    docId: pdfDoc.docId,
    topK: 5,
  });
  console.log("Off-topic in PDF mode:", JSON.stringify(offTopicPDF, null, 2));

  const offTopicNotes = await caller.uploads.answer({
    question: "What is the weather forecast for tomorrow?",
    scope: "uploads",
    docId: notesDoc.docId,
    topK: 5,
  });
  console.log("Off-topic in Notes mode:", JSON.stringify(offTopicNotes, null, 2));

  const offTopicPlaylist = await caller.uploads.answer({
    question: "What is the weather forecast for tomorrow?",
    scope: "playlist",
    topK: 5,
  });
  console.log("Off-topic in Playlist mode:", JSON.stringify(offTopicPlaylist, null, 2));

  // Phase 4 Cross-cutting: Error handling tests
  console.log("\n--- Phase 4: Cross-cutting Error Handling ---");
  // 1. Empty PDF
  try {
    await caller.uploads.ingestPdf({
      title: "Empty PDF",
      fileName: "empty.pdf",
      contentType: "application/pdf",
      contentBase64: "",
    });
    console.log("Empty PDF: Unexpected success");
  } catch (err: any) {
    console.log("Empty PDF Error (Expected):", err.message || err);
  }

  // 2. Non-PDF file renamed to .pdf
  try {
    const fakePdfBase64 = Buffer.from("This is a plain text file pretending to be pdf").toString("base64");
    await caller.uploads.ingestPdf({
      title: "Fake PDF",
      fileName: "fake.pdf",
      contentType: "application/pdf",
      contentBase64: fakePdfBase64,
    });
    console.log("Fake PDF: Unexpected success");
  } catch (err: any) {
    console.log("Fake PDF Error (Expected):", err.message || err);
  }

  // 3. Very large file (> 20 MB)
  try {
    // 21 MB dummy buffer
    const largeBuf = Buffer.alloc(21 * 1024 * 1024);
    // write PDF header so it passes initial signature check
    largeBuf.write("%PDF-1.4");
    await caller.uploads.ingestPdf({
      title: "Huge PDF",
      fileName: "huge.pdf",
      contentType: "application/pdf",
      contentBase64: largeBuf.toString("base64"),
    });
    console.log("Huge PDF: Unexpected success");
  } catch (err: any) {
    console.log("Huge PDF Error (Expected):", err.message || err);
  }

  console.log("\n=================== AUDIT CHECKS COMPLETE ===================");
}

runAudit().catch(err => {
  console.error("FATAL ERROR in runAudit:", err);
  process.exit(1);
});
