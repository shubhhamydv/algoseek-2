import sys
import json
import urllib.request
import urllib.error

sys.path.insert(0, 'ai-service')
from ytrag.ingestion import make_text_chunks, chunk_text, estimate_tokens

CODE_SAMPLE = """def minWindow(s: str, t: str) -> str:
    if not t or not s:
        return ""
    from collections import Counter
    dict_t = Counter(t)
    required = len(dict_t)
    l, r = 0, 0
    formed = 0
    window_counts = {}
    ans = float("inf"), None, None
    while r < len(s):
        character = s[r]
        window_counts[character] = window_counts.get(character, 0) + 1
        if character in dict_t and window_counts[character] == dict_t[character]:
            formed += 1
        while l <= r and formed == required:
            character = s[l]
            if r - l + 1 < ans[0]:
                ans = (r - l + 1, l, r)
            window_counts[character] -= 1
            if character in dict_t and window_counts[character] < dict_t[character]:
                formed -= 1
            l += 1
        r += 1
    return "" if ans[0] == float("inf") else s[ans[1] : ans[2] + 1]
"""

print("=== STEP 2: Text extraction & size ===")
print("Characters:", len(CODE_SAMPLE))
print("Estimated tokens:", estimate_tokens(CODE_SAMPLE))

print("\n=== STEP 3: Chunking ===")
chunks = make_text_chunks("test-doc-76", "LeetCode 76 Minimum Window", CODE_SAMPLE)
print("Chunks produced:", len(chunks))
for i, c in enumerate(chunks):
    print(f"Chunk {i}: length={len(c.text)}, tokens={estimate_tokens(c.text)}")
    print(f"Content:\n{repr(c.text)}\n---")

print("\n=== STEP 4 & 5: Ingest via FastAPI /ingest/text ===")
req_data = json.dumps({
    "title": "LeetCode 76 Minimum Window",
    "text": CODE_SAMPLE,
    "doc_id": "test-doc-76"
}).encode('utf-8')
req = urllib.request.Request("http://127.0.0.1:8000/ingest/text", data=req_data, headers={"Content-Type": "application/json"})
try:
    with urllib.request.urlopen(req) as resp:
        ingest_res = json.loads(resp.read().decode())
        print("Ingest response:", json.dumps(ingest_res, indent=2))
except Exception as e:
    print("Ingest error:", e)

print("\n=== STEP 6 & 7: Scoped Answer API Call ('explain me the code') ===")
query = "explain me the code"
answer_req = json.dumps({
    "question": query,
    "scope": "uploads",
    "doc_id": "test-doc-76",
    "top_k": 5
}).encode('utf-8')
req = urllib.request.Request("http://127.0.0.1:8000/v1/answers/scoped", data=answer_req, headers={"Content-Type": "application/json"})
try:
    with urllib.request.urlopen(req) as resp:
        answer_res = json.loads(resp.read().decode())
        print("Answer response:", json.dumps(answer_res, indent=2))
except urllib.error.HTTPError as e:
    print("HTTP error:", e.code, e.read().decode())
except Exception as e:
    print("Answer error:", e)
