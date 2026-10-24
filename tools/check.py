#!/usr/bin/env python3
"""Our test! Checks that games.json is correct and every game has its files.

Run it from the top of the repo:  python3 tools/check.py
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FIELDS = {"title": str, "folder": str, "blurb": str, "fave": bool, "date": str}

problems = []

try:
    games = json.loads((ROOT / "games.json").read_text())
except json.JSONDecodeError as error:
    sys.exit(f"games.json is not valid JSON: {error}")

if not isinstance(games, list):
    sys.exit("games.json should be a list: [ ... ]")

seen_folders = set()
for number, game in enumerate(games, start=1):
    name = game.get("title", f"game #{number}")

    for field, kind in FIELDS.items():
        if field not in game:
            problems.append(f"{name}: missing \"{field}\"")
        elif not isinstance(game[field], kind):
            problems.append(f"{name}: \"{field}\" should be a {kind.__name__}")
    for field in game:
        if field not in FIELDS:
            problems.append(f"{name}: unknown field \"{field}\" (typo?)")

    date = game.get("date", "")
    if isinstance(date, str) and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", date):
        problems.append(f"{name}: date \"{date}\" should look like 2026-10-05")

    folder = game.get("folder")
    if isinstance(folder, str):
        if not re.fullmatch(r"[a-z0-9]+(-[a-z0-9]+)*", folder):
            problems.append(f"{name}: folder \"{folder}\" should be lowercase-with-dashes")
        if folder in seen_folders:
            problems.append(f"{name}: folder \"{folder}\" is used twice")
        seen_folders.add(folder)
        for needed in ["index.html", "card.png"]:
            if not (ROOT / "games" / folder / needed).is_file():
                problems.append(f"{name}: missing games/{folder}/{needed}")
        # Without <meta charset="utf-8">, emoji like 🧀 turn into gibberish.
        page = ROOT / "games" / folder / "index.html"
        if page.is_file() and "charset" not in page.read_text(errors="replace")[:2000].lower():
            problems.append(f"{name}: index.html needs <meta charset=\"utf-8\"> near the top")

# Folders that exist but aren't in games.json won't show up on the home page.
for path in sorted((ROOT / "games").glob("*/")):
    if path.name not in seen_folders:
        problems.append(f"games/{path.name}/ is not listed in games.json")

if problems:
    print("Problems found:")
    for problem in problems:
        print("  ✗", problem)
    sys.exit(1)

print(f"✓ All {len(games)} games look good!")
