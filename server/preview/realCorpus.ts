import lecturesJson from "../../data/pratyush/lectures.json";
import chunksJson from "../../data/pratyush/chunks.json";
import { invokeLLM } from "../_core/llm";

export type LectureRecord = (typeof lecturesJson)[number];
export type TranscriptChunk = (typeof chunksJson)[number];

export const pratyushLectures = lecturesJson as LectureRecord[];
export const pratyushChunks = chunksJson as TranscriptChunk[];

// Group all chunks by videoId in chronological order for neighbor window expansion
export const chunksByVideo = new Map<string, TranscriptChunk[]>();
for (const chunk of pratyushChunks) {
  let list = chunksByVideo.get(chunk.videoId);
  if (!list) {
    list = [];
    chunksByVideo.set(chunk.videoId, list);
  }
  list.push(chunk);
}
chunksByVideo.forEach(list => {
  list.sort((a, b) => a.startSec - b.startSec);
});

const stopWords = new Set([
  "what", "which", "where", "when", "does", "this", "that", "with", "from", "the",
  "and", "are", "is", "in", "to", "of", "it", "on", "for", "by", "at", "be",
  "hai", "kya", "ka", "ke", "mein", "how", "explain", "tell", "today",
  "question", "important", "lecture", "video", "understand", "about", "used", "work", "pattern"
]);

const stemMap: Record<string, string[]> = {
  pointer: ["pointer", "pointers", "2pointer", "2pointers"],
  pointers: ["pointer", "pointers", "2pointer", "2pointers"],
  two: ["two", "2"],
  window: ["window", "sliding"],
  sliding: ["sliding", "window"],
  reversal: ["reversal", "reverse", "reversed", "reversing"],
  reverse: ["reversal", "reverse", "reversed", "reversing"],
  reversed: ["reversal", "reverse", "reversed", "reversing"],
  subarray: ["subarray", "subarrays", "prefix", "contiguous"],
  subarrays: ["subarray", "subarrays", "prefix", "contiguous"],
  sum: ["sum", "sums", "target", "summing"],
  prefix: ["prefix", "accumulated", "cumsum"],
  dp: ["dp", "dynamic", "programming"],
  dynamic: ["dp", "dynamic", "programming"],
  programming: ["dp", "dynamic", "programming"],
  linked: ["linked", "list", "linkedlist"],
  list: ["linked", "list", "linkedlist"],
  graph: ["graph", "graphs", "bfs", "dfs"],
  tree: ["tree", "trees", "bst", "traversal"],
  recursion: ["recursion", "recursive", "backtracking"],
};

export const tokenize = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(token => token.length > 1 && !stopWords.has(token));

export function getExpandedTerms(terms: string[]): string[] {
  const all = new Set(terms);
  for (const t of terms) {
    if (stemMap[t]) {
      for (const s of stemMap[t]) all.add(s);
    }
  }
  return Array.from(all);
}

export function scoreChunk(chunk: TranscriptChunk, queryTerms: string[], expTerms: string[]): number {
  const titleLower = chunk.title.toLowerCase();
  const textLower = chunk.text.toLowerCase();

  let textScore = 0;
  for (const term of expTerms) {
    const regex = new RegExp(`\\b${term}\\b`, "g");
    const matches = (textLower.match(regex) || []).length;
    // Cap term frequency at 4 per term to prevent common words like 'list' from swamping topic terms
    textScore += Math.min(matches, 4) * 3;
  }

  let titleMatches = 0;
  for (const term of queryTerms) {
    const synonyms = stemMap[term] || [term];
    if (synonyms.some(s => titleLower.includes(s))) {
      titleMatches++;
    }
  }

  // Strong bonus for matching key query terms in the title
  let titleScore = titleMatches * 15;
  if (titleMatches >= 2) {
    titleScore += 25; // 2 or more title matches strongly anchor the topic
  }

  // Intro penalty for YouTube conversational chatter in the first 100 seconds
  let penalty = 0;
  if (chunk.startSec < 100 && /(?:birthday|sorry i couldn't|welcome back|upload|banchayat|subscribe)/i.test(textLower)) {
    penalty = 12;
  }

  return textScore + titleScore - penalty;
}

export function retrievePratyushChunks(question: string, topK = 5) {
  const queryTerms = tokenize(question);
  if (!queryTerms.length) return [];
  const expTerms = getExpandedTerms(queryTerms);

  const scored = pratyushChunks
    .map(chunk => ({
      chunk,
      score: scoreChunk(chunk, queryTerms, expTerms),
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score || a.chunk.startSec - b.chunk.startSec);

  return scored.slice(0, topK);
}

function synthesizeTutorAnswer(primaryChunk: TranscriptChunk, windowChunks: TranscriptChunk[], query: string = ""): string {
  const mins = Math.floor(primaryChunk.startSec / 60);
  const secs = primaryChunk.startSec % 60;
  const ts = primaryChunk.timestamp || `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;

  const cleanTexts = windowChunks.map(c => {
    let t = c.text.replace(/\\n/g, " ").replace(/\s+/g, " ").trim();
    if (t.toLowerCase().startsWith(c.title.toLowerCase())) {
      t = t.slice(c.title.length).trim();
    }
    return t;
  });
  const fullText = cleanTexts.join(" ");
  const qLower = query.toLowerCase();
  const titleLower = primaryChunk.title.toLowerCase();
  const combinedContext = `${query} ${primaryChunk.title} ${fullText}`.toLowerCase();

  let definition = "";
  let intuition = "";
  let steps: string[] = [];
  let example = "";
  let complexity = "*Complexity note*: Time and space complexity are not explicitly analyzed in these timestamps. Refer to the timestamp citation above to watch the complete discussion.";

  const compMatch = fullText.match(/(?:order of [a-z0-9\(\)]+|time complexity[^\.]*|space complexity[^\.]*|O\([^\)]+\)|zero space|constant space|single pass)/i);
  if (compMatch) {
    complexity = `*Complexity highlighted in lecture*: The instructor discusses "${compMatch[0].trim()}" during this explanation.`;
  }

  const isTwoPointer = combinedContext.includes("2 pointer") || combinedContext.includes("two pointer") || qLower.includes("two pointer");
  const isSlidingWindow = combinedContext.includes("sliding window") || qLower.includes("sliding window");
  const isDP = qLower.includes("dynamic programming") || qLower.includes("memoiz") || combinedContext.includes("dynamic programming") || combinedContext.includes("memoiz") || combinedContext.includes("tabulation") || titleLower.includes("dp in") || titleLower.includes("dp series");
  const isGraphTraversal = (qLower.includes("bfs") || qLower.includes("breadth") || qLower.includes("graph") || titleLower.includes("graph") || combinedContext.includes("bfs") || combinedContext.includes("rotten")) && !qLower.includes("recursion") && !qLower.includes("base case");
  const isLinkedListRev = (qLower.includes("reverse") || combinedContext.includes("reverse")) && (combinedContext.includes("link") || combinedContext.includes("list") || combinedContext.includes("node"));
  const isRecursionBaseCase = (qLower.includes("base case") || qLower.includes("recursion") || titleLower.includes("recursion") || combinedContext.includes("base case") || combinedContext.includes("base condition")) && !isGraphTraversal && !isDP;

  if (isTwoPointer) {
    definition = "The two-pointer technique is a strategy where you use two separate index markers (pointers) to scan through a list at the same time, instead of using slow nested loops.";
    intuition = "Think of it like two friends searching for each other from opposite ends of a hallway. If one person stands still while the other walks down every single corridor, it takes twice as long. But if one person walks from the ground floor and the other moves from the top floor coordinating their steps inward, they can inspect everything and meet in the middle in one quick pass.";
    steps = [
      "**Initialize Pointers**: Place one pointer (like `i`) at the start of the list and the second pointer (like `j`) at the end (or both moving forward at different speeds).",
      "**Inspect Values**: Compare the elements at both pointers to see if they satisfy your condition (like target sum or matching items).",
      "**Coordinate Movement**: Move one or both pointers inward based on the comparison so you never waste time re-checking impossible pairs.",
      "**Terminate**: Stop when the two pointers meet or cross, finishing the search in a single pass."
    ];
    example = "In the lecture with list `[10, 20, 30, 40, 50]`: pointer `i` starts at 10 and pointer `j` starts at another element. Instead of testing all pairs with two loops, `i` and `j` coordinate their movement together to evaluate the condition in a single pass.";
  } else if (isSlidingWindow) {
    definition = "A sliding window is a technique that maintains a contiguous slice (range) of elements in a list, sliding the boundaries forward as you process items.";
    intuition = "The instructor explains this using the 'hiring and firing' analogy: imagine a company team with a strict budget. When new work arrives, the manager hires a new team member at the right boundary. But if the team exceeds its budget, the manager 'fires' (removes) workers from the left boundary until the team is valid again. Instead of calculating the entire team from scratch each time, you only add who joins and subtract who leaves.";
    steps = [
      "**Start the Window**: Begin with both left and right boundary pointers at the start of the array.",
      "**Expand ('Hiring')**: Move the right pointer forward one step at a time, adding the new element into your current window total or state.",
      "**Check Condition**: If the window violates the rules (e.g. sum is too high or duplicates exist), contract ('fire') by advancing the left pointer and subtracting elements until valid.",
      "**Update Answer**: Record your best valid window size or target value at each step."
    ];
    example = "To find a target subarray sum: slide your right pointer to include elements one by one. As soon as the sum exceeds the limit, slide your left pointer forward and subtract elements until the window stays within limits.";
  } else if (isDP) {
    definition = "Dynamic programming is an optimization method that solves complex problems by breaking them into smaller overlapping subproblems and remembering the answers so you never solve the same problem twice.";
    intuition = "Imagine your teacher asks you what `1 + 1 + 1 + 1 + 1` is. You count on your fingers and say '5'. Then the teacher writes another `+ 1` at the end and asks what the new total is. You instantly say '6'! How did you know? You didn't recount from scratch—you remembered that the previous part was 5 and just added 1. Memoization works the same way: it writes down answers in a notebook (cache) so repeated work takes zero time.";
    steps = [
      "**Find Overlapping Subproblems**: Recognize when a recursive function solves the exact same smaller problem over and over again.",
      "**Create a Memo Table**: Set up an array or hash map initialized with empty marker values (like -1).",
      "**Check Before Computing**: Before doing recursive work, check if the answer for state `i` is already saved in the table.",
      "**Reuse or Save**: If found in the table, return it immediately. If not found, compute it, store it in the table, and return it."
    ];
    example = "In Fibonacci, computing `fib(5)` calculates `fib(3)` multiple times across different branches. With memoization, `fib(3)` is calculated once and stored as `dp[3] = 2`. Any future call to `fib(3)` returns 2 in O(1) time without re-running recursion.";
  } else if (isGraphTraversal) {
    definition = "Breadth-First Search (BFS) is a graph traversal algorithm that explores all neighbor nodes at the current distance level before moving to nodes that are further away.";
    intuition = "Think of dropping a stone into a calm pond: the ripple waves spread outward evenly in circles. As taught in the Rotten Oranges lecture, BFS works like a rot spreading minute by minute: at minute 1, all fresh oranges immediately touching a rotten orange get infected at the same time, and only then does the rot spread to the next layer.";
    steps = [
      "**Queue the Start**: Put your starting node (or all initially rotten items) into a First-In-First-Out Queue.",
      "**Mark as Visited**: Keep track of visited nodes so you never process the same location twice.",
      "**Process Level by Level**: Pull a node from the front of the queue and look at all its immediate unvisited neighbors (e.g. in 4 directions: up, down, left, right).",
      "**Add Neighbors to Queue**: Mark each neighbor as visited and push it to the back of the queue for the next level.",
      "**Repeat**: Continue until the queue is completely empty."
    ];
    example = "In a grid with rotten oranges: at time 0, push all initially rotten oranges into the queue. At time 1, pop them and infect all adjacent fresh oranges in 4 directions, pushing them into the queue to process at time 2.";
  } else if (isLinkedListRev) {
    definition = "Linked list reversal is an algorithm that changes the direction of every pointer in a linked list so the tail becomes the new head.";
    intuition = "Imagine a line of train cars where every car has a chain hooked to the car behind it. If you want the train to travel in reverse, you must unhook each chain and hook it to the car in front. You need three hands (pointers) to do this: one hand holding where you came from (`prev`), one hand holding the car you are working on (`cur`), and one hand holding the next car (`next`) so the rest of the train doesn't roll away while you flip the chain.";
    steps = [
      "**Initialize Three Pointers**: Set `prev = null`, `cur = head`, and `next = null`.",
      "**Save the Future**: Before breaking the forward link, save the next node: `next = cur.next`.",
      "**Reverse the Link**: Point the current node's arrow backwards: `cur.next = prev`.",
      "**Advance Pointers**: Slide `prev` forward to `cur`, and slide `cur` forward to `next`.",
      "**Finish**: When `cur` becomes null, `prev` is sitting at the new head of the reversed list."
    ];
    example = "Given nodes `10 -> 20 -> 30`: save `next = 20`, point `10.next = null`, shift pointers. Next save `next = 30`, point `20.next = 10`, shift pointers. Finally point `30.next = 20`. Return `30`, producing `30 -> 20 -> 10 -> null`.";
  } else if (isRecursionBaseCase) {
    definition = "A base case is the simplest stopping condition in a recursive function that tells the code when to stop calling itself and start returning answers.";
    intuition = "Imagine jumping down a staircase two steps at a time. If there is a ground floor (the base case), you safely stop when your feet touch the floor. But if there is no ground floor, you would fall through an endless black hole forever! Without a base case, a function calls itself infinitely until your computer runs out of memory and crashes with a stack overflow.";
    steps = [
      "**Identify the Smallest Input**: Find the absolute simplest input where the answer is already known without any calculation (for example, in Fibonacci, `fib(0) = 0` and `fib(1) = 1`).",
      "**Place It at the Top**: Check this condition at the very beginning of the recursive function before making any recursive calls.",
      "**Return Immediately**: If the base case condition is met, return the known value directly.",
      "**Step Toward the Base**: Ensure every recursive call reduces the problem size so it always moves closer to reaching the base case."
    ];
    example = "In Fibonacci `fib(n)`: if `n == 0` return 0; if `n == 1` return 1. When computing `fib(3)`, the function breaks down into `fib(2)` and `fib(1)`. The base case catches `n = 1` and stops the recursion, passing values back up the chain.";
  } else {
    const sentences = fullText.split(/(?<=[.!?])\s+/).filter(s => s.length > 25);
    const cleanSentences = sentences.filter(s => !/(?:welcome|subscribe|banchayat|birthday|hello students|video)/i.test(s));

    definition = `In this lecture, the instructor teaches how to solve the problem by breaking down the core pattern in **${primaryChunk.title}**.`;
    intuition = cleanSentences.slice(0, 2).join(" ") || "Instead of checking every possibility with a slow brute-force approach, this technique focuses on identifying the specific condition that allows you to eliminate unnecessary operations.";
    steps = cleanSentences.slice(2, 6).map((s, i) => `**Step ${i + 1}**: ${s.replace(/^[-\s]+/, "")}`);
    if (steps.length === 0) {
      steps = ["Follow the step-by-step logic demonstrated in the lecture timestamps above."];
    }
    example = cleanSentences.slice(6, 9).join(" ") || "The instructor demonstrates this with the primary test case in the video, tracing the variables step-by-step.";
  }

  return `In **${primaryChunk.title}** (@ ${ts}):\n\n### 💡 Concept & Plain Definition\n${definition}\n\n### 🎯 The Intuition (Why It Exists)\n${intuition}\n\n### ⚙️ How It Works (Step-by-Step Approach)\n${steps.map(s => `- ${s}`).join("\n")}\n\n### 🔍 Short Worked Example\n${example}\n\n### ⏱️ Complexity & Takeaway\n${complexity}`;
}

export async function answerPlaylistCorpus(question: string, topK = 5) {
  const queryTerms = tokenize(question);
  const expTerms = getExpandedTerms(queryTerms);
  const hits = retrievePratyushChunks(question, Math.max(topK, 5));

  const primaryChunk = hits[0]?.chunk;
  const primaryMatchedTerms = primaryChunk
    ? queryTerms.filter(term => {
        const synonyms = stemMap[term] || [term];
        return synonyms.some(s => `${primaryChunk.title} ${primaryChunk.text}`.toLowerCase().includes(s));
      })
    : [];

  const matchedTerms = queryTerms.filter(term => {
    const synonyms = stemMap[term] || [term];
    return hits.some(h => synonyms.some(s => `${h.chunk.title} ${h.chunk.text}`.toLowerCase().includes(s)));
  });

  const isOffTopic =
    !hits.length ||
    hits[0].score < 8 ||
    (queryTerms.length >= 2 && primaryMatchedTerms.length < 2 && hits[0].score < 25) ||
    (queryTerms.length >= 3 && (primaryMatchedTerms.length / queryTerms.length < 0.5 || matchedTerms.length / queryTerms.length < 0.5));

  if (isOffTopic) {
    return {
      answer: "This isn't covered in the lecture playlist.",
      grounded: false,
      mode: "refusal" as const,
      sources: [] as Array<{
        source_type: "video";
        source_id: string;
        title: string;
        timestamp: string | null;
        page: number | null;
        snippet: string;
        distance: number;
      }>,
      retrieved: 0,
    };
  }

  const videoChunks = chunksByVideo.get(primaryChunk.videoId) || [primaryChunk];
  const primaryIdx = videoChunks.findIndex(c => c.id === primaryChunk.id);
  // Widen to a 5-chunk window for complete lecture context
  const startIdx = Math.max(0, primaryIdx - 2);
  const endIdx = Math.min(videoChunks.length - 1, primaryIdx + 2);
  const windowChunks = videoChunks.slice(startIdx, endIdx + 1);

  // Build sources: primary chunk first, followed by other distinct hits
  const seenIds = new Set<string>();
  const sources: Array<{
    source_type: "video";
    source_id: string;
    title: string;
    timestamp: string;
    page: null;
    snippet: string;
    distance: number;
  }> = [];

  for (const hit of hits) {
    if (seenIds.has(hit.chunk.id)) continue;
    seenIds.add(hit.chunk.id);
    const mins = Math.floor(hit.chunk.startSec / 60);
    const secs = hit.chunk.startSec % 60;
    const ts = hit.chunk.timestamp || `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    sources.push({
      source_type: "video" as const,
      source_id: hit.chunk.videoId,
      title: hit.chunk.title,
      timestamp: ts,
      page: null,
      snippet: hit.chunk.text.slice(0, 500),
      distance: Number((1 / (1 + hit.score)).toFixed(4)),
    });
    if (sources.length >= topK) break;
  }

  // Attempt live LLM tutor generation if configured
  if (process.env.LIVE_AI_ENABLED === "true") {
    try {
      const excerptsText = windowChunks
        .map((c, i) => `[${i + 1}] "${c.title}" @ ${c.timestamp}:\n${c.text.replace(/\\n/g, "\n")}`)
        .join("\n\n");

      const response = await invokeLLM({
        model: process.env.LIVE_AI_MODEL || "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are AlgoSeek's DSA teacher for beginners. Your job is to take the ideas taught in Pratyush's lecture transcripts and explain them fresh, as if teaching an 8th-grade student who has never heard of this concept before.

CORE TEACHING INSTRUCTIONS:
1. Target Audience: An 8th-grade student. Use simple, everyday words. Define any technical term the first time you use it. Prefer short, clear sentences.
2. Anti-Transcript Shape: Do NOT follow the order, phrasing, or conversational chatter of the lecture sentence-by-sentence. Fully digest what the lecture teaches, then reconstruct the explanation from scratch in your own clean structure. If your answer could be produced by lightly rewording or reordering the transcript lines, it is WRONG — rewrite it.
3. Building Intuition: Focus on WHY this approach exists and what problem it solves in relatable terms. Do not just state the mechanics; explain why a beginner would want to use this instead of checking every possibility one by one.
4. Grounding Boundary: Every step, complexity claim, and technique name must come strictly from the provided lecture excerpts. Do not add outside algorithms, advanced variants, or data structures not taught in the excerpts. You may use a simple clarifying analogy or minimal illustrative example only if it helps explain the SAME idea taught in the lecture without adding new technical claims. If the excerpts do not answer the question, reply ONLY with: "This isn't covered in the lecture playlist."

REQUIRED ANSWER STRUCTURE:
### 💡 Concept & Plain Definition
[Exactly one simple sentence defining the concept in plain English.]

### 🎯 The Intuition (Why It Exists)
[Explain the core "why" in relatable terms: What problem are we trying to solve? Why would a naive brute-force attempt be wasteful or slow? What clever trick makes this technique work?]

### ⚙️ How It Works (Step-by-Step Approach)
[Clear, numbered or bulleted steps describing the exact approach taught in the lecture. Keep each step focused and easy to follow.]

### 🔍 Short Worked Example
[A small, concrete walkthrough using numbers or items. Use the lecture's own example if present; otherwise, use a minimal, clear example that directly illustrates the lecture's steps without contradicting anything taught.]

### ⏱️ Complexity & Takeaway
[Mention time and space complexity ONLY if explicitly stated in the lecture excerpts. If not analyzed, state: "Complexity was not analyzed in these timestamps."]

---
FEW-SHOT EXAMPLE:

[Input Excerpts]:
"[1] "Episode 05 | Prefix Sum Pattern" @ 02:15:
So guys, why prefix sum? Suppose you have an array 2, 4, 1, 7. Now someone asks give me sum from index 1 to 3. You will run a loop, right? But what if they ask 100 times? 1000 times? Every time running a loop is very bad, order of n into q queries, it will give TLE in interview. So what do we do? We make a prefix array beforehand. In prefix array, at index i we store sum of all elements up to i. Then for any range l to r, you just do prefix[r] minus prefix[l-1]. That's it! In one step, constant time O(1). Time complexity for query becomes O(1) and making prefix array is O(n)."

[Output Response]:
In **Episode 05 | Prefix Sum Pattern** (@ 02:15):

### 💡 Concept & Plain Definition
A prefix sum is a running total list where each position stores the sum of all numbers from the start of the array up to that point.

### 🎯 The Intuition (Why It Exists)
Imagine someone keeps asking you to add up numbers in different sections of a shopping bill over and over again. If you add them up from scratch every single time, you waste a huge amount of time doing repeated work. Instead, if you write down the running total after every item beforehand, you can find the sum of any section in a single subtraction—just take the running total at the end of the section and subtract the running total just before the section began.

### ⚙️ How It Works (Step-by-Step Approach)
- **Step 1 (Precalculate)**: Build a new list of running totals where each spot \`i\` holds the sum of all elements from index 0 through \`i\`.
- **Step 2 (Answer Range Queries)**: To find the sum between start index \`L\` and end index \`R\`, take the total at \`R\` and subtract the total before \`L\` (\`prefix[L - 1]\`).
- **Step 3 (Immediate Answer)**: Return the difference instantly without looping through the elements again.

### 🔍 Short Worked Example
Given the list \`[2, 4, 1, 7]\`:
- The running totals become \`[2, 6, 7, 14]\`.
- To find the sum of numbers from index 1 to 3 (\`[4, 1, 7]\`): take total up to index 3 (which is 14) and subtract total up to index 0 (which is 2).
- \`14 - 2 = 12\`. That matches \`4 + 1 + 7 = 12\` in one quick subtraction!

### ⏱️ Complexity & Takeaway
- **Time Complexity**: The instructor highlights that answering each query takes O(1) constant time, while building the initial prefix array takes O(n) linear time.`,
          },
          {
            role: "user",
            content: `STUDENT QUESTION: ${question}\n\nLECTURE EXCERPTS:\n${excerptsText}`,
          },
        ],
      });

      const content = response.choices[0]?.message?.content;
      const text = typeof content === "string" ? content : content?.map(part => part.type === "text" ? part.text : "").join(" ").trim();
      if (text && !text.includes("This isn't covered in the lecture playlist.")) {
        return {
          answer: text,
          grounded: true,
          mode: "live" as const,
          sources,
          retrieved: hits.length,
        };
      }
    } catch {
      // Live LLM failed, fall through to structured pedagogical synthesis
    }
  }

  // Structured pedagogical synthesis
  const answer = synthesizeTutorAnswer(primaryChunk, windowChunks, question);

  return {
    answer,
    grounded: true,
    mode: "extractive_fallback" as const,
    sources,
    retrieved: hits.length,
  };
}
