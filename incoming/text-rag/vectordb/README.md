# VectorDB MERN AI

VectorDB MERN AI is a modular TypeScript and React migration of the supplied C++ educational vector-search application. It preserves the original 16-dimensional demo dataset, cosine/Euclidean/Manhattan metrics, brute-force/KD-Tree/HNSW search modes, benchmark and graph details, document chunking, Ollama embeddings, semantic retrieval, and RAG question answering.

## Architecture

The React client uses typed tRPC procedures exposed by the Express server. Persistent records live in the project database through Drizzle; the server rebuilds in-memory algorithm indexes from those records before search and benchmarking. The server prefers Ollama as an external, configurable AI runtime and falls back to the managed built-in AI provider when Ollama is unavailable.

```text
React dashboard
      ↓ typed tRPC
Express + tRPC server
      ├── vector service → brute force / KD-Tree / HNSW indexes
      ├── document service → 250-word chunks / 30-word overlap
      ├── Ollama service → embeddings + RAG generation
      └── project database → vector_items / document_chunks
```

## Features

The migrated dashboard includes algorithm and distance controls, top-k search, latency, result deletion, benchmark comparison, graph-layer details, semantic-space projection, demo-vector insertion, document embedding and deletion, Ollama status, and source-aware Ask AI responses.

## Environment

Create environment values through the project settings. The relevant optional variables are:

```bash
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_EMBED_MODEL=nomic-embed-text
OLLAMA_GEN_MODEL=llama3.2
```

The defaults match the original application. When Ollama is unavailable, the default managed fallback keeps document insertion and RAG usable; set `ENABLE_LOCAL_AI_FALLBACK=false` to require Ollama and receive explicit categorized errors.

## Development

```bash
pnpm install
pnpm dev
```

The managed project preview starts the application. In a local environment, the same server can be run with the scaffold's configured development command.

## Testing

```bash
pnpm test
pnpm check
pnpm build
```

The parity suite covers metric edge cases, nearest-neighbor ordering for the seeded vectors, KD-Tree rebuild behavior, HNSW deletion, and the exact 250/30 chunking rule. The existing authentication logout test remains in place.

## Typed API contract

| Procedure | Input | Output |
|---|---|---|
| `vector.list` | none | Persisted vectors with embeddings |
| `vector.insert` | metadata, category, 16D embedding | Inserted vector |
| `vector.delete` | numeric id | Boolean success |
| `vector.search` | 16D query, k, metric, algorithm | Results, distances, latency, selected mode |
| `vector.benchmark` | 16D query, k, metric | Brute-force, KD-Tree, and HNSW microsecond timings |
| `vector.graph` | none | HNSW nodes, edges, and layer counts |
| `vector.stats` | none | Count, dimensions, algorithms, metrics |
| `ai.status` | none | Ollama availability and configured models |
| `ai.documents` | none | Document chunk previews and word counts |
| `ai.insertDocument` | title, text | Chunk IDs, chunk count, embedding dimension |
| `ai.deleteDocument` | numeric id | Boolean success |
| `ai.searchDocuments` | question, k | Retrieved source chunks and distances |
| `ai.ask` | question, k | Answer, source contexts, document count |

## Migration mapping

| C++ component | MERN equivalent |
|---|---|
| `VectorDB` | `server/vector/vectorService.ts` plus project database repository |
| `BruteForce` | `server/vector/exact.ts` |
| `KDTree` | `server/vector/exact.ts` |
| `HNSW` | `server/vector/hnsw.ts` |
| `DocumentDB` | `server/ai/documentService.ts` plus `document_chunks` |
| `OllamaClient` | `server/ai/ollama.ts` |
| `index.html` | `client/src/pages/Home.tsx` and `client/src/index.css` |
| REST handlers | Typed tRPC procedures in `server/routers.ts` |

## Database design

`vector_items` stores the original metadata, category, serialized embedding, generated ID, and creation time. `document_chunks` stores the chunk title, body, serialized Ollama or fallback embedding, generated ID, and creation time. Embeddings are persisted as JSON text because the project database template does not provide a native vector column; the in-memory indexes preserve the original algorithm behavior.

## Behavioral notes

Demo search preserves the original synthetic keyword-to-16D query behavior. Document search uses Ollama embeddings when available, otherwise deterministic managed fallback embeddings and filters retrieved chunks using the original cosine-distance threshold of `0.7`. RAG follows the original prompt behavior: it prefers retrieved context but permits general knowledge when context is insufficient. The current project database is the supplied managed database abstraction rather than a separate MongoDB deployment; this avoids introducing an unsupported second database service while retaining persistent storage and a modular MERN-style Node/React architecture.

## AI provider behavior

The application prefers a live Ollama endpoint when available. In the managed preview, where Ollama is normally not running, it automatically uses a built-in server-side AI fallback: deterministic 16-dimensional embeddings for document indexing and the preconfigured server-side LLM for RAG generation. To require Ollama only in a deployment, set `ENABLE_LOCAL_AI_FALLBACK=false`; the default is enabled so **Embed & insert** works immediately in preview.
