

# AlgoSeek

AlgoSeek is a grounded study assistant for three kinds of material in one chat:
Pratyush DSA lectures, pasted notes, and text-based PDFs. Lecture evidence opens
at the cited YouTube timestamp; PDF evidence carries its page number; note
evidence shows the retrieved snippet.

Uploaded chunks live only in `user_uploads_<embedding_dimension>`. The original
`dsa_lectures_<embedding_dimension>` collection is neither changed nor reindexed
by this feature.

## Run locally (verified on Windows PowerShell)

Prerequisites: Node.js 24+, pnpm 10+, Python 3.11 or 3.12, and
[uv](https://docs.astral.sh/uv/). Docker Desktop is optional.

First-time setup:

```powershell
Copy-Item .env.example .env
pnpm install --frozen-lockfile
uv venv ai-service/.venv --python 3.12
uv pip install --python ai-service/.venv/Scripts/python.exe -e "ai-service[dev]"
```

Then keep these two terminals open from the repository root:

```powershell
# Terminal 1 — FastAPI / ingestion / retrieval
$env:PYTHONPATH = "$PWD/ai-service"
$env:YTRAG_QDRANT_PATH = "$PWD/runtime/qdrant"
$env:QDRANT_URL = ""
ai-service/.venv/Scripts/python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

```powershell
# Terminal 2 — React + Express + tRPC
pnpm dev
```

Open `http://127.0.0.1:3000`. The default `LIVE_AI_ENABLED=false` retains the
credential-free local lecture-preview corpus while uploaded material always uses
FastAPI and Qdrant. To use a populated lecture Qdrant collection, set
`LIVE_AI_ENABLED=true`; do not enable it against an empty lecture collection.

To run Qdrant as a shared container instead, start `docker compose up -d qdrant`
and omit the two `YTRAG_*`/`QDRANT_URL` lines above. The supplied `.env.example`
already points to the container at `http://127.0.0.1:6333`.

On macOS/Linux, replace `ai-service/.venv/Scripts/python.exe` with
`ai-service/.venv/bin/python`.

## Demo flow

1. Select **My uploads** and upload
   `data/demo/dynamic-programming-study-guide.pdf`. Ask “What does memoization
   store?”; the result cites page 1.
2. Paste `data/demo/dynamic-programming-notes.txt` into the notes panel and ask
   a question from it.
3. Ask an unrelated question such as “Who won the 2022 FIFA World Cup?”; the
   app returns “It is not found in your material.” without using an answer
   provider.
4. Select **Pratyush lectures** and ask “Memoization aur tabulation ka
   difference?”; source cards link to the exact YouTube moments.

## Architecture and grounding

```text
React source selector + upload panel
        | typed tRPC (Zod validation)
Express upload bridge -- multipart --> FastAPI
                                     |-- text/PDF extraction + chunking
                                     |-- user_uploads_<dimension> Qdrant
Lecture preview / FastAPI lecture RAG |-- dsa_lectures_<dimension> Qdrant
```

PDF ingestion accepts only valid PDF signatures at 20 MB or less. PyMuPDF
extracts each page with one-based page metadata, cleans recurring page headers
and footers, joins hyphenated line wraps, and rejects scanned/image-only PDFs
that have no text layer. Text is chunked around 650 local-estimated tokens with
overlap, preserving fenced code blocks and definitions as units.

The scoped answer path filters upload retrieval by the required `doc_id`,
applies per-source configurable similarity thresholds before an LLM is called,
and sends only retrieved material to the model. Provider failures return an
extractive response from the retrieved material, never a generic answer.

## Verification

```powershell
pnpm check
pnpm test
$env:PYTHONPATH = "$PWD/ai-service"
ai-service/.venv/Scripts/python.exe -m pytest ai-service/tests -q
```


## Real Pratyush corpus and RAG migration

The application is now backed by the supplied Pratyush transcript corpus rather than only representative demo records. The import contains **126 lecture transcript files** and derives **2,495 timestamped transcript chunks** from their actual segment text. The imported files are under `data/pratyush/lectures.json` and `data/pratyush/chunks.json`; they are generated from the original `week3/ytscraper/transcripts` corpus and retain source video IDs, titles, language/model metadata, boundaries, text, and YouTube timestamp URLs.

The local preview path performs corpus-backed lexical retrieval so it remains usable without credentials. It never fabricates an answer or citation when no corpus match exists: it returns the source-grounded refusal and an empty evidence trail. When `LIVE_AI_ENABLED=true` and `AI_SERVICE_URL` is configured, the Node tRPC gateway calls the real Python service at `/v1/answers`. That service preserves the original `ytrag` implementation for Qdrant retrieval, source reranking, Groq/Gemini answer generation, refusal guards, and citation renumbering. The original `ytrag` package and its configuration are preserved under `ai-service/ytrag/`, with the FastAPI wrapper in `ai-service/app/main.py`.

```bash
# Optional production AI service boundary
LIVE_AI_ENABLED=true
AI_SERVICE_URL=https://your-python-rag-service.example.com
QDRANT_URL=https://your-qdrant-cluster.example.com
QDRANT_API_KEY=...
GROQ_API_KEY=...
YTRAG_LLM_MODEL=your-provider-model
```

The source corpus is included for migration and local verification. In production, move transcript artifacts to durable object storage and keep only object keys/checksums plus searchable metadata in the database; build the Qdrant collection from those artifacts using the preserved ingestion/reindex pipeline.


### YouTube and Whisper ingestion requirements

The preserved ingestion pipeline uses `yt-dlp` to enumerate playlist videos and download best-quality audio. For local or server deployment, set `YTRAG_ROOT` to a durable working directory, configure `YTRAG_COOKIES_FILE` when YouTube requires authentication, and review the configured download sleep range to avoid bulk-download throttling. Audio is an intermediate artifact and should be removed after successful transcription.

Transcription uses `faster-whisper` with `YTRAG_WHISPER_MODEL=large-v3` by default. The source-compatible settings are `YTRAG_WHISPER_DEVICE=auto`, `YTRAG_WHISPER_COMPUTE` optional, `YTRAG_WHISPER_LANG=en`, `YTRAG_WHISPER_BEAM=5`, and `YTRAG_WHISPER_BATCH=8`. The supplied corpus already contains the resulting JSON transcript artifacts, so the web preview does not need Whisper installed. A production ingestion worker does need the Python runtime and model storage.

```bash
YTRAG_ROOT=/durable/path/yt-rag
YTRAG_COOKIES_FILE=/durable/secrets/youtube-cookies.txt
YTRAG_WHISPER_MODEL=large-v3
YTRAG_WHISPER_DEVICE=auto
YTRAG_WHISPER_LANG=en
YTRAG_WHISPER_BATCH=8
YTRAG_CHUNK_SECONDS=75
YTRAG_CHUNK_OVERLAP=15
YTRAG_MIN_CHUNK_WORDS=15
YTRAG_EMBED_MODEL=all-MiniLM-L6-v2
YTRAG_TOP_K=6
YTRAG_MAX_DISTANCE=0.6
YTRAG_TITLE_BOOST=0.06
```

For a hosted semantic index, configure `QDRANT_URL`, `QDRANT_API_KEY`, and `YTRAG_COLLECTION`. Without `QDRANT_URL`, the original Python package uses its local Qdrant path from `YTRAG_QDRANT_PATH`; this is appropriate for a worker or self-hosted service, not for ephemeral autoscaling request containers. The source code retains the original embedding, index, answer, CLI, and evaluation modules under `ai-service/ytrag`.
