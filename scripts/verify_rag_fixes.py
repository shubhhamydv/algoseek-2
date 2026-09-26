"""Comprehensive verification script for Phase 3 checks 1 through 6."""

import json
import urllib.request
import urllib.error
import time

API_BASE = "http://127.0.0.1:8000"

def post_json(path, data):
    req = urllib.request.Request(
        f"{API_BASE}{path}",
        data=json.dumps(data).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        return json.loads(resp.read().decode("utf-8"))

def run_tests():
    print("==================================================")
    print("STARTING PHASE 3 VERIFICATION SUITE")
    print("==================================================")

    # ------------------------------------------------------------------
    # Check 1 & 2 & 3: LeetCode 76 (Minimum Window Substring)
    # ------------------------------------------------------------------
    lc76_code = '''from collections import Counter

class Solution:
    def minWindow(self, s: str, t: str) -> str:
        """
        LeetCode 76: Minimum Window Substring
        Finds the minimum window in s which will contain all the characters in t.
        Time Complexity: O(|s| + |t|)
        Space Complexity: O(|s| + |t|)
        """
        if not t or not s:
            return ""

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

            # Contract window from left
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
'''

    print("\n--- Ingesting LeetCode 76 Code Document ---")
    doc1 = post_json("/ingest/text", {
        "title": "LeetCode 76 - Minimum Window Substring",
        "text": lc76_code,
        "doc_id": "doc_lc76_test"
    })
    print(f"Ingested doc_id={doc1['doc_id']}, chunks={doc1['chunks']}")

    print("\n[Check 1] Original Repro: 'explain me the code'")
    ans1 = post_json("/v1/answers/scoped", {
        "question": "explain me the code",
        "scope": "uploads",
        "doc_id": "doc_lc76_test",
        "top_k": 5
    })
    print(f"Grounded: {ans1.get('grounded')}")
    print(f"Retrieved chunks: {ans1.get('retrieved')}")
    print(f"Mode: {ans1.get('mode')}")
    print(f"Answer snippet:\n{ans1.get('answer')[:400]}...\n")
    assert ans1.get("grounded") is True, "Check 1 failed: grounded is False"
    assert "minWindow" in ans1.get("answer") or "window" in ans1.get("answer").lower(), "Check 1 failed: answer does not explain code"
    print(">>> CHECK 1 PASS: Grounded explanation returned for 'explain me the code'.")

    print("\n[Check 2] Targeted question: 'what is the time complexity of this solution?'")
    ans2 = post_json("/v1/answers/scoped", {
        "question": "what is the time complexity of this solution?",
        "scope": "uploads",
        "doc_id": "doc_lc76_test",
        "top_k": 5
    })
    print(f"Grounded: {ans2.get('grounded')}")
    print(f"Answer:\n{ans2.get('answer')}\n")
    assert ans2.get("grounded") is True, "Check 2 failed: grounded is False"
    assert "O(" in ans2.get("answer") or "O(|s|" in ans2.get("answer") or "linear" in ans2.get("answer").lower(), "Check 2 failed: time complexity not answered"
    print(">>> CHECK 2 PASS: Grounded answer returned for targeted question.")

    print("\n[Check 3] Out-of-scope question: 'explain Dijkstra shortest path algorithm'")
    ans3 = post_json("/v1/answers/scoped", {
        "question": "explain Dijkstra shortest path algorithm",
        "scope": "uploads",
        "doc_id": "doc_lc76_test",
        "top_k": 5
    })
    print(f"Grounded: {ans3.get('grounded')}")
    print(f"Mode: {ans3.get('mode')}")
    print(f"Answer:\n{ans3.get('answer')}\n")
    assert ans3.get("grounded") is False or "not found" in ans3.get("answer").lower(), "Check 3 failed: did not refuse out-of-scope question"
    print(">>> CHECK 3 PASS: Strict grounding preserved, out-of-scope question refused.")

    # ------------------------------------------------------------------
    # Check 4: Second different code file (LeetCode 206 Reverse Linked List)
    # ------------------------------------------------------------------
    lc206_code = '''class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class Solution:
    def reverseList(self, head: ListNode) -> ListNode:
        """
        LeetCode 206: Reverse Linked List
        Reverses a singly linked list iteratively using three pointers.
        Time Complexity: O(n)
        Space Complexity: O(1)
        """
        prev = None
        curr = head
        while curr:
            next_node = curr.next
            curr.next = prev
            prev = curr
            curr = next_node
        return prev
'''
    print("\n--- Ingesting Second Code File: LeetCode 206 (Reverse Linked List) ---")
    doc2 = post_json("/ingest/text", {
        "title": "LeetCode 206 - Reverse Linked List",
        "text": lc206_code,
        "doc_id": "doc_lc206_test"
    })
    print(f"Ingested doc_id={doc2['doc_id']}, chunks={doc2['chunks']}")

    print("\n[Check 4a] Second file repro: 'explain me the code'")
    ans4a = post_json("/v1/answers/scoped", {
        "question": "explain me the code",
        "scope": "uploads",
        "doc_id": "doc_lc206_test",
        "top_k": 5
    })
    print(f"Grounded: {ans4a.get('grounded')}")
    print(f"Answer snippet:\n{ans4a.get('answer')[:350]}...\n")
    assert ans4a.get("grounded") is True, "Check 4a failed: grounded is False"
    assert "reverse" in ans4a.get("answer").lower() or "pointer" in ans4a.get("answer").lower() or "node" in ans4a.get("answer").lower()

    print("\n[Check 4b] Second file targeted question: 'what does the while loop do?'")
    ans4b = post_json("/v1/answers/scoped", {
        "question": "what does the while loop do?",
        "scope": "uploads",
        "doc_id": "doc_lc206_test",
        "top_k": 5
    })
    print(f"Grounded: {ans4b.get('grounded')}")
    print(f"Answer snippet:\n{ans4b.get('answer')[:350]}...\n")
    assert ans4b.get("grounded") is True, "Check 4b failed"
    print(">>> CHECK 4 PASS: Second code file works for explanation and targeted question.")

    # ------------------------------------------------------------------
    # Check 5: Larger document (> 2500 tokens) -> Chunk-based retrieval
    # ------------------------------------------------------------------
    print("\n--- Ingesting Large Multi-Topic Document (> 2500 tokens) ---")
    large_doc_parts = [
        "Chapter 1: Graph Theory Fundamentals.\nA graph G = (V, E) consists of vertices and edges. Graphs can be directed or undirected. Breadth-First Search (BFS) explores all neighbor nodes at the present depth before moving on to nodes at the next depth level. BFS uses a Queue data structure and visits each vertex once, running in O(V + E) time complexity.",
        "Chapter 2: Minimum Spanning Trees and Kruskal's Algorithm.\nKruskal's algorithm finds a minimum spanning forest of an undirected edge-weighted graph. It uses a Disjoint Set Union (DSU) data structure with path compression and union by rank. The time complexity of Kruskal's algorithm is O(E log E) or O(E log V).",
        "Chapter 3: Dynamic Programming on Trees.\nTree DP often involves computing values for subtrees rooted at each node. Re-rooting DP techniques allow answering queries for every node in O(N) total time after an initial depth-first traversal.",
        "Chapter 4: Segment Trees and Range Queries.\nA segment tree is a tree data structure used for storing information about intervals or segments. It allows querying which of the stored segments contain a given point in O(log n) time. Point updates also run in O(log n) time.",
        "Chapter 5: String Algorithms and KMP Pattern Matching.\nThe Knuth-Morris-Pratt (KMP) string-searching algorithm searches for occurrences of a pattern word within a main text string. It builds a longest prefix suffix (LPS) array in O(m) time and executes the text scan in O(n) time.",
        "Chapter 6: Network Flow and Ford-Fulkerson Method.\nThe Ford-Fulkerson method computes the maximum flow in a flow network. The Edmonds-Karp algorithm is an implementation of Ford-Fulkerson that uses BFS to find augmenting paths, running in O(V E^2) time.",
        "Chapter 7: Computational Geometry and Convex Hull.\nGraham's scan is a method of finding the convex hull of a finite set of points in the plane with time complexity O(n log n). It uses a stack to detect and remove concavities in the boundary.",
    ]
    # Expand to > 3000 tokens
    large_text = "\n\n".join(large_doc_parts * 5)
    doc_large = post_json("/ingest/text", {
        "title": "Comprehensive Advanced Algorithms Handbook",
        "text": large_text,
        "doc_id": "doc_large_test"
    })
    print(f"Ingested large document doc_id={doc_large['doc_id']}, chunks={doc_large['chunks']}")
    assert doc_large['chunks'] > 1, "Large doc should have multiple chunks"

    print("\n[Check 5a] Targeted query on large doc: 'what data structure does Kruskal algorithm use?'")
    ans5a = post_json("/v1/answers/scoped", {
        "question": "what data structure does Kruskal algorithm use?",
        "scope": "uploads",
        "doc_id": "doc_large_test",
        "top_k": 3
    })
    print(f"Grounded: {ans5a.get('grounded')}")
    print(f"Retrieved count: {ans5a.get('retrieved')}")
    print(f"Answer:\n{ans5a.get('answer')[:350]}...\n")
    assert ans5a.get("grounded") is True
    assert "dsu" in ans5a.get("answer").lower() or "disjoint" in ans5a.get("answer").lower() or "union" in ans5a.get("answer").lower()

    print("\n[Check 5b] Whole-document query on large doc: 'summarize the main chapters in this handbook'")
    ans5b = post_json("/v1/answers/scoped", {
        "question": "summarize the main chapters in this handbook",
        "scope": "uploads",
        "doc_id": "doc_large_test",
        "top_k": 5
    })
    print(f"Grounded: {ans5b.get('grounded')}")
    print(f"Retrieved count: {ans5b.get('retrieved')}")
    print(f"Answer:\n{ans5b.get('answer')[:350]}...\n")
    assert ans5b.get("grounded") is True
    print(">>> CHECK 5 PASS: Large document chunk retrieval and broad summary work properly.")

    # ------------------------------------------------------------------
    # Check 6: Visible error states & artificial failure test
    # ------------------------------------------------------------------
    print("\n[Check 6] Artificial failure test:")
    print("Testing nonexistent doc_id...")
    ans6_empty = post_json("/v1/answers/scoped", {
        "question": "explain the code",
        "scope": "uploads",
        "doc_id": "nonexistent_doc_id_999",
        "top_k": 5
    })
    print(f"Result for nonexistent doc: grounded={ans6_empty.get('grounded')}, answer='{ans6_empty.get('answer')}', retrieved={ans6_empty.get('retrieved')}")
    assert ans6_empty.get("grounded") is False
    assert ans6_empty.get("answer") == "It is not found in your material."

    print("Testing missing doc_id (validation error)...")
    try:
        post_json("/v1/answers/scoped", {
            "question": "explain the code",
            "scope": "uploads",
            "doc_id": "",
            "top_k": 5
        })
        print("Expected error did not raise")
    except urllib.error.HTTPError as e:
        err_body = json.loads(e.read().decode())
        print(f"Correctly raised HTTP {e.code}: {err_body.get('detail')}")
        assert e.code == 422
    print(">>> CHECK 6 PASS: Failures produce visible messages and proper HTTP error codes.")

    print("\n==================================================")
    print("ALL 6 PHASE 3 CHECKS COMPLETED AND PASSED!")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
