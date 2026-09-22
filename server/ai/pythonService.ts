export type PythonRagResponse = { answer: string; grounded: boolean; citations?: Array<{ title: string; timestamp: string; url: string; start_sec: number; video_id: string; distance?: number }>; retrieved?: number; boundary_version?: string; model?: string };

export async function requestPythonRag(question: string, topK: number): Promise<PythonRagResponse | null> {
  const baseUrl = process.env.AI_SERVICE_URL?.trim();
  if (!baseUrl || process.env.LIVE_AI_ENABLED !== "true") return null;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/v1/answers`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question, top_k: topK }), signal: controller.signal });
    if (!response.ok) throw new Error(`AI service returned ${response.status}`);
    return await response.json() as PythonRagResponse;
  } finally {
    clearTimeout(timer);
  }
}
