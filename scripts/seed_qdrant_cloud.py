"""Seed Qdrant Cloud cluster with pre-processed lecture chunks from data/pratyush/chunks.json.

Usage:
    python scripts/seed_qdrant_cloud.py

Requires QDRANT_URL and QDRANT_API_KEY set in .env or environment.
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

# Add ai-service to Python path so ytrag imports work seamlessly
REPO_ROOT = Path(__file__).resolve().parent.parent
AI_SERVICE_DIR = REPO_ROOT / "ai-service"
sys.path.insert(0, str(AI_SERVICE_DIR))

from dotenv import load_dotenv

# Load root .env first, then ai-service/.env if present
load_dotenv(REPO_ROOT / ".env")
load_dotenv(AI_SERVICE_DIR / ".env")

from ytrag.models import Chunk
from ytrag.index import upsert_chunks, ensure_collection, get_client, collection_name
from ytrag.embed import get_embedder


def main() -> None:
    qdrant_url = os.getenv("QDRANT_URL")
    qdrant_key = os.getenv("QDRANT_API_KEY")

    print("==================================================")
    print("   AlgoSeek — Qdrant Cloud Migration / Seeder     ")
    print("==================================================")
    print(f"Target Qdrant URL: {qdrant_url or '(Local embedded)'}")
    print(f"API Key present:   {'Yes' if qdrant_key else 'No'}")

    if not qdrant_url:
        print("\n[WARNING] QDRANT_URL is not set. This will write to local embedded storage.")
        print("To seed Qdrant Cloud, set QDRANT_URL and QDRANT_API_KEY in your .env file.\n")

    chunks_file = REPO_ROOT / "data" / "pratyush" / "chunks.json"
    if not chunks_file.exists():
        print(f"[ERROR] Chunks file not found at: {chunks_file}")
        sys.exit(1)

    print(f"Loading chunks from: {chunks_file} ...")
    with open(chunks_file, encoding="utf-8") as f:
        raw_chunks = json.load(f)

    print(f"Loaded {len(raw_chunks)} chunks.")

    # Convert raw JSON records to ytrag Chunk model objects
    chunks: list[Chunk] = []
    for item in raw_chunks:
        vid = item.get("videoId") or item.get("lectureId", "")
        start_sec = int(item.get("startSec", 0))
        chunks.append(
            Chunk(
                chunk_id=item.get("id") or f"{vid}:{start_sec}",
                video_id=vid,
                video_title=item.get("title", ""),
                start_sec=start_sec,
                end_sec=int(item.get("endSec", 0)),
                text=item.get("text", "").replace("\\n", "\n"),
            )
        )

    embedder = get_embedder()
    target_coll = collection_name()
    print(f"Embedding model:     {embedder.name} ({embedder.dim}-dimensional)")
    print(f"Target collection:   {target_coll}")

    print("\nEnsuring collection exists and index is prepared...")
    ensure_collection()

    print(f"Embedding and uploading {len(chunks)} chunks in batches...")
    upserted = upsert_chunks(chunks, batch_size=128)

    client = get_client()
    coll_info = client.get_collection(target_coll)
    total_points = coll_info.points_count

    print("\n==================================================")
    print(f"[SUCCESS] Uploaded {upserted} chunks!")
    print(f"Total points in collection '{target_coll}': {total_points}")
    print("Your Qdrant cluster is now ready for production RAG!")
    print("==================================================")


if __name__ == "__main__":
    main()
