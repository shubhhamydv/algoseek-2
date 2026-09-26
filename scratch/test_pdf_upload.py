import fitz # PyMuPDF
import json
import base64
import urllib.request
import urllib.error

CODE_TEXT = """// LeetCode 76: Minimum Window Substring
class Solution {
public:
    string minWindow(string s, string t) {
        if (s.empty() || t.empty()) return "";
        vector<int> map(128, 0);
        for (char c : t) map[c]++;
        int count = t.size(), begin = 0, end = 0, d = INT_MAX, head = 0;
        while (end < s.size()) {
            if (map[s[end++]]-- > 0) count--;
            while (count == 0) {
                if (end - begin < d) d = end - (head = begin);
                if (map[s[begin++]]++ == 0) count++;
            }
        }
        return d == INT_MAX ? "" : s.substr(head, d);
    }
};"""

# 1. Create a clean PDF
doc = fitz.open()
page = doc.new_page()
page.insert_text((50, 72), CODE_TEXT, fontsize=11)
pdf_bytes = doc.tobytes()
doc.save("scratch/leetcode76.pdf")
print("Generated scratch/leetcode76.pdf, bytes:", len(pdf_bytes))

# Test PDF Ingestion via FastAPI
import io
boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
body = (
    f'--{boundary}\r\n'
    f'Content-Disposition: form-data; name="file"; filename="leetcode76.pdf"\r\n'
    f'Content-Type: application/pdf\r\n\r\n'
).encode('utf-8') + pdf_bytes + f'\r\n--{boundary}--\r\n'.encode('utf-8')

req = urllib.request.Request(
    "http://127.0.0.1:8000/ingest/pdf",
    data=body,
    headers={"Content-Type": f"multipart/form-data; boundary={boundary}"}
)
try:
    with urllib.request.urlopen(req) as resp:
        pdf_res = json.loads(resp.read().decode())
        print("\nPDF Ingest Response:", json.dumps(pdf_res, indent=2))
        doc_id = pdf_res["doc_id"]
except Exception as e:
    print("\nPDF Ingest Error:", e)
    doc_id = None

if doc_id:
    # Query PDF with "explain me the code"
    query = "explain me the code"
    answer_req = json.dumps({
        "question": query,
        "scope": "uploads",
        "doc_id": doc_id,
        "top_k": 5
    }).encode('utf-8')
    req = urllib.request.Request("http://127.0.0.1:8000/v1/answers/scoped", data=answer_req, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req) as resp:
            answer_res = json.loads(resp.read().decode())
            print("\nScoped Answer Response for PDF:", json.dumps(answer_res, indent=2))
    except Exception as e:
        print("\nScoped Answer Error:", e)
