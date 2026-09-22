# Live Embed & Insert Verification

Date: 2026-08-22

The managed preview reported `BUILT-IN AI` and `Built-in AI fallback active · Ollama optional` in the Documents tab while the Ollama service was unreachable.

A practical sample titled `Vector Search Quickstart` was submitted through **Embed & insert**. The UI showed the success message `Document embedded and indexed`, and the indexed chunk count increased from 1 to 2. The new document appeared in the indexed list with a 59-word preview. This verifies the end-to-end fallback embedding, database persistence, and success feedback path without requiring Ollama.

## Root cause

The previous failure was caused by the document workflow treating Ollama reachability as a hard prerequisite: when the local Ollama `/api/tags` request failed, the status became unavailable and the UI blocked or propagated the embedding mutation error. The database write path itself was healthy. The current fix changes the default behavior to a managed fallback provider, while retaining strict Ollama-only behavior behind `ENABLE_LOCAL_AI_FALLBACK=false`. After the updated server was restarted, the live browser reported `BUILT-IN AI`, accepted the sample, displayed `Document embedded and indexed`, and increased the indexed chunk count from 1 to 2.
