"""Build simplified, topology-consistent SVG paths for the 16 Polish voivodeships.

Usage (regenerates src/app/data/voivodeship-shapes.ts input):
  1. Download ne_10m_admin_1_states_provinces.geojson from Natural Earth (public domain).
  2. Keep the 16 features with adm0_a3 == "POL" as {"properties": {"iso": iso_3166_2}, "geometry": ...}.
  3. python3 scripts/voivodeship-map.py poland.geojson map.json 1.0

Input: GeoJSON (Natural Earth admin-1, public domain) filtered to Poland, properties.iso = PL-XX.
Output: JSON {iso: {"d": svg path, "label": [x, y]}} plus viewBox size.
Projection: Lambert conformal conic, standard parallels 50°N and 54°N, origin 52°N 19°E.
Simplification: Douglas-Peucker per shared arc (arcs split where the neighbouring polygon changes),
so both sides of a shared border keep exactly the same vertices.
"""
import json
import math
import sys

SRC, OUT = sys.argv[1], sys.argv[2]
TOLERANCE = float(sys.argv[3]) if len(sys.argv) > 3 else 1.2  # in output px
WIDTH = 700.0
MARGIN = 6.0

phi1, phi2, phi0, lam0 = map(math.radians, (50.0, 54.0, 52.0, 19.0))
n = math.log(math.cos(phi1) / math.cos(phi2)) / math.log(
    math.tan(math.pi / 4 + phi2 / 2) / math.tan(math.pi / 4 + phi1 / 2)
)
F = math.cos(phi1) * math.tan(math.pi / 4 + phi1 / 2) ** n / n
rho0 = F / math.tan(math.pi / 4 + phi0 / 2) ** n


def project(lon, lat):
    phi, lam = math.radians(lat), math.radians(lon)
    rho = F / math.tan(math.pi / 4 + phi / 2) ** n
    theta = n * (lam - lam0)
    return rho * math.sin(theta), rho0 - rho * math.cos(theta)


data = json.load(open(SRC, encoding="utf-8"))
rings = {}  # iso -> list of rings (list of (lon,lat) keys)
for feature in data["features"]:
    iso = feature["properties"]["iso"]
    geom = feature["geometry"]
    polys = [geom["coordinates"]] if geom["type"] == "Polygon" else geom["coordinates"]
    out = []
    for poly in polys:
        outer = poly[0]
        ring = [(round(p[0], 7), round(p[1], 7)) for p in outer]
        if ring[0] == ring[-1]:
            ring = ring[:-1]
        out.append(ring)
    rings[iso] = out

# Edge ownership: undirected edge -> set of isos.
edge_owner = {}
for iso, rs in rings.items():
    for ring in rs:
        for i in range(len(ring)):
            a, b = ring[i], ring[(i + 1) % len(ring)]
            key = (a, b) if a < b else (b, a)
            edge_owner.setdefault(key, set()).add(iso)

shared = sum(1 for s in edge_owner.values() if len(s) == 2)
print(f"edges: {len(edge_owner)}, shared: {shared}", file=sys.stderr)

# Projected + scaled coordinates.
allpts = {p for rs in rings.values() for ring in rs for p in ring}
proj = {p: project(*p) for p in allpts}
xs = [v[0] for v in proj.values()]
ys = [v[1] for v in proj.values()]
minx, maxx, miny, maxy = min(xs), max(xs), min(ys), max(ys)
scale = (WIDTH - 2 * MARGIN) / (maxx - minx)
HEIGHT = (maxy - miny) * scale + 2 * MARGIN
screen = {p: ((v[0] - minx) * scale + MARGIN, (maxy - v[1]) * scale + MARGIN) for p, v in proj.items()}


def dp(points, tol):
    """Douglas-Peucker on screen coords; endpoints kept."""
    if len(points) < 3:
        return points
    keep = [False] * len(points)
    keep[0] = keep[-1] = True
    stack = [(0, len(points) - 1)]
    while stack:
        s, e = stack.pop()
        ax, ay = screen[points[s]]
        bx, by = screen[points[e]]
        dx, dy = bx - ax, by - ay
        length = math.hypot(dx, dy)
        best, idx = -1.0, -1
        for i in range(s + 1, e):
            px, py = screen[points[i]]
            if length == 0:
                d = math.hypot(px - ax, py - ay)
            else:
                d = abs(dy * px - dx * py + bx * ay - by * ax) / length
            if d > best:
                best, idx = d, i
        if best > tol and idx > 0:
            keep[idx] = True
            stack.append((s, idx))
            stack.append((idx, e))
    return [p for p, k in zip(points, keep) if k]


def neighbour(a, b, iso):
    key = (a, b) if a < b else (b, a)
    others = edge_owner[key] - {iso}
    return min(others) if others else None


simplified = {}
for iso, rs in rings.items():
    out_rings = []
    for ring in rs:
        m = len(ring)
        nb = [neighbour(ring[i], ring[(i + 1) % m], iso) for i in range(m)]
        # Break vertices: where the neighbour of the incoming edge differs from the outgoing edge.
        breaks = [i for i in range(m) if nb[i - 1] != nb[i]]
        if not breaks:
            # Single neighbour all round: anchor at the extreme vertices so both sides agree.
            idx = sorted(range(m), key=lambda i: ring[i])
            breaks = sorted({idx[0], idx[-1]})
        result = []
        for k, start in enumerate(breaks):
            end = breaks[(k + 1) % len(breaks)]
            seg = [ring[(start + j) % m] for j in range(((end - start) % m or m) + 1)]
            # Canonical direction so both polygons simplify the identical sequence.
            canon = seg if seg[0] <= seg[-1] else seg[::-1]
            simp = dp(canon, TOLERANCE)
            if canon is not seg:
                simp = simp[::-1]
            result.extend(simp[:-1])
        out_rings.append(result)
    simplified[iso] = out_rings


def path_d(rs):
    parts = []
    for ring in rs:
        pts = [screen[p] for p in ring]
        parts.append("M" + "L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + "Z")
    return "".join(parts)


def inside(x, y, poly):
    c = False
    for i in range(len(poly)):
        x1, y1 = poly[i]
        x2, y2 = poly[i - 1]
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
            c = not c
    return c


def seg_dist(px, py, a, b):
    ax, ay = a
    bx, by = b
    dx, dy = bx - ax, by - ay
    t = 0 if dx == dy == 0 else max(0, min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
    return math.hypot(px - ax - t * dx, py - ay - t * dy)


def label_point(rs):
    """Pole of inaccessibility by grid search on the largest ring."""
    ring = max(rs, key=len)
    poly = [screen[p] for p in ring]
    xs = [p[0] for p in poly]
    ys = [p[1] for p in poly]
    best, bp = -1, None
    steps = 60
    for i in range(steps + 1):
        for j in range(steps + 1):
            x = min(xs) + (max(xs) - min(xs)) * i / steps
            y = min(ys) + (max(ys) - min(ys)) * j / steps
            if not inside(x, y, poly):
                continue
            d = min(seg_dist(x, y, poly[k], poly[k - 1]) for k in range(len(poly)))
            if d > best:
                best, bp = d, (x, y)
    return [round(bp[0], 1), round(bp[1], 1)]


result = {
    "width": WIDTH,
    "height": round(HEIGHT, 1),
    "regions": {
        iso: {"d": path_d(simplified[iso]), "label": label_point(rings[iso]), "points": sum(len(r) for r in simplified[iso])}
        for iso in sorted(simplified)
    },
}
json.dump(result, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"height {HEIGHT:.1f}; points {sum(v['points'] for v in result['regions'].values())}", file=sys.stderr)
