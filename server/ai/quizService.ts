import { randomUUID } from "node:crypto";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { getDocumentStatus } from "./uploadService";

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
  topicId?: string;
  topicTitle: string;
  scope: "uploads" | "playlist";
  questions: QuizQuestion[];
  totalGenerated: number;
  discardedCount: number;
  verifiedCount: number;
  message?: string;
};

export type RawBankQuestion = {
  id: string;
  question: string;
  options: [string, string, string, string];
  correctIndex: number; // Always 0 in the source file
  explanation: string;
};

export type RawBankTopic = {
  id: string;
  name: string;
  questions: RawBankQuestion[];
};

export type QuestionBankData = {
  _readme?: string;
  topics: RawBankTopic[];
};

// Canonical topic taxonomy loader for coverage map
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

// Load the hand-crafted, verified 120-question DSA Question Bank
export function loadQuestionBank(): QuestionBankData {
  const candidatePaths = [
    join(process.cwd(), "data", "dsa-quiz-question-bank.json"),
    join(process.cwd(), "dsa-quiz-question-bank.json"),
    join(process.cwd(), "dist", "data", "dsa-quiz-question-bank.json"),
  ];
  for (const p of candidatePaths) {
    if (existsSync(p)) {
      try {
        const parsed = JSON.parse(readFileSync(p, "utf-8")) as QuestionBankData;
        if (Array.isArray(parsed?.topics) && parsed.topics.length > 0) {
          return parsed;
        }
      } catch {
        // Fallback
      }
    }
  }
  throw new Error("Could not find or parse dsa-quiz-question-bank.json");
}

/**
 * Topic Reconciliation Map:
 * Bridges Question Bank topic IDs with the Coverage Map taxonomy IDs.
 */
export const TOPIC_RECONCILIATION_MAP: Record<
  string,
  { bankTopicId: string; taxonomyTopicId: string; title: string }
> = {
  // 1. Arrays & Strings / Arrays & Hashing
  "arrays-strings": { bankTopicId: "arrays-strings", taxonomyTopicId: "arrays_hashing", title: "Arrays & Strings" },
  "arrays_hashing": { bankTopicId: "arrays-strings", taxonomyTopicId: "arrays_hashing", title: "Arrays & Strings" },
  "arrays": { bankTopicId: "arrays-strings", taxonomyTopicId: "arrays_hashing", title: "Arrays & Strings" },
  "hashing": { bankTopicId: "arrays-strings", taxonomyTopicId: "arrays_hashing", title: "Arrays & Strings" },

  // 2. Two Pointers
  "two-pointers": { bankTopicId: "two-pointers", taxonomyTopicId: "two_pointers", title: "Two Pointers" },
  "two_pointers": { bankTopicId: "two-pointers", taxonomyTopicId: "two_pointers", title: "Two Pointers" },

  // 3. Sliding Window
  "sliding-window": { bankTopicId: "sliding-window", taxonomyTopicId: "sliding_window", title: "Sliding Window" },
  "sliding_window": { bankTopicId: "sliding-window", taxonomyTopicId: "sliding_window", title: "Sliding Window" },

  // 4. Linked Lists
  "linked-lists": { bankTopicId: "linked-lists", taxonomyTopicId: "linked_lists", title: "Linked Lists" },
  "linked_lists": { bankTopicId: "linked-lists", taxonomyTopicId: "linked_lists", title: "Linked Lists" },

  // 5. Stacks & Queues
  "stacks-queues": { bankTopicId: "stacks-queues", taxonomyTopicId: "stacks_queues", title: "Stacks & Queues" },
  "stacks_queues": { bankTopicId: "stacks-queues", taxonomyTopicId: "stacks_queues", title: "Stacks & Queues" },

  // 6. Trees
  "trees": { bankTopicId: "trees", taxonomyTopicId: "trees_bst", title: "Trees & Binary Search Trees" },
  "trees_bst": { bankTopicId: "trees", taxonomyTopicId: "trees_bst", title: "Trees & Binary Search Trees" },
  "bst": { bankTopicId: "trees", taxonomyTopicId: "trees_bst", title: "Trees & Binary Search Trees" },

  // 7. Graphs
  "graphs": { bankTopicId: "graphs", taxonomyTopicId: "graphs_bfs_dfs", title: "Graphs (BFS & DFS)" },
  "graphs_bfs_dfs": { bankTopicId: "graphs", taxonomyTopicId: "graphs_bfs_dfs", title: "Graphs (BFS & DFS)" },
  "bfs": { bankTopicId: "graphs", taxonomyTopicId: "graphs_bfs_dfs", title: "Graphs (BFS & DFS)" },
  "dfs": { bankTopicId: "graphs", taxonomyTopicId: "graphs_bfs_dfs", title: "Graphs (BFS & DFS)" },

  // 8. Recursion & Backtracking
  "recursion-backtracking": { bankTopicId: "recursion-backtracking", taxonomyTopicId: "recursion_backtracking", title: "Recursion & Backtracking" },
  "recursion_backtracking": { bankTopicId: "recursion-backtracking", taxonomyTopicId: "recursion_backtracking", title: "Recursion & Backtracking" },
  "recursion": { bankTopicId: "recursion-backtracking", taxonomyTopicId: "recursion_backtracking", title: "Recursion & Backtracking" },
  "backtracking": { bankTopicId: "recursion-backtracking", taxonomyTopicId: "recursion_backtracking", title: "Recursion & Backtracking" },

  // 9. Dynamic Programming
  "dynamic-programming": { bankTopicId: "dynamic-programming", taxonomyTopicId: "dynamic_programming", title: "Dynamic Programming" },
  "dynamic_programming": { bankTopicId: "dynamic-programming", taxonomyTopicId: "dynamic_programming", title: "Dynamic Programming" },
  "dp": { bankTopicId: "dynamic-programming", taxonomyTopicId: "dynamic_programming", title: "Dynamic Programming" },

  // 10. Greedy Algorithms
  "greedy": { bankTopicId: "greedy", taxonomyTopicId: "greedy", title: "Greedy Algorithms" },

  // 11. Sorting & Searching / Binary Search
  "sorting-searching": { bankTopicId: "sorting-searching", taxonomyTopicId: "binary_search", title: "Sorting & Searching" },
  "binary_search": { bankTopicId: "sorting-searching", taxonomyTopicId: "binary_search", title: "Sorting & Searching" },
  "binary search": { bankTopicId: "sorting-searching", taxonomyTopicId: "binary_search", title: "Sorting & Searching" },
  "sorting": { bankTopicId: "sorting-searching", taxonomyTopicId: "binary_search", title: "Sorting & Searching" },
  "searching": { bankTopicId: "sorting-searching", taxonomyTopicId: "binary_search", title: "Sorting & Searching" },

  // 12. Bit Manipulation
  "bit-manipulation": { bankTopicId: "bit-manipulation", taxonomyTopicId: "bit_manipulation", title: "Bit Manipulation" },
  "bit_manipulation": { bankTopicId: "bit-manipulation", taxonomyTopicId: "bit_manipulation", title: "Bit Manipulation" },
  "bit": { bankTopicId: "bit-manipulation", taxonomyTopicId: "bit_manipulation", title: "Bit Manipulation" },
};

/**
 * Resolves any input topic identifier or query text to a Question Bank topic
 * and canonical coverage map taxonomy ID.
 */
export function resolveTopic(input: { topicId?: string; query?: string; docId?: string }): {
  bankTopic: RawBankTopic;
  taxonomyTopicId: string;
  title: string;
} {
  const bank = loadQuestionBank();

  // 1. Direct lookup by topicId
  if (input.topicId) {
    const normalizedId = input.topicId.trim().toLowerCase();
    const mapping = TOPIC_RECONCILIATION_MAP[normalizedId];
    if (mapping) {
      const found = bank.topics.find((t) => t.id === mapping.bankTopicId);
      if (found) {
        return { bankTopic: found, taxonomyTopicId: mapping.taxonomyTopicId, title: mapping.title };
      }
    }
    const direct = bank.topics.find((t) => t.id === normalizedId || t.name.toLowerCase() === normalizedId);
    if (direct) {
      const mapping = TOPIC_RECONCILIATION_MAP[direct.id] || {
        bankTopicId: direct.id,
        taxonomyTopicId: direct.id,
        title: direct.name,
      };
      return { bankTopic: direct, taxonomyTopicId: mapping.taxonomyTopicId, title: mapping.title };
    }
  }

  // 2. Keyword match on query or document title
  const textToSearch = [
    input.query,
    input.docId ? getDocumentStatus(input.docId)?.title : "",
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (textToSearch) {
    // Sort keys by length descending to match most specific keywords first
    const keys = Object.keys(TOPIC_RECONCILIATION_MAP).sort((a, b) => b.length - a.length);
    for (const key of keys) {
      const cleanKey = key.toLowerCase().replace(/[-_]/g, " ");
      if (textToSearch.includes(cleanKey) || textToSearch.includes(key)) {
        const mapping = TOPIC_RECONCILIATION_MAP[key];
        const found = bank.topics.find((t) => t.id === mapping.bankTopicId);
        if (found) {
          return { bankTopic: found, taxonomyTopicId: mapping.taxonomyTopicId, title: mapping.title };
        }
      }
    }
  }

  // 3. Fallback: select a topic predictably or from first topic
  const fallback = bank.topics[0];
  const mapping = TOPIC_RECONCILIATION_MAP[fallback.id] || {
    bankTopicId: fallback.id,
    taxonomyTopicId: "arrays_hashing",
    title: fallback.name,
  };
  return { bankTopic: fallback, taxonomyTopicId: mapping.taxonomyTopicId, title: mapping.title };
}

/**
 * Fisher-Yates shuffle implementation ensuring uniform randomization
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

/**
 * Randomly sample k items without replacement
 */
export function sampleWithoutReplacement<T>(array: T[], count: number): T[] {
  const shuffled = shuffleArray(array);
  return shuffled.slice(0, Math.min(count, array.length));
}

/**
 * Prepares a question from the static question bank for a live quiz attempt:
 * - Shuffles the 4 options into a fresh random permutation (never shows options[0] in fixed spot).
 * - Recomputes which index holds the correct answer.
 */
export function prepareQuestionForSession(
  rawQ: RawBankQuestion,
  topicTitle: string
): QuizQuestion {
  // In the question bank file, options[0] is always the author-verified correct answer
  const correctAnswer = rawQ.options[0];

  // Randomly shuffle the 4 options
  const shuffledOptions = shuffleArray(rawQ.options) as [string, string, string, string];

  // Recompute the correctIndex for this shuffled session
  const correctIndex = shuffledOptions.indexOf(correctAnswer);
  if (correctIndex === -1) {
    throw new Error(`Corrupted options for question ID ${rawQ.id}`);
  }

  return {
    id: rawQ.id,
    question: rawQ.question,
    options: shuffledOptions,
    correctIndex,
    explanation: rawQ.explanation,
    citation: {
      sourceType: "video",
      sourceId: rawQ.id,
      title: `${topicTitle} Topic Bank`,
      page: null,
      timestamp: null,
      snippet: rawQ.explanation,
    },
  };
}

/**
 * Generates a quiz attempt using static verified question bank.
 * Zero live LLM calls.
 */
export async function generateGroundedQuiz(input: {
  scope: "uploads" | "playlist";
  docId?: string;
  topicId?: string;
  query?: string;
  questionCount?: number;
}): Promise<QuizResult> {
  const targetCount = Math.max(1, Math.min(input.questionCount ?? 5, 10));

  // Resolve topic
  const { bankTopic, taxonomyTopicId, title } = resolveTopic({
    topicId: input.topicId,
    query: input.query,
    docId: input.docId,
  });

  // 1. Randomly sample targetCount (default 5) questions without replacement
  const selectedRawQuestions = sampleWithoutReplacement(bankTopic.questions, targetCount);

  // 2. For each question, shuffle its 4 options and recompute correctIndex
  const questions = selectedRawQuestions.map((q) => prepareQuestionForSession(q, title));

  return {
    success: true,
    topicId: taxonomyTopicId,
    topicTitle: title,
    scope: input.scope,
    questions,
    totalGenerated: bankTopic.questions.length,
    discardedCount: 0,
    verifiedCount: questions.length,
    message: `Loaded ${questions.length} verified questions for ${title}`,
  };
}

/**
 * Optional self-verification utility preserved for testing and validation
 */
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

  const correctOption = options[cIndex].trim().toLowerCase();
  const snippetLower = sourceSnippet.toLowerCase();

  const isSubstring = snippetLower.includes(correctOption);
  const words = correctOption.split(/\s+/).filter((w) => w.length > 3);
  const matchedWords = words.filter((w) => snippetLower.includes(w));
  const wordMatch = words.length > 0 && matchedWords.length / words.length >= 0.5;

  if (!isSubstring && !wordMatch) {
    return {
      verified: false,
      reason: `Correct answer "${options[cIndex]}" not supported by snippet`,
    };
  }

  return { verified: true };
}
