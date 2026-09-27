import { describe, expect, it } from "vitest";
import {
  generateGroundedQuiz,
  loadQuestionBank,
  prepareQuestionForSession,
  resolveTopic,
  sampleWithoutReplacement,
  shuffleArray,
  getTopicTaxonomy,
  TOPIC_RECONCILIATION_MAP,
} from "./ai/quizService";
import { appRouter } from "./routers";

describe("Phase 1: Question Bank Integrity & Loading", () => {
  it("loads dsa-quiz-question-bank.json with exactly 12 topics and 120 questions", () => {
    const bank = loadQuestionBank();
    expect(bank).toBeDefined();
    expect(Array.isArray(bank.topics)).toBe(true);
    expect(bank.topics.length).toBe(12);

    let totalQuestions = 0;
    for (const topic of bank.topics) {
      expect(topic.id).toBeTruthy();
      expect(topic.name).toBeTruthy();
      expect(topic.questions.length).toBe(10);

      for (const q of topic.questions) {
        totalQuestions++;
        expect(q.id).toBeTruthy();
        expect(q.question.trim().length).toBeGreaterThan(10);
        expect(q.options.length).toBe(4);
        expect(q.options.every((opt) => opt.trim().length > 0)).toBe(true);
        expect(new Set(q.options).size).toBe(4); // 4 distinct options
        expect(q.correctIndex).toBe(0); // In raw static file, correct answer is authored at index 0
        expect(q.explanation.trim().length).toBeGreaterThan(10);
      }
    }

    expect(totalQuestions).toBe(120);
  });
});

describe("Phase 2: Quiz Session Logic & Shuffling", () => {
  it("samples 5 questions without replacement per attempt", () => {
    const bank = loadQuestionBank();
    const topic = bank.topics[0];
    const sampled = sampleWithoutReplacement(topic.questions, 5);

    expect(sampled.length).toBe(5);
    const sampledIds = new Set(sampled.map((q) => q.id));
    expect(sampledIds.size).toBe(5); // No duplicates within attempt
  });

  it("shuffles options and correctly recomputes correctIndex to match raw options[0]", () => {
    const bank = loadQuestionBank();
    for (const topic of bank.topics) {
      for (const rawQ of topic.questions) {
        const authoredCorrect = rawQ.options[0];
        const sessionQ = prepareQuestionForSession(rawQ, topic.name);

        expect(sessionQ.options.length).toBe(4);
        expect(sessionQ.correctIndex).toBeGreaterThanOrEqual(0);
        expect(sessionQ.correctIndex).toBeLessThan(4);
        expect(sessionQ.options[sessionQ.correctIndex]).toBe(authoredCorrect);
        expect(sessionQ.explanation).toBe(rawQ.explanation);
      }
    }
  });

  it("randomizes correctIndex across positions 0, 1, 2, and 3 over multiple iterations", () => {
    const bank = loadQuestionBank();
    const rawQ = bank.topics[0].questions[0];
    const positionCounts = [0, 0, 0, 0];

    for (let i = 0; i < 400; i++) {
      const sessionQ = prepareQuestionForSession(rawQ, "Arrays & Strings");
      positionCounts[sessionQ.correctIndex]++;
    }

    // Each position (A, B, C, D) should be selected roughly ~25% of the time (min 10% each)
    for (let i = 0; i < 4; i++) {
      expect(positionCounts[i]).toBeGreaterThan(20);
    }
  });

  it("produces varying question subsets and orders across multiple attempts on the same topic", async () => {
    const attempts = await Promise.all([
      generateGroundedQuiz({ scope: "playlist", topicId: "two_pointers", questionCount: 5 }),
      generateGroundedQuiz({ scope: "playlist", topicId: "two_pointers", questionCount: 5 }),
      generateGroundedQuiz({ scope: "playlist", topicId: "two_pointers", questionCount: 5 }),
    ]);

    const ids1 = attempts[0].questions.map((q) => q.id).join(",");
    const ids2 = attempts[1].questions.map((q) => q.id).join(",");
    const ids3 = attempts[2].questions.map((q) => q.id).join(",");

    // Across 3 independent attempts of picking 5 from 10, sequences should not all be identical
    const allIdentical = ids1 === ids2 && ids2 === ids3;
    expect(allIdentical).toBe(false);
  });
});

describe("Phase 2 & 3: Topic Taxonomy Reconciliation & Coverage Map Integration", () => {
  it("reconciles all 12 bank topics to coverage map taxonomy IDs", () => {
    const taxonomy = getTopicTaxonomy();
    expect(taxonomy.length).toBe(12);
    const taxonomyIds = new Set(taxonomy.map((t: any) => t.id));

    const bank = loadQuestionBank();
    for (const bankTopic of bank.topics) {
      const resolved = resolveTopic({ topicId: bankTopic.id });
      expect(resolved.bankTopic.id).toBe(bankTopic.id);
      expect(taxonomyIds.has(resolved.taxonomyTopicId)).toBe(true);
    }
  });

  it("handles incoming taxonomy IDs, bank topic IDs, and text queries seamlessly", () => {
    // By taxonomy ID
    const byTaxonomy = resolveTopic({ topicId: "trees_bst" });
    expect(byTaxonomy.bankTopic.id).toBe("trees");
    expect(byTaxonomy.taxonomyTopicId).toBe("trees_bst");

    // By bank topic ID
    const byBankId = resolveTopic({ topicId: "recursion-backtracking" });
    expect(byBankId.bankTopic.id).toBe("recursion-backtracking");
    expect(byBankId.taxonomyTopicId).toBe("recursion_backtracking");

    // By query string
    const byQuery = resolveTopic({ query: "Explain dynamic programming memoization" });
    expect(byQuery.bankTopic.id).toBe("dynamic-programming");
    expect(byQuery.taxonomyTopicId).toBe("dynamic_programming");
  });

  it("returns reconciled taxonomy topicId in tRPC quiz.generate mutation", async () => {
    const caller = appRouter.createCaller({});
    const res = await caller.quiz.generate({
      scope: "playlist",
      topicId: "arrays-strings",
      questionCount: 5,
    });

    expect(res.success).toBe(true);
    expect(res.topicId).toBe("arrays_hashing");
    expect(res.questions.length).toBe(5);
    for (const q of res.questions) {
      expect(q.options.length).toBe(4);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(4);
      expect(q.explanation.length).toBeGreaterThan(0);
    }
  });
});
