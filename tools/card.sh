#!/usr/bin/env bash
# Takes a 640x400 screenshot of a web page with Chrome to use as a card picture.
#
# Usage:  tools/card.sh <page.html> <out.png> [seconds-to-wait] [button-to-click]
# Example: tools/card.sh games/puzzling/index.html games/puzzling/card.png 3
#
# The page is drawn at 1280x800 (like a laptop screen) and shrunk to half size.
#
# The button is a CSS selector like "#go" or ".start-button". It gets clicked
# as soon as the game loads (to get past a start screen). This only works for
# pages inside this repo.
#
# Pages inside this repo are opened through a little local web server (some
# games can't load their files from file://). Pages elsewhere use file://.
set -euo pipefail

page="$1"
out="$2"
wait_seconds="${3:-3}"
click="${4:-}"
root="$(cd "$(dirname "$0")/.." && pwd)"
page_abs="$(realpath "$page")"
out_abs="$(realpath -m "$out")"

server_pid=""
wrapper=""
cleanup() {
  [[ -n "$server_pid" ]] && kill "$server_pid" 2>/dev/null
  [[ -n "$wrapper" ]] && rm -f "$wrapper"
  true
}
trap cleanup EXIT

if [[ "$page_abs" == "$root"/* ]]; then
  port=$(( 8100 + RANDOM % 800 ))
  python3 -m http.server "$port" --directory "$root" >/dev/null 2>&1 &
  server_pid=$!
  sleep 1
  url="http://localhost:$port/${page_abs#"$root"/}"
  if [[ -n "$click" ]]; then
    # A tiny page that shows the game in an <iframe> and clicks the button.
    wrapper="$root/.card-wrapper-$$.html"
    cat > "$wrapper" <<HTML
<!doctype html>
<style>html, body, iframe { margin: 0; border: 0; width: 100%; height: 100%; display: block; overflow: hidden; }</style>
<iframe src="$url"></iframe>
<script>
  document.querySelector("iframe").onload = event =>
    event.target.contentDocument.querySelector("$click").click();
</script>
HTML
    url="http://localhost:$port/$(basename "$wrapper")"
  fi
else
  url="file://$page_abs"
fi

google-chrome --headless=new --disable-gpu --hide-scrollbars --mute-audio \
  --autoplay-policy=no-user-gesture-required \
  --window-size=1280,920 --force-device-scale-factor=0.5 \
  --virtual-time-budget=$(( wait_seconds * 1000 )) \
  --screenshot="$out_abs" "$url" 2>/dev/null

# Headless Chrome's page area is ~87px shorter than the window, so we asked for
# a taller window above. Now cut the picture down to exactly 640x400.
python3 "$root/tools/crop_png.py" "$out_abs" 400

echo "Saved $out"
