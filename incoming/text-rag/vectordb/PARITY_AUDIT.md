# VectorDB C++ → MERN + AI Parity Audit

## Audit scope

This audit compares the supplied `main.cpp` and `index.html` with the migrated TypeScript/React implementation. Verification was performed with `pnpm test`, `pnpm check`, and `pnpm build`.

| Original capability | Migrated implementation | Status | Evidence |
|---|---|---|---|
| 20 seeded 16D demo vectors | `server/vector/demoData.ts` and persistent `vector_items` table | Pass | Seed data preserved; database duplicate-seeding bug fixed |
| Cosine, Euclidean, Manhattan metrics | `server/vector/metrics.ts` | Pass | Unit tests include zero-vector cosine behavior |
| Brute-force KNN | `BruteForceIndex` | Pass | Ordering and top-k parity test |
| KD-Tree KNN and rebuild after delete | `KDTreeIndex` | Pass | Rebuild and nearest-neighbor tests |
| HNSW multilayer graph | `HNSWIndex` | Pass with caveat | Search, deletion, layer, node, and edge behavior ported; deterministic JavaScript MT19937 approximation is tested for repeatability but not proven byte-identical to every C++ standard-library distribution implementation |
| Search, insert, delete, benchmark, graph, statistics | Typed tRPC `vector.*` procedures | Pass | Type check and dashboard integration |
| In-memory startup data | Persistent database plus rebuilt memory indexes | Improved | Database schema and startup rebuild implemented |
| Synthetic demo query embeddings | `textToEmbedding()` in React and server demo utility | Pass | Keyword category behavior retained |
| PCA semantic-space plot | Client-side PCA projection in `Home.tsx` | Pass | Centered covariance power iteration and 2D rendering |
| HNSW graph details | Interactive SVG node/edge view with layer statistics | Pass | Graph response drives nodes and edges; hover exposes metadata |
| 250-word chunks, 30-word overlap | `chunkText()` | Pass | Exact boundary and overlap tests |
| Ollama embeddings | Configurable `server/ai/ollama.ts` | Pass with dependency | Model, endpoint, timeout, and malformed-response handling are explicit |
| Document list/delete | Typed `ai.documents` and `ai.deleteDocument` | Pass | Persistent chunk storage and dashboard controls |
| Semantic retrieval threshold 0.7 | `retrieve()` | Pass | Cosine filter and top-k ordering preserved |
| RAG answer with source contexts | `ai.ask` and Ask AI tab | Pass with dependency | Prompt flow and contexts returned |
| Single-page dark neon UI | React dashboard and responsive CSS | Pass | Search, documents, and Ask AI tabs rebuilt |

## Genuine limitations

The managed project template provides a Drizzle-backed project database rather than a native MongoDB/Mongoose service. The migration therefore preserves the requested persistent database behavior through the project database abstraction, while keeping the application architecture modular Node.js/TypeScript + React. Replacing that persistence adapter with MongoDB would be a deployment-level infrastructure change, not a UI or algorithm change.

Ollama is an external runtime and is not available in the managed preview by default. Document embedding and RAG require a reachable Ollama-compatible endpoint with the configured models. The dashboard reports this state and returns descriptive failures, but it cannot generate real embeddings when the external service is offline.

The HNSW random-level generator uses a deterministic MT19937 implementation with float conversion intended to mirror the C++ configuration. Exact parity with `std::uniform_real_distribution<float>` can vary by standard-library implementation, so graph-layer counts should be treated as repeatable within the migrated runtime rather than as a guaranteed binary match to every C++ toolchain.

The automated suite currently emphasizes algorithm and chunking parity plus the existing authentication test. Full live database integration tests and live Ollama contract tests require external services and are not executed in the managed test process.
