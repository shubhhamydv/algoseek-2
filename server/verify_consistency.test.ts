import { describe, expect, it } from "vitest";
import dotenv from "dotenv";
dotenv.config();

import { ingestText, ingestPdf, answerUploads } from "./ai/uploadService";
import { isRefusalText, extractAndAlignUsedCitations } from "../client/src/pages/Home";

// Helper to simulate the exact rendering state derived by Home.tsx from SearchResult
function evaluateHomeScreenState(data: {
  answer: string;
  grounded: boolean;
  mode: string;
  sources: Array<any>;
}) {
  const isRefusalOutcome = Boolean(
    !data.grounded ||
    data.mode === "refusal" ||
    isRefusalText(data.answer)
  );
  const effectiveGrounded = Boolean(data.grounded && !isRefusalOutcome);

  const rawCitations = data.sources.map((source, index) => ({
    id: `${source.source_id}-${index}`,
    title: source.title,
    timestamp: source.timestamp ?? undefined,
    startSec: source.timestamp ? 100 : undefined,
    videoId: source.source_type === "video" ? source.source_id : undefined,
    text: source.snippet,
    sourceType: source.source_type,
    page: source.page ?? undefined,
  }));

  const { alignedAnswer, alignedCitations } = effectiveGrounded
    ? extractAndAlignUsedCitations(data.answer, rawCitations)
    : { alignedAnswer: data.answer, alignedCitations: [] };

  const finalGrounded = Boolean(effectiveGrounded && alignedCitations.length > 0);

  // Derived single source of truth in Home.tsx:
  const isRefusal = Boolean(
    !finalGrounded ||
    isRefusalText(alignedAnswer) ||
    alignedCitations.length === 0
  );
  const isGrounded = Boolean(finalGrounded && !isRefusal && alignedCitations.length > 0 && alignedAnswer.trim());
  const activeCitation = isGrounded ? alignedCitations[0] : undefined;

  return {
    // 1. Answer text
    answerText: alignedAnswer,
    // 2. Status pill
    statusPill: isRefusal ? "Not Grounded (is-refused)" : "Grounded (is-grounded)",
    isPillGreen: isGrounded,
    // 3. Evidence trail
    evidenceTrailCount: isGrounded ? alignedCitations.length : 0,
    evidenceTrailEmptyState: !isGrounded,
    evidenceTrailCardsRendered: isGrounded ? alignedCitations.length : 0,
    // 4. Document context panel
    documentContextHasExcerpt: Boolean(isGrounded && activeCitation),
    documentContextBadge: isGrounded && activeCitation ? "ACTIVE_BRIEF" : "NOT_GROUNDED",
    documentContextExcerpt: activeCitation?.text ?? null,
  };
}

const SAMPLE_PDF_BASE64 = Buffer.from(
  "%PDF-1.4\n" +
  "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n" +
  "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n" +
  "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n" +
  "4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n" +
  "5 0 obj\n<< /Length 78 >>\nstream\n" +
  "BT\n/F1 12 Tf\n72 712 Td\n(Binary Search runs in O(log n) time by halving the search space.) Tj\nET\nendstream\nendobj\n" +
  "xref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000227 00000 n \n0000000294 00000 n \n" +
  "trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n422\n%%EOF"
).toString("base64");

describe("Phase 3: Verify Single Source of Truth Across All Modes", () => {
  const testDeviceId = "test-device-consistency-mode";

  // ── Mode 1: Text Upload Mode ──
  it("Text Mode (Case 1): Unrelated question 'What is React?' against Hackathon Rule Book", async () => {
    const doc = await ingestText({
      title: "Hackathon Rule Book",
      text: `Chunk 1: Welcome to the Annual Code Hackathon! All participants must register on the portal.
Eligibility: Open to all undergraduate and graduate university students with valid student ID cards.
Teams: Teams must consist of 2 to 4 participants. Cross-university teams are allowed and encouraged.

Chunk 2: Schedule and Timeline: The hackathon commences at 9:00 AM on Saturday and ends at 9:00 AM on Monday.
48 hours of continuous building. Mentors will be available in person and on Discord during the daytime hours.

Chunk 3: Judging Criteria: Projects will be evaluated on Innovation (25%), Technical Depth (25%),
Practical Impact (25%), and Presentation (25%). Prizes include cash awards, mentorship, and cloud credits.`,
      deviceId: testDeviceId,
    });

    const res = await answerUploads({
      question: "What is React?",
      scope: "uploads",
      docId: doc.docId,
      deviceId: testDeviceId,
    });

    const uiState = evaluateHomeScreenState(res);

    // 1. Answer text: refuses
    expect(uiState.answerText.toLowerCase()).toContain("not found in your material");
    // 2. Status pill: Not Grounded (muted red/amber, NOT green)
    expect(uiState.statusPill).toBe("Not Grounded (is-refused)");
    expect(uiState.isPillGreen).toBe(false);
    // 3. Evidence trail: 0 sources, empty state
    expect(uiState.evidenceTrailCount).toBe(0);
    expect(uiState.evidenceTrailEmptyState).toBe(true);
    expect(uiState.evidenceTrailCardsRendered).toBe(0);
    // 4. Document context: empty state, no unrelated text
    expect(uiState.documentContextHasExcerpt).toBe(false);
    expect(uiState.documentContextBadge).toBe("NOT_GROUNDED");
    expect(uiState.documentContextExcerpt).toBeNull();
  });

  it("Text Mode (Case 2): Genuinely answerable question against Hackathon Rule Book", async () => {
    const doc = await ingestText({
      title: "Hackathon Rule Book",
      text: `Welcome to the Annual Code Hackathon!
Rule 1: Teams must consist of 2 to 4 participants.
Rule 2: Judging criteria include Innovation (25%), Technical Depth (25%), Practicality (25%), and Presentation (25%).
Prizes will be awarded to 1st, 2nd, and 3rd place teams at the closing ceremony on Sunday.`,
      deviceId: testDeviceId,
    });

    const res = await answerUploads({
      question: "What are the team size rules and judging criteria?",
      scope: "uploads",
      docId: doc.docId,
      deviceId: testDeviceId,
    });

    const uiState = evaluateHomeScreenState(res);

    // 1. Answer text: grounded answer
    expect(uiState.answerText.toLowerCase()).toMatch(/team|judging|innovation|2 to 4/);
    // 2. Status pill: Grounded (green)
    expect(uiState.statusPill).toBe("Grounded (is-grounded)");
    expect(uiState.isPillGreen).toBe(true);
    // 3. Evidence trail: sources displayed
    expect(uiState.evidenceTrailCount).toBeGreaterThan(0);
    expect(uiState.evidenceTrailEmptyState).toBe(false);
    expect(uiState.evidenceTrailCardsRendered).toBeGreaterThan(0);
    // 4. Document context: relevant excerpt displayed
    expect(uiState.documentContextHasExcerpt).toBe(true);
    expect(uiState.documentContextBadge).toBe("ACTIVE_BRIEF");
    expect(uiState.documentContextExcerpt).not.toBeNull();
  });

  // ── Mode 2: PDF Upload Mode ──
  it("PDF Mode (Case 1): Unrelated question 'Who painted the Mona Lisa?' against Search PDF", async () => {
    const doc = await ingestPdf({
      title: "Search Algorithms PDF",
      fileName: "search.pdf",
      contentType: "application/pdf",
      contentBase64: SAMPLE_PDF_BASE64,
      deviceId: testDeviceId,
    });

    const res = await answerUploads({
      question: "Who painted the Mona Lisa and when was it created?",
      scope: "uploads",
      docId: doc.docId,
      deviceId: testDeviceId,
    });

    const uiState = evaluateHomeScreenState(res);

    // 1. Answer text: refuses
    expect(uiState.answerText.toLowerCase()).toContain("not found in your material");
    // 2. Status pill: Not Grounded (NOT green)
    expect(uiState.statusPill).toBe("Not Grounded (is-refused)");
    expect(uiState.isPillGreen).toBe(false);
    // 3. Evidence trail: empty
    expect(uiState.evidenceTrailCount).toBe(0);
    expect(uiState.evidenceTrailCardsRendered).toBe(0);
    // 4. Document context: empty
    expect(uiState.documentContextHasExcerpt).toBe(false);
    expect(uiState.documentContextBadge).toBe("NOT_GROUNDED");
  });

  it("PDF Mode (Case 2): Genuinely answerable question 'What is the time complexity of Binary Search?'", async () => {
    const doc = await ingestPdf({
      title: "Search Algorithms PDF",
      fileName: "search.pdf",
      contentType: "application/pdf",
      contentBase64: SAMPLE_PDF_BASE64,
      deviceId: testDeviceId,
    });

    const res = await answerUploads({
      question: "What is the time complexity of Binary Search?",
      scope: "uploads",
      docId: doc.docId,
      deviceId: testDeviceId,
    });

    const uiState = evaluateHomeScreenState(res);

    // 1. Answer text: grounded answer
    expect(uiState.answerText).toMatch(/Binary Search|O\(log n\)|halving/i);
    // 2. Status pill: Grounded (green)
    expect(uiState.statusPill).toBe("Grounded (is-grounded)");
    expect(uiState.isPillGreen).toBe(true);
    // 3. Evidence trail: sources displayed
    expect(uiState.evidenceTrailCount).toBeGreaterThan(0);
    // 4. Document context: excerpt displayed
    expect(uiState.documentContextHasExcerpt).toBe(true);
  });

  // ── Mode 3: Playlist Mode ──
  it("Playlist Mode (Case 1): Unrelated question 'Explain how to bake sourdough bread'", async () => {
    const res = await answerUploads({
      question: "Explain how to bake sourdough bread step by step",
      scope: "playlist",
    });

    const uiState = evaluateHomeScreenState(res);

    // 1. Answer text: refuses
    expect(uiState.answerText.toLowerCase()).toContain("isn't covered in the lecture playlist");
    // 2. Status pill: Not Grounded
    expect(uiState.statusPill).toBe("Not Grounded (is-refused)");
    expect(uiState.isPillGreen).toBe(false);
    // 3. Evidence trail: 0 sources
    expect(uiState.evidenceTrailCount).toBe(0);
    expect(uiState.evidenceTrailCardsRendered).toBe(0);
    // 4. Document context: empty
    expect(uiState.documentContextHasExcerpt).toBe(false);
  });

  it("Playlist Mode (Case 2): Genuinely answerable question 'When should I use two pointers?'", async () => {
    const res = await answerUploads({
      question: "When should I use two pointers?",
      scope: "playlist",
    });

    const uiState = evaluateHomeScreenState(res);

    // 1. Answer text: grounded explanation
    expect(uiState.answerText.toLowerCase()).toContain("pointer");
    // 2. Status pill: Grounded (green)
    expect(uiState.statusPill).toBe("Grounded (is-grounded)");
    expect(uiState.isPillGreen).toBe(true);
    // 3. Evidence trail: lecture moments displayed
    expect(uiState.evidenceTrailCount).toBeGreaterThan(0);
    // 4. Document context / Player: active playback citation
    expect(uiState.documentContextHasExcerpt).toBe(true);
  });
});
