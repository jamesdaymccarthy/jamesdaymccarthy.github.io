#!/usr/bin/env python3
"""Keeps only the top rows of a PNG:  python3 tools/crop_png.py <file.png> <height>

A PNG's pixels are stored row by row, and each row is only "filtered" using the
row above it. So keeping the top rows is easy: unzip, cut, zip again.
"""
import struct
import sys
import zlib

path, height = sys.argv[1], int(sys.argv[2])
data = open(path, "rb").read()

chunks = []
pos = 8  # skip the PNG signature
while pos < len(data):
    length, kind = struct.unpack(">I4s", data[pos:pos + 8])
    chunks.append((kind, data[pos + 8:pos + 8 + length]))
    pos += 12 + length

ihdr = dict(chunks)[b"IHDR"]
width, old_height, depth, color = struct.unpack(">IIBB", ihdr[:10])
if depth != 8 or ihdr[12] != 0:
    sys.exit("Only 8-bit, non-interlaced PNGs are supported")
channels = {0: 1, 2: 3, 4: 2, 6: 4}[color]
height = min(height, old_height)

pixels = zlib.decompress(b"".join(body for kind, body in chunks if kind == b"IDAT"))
pixels = pixels[:height * (1 + width * channels)]  # +1 for each row's filter byte


def chunk(kind, body):
    return struct.pack(">I", len(body)) + kind + body + struct.pack(">I", zlib.crc32(kind + body))


new_ihdr = struct.pack(">II", width, height) + ihdr[8:]
with open(path, "wb") as out:
    out.write(data[:8] + chunk(b"IHDR", new_ihdr) + chunk(b"IDAT", zlib.compress(pixels, 9))
              + chunk(b"IEND", b""))
