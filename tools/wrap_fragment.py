#!/usr/bin/env python3
"""Turns "half a page" from claude.ai into a full web page.

Usage:  python3 tools/wrap_fragment.py games/<folder>/index.html "Game Title"

Some games from claude.ai are only a fragment: they start with <style> or <div>
and have no <head>. claude.ai fills in the rest when it shows them in the chat:
the charset (so emoji work), colors like var(--text-secondary), button styles,
and the Tabler Icons font. This adds all of that, so the game works on our site.
"""
import html
import re
import sys
from pathlib import Path

path, title = Path(sys.argv[1]), sys.argv[2]
fragment = path.read_text()

if re.match(r"\s*<!doctype|\s*<html", fragment, re.IGNORECASE):
    sys.exit(f"{path} is already a full page")

# Icon classes like "ti ti-player-play" come from Tabler Icons.
icons = ""
if re.search(r"""class=["'][^"']*\bti\b""", fragment):
    icons = ('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/'
             '@tabler/icons-webfont@3.19.0/dist/tabler-icons.min.css">\n')

page = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(title)}</title>
{icons}<style>
  /* claude.ai gave the game these colors and styles. On our site we set them ourselves. */
  :root {{
    color-scheme: dark;
    --text-primary: #ececf1;
    --text-secondary: #a1a1ad;
    --text-tertiary: #71717c;
    --surface-0: #15151c;
    --surface-1: #20202a;
    --surface-2: #2a2a36;
    --border: #2f2f3b;
    --border-strong: #454555;
    --border-accent: #7c8cff;
    --accent: #7c8cff;
    --radius: 8px;
  }}
  body {{
    margin: 0;
    padding: 0 16px;
    background: var(--surface-0);
    color: var(--text-primary);
    font-family: system-ui, sans-serif;
  }}
  body > div {{ max-width: 760px; margin: 0 auto; }}
  button {{
    font: inherit;
    color: var(--text-primary);
    background: var(--surface-1);
    border: 1px solid var(--border-strong);
    border-radius: var(--radius);
    padding: 6px 12px;
    cursor: pointer;
  }}
  button:hover {{ background: var(--surface-2); }}
  .sr-only {{
    position: absolute; width: 1px; height: 1px;
    overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap;
  }}
</style>
</head>
<body>
{fragment.strip()}
</body>
</html>
"""
path.write_text(page)
print(f"Wrapped {path}")
