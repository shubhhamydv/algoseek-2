"""Create lightweight, sampled WebP sequences from the supplied RAG PNG archive.

Usage:
  python scripts/prepare_rag_frames.py --source <path-to-png-split.zip>

The source export contains 300 full-HD PNG frames (over 300 MB compressed). The
website deliberately samples that sequence to 150 desktop and 75 mobile frames,
then uses a canvas renderer with a small runtime image cache.
"""

from __future__ import annotations

import argparse
import io
import shutil
import zipfile
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
OUTPUT_ROOT = ROOT / "client" / "public" / "rag-sequence"
SOURCE_FRAME_COUNT = 300


def source_index(output_index: int, output_count: int) -> int:
    return round(output_index * (SOURCE_FRAME_COUNT - 1) / (output_count - 1))


def encode_sequence(
    archive: zipfile.ZipFile,
    output_dir: Path,
    count: int,
    size: tuple[int, int],
    quality: int,
) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    for output_index in range(count):
        source_number = source_index(output_index, count) + 1
        source_name = f"ezgif-frame-{source_number:03d}.png"
        with archive.open(source_name) as source_file:
            with Image.open(io.BytesIO(source_file.read())) as source:
                frame = source.convert("RGB").resize(size, Image.Resampling.LANCZOS)
                frame.save(
                    output_dir / f"frame-{output_index:03d}.webp",
                    "WEBP",
                    quality=quality,
                    method=6,
                )
        print(f"{output_dir.name}: {output_index + 1}/{count}", flush=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", type=Path, required=True, help="PNG frame ZIP supplied for the animation")
    args = parser.parse_args()

    if not args.source.is_file():
        raise SystemExit(f"Archive not found: {args.source}")

    if OUTPUT_ROOT.exists():
        shutil.rmtree(OUTPUT_ROOT)

    with zipfile.ZipFile(args.source) as archive:
        encode_sequence(archive, OUTPUT_ROOT / "desktop", count=150, size=(960, 540), quality=76)
        encode_sequence(archive, OUTPUT_ROOT / "mobile", count=75, size=(640, 360), quality=70)


if __name__ == "__main__":
    main()
