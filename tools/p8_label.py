#!/usr/bin/env python3
"""Turns a PICO-8 cart's label into a 640x400 card picture.

Usage:  python3 tools/p8_label.py <cart.p8> <card.png>

A .p8 file is just text! The label is in the __label__ section: 128 lines of
128 characters. Each character is one pixel, and it says which of PICO-8's
colors to use (0-f for the normal 16 colors, g-v for the 16 "secret" ones).
We make each pixel a 3x3 square (384x384) and put it in the middle of the card.
"""
import struct
import sys
import zlib

PALETTE = [
    # The 16 normal colors: 0 to f
    "000000", "1d2b53", "7e2553", "008751", "ab5236", "5f574f", "c2c3c7", "fff1e8",
    "ff004d", "ffa300", "ffec27", "00e436", "29adff", "83769c", "ff77a8", "ffccaa",
    # The 16 secret colors: g to v
    "291814", "111d35", "422136", "125359", "742f29", "49333b", "a28879", "f3ef7d",
    "be1250", "ff6c24", "a8e72e", "00b543", "065ab5", "754665", "ff6e59", "ff9d81",
]
DIGITS = "0123456789abcdefghijklmnopqrstuv"
WIDTH, HEIGHT, SCALE = 640, 400, 3

cart, out = sys.argv[1], sys.argv[2]
lines = open(cart).read().split("\n")
try:
    start = lines.index("__label__") + 1
except ValueError:
    sys.exit(f"{cart} has no label. In PICO-8, run the game, press F7, then save.")
label = lines[start:start + 128]

background = bytes.fromhex(PALETTE[0])
left = (WIDTH - 128 * SCALE) // 2
top = (HEIGHT - 128 * SCALE) // 2

rows = []
for y in range(HEIGHT):
    row = bytearray(background * WIDTH)
    label_y = (y - top) // SCALE
    if 0 <= y - top < 128 * SCALE:
        for label_x, char in enumerate(label[label_y]):
            color = bytes.fromhex(PALETTE[DIGITS.index(char)])
            x = left + label_x * SCALE
            row[x * 3:(x + SCALE) * 3] = color * SCALE
    rows.append(b"\x00" + bytes(row))  # 0 = "no filter" for this row


def chunk(kind, body):
    return struct.pack(">I", len(body)) + kind + body + struct.pack(">I", zlib.crc32(kind + body))


with open(out, "wb") as f:
    f.write(b"\x89PNG\r\n\x1a\n")
    f.write(chunk(b"IHDR", struct.pack(">IIBBBBB", WIDTH, HEIGHT, 8, 2, 0, 0, 0)))  # 8-bit RGB
    f.write(chunk(b"IDAT", zlib.compress(b"".join(rows), 9)))
    f.write(chunk(b"IEND", b""))
print(f"Saved {out}")
