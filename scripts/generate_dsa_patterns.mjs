import fs from "fs";
import path from "path";

const csvPath = path.resolve("data/dsa_pattern_sheet.csv");
const lines = fs.readFileSync(csvPath, "utf-8").split(/\r?\n/);

function detectPlatform(url) {
  if (url.includes("leetcode.com")) return "leetcode";
  if (url.includes("geeksforgeeks.org")) return "geeksforgeeks";
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "youtube";
  return "other";
}

function parseDifficulty(raw) {
  const lower = raw.toLowerCase();
  if (lower.includes("(easy)") || /\beasy\b/i.test(lower)) return "Easy";
  if (lower.includes("(medium)") || lower.includes("(med)") || /\bmedium\b/i.test(lower) || /\bmed\b/i.test(lower)) return "Medium";
  if (lower.includes("(hard)") || /\bhard\b/i.test(lower)) return "Hard";
  return undefined;
}

function cleanTitle(raw, url) {
  let cleaned = raw
    .replace(/\s*\((easy|medium|med|hard)\)\s*/gi, "")
    .replace(/\s*\(Problem Challenge\)\s*/gi, " (Challenge)")
    .trim();

  // If title is empty or generic, infer from URL
  if (!cleaned && url) {
    try {
      const parsed = new URL(url);
      const match = parsed.pathname.match(/problems\/([^\/]+)/);
      if (match && match[1]) {
        cleaned = match[1]
          .split("-")
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
      }
    } catch {}
  }
  return cleaned || "Practice Problem";
}

function normalizePatternName(raw) {
  let name = raw
    .replace(/^\d+\.\s*/, "")
    .replace(/^Pattern:\s*/i, "")
    .replace(/^PATTERN:\s*/i, "")
    .trim();

  const map = {
    "Two Pointers": "Two Pointers",
    "Fast & Slow pointers": "Fast & Slow Pointers",
    "Sliding Window": "Sliding Window",
    "Kadane pattern": "Kadane Pattern",
    "PREFIX SUM": "Prefix Sum",
    "Merge Intervals": "Merge Intervals",
    "In-place Reversal of a LinkedList": "In-place Reversal of LinkedList",
    "Stack": "Stack",
    "Hash Maps": "Hash Maps",
    "Pattern : Binary Search": "Binary Search",
    "HEAP PATTERN": "Heap Pattern",
    "Recursion and Backtracking Pattern": "Recursion & Backtracking",
    "Tree Pattern": "Tree Pattern",
    "GRAPHS": "Graphs",
    "DP (Dynamic Programming)": "Dynamic Programming (DP)",
    "GREEDY": "Greedy",
  };

  return map[name] || name;
}

const patternDescriptions = {
  "Two Pointers": "Pointers converging or moving in lockstep across sorted arrays to locate pairs, triplets, and sub-ranges in O(N) time.",
  "Fast & Slow Pointers": "Tortoise and Hare technique for detecting cycles, finding midpoints, and navigating linked lists with O(1) extra space.",
  "Sliding Window": "Expanding and contracting sub-array boundaries to compute maximum sums, longest substrings, and minimal window targets in linear time.",
  "Kadane Pattern": "Dynamic tracking of maximum and minimum contiguous subarray sums and products in a single forward pass.",
  "Prefix Sum": "Precomputed cumulative sums enabling O(1) subarray query evaluations and hash-map frequency counting.",
  "Merge Intervals": "Sorting and combining overlapping ranges, meeting times, and continuous scheduling blocks.",
  "In-place Reversal of LinkedList": "Pointers manipulation to reverse lists, sublists, and k-sized groups without allocating new nodes.",
  "Stack": "LIFO structures for monotonic next-greater evaluations, parentheses verification, and nested bracket parsing.",
  "Hash Maps": "O(1) dictionary lookups for frequency counting, duplicate detection, and anagram validation.",
  "Binary Search": "Logarithmic O(log N) search on sorted arrays, search-space reduction, and binary search on answer bounds.",
  "Heap Pattern": "Priority queue logic for Top-K frequent elements, K-way merges, median maintenance, and greedy scheduling.",
  "Recursion & Backtracking": "State exploration, decision trees, subsets, permutations, and combinatorial generation.",
  "Tree Pattern": "DFS, BFS, traversals, binary search trees, symmetry validation, and lowest common ancestor queries.",
  "Graphs": "Adjacency lists, BFS shortest paths, DFS connectivity, topological sort, Dijkstra, and minimum spanning trees.",
  "Dynamic Programming (DP)": "Overlapping subproblems solved via memoization and bottom-up tabulation for knapsack, LIS, LCS, and stocks.",
  "Greedy": "Locally optimal choices leading to globally optimal solutions for intervals, gas refueling, and jumps.",
};

let currentPattern = "";
let currentSubCategory = "";
const allProblems = [];
const patternGroupsMap = new Map();

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line || line.startsWith("INSTA") || line.startsWith("Pattern,Question")) continue;

  const parts = [];
  let current = "";
  let inQuotes = false;
  for (let c = 0; c < line.length; c++) {
    const char = line[c];
    if (char === '"') inQuotes = !inQuotes;
    else if (char === ',' && !inQuotes) { parts.push(current); current = ""; }
    else current += char;
  }
  parts.push(current);

  const col0 = parts[0]?.trim() || "";
  const col1 = parts[1]?.trim() || "";
  const linkCols = parts.slice(2).map(l => l.trim()).filter(Boolean);

  if (col1.match(/(Pattern|PATTERN|GRAPHS|GREEDY|HEAP PATTERN|Tree Pattern|DP \(Dynamic Programming\))/i) && !linkCols.length) {
    currentPattern = normalizePatternName(col1);
    currentSubCategory = "";
    continue;
  }

  if (col0 && !col1 && !linkCols.length) {
    if (col0.match(/(Pattern|PATTERN|GRAPHS|GREEDY)/i)) {
      currentPattern = normalizePatternName(col0);
      currentSubCategory = "";
      continue;
    }
  }

  if (col0 && col0.length < 30 && !col0.includes("http")) {
    currentSubCategory = col0.trim();
  }

  let validLinks = linkCols.filter(l => l.startsWith("http"));
  if (!validLinks.length && !col1) continue;

  const fallbackLinksMap = {
    "Reverse a String": [
      { url: "https://leetcode.com/problems/reverse-string/description/", platform: "leetcode", label: "LeetCode" },
      { url: "https://www.geeksforgeeks.org/problems/reverse-a-string/1", platform: "geeksforgeeks", label: "GeeksforGeeks" },
    ],
    "Episode 06: tabulation Intro": [
      { url: "https://leetcode.com/problems/climbing-stairs/description/", platform: "leetcode", label: "LeetCode (Tabulation)" },
    ],
    "Episode 11 : LIS Tabulation": [
      { url: "https://leetcode.com/problems/longest-increasing-subsequence/description/", platform: "leetcode", label: "LeetCode (LIS Tabulation)" },
    ],
    "Episode 16: Revision": [
      { url: "https://leetcode.com/problems/coin-change/description/", platform: "leetcode", label: "LeetCode (DP Revision)" },
    ],
  };

  const primaryUrl = validLinks[0] || (fallbackLinksMap[col1]?.[0]?.url) || "";
  const title = cleanTitle(col1, primaryUrl);
  const difficulty = parseDifficulty(col1);

  let formattedLinks = validLinks.map((url, idx) => {
    const platform = detectPlatform(url);
    const platformName = platform === "leetcode" ? "LeetCode" : platform === "geeksforgeeks" ? "GeeksforGeeks" : platform === "youtube" ? "Video Solution" : "Link";
    return {
      url,
      platform,
      label: validLinks.length > 1 ? `${platformName} (${idx + 1})` : platformName,
    };
  });

  if (!formattedLinks.length && fallbackLinksMap[col1]) {
    formattedLinks = fallbackLinksMap[col1];
  }

  const problem = {
    id: `prob-${allProblems.length + 1}`,
    pattern: currentPattern || "General DSA",
    subCategory: currentSubCategory || undefined,
    title,
    difficulty: difficulty || undefined,
    links: formattedLinks,
  };

  allProblems.push(problem);

  if (!patternGroupsMap.has(problem.pattern)) {
    patternGroupsMap.set(problem.pattern, []);
  }
  patternGroupsMap.get(problem.pattern).push(problem);
}

const patternGroups = Array.from(patternGroupsMap.entries()).map(([name, problems]) => ({
  id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
  name,
  problemCount: problems.length,
  description: patternDescriptions[name] || `Curated ${name} pattern problems.`,
  problems,
}));

const tsContent = `/* ─── Auto-generated DSA Pattern Sheet ─── */

export interface ProblemLink {
  label: string;
  url: string;
  platform: "leetcode" | "geeksforgeeks" | "youtube" | "other";
}

export interface PracticeProblem {
  id: string;
  pattern: string;
  subCategory?: string;
  title: string;
  difficulty?: "Easy" | "Medium" | "Hard";
  links: ProblemLink[];
}

export interface PatternGroup {
  id: string;
  name: string;
  problemCount: number;
  description: string;
  problems: PracticeProblem[];
}

export const DSA_PATTERNS: PatternGroup[] = ${JSON.stringify(patternGroups, null, 2)};

export const ALL_PRACTICE_PROBLEMS: PracticeProblem[] = ${JSON.stringify(allProblems, null, 2)};

export function searchPracticeProblems(query: string): {
  matchedPatterns: PatternGroup[];
  matchedProblems: PracticeProblem[];
  totalMatches: number;
} {
  const q = query.trim().toLowerCase();
  if (!q) {
    return {
      matchedPatterns: DSA_PATTERNS,
      matchedProblems: ALL_PRACTICE_PROBLEMS,
      totalMatches: ALL_PRACTICE_PROBLEMS.length,
    };
  }

  // Common aliases
  const normalizedQuery = q === "dp" ? "dynamic programming" : q;

  // 1. Direct Pattern Match
  const patternMatches = DSA_PATTERNS.filter(p =>
    p.name.toLowerCase().includes(normalizedQuery) ||
    normalizedQuery.includes(p.name.toLowerCase()) ||
    p.description.toLowerCase().includes(normalizedQuery)
  );

  // 2. Problem level search (matches title, pattern, subcategory, difficulty)
  const problemMatches = ALL_PRACTICE_PROBLEMS.filter(prob => {
    const titleMatch = prob.title.toLowerCase().includes(normalizedQuery);
    const patternMatch = prob.pattern.toLowerCase().includes(normalizedQuery);
    const subMatch = prob.subCategory ? prob.subCategory.toLowerCase().includes(normalizedQuery) : false;
    const diffMatch = prob.difficulty ? prob.difficulty.toLowerCase() === normalizedQuery : false;
    return titleMatch || patternMatch || subMatch || diffMatch;
  });

  // Group matched problems by pattern
  const matchedPatternIds = new Set<string>();
  for (const prob of problemMatches) {
    const pat = DSA_PATTERNS.find(p => p.name === prob.pattern);
    if (pat) matchedPatternIds.add(pat.id);
  }
  for (const pat of patternMatches) {
    matchedPatternIds.add(pat.id);
  }

  const resultPatterns: PatternGroup[] = [];
  for (const pat of DSA_PATTERNS) {
    if (matchedPatternIds.has(pat.id)) {
      const matchingInGroup = pat.problems.filter(prob =>
        problemMatches.some(m => m.id === prob.id) ||
        pat.name.toLowerCase().includes(normalizedQuery)
      );
      if (matchingInGroup.length > 0) {
        resultPatterns.push({
          ...pat,
          problemCount: matchingInGroup.length,
          problems: matchingInGroup,
        });
      }
    }
  }

  return {
    matchedPatterns: resultPatterns,
    matchedProblems: problemMatches,
    totalMatches: problemMatches.length,
  };
}
`;

fs.writeFileSync(path.resolve("client/src/data/dsaPatterns.ts"), tsContent, "utf-8");
console.log(`Generated client/src/data/dsaPatterns.ts with ${allProblems.length} problems across ${patternGroups.length} patterns.`);
