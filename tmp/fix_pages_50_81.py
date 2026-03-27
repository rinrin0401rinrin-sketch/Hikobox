#!/usr/bin/env python3

import glob
import json
import os
import subprocess
from collections import defaultdict
from pathlib import Path


ROOT = Path("/Users/hasegawaakihiko/Documents/New project")
MODULE_CACHE = "/tmp/modulecache"
VERTICAL = [(195, 118), (195, 874), (195, 1630), (835, 118), (835, 874), (835, 1630)]
RIGHT_ONLY = [(835, 118), (835, 874), (835, 1630)]


def run(cmd):
    subprocess.run(cmd, check=True, cwd=ROOT, stdout=subprocess.DEVNULL)


def main():
    os.chdir(ROOT)
    Path(MODULE_CACHE).mkdir(parents=True, exist_ok=True)

    pages = defaultdict(list)
    for path in glob.glob("data/members/hr-*.json"):
        with open(path) as f:
            member = json.load(f)
        page = member.get("sourcePage")
        if 50 <= page <= 81:
            pages[page].append(member["id"])

    for page in range(50, 82):
        run(
            [
                "swift",
                "-module-cache-path",
                MODULE_CACHE,
                "scripts/render_pdf_page.swift",
                "data/source-pdf/members.pdf",
                str(page),
                f"tmp/refix-page-{page}-bulk.png",
                "1600",
            ]
        )

    updated = []
    for page in range(50, 81):
        ids = sorted(pages[page])
        if len(ids) != 6:
            raise SystemExit(f"page {page} expected 6 ids, got {len(ids)}: {ids}")
        for member_id, (x, y) in zip(ids, VERTICAL):
            run(
                [
                    "swift",
                    "-module-cache-path",
                    MODULE_CACHE,
                    "scripts/crop_rect.swift",
                    f"tmp/refix-page-{page}-bulk.png",
                    str(x),
                    str(y),
                    "360",
                    "560",
                    f"data/photos/{member_id}.jpg",
                ]
            )
            updated.append(member_id)

    ids81 = sorted(pages[81])
    if len(ids81) != 3:
        raise SystemExit(f"page 81 expected 3 ids, got {len(ids81)}: {ids81}")
    for member_id, (x, y) in zip(ids81, RIGHT_ONLY):
        run(
            [
                "swift",
                "-module-cache-path",
                MODULE_CACHE,
                "scripts/crop_rect.swift",
                "tmp/refix-page-81-bulk.png",
                str(x),
                str(y),
                "360",
                "560",
                f"data/photos/{member_id}.jpg",
            ]
        )
        updated.append(member_id)

    print(f"updated {len(updated)} photos")
    print(f"first={updated[0]} last={updated[-1]}")


if __name__ == "__main__":
    main()
