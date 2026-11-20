#!/usr/bin/env python3
"""Extract page images from phone-scanned PDFs (no text layer) so they can be read.

Usage:  python3 -I tools/pdf_pages.py "Libro 3.pdf" <out_dir>
Writes <out_dir>/<name>_p<N>.jpg (resized to 1600px with macOS `sips`).
Handles FlateDecode (raw RGB/gray) and DCTDecode (JPEG) image streams. No dependencies.
"""
import os, re, struct, subprocess, sys, zlib

src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
prefix = re.sub(r'\W+', '_', os.path.splitext(os.path.basename(src))[0])
data = open(src, 'rb').read()

def chunk(t, b):
    return struct.pack('>I', len(b)) + t + b + struct.pack('>I', zlib.crc32(t + b) & 0xffffffff)

n = 0
for m in re.finditer(rb'(\d+) 0 obj\s*<<(.*?)>>\s*stream\r?\n', data, re.S):
    d = m.group(2)
    if b'/Subtype /Image' not in d:
        continue
    w = int(re.search(rb'/Width (\d+)', d).group(1))
    h = int(re.search(rb'/Height (\d+)', d).group(1))
    if w < 300 or h < 300:
        continue  # skip masks/thumbnails
    L = int(re.search(rb'/Length (\d+)', d).group(1))
    raw = data[m.end():m.end() + L]
    n += 1
    tmp = os.path.join(out, f'{prefix}_p{n}.tmp')
    if b'DCTDecode' in d:
        open(tmp, 'wb').write(raw)
    else:
        px = zlib.decompress(raw)
        comps = len(px) // (w * h)
        rows = b''.join(b'\x00' + px[y * w * comps:(y + 1) * w * comps] for y in range(h))
        ct = {1: 0, 3: 2, 4: 6}[comps]
        open(tmp, 'wb').write(b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, ct, 0, 0, 0))
                              + chunk(b'IDAT', zlib.compress(rows, 6)) + chunk(b'IEND', b''))
    jpg = os.path.join(out, f'{prefix}_p{n}.jpg')
    subprocess.run(['sips', '-Z', '1600', '-s', 'format', 'jpeg', tmp, '--out', jpg], check=True, capture_output=True)
    os.remove(tmp)
    print(jpg)
