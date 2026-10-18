#!/usr/bin/env python3
"""Generate docs/sample-walk.json: a delivery zone in Newtown, Sydney plus a
simulated serpentine walk that covers about 70% of it. Standard library only.

    python3 tools/generate_sample_walk.py
"""
import json
import pathlib

MIN_LNG, MAX_LNG = 151.1730, 151.1790
MAX_LAT, MIN_LAT = -33.8935, -33.8975

zone = [[MAX_LAT, MIN_LNG], [MAX_LAT, MAX_LNG], [MIN_LAT, MAX_LNG], [MIN_LAT, MIN_LNG]]  # [lat, lng]

ROWS, STEPS = 7, 22
walk = []
for r in range(ROWS):
    lat = MAX_LAT - (MAX_LAT - MIN_LAT) * (r + 0.5) / ROWS
    for s in range(STEPS + 1):
        t = s / STEPS if r % 2 == 0 else 1 - s / STEPS
        walk.append({"lat": round(lat, 6), "lng": round(MIN_LNG + (MAX_LNG - MIN_LNG) * t, 6)})
walk = walk[: int(len(walk) * 0.7)]

out = pathlib.Path(__file__).resolve().parent.parent / "docs" / "sample-walk.json"
out.write_text(json.dumps({"name": "Spring Pizza Promo", "zone": zone, "walk": walk}))
print(f"Wrote {out} ({len(walk)} GPS points)")
