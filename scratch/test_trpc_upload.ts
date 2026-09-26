import { appRouter } from "../server/routers";

async function main() {
  const caller = appRouter.createCaller({ user: null, req: {} as any, res: {} as any });
  
  // 1. Ingest text
  const code = `def minWindow(s: str, t: str) -> str:
    if not t or not s: return ""
    from collections import Counter
    dict_t = Counter(t)
    required = len(dict_t)
    l, r, formed = 0, 0, 0
    window_counts = {}
    ans = float("inf"), None, None
    while r < len(s):
        c = s[r]
        window_counts[c] = window_counts.get(c, 0) + 1
        if c in dict_t and window_counts[c] == dict_t[c]: formed += 1
        while l <= r and formed == required:
            c = s[l]
            if r - l + 1 < ans[0]: ans = (r - l + 1, l, r)
            window_counts[c] -= 1
            if c in dict_t and window_counts[c] < dict_t[c]: formed -= 1
            l += 1
        r += 1
    return "" if ans[0] == float("inf") else s[ans[1]:ans[2]+1]`;

  console.log("Ingesting text...");
  const doc = await caller.uploads.ingestText({
    title: "LeetCode 76",
    text: code,
  });
  console.log("Ingested doc:", doc);

  console.log("Asking question: 'explain me the code'...");
  const answer = await caller.uploads.answer({
    question: "explain me the code",
    scope: "uploads",
    docId: doc.docId,
    topK: 5,
  });
  console.log("Answer result:", JSON.stringify(answer, null, 2));
}

main().catch(console.error);
