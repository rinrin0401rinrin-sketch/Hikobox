#!/usr/bin/env python3

import json
import math
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
PDF_PATH = ROOT / "data/source-pdf/members.pdf"
MAP_PATH = ROOT / "data/batches/batch-02-50/photo-map.json"
RENDER_DIR = ROOT / "data/work/rendered"
CROP_DIR = ROOT / "data/work/crops"
PHOTO_DIR = ROOT / "data/photos"


def run(cmd):
    subprocess.run(cmd, check=True)


def centered_portrait_crop(box):
    target_ratio = 320 / 500
    crop_height = box["height"]
    crop_width = min(box["width"], int(round(crop_height * target_ratio)))
    x = box["x"] + (box["width"] - crop_width) // 2
    return {
        "x": x,
        "y": box["y"],
        "width": crop_width,
        "height": crop_height,
    }


def main():
    config = json.loads(MAP_PATH.read_text())
    boxes = {slot: centered_portrait_crop(box) for slot, box in config["boxes"].items()}
    entries = config["entries"]
    pages = sorted({entry["page"] for entry in entries})

    RENDER_DIR.mkdir(parents=True, exist_ok=True)
    CROP_DIR.mkdir(parents=True, exist_ok=True)
    PHOTO_DIR.mkdir(parents=True, exist_ok=True)

    for page in pages:
        output = RENDER_DIR / f"page-{page:02d}.png"
        run(
            [
                "swift",
                "scripts/render_pdf_page.swift",
                str(PDF_PATH),
                str(page),
                str(output),
                str(config["renderWidth"]),
            ]
        )

    for entry in entries:
        page_image = RENDER_DIR / f"page-{entry['page']:02d}.png"
        crop = boxes[entry["slot"]]
        raw_output = CROP_DIR / f"{entry['id']}-raw.jpg"
        final_output = PHOTO_DIR / f"{entry['id']}.jpg"

        run(
            [
                "swift",
                "scripts/crop_rect.swift",
                str(page_image),
                str(crop["x"]),
                str(crop["y"]),
                str(crop["width"]),
                str(crop["height"]),
                str(raw_output),
            ]
        )
        run(
            [
                "sips",
                "-z",
                "500",
                "320",
                str(raw_output),
                "--out",
                str(final_output),
            ]
        )

    print(f"generated {len(entries)} photos")


if __name__ == "__main__":
    main()
