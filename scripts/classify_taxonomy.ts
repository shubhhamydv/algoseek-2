import fs from "fs";
import path from "path";

const lectures = JSON.parse(fs.readFileSync("data/pratyush/lectures.json", "utf-8"));

export interface TopicDefinition {
  id: string;
  title: string;
  shortDesc: string;
  keywords: string[];
  lectureIds: string[];
}

const TOPICS: Array<Omit<TopicDefinition, "lectureIds">> = [
  {
    id: "arrays_hashing",
    title: "Arrays & Hashing",
    shortDesc: "Prefix sums, hash maps, frequency arrays, and contiguous subarrays",
    keywords: ["array", "hash", "map", "frequency", "subarray", "prefix", "kadane", "majority element", "duplicate", "vector"],
  },
  {
    id: "two_pointers",
    title: "Two Pointers",
    shortDesc: "Opposite ends, fast-slow pointers, 3Sum, and container with most water",
    keywords: ["two pointer", "2 pointer", "two-pointer", "3sum", "pair sum", "dutch national flag", "container with most water", "trap rain", "trapping rain"],
  },
  {
    id: "sliding_window",
    title: "Sliding Window",
    shortDesc: "Fixed and dynamic contiguous ranges, longest substring, and budget bounds",
    keywords: ["sliding window", "window", "longest substring", "subarray sum", "at most k", "exact k", "maximum sum subarray"],
  },
  {
    id: "linked_lists",
    title: "Linked Lists",
    shortDesc: "Reversal, cycle detection, fast & slow pointers, merge lists",
    keywords: ["linked list", "linkedlist", "node", "reverse linked", "cycle in linked", "floyd", "middle of the linked", "merge two sorted linked", "doubly linked", "linked list series"],
  },
  {
    id: "stacks_queues",
    title: "Stacks & Queues",
    shortDesc: "Monotonic stack, valid parentheses, next greater element, queue with stack",
    keywords: ["stack", "queue", "parentheses", "next greater", "previous smaller", "monotonic", "histogram", "sliding window maximum queue", "stack series"],
  },
  {
    id: "trees_bst",
    title: "Trees & Binary Search Trees",
    shortDesc: "Inorder, preorder, postorder, level order, LCA, height, and BST properties",
    keywords: ["tree", "binary tree", "bst", "inorder", "preorder", "postorder", "level order", "lca", "ancestor", "diameter of binary tree", "height of binary tree", "invert binary", "tree series"],
  },
  {
    id: "graphs_bfs_dfs",
    title: "Graphs (BFS & DFS)",
    shortDesc: "Connected components, rotten oranges, cycle detection, topological sort, Dijkstra",
    keywords: ["graph", "bfs", "dfs", "breadth", "depth", "rotten orange", "topological", "dijkstra", "bellman", "shortest path", "bipartite", "cycle in graph", "connected components", "graph series"],
  },
  {
    id: "recursion_backtracking",
    title: "Recursion & Backtracking",
    shortDesc: "Base cases, recursion trees, subsets, combinations, permutations, N-Queens",
    keywords: ["recursion", "recursive", "backtrack", "backtracking", "subset", "subsets", "combination", "permutation", "n-queen", "sudoku", "base case", "recursion series"],
  },
  {
    id: "dynamic_programming",
    title: "Dynamic Programming",
    shortDesc: "Memoization, tabulation, 1D/2D DP, knapsack, LCS, LIS, coin change",
    keywords: ["dp", "dynamic programming", "memoiz", "tabulation", "knapsack", "longest common subsequence", "coin change", "edit distance", "climbing stairs", "fibonacci", "dp series"],
  },
  {
    id: "greedy",
    title: "Greedy Algorithms",
    shortDesc: "Local optimal choice, interval scheduling, jump game, activity selection",
    keywords: ["greedy", "jump game", "interval", "intervals", "activity selection", "gas station", "minimum platform", "fractional knapsack", "assign cookies"],
  },
  {
    id: "binary_search",
    title: "Binary Search & Sorting",
    shortDesc: "Sorted search space, lower/upper bounds, rotated sorted array, search answers",
    keywords: ["binary search", "search space", "rotated sorted", "lower bound", "upper bound", "merge sort", "quick sort", "peak element", "koko eating", "search insert", "sorting"],
  },
  {
    id: "bit_manipulation",
    title: "Bit Manipulation & Math",
    shortDesc: "XOR operations, single number, power of two, bitwise masks, count set bits",
    keywords: ["bit", "bitwise", "xor", "single number", "power of two", "set bit", "counting bits", "prime", "sieve", "gcd"],
  },
];

const classification: TopicDefinition[] = TOPICS.map((t) => ({ ...t, lectureIds: [] }));

for (const lecture of lectures) {
  const title = lecture.title.toLowerCase();
  let matched = false;

  for (const topic of classification) {
    const isMatch = topic.keywords.some((kw) => {
      if (kw.length <= 4) {
        return new RegExp(`\\b${kw}\\b`, "i").test(title);
      }
      return title.includes(kw);
    });

    if (isMatch) {
      topic.lectureIds.push(lecture.id);
      matched = true;
    }
  }

  // Fallback to arrays & hashing if not classified by title
  if (!matched) {
    classification[0].lectureIds.push(lecture.id);
  }
}

console.log("=== Refined DSA Curriculum Classification ===");
for (const topic of classification) {
  console.log(`${topic.title.padEnd(30)}: ${topic.lectureIds.length.toString().padStart(2, " ")} lectures`);
}

const outputPath = path.resolve("data/pratyush/topic_taxonomy.json");
fs.writeFileSync(outputPath, JSON.stringify(classification, null, 2), "utf-8");
console.log(`Saved topic taxonomy to ${outputPath}`);
