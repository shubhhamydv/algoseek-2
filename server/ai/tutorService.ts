export type TutorMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type TutorRequest = {
  question: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  track?: string;
};

export type TutorResponse = {
  answer: string;
  provider: "gemini" | "groq" | "offline-knowledge";
  model: string;
  failoverActive?: boolean;
  suggestions?: string[];
};

const SYSTEM_PROMPT = `You are UNSTUCK AI Tutor, an expert, encouraging software engineering mentor and computer science teacher.
Your mission is to help students learn and master computer science fundamentals, full-stack development, and coding interview preparation.

Core tracks and subjects:
1. Data Structures & Algorithms (Arrays, Linked Lists, Trees, Graphs, DP, Sorting, Searching)
2. Frontend Development (HTML5, Modern CSS, JavaScript ES6+, React, State Management)
3. Backend Engineering (Node.js, Express, REST APIs, System Design, Microservices)
4. Databases (PostgreSQL, MySQL, MongoDB, Indexing, ACID, Transactions, Query Optimization)
5. Programming Languages (C, C++, Java, Python)
6. Data Analytics (SQL, Pandas, NumPy, Business Intelligence)
7. Artificial Intelligence & Machine Learning (Foundations, Neural Networks, Scikit-Learn)

Guidelines for your answers:
- Deliver clear, high-yield conceptual explanations with intuitive real-world examples.
- When providing code, make it clean, well-commented, and idiomatic.
- If asked in Hindi or Hinglish, explain comfortably in natural Hinglish/English.
- Use markdown formatting: bold key concepts, bulleted lists for steps, and code blocks with language identifiers.
- Keep explanations structured, easy to digest, and actionable.`;

// Supported Gemini models in order of speed and current availability
const GEMINI_CANDIDATE_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.5-flash",
  "gemini-3.8-flash",
  "gemini-flash-latest",
  "gemini-2.5-flash",
  "gemini-1.5-flash",
];

// Groq models for instant failover (14,400 free queries/day)
const GROQ_CANDIDATE_MODELS = [
  process.env.YTRAG_GROQ_MODEL,
  "qwen/qwen3.8-27b",
  "openai/gpt-oss-120b",
  "openai/gpt-oss-20b",
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
].filter(Boolean) as string[];

async function tryGemini(
  geminiKey: string,
  systemPrompt: string,
  messages: TutorMessage[]
): Promise<{ answer: string; model: string } | null> {
  // Map messages to Gemini format
  const contents = messages.map(m => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  for (const model of GEMINI_CANDIDATE_MODELS) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10_000);

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents,
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 1200,
            },
          }),
          signal: controller.signal,
        }
      );

      clearTimeout(timer);

      if (response.ok) {
        const data = (await response.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (text) {
          return { answer: text, model: `Google Gemini (${model})` };
        }
      } else {
        // If 429 (rate-limit / quota), 404 (deprecated), or 503 (high demand)
        console.warn(`[AI Tutor] Gemini ${model} returned status ${response.status}`);
      }
    } catch {
      // Continue to next model if this one times out or errors
    }
  }
  return null;
}

async function tryGroq(
  groqKey: string,
  systemPrompt: string,
  messages: TutorMessage[]
): Promise<{ answer: string; model: string } | null> {
  for (const model of GROQ_CANDIDATE_MODELS) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12_000);

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.map(m => ({ role: m.role, content: m.content })),
          ],
          temperature: 0.3,
          max_tokens: 1200,
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (response.ok) {
        const data = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        const content = data.choices?.[0]?.message?.content?.trim();
        if (content) {
          return { answer: content, model: `Groq (${model})` };
        }
      } else {
        console.warn(`[AI Tutor] Groq ${model} returned status ${response.status}`);
      }
    } catch {
      // Continue to next candidate model
    }
  }
  return null;
}

/**
 * Intelligent domain knowledge fallback if both external providers exhaust or are offline
 */
function getDomainFallbackAnswer(question: string, track?: string): string {
  const q = question.toLowerCase();

  if (q.includes("two pointer") || q.includes("pointer")) {
    return `### 💡 Two Pointers Technique in DSA

**What it is:**  
The **Two Pointers** approach is an optimization pattern where two reference markers iterate through a data structure (usually an array or string) simultaneously to reduce time complexity from $O(N^2)$ to $O(N)$.

#### Common Patterns:
1. **Opposite Ends (Shrinking Window):**  
   - Left pointer starts at \`0\`, Right pointer starts at \`n - 1\`.
   - Used for **Pair Sum in Sorted Array**, **Valid Palindrome**, or **Container With Most Water**.
2. **Same Direction (Fast & Slow):**  
   - Slow pointer moves by 1 step, Fast pointer moves by 2 steps.
   - Used for **Cycle Detection in Linked Lists** (Floyd's algorithm) or **Finding the Middle of a List**.

\`\`\`python
# Example: Check if a sorted array has two numbers with target sum
def has_pair_with_sum(arr, target):
    left, right = 0, len(arr) - 1
    while left < right:
        current_sum = arr[left] + arr[right]
        if current_sum == target:
            return True
        elif current_sum < target:
            left += 1  # Need a larger sum
        else:
            right -= 1 # Need a smaller sum
    return False
\`\`\`

> 💡 *Tip:* Always check if sorting the array first makes the Two Pointers pattern applicable!`;
  }

  if (q.includes("index") || q.includes("b-tree") || q.includes("database") || q.includes("sql")) {
    return `### 🗄️ Database Indexing & B-Trees Explained

**Why Indexes Matter:**  
Without an index, the database must perform a **Full Table Scan** ($O(N)$), reading every disk page. With an index, it can find matching rows in **$O(\\log N)$** time.

#### 1. Why are B-Trees / B+ Trees Used?
- **Disk I/O Efficiency:** Disks read data in pages/blocks (e.g., 4KB or 8KB). B-Trees have high fan-out (hundreds of children per node), meaning the tree height is small (typically only 3 to 4 levels for millions of rows).
- **Sorted Range Scans:** B+ Trees keep all actual data pointers in linked leaf nodes, making range queries (\`WHERE age BETWEEN 20 AND 30\`) lightning fast.

\`\`\`sql
-- Example: Creating a composite index for fast lookups
CREATE INDEX idx_users_email ON users(email);

-- Composite index: Order matters! (Leftmost prefix rule)
CREATE INDEX idx_orders_customer_date ON orders(customer_id, order_date);
\`\`\`

> ⚠️ *Pro-Tip:* Don't over-index! Every index speeds up \`SELECT\` queries but slows down \`INSERT\`, \`UPDATE\`, and \`DELETE\` operations because the index tree must be updated.`;
  }

  if (q.includes("event loop") || q.includes("javascript") || q.includes("async")) {
    return `### ⚡ JavaScript Event Loop Explained

JavaScript is **single-threaded** (one call stack), but it handles asynchronous operations (like network requests and timers) non-blockingly using the **Event Loop**.

#### The Core Components:
1. **Call Stack:** Executes synchronous JavaScript code LIFO (Last In, First Out).
2. **Web APIs / Node APIs:** Handles background timers (\`setTimeout\`), HTTP requests (\`fetch\`), and DOM events.
3. **Microtask Queue:** Highest priority queue (Promises \`.then()\`, \`async/await\`, \`queueMicrotask\`). Emptied completely before any macrotask runs!
4. **Macrotask / Task Queue:** Regular tasks (\`setTimeout\`, \`setInterval\`, I/O).

#### Execution Order:
\`\`\`text
Synchronous Call Stack  -->  All Microtasks (Promises)  -->  One Macrotask (setTimeout)  -->  Render UI
\`\`\`

\`\`\`javascript
console.log("1"); // Synchronous

setTimeout(() => {
  console.log("2"); // Macrotask
}, 0);

Promise.resolve().then(() => {
  console.log("3"); // Microtask
});

console.log("4"); // Synchronous

// Output: 1, 4, 3, 2
\`\`\``;
  }

  // General helpful educational answer
  const trackName = track ? ` for **${track.toUpperCase()}**` : "";
  return `### 🎓 UNSTUCK AI Tutor: Answer & Study Guidance${trackName}

Regarding your question: **"${question}"**

1. **Core Concept:**  
   In computer science and engineering interviews, this is best approached by breaking the problem down into its fundamentals: **Inputs & Constraints**, **Algorithm/Architecture Choice**, and **Trade-offs (Time & Space)**.

2. **Step-by-Step Approach:**
   - **Step 1:** Clarify the constraints and edge cases (e.g., null values, memory boundaries, empty arrays).
   - **Step 2:** Formulate a brute-force solution to verify understanding and establish a baseline complexity.
   - **Step 3:** Optimize by leveraging appropriate data structures (Hash Maps for $O(1)$ lookups, Two Pointers/Sliding Window for arrays, or Indexing for database queries).
   - **Step 4:** Walk through a concrete dry-run with sample input.

> 💡 *Dual-Engine Protection:* Your chatbot has automated failover. If Gemini ever hits a rate or credit limit, Groq will seamlessly provide answers so you are never stuck!`;
}

export async function askAITutor(req: TutorRequest): Promise<TutorResponse> {
  const { question, history = [], track } = req;
  const trimmedQuestion = question.trim();

  if (!trimmedQuestion) {
    return {
      answer: "Please enter a question so I can help you!",
      provider: "offline-knowledge",
      model: "default",
    };
  }

  // Build message history
  const messages: TutorMessage[] = [
    ...history.slice(-8).map(h => ({
      role: h.role,
      content: h.content,
    })),
    { role: "user", content: trimmedQuestion },
  ];

  // Tailor system prompt with track context if available
  let specializedPrompt = SYSTEM_PROMPT;
  if (track) {
    specializedPrompt += `\n\nContext Note: The student is currently studying in the "${track}" section of UNSTUCK. Prioritize relevant concepts and examples from this domain.`;
  }

  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const groqKey = process.env.GROQ_API_KEY?.trim();

  // 1. PRIMARY: Try Google Gemini First
  if (geminiKey) {
    const geminiResult = await tryGemini(geminiKey, specializedPrompt, messages);
    if (geminiResult) {
      return {
        answer: geminiResult.answer,
        provider: "gemini",
        model: geminiResult.model,
      };
    }
    console.warn("[AI Tutor Failover] Gemini quota exhausted or unavailable. Instantly falling over to Groq...");
  }

  // 2. AUTOMATIC FAILOVER: Try Groq (14,400 free queries/day · ultra-low latency)
  if (groqKey) {
    const groqResult = await tryGroq(groqKey, specializedPrompt, messages);
    if (groqResult) {
      return {
        answer: groqResult.answer,
        provider: "groq",
        model: geminiKey ? `${groqResult.model} [Auto-Failover]` : groqResult.model,
        failoverActive: Boolean(geminiKey),
      };
    }
    console.warn("[AI Tutor Failover] Groq also unavailable. Falling back to UNSTUCK domain knowledge...");
  }

  // 3. TERTIARY: Safe Domain Knowledge Fallback (Guarantees zero crashes)
  return {
    answer: getDomainFallbackAnswer(trimmedQuestion, track),
    provider: "offline-knowledge",
    model: "UNSTUCK Domain Knowledge",
  };
}

export function getTutorConfigStatus() {
  const hasGroq = Boolean(process.env.GROQ_API_KEY?.trim());
  const hasGemini = Boolean(process.env.GEMINI_API_KEY?.trim());

  let activeProvider = "offline-knowledge";
  let activeModel = "UNSTUCK Knowledge Base";

  if (hasGemini && hasGroq) {
    activeProvider = "gemini-with-groq-failover";
    activeModel = "Google Gemini (Primary) ➔ Groq (Auto-Failover Backup)";
  } else if (hasGemini) {
    activeProvider = "gemini";
    activeModel = "Google Gemini 3.5 Flash (1,500 free queries/day)";
  } else if (hasGroq) {
    activeProvider = "groq";
    activeModel = process.env.YTRAG_GROQ_MODEL || "Groq (14,400 free queries/day)";
  }

  return {
    configured: hasGroq || hasGemini,
    dualEngineEnabled: hasGemini && hasGroq,
    activeProvider,
    activeModel,
    providers: {
      gemini: {
        configured: hasGemini,
        role: hasGemini ? "Primary Engine" : "Unconfigured",
        freeQuota: "1,500 requests/day · 15 RPM (Free Forever)",
      },
      groq: {
        configured: hasGroq,
        role: hasGemini ? "Automatic Failover Backup" : "Primary Engine",
        freeQuota: "14,400 requests/day · 30 RPM (Free Forever)",
      },
    },
  };
}
