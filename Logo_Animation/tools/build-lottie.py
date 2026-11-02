"""
Build the Lottie version of the Greenstreets logo animation.

    python Logo_Animation/tools/build-lottie.py

Writes Logo_Animation/lottie/greenstreets-logo.json.

Source of truth is greenstreets-logo-anim.js: every path, colour and position is READ from
it, so geometry can't drift. The TIMINGS below mirror buildTimeline() in that file by hand —
change one, change the other.

Mapping: GSAP timeline second T plays at speed 1.5, so Lottie frame = T / 1.5 * 60 = T * 40.

Easing: GSAP eases are fitted to the cubic bezier Lottie uses (fit_ease); the worst-case
error of each fit is printed. The two things a cubic ease can't express — a square riding
its stroke while turning with it, and that stroke's tip — are BAKED one key per frame from
the exact GSAP ease, so square and tip stay locked together.
"""
import json, math, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
JS = open(os.path.join(ROOT, 'greenstreets-logo-anim.js'), encoding='utf-8').read()

FPS = 60
SPEED = 1.5
def F(T): return T / SPEED * FPS            # timeline seconds → frame

# ── read the artwork out of the JS ───────────────────────────────────────────
def js_str(name):
    return re.search(r"var %s = '([^']+)'" % name, JS).group(1)
def js_arr(name):
    block = re.search(r"var %s = \[(.*?)\];" % name, JS, re.S).group(1)
    return re.findall(r"'([^']+)'", block)
def js_num(name):
    return float(re.search(r"var %s = ([\d.]+)" % name, JS).group(1))
def js_color(key):
    return re.search(r"%s: '(#[0-9a-fA-F]{6})'" % key, JS).group(1)

G_PATH = js_str('G_PATH')
SWOOSH_TOP, SWOOSH_BOTTOM = js_arr('SWOOSH_TOP'), js_arr('SWOOSH_BOTTOM')
CHECK_LINE = js_str('CHECK_LINE')
SWOOSH_DRAW_TOP, SWOOSH_DRAW_BOTTOM = js_str('SWOOSH_DRAW_TOP'), js_str('SWOOSH_DRAW_BOTTOM')
gs_block = re.search(r"var G_STROKES = \{(.*?)\};", JS, re.S).group(1)
G_STROKES = dict(re.findall(r"(\w+):\s*'([^']+)'", gs_block))
sq_block = re.search(r"var CHECK_SQUARES = \{(.*?)\};", JS, re.S).group(1)
CHECK_SQUARES = {k: [float(a), float(b), float(c)] for k, a, b, c in
                 re.findall(r"(\w+):\s*\[\s*([-\d.]+),\s*([-\d.]+),\s*([-\d.]+)\]", sq_block)}
VB = js_num('VB'); C = VB / 2
SEAL_R, POINT_R, POINT_COUNT, SQ = js_num('SEAL_R'), js_num('POINT_R'), int(js_num('POINT_COUNT')), js_num('SQ')
COL = {k: js_color(k) for k in ('navy', 'green', 'seal', 'sealGlow', 'point', 'mark')}
ORDER = ['top', 'left', 'bottom', 'center']   # Object.keys(G_STROKES) order in the JS

W = H = 368                                    # Lottie wants integer comp size
FIT = W / VB                                   # scale the 368.504 artwork onto it

# ── GSAP eases ───────────────────────────────────────────────────────────────
def power(p, kind):
    n = p + 1
    if kind == 'in': return lambda t: t ** n
    if kind == 'out': return lambda t: 1 - (1 - t) ** n
    return lambda t: (2 * t) ** n / 2 if t < .5 else 1 - (2 * (1 - t)) ** n / 2
def back(s, kind):
    if kind == 'out': return lambda t: (t - 1) ** 2 * ((s + 1) * (t - 1) + s) + 1
    return lambda t: t * t * ((s + 1) * t - s)
EASES = {
    'power1.out': power(1, 'out'), 'power1.inOut': power(1, 'inOut'), 'power1.in': power(1, 'in'),
    'power2.out': power(2, 'out'), 'power2.inOut': power(2, 'inOut'), 'power2.in': power(2, 'in'),
    'power3.out': power(3, 'out'), 'power3.inOut': power(3, 'inOut'),
    'back.out(3)': back(3, 'out'), 'back.in(2.5)': back(2.5, 'in'),
}

def bez1(a, b, t):  # 1-D cubic bezier from 0 to 1 with control values a, b
    u = 1 - t
    return 3 * u * u * t * a + 3 * u * t * t * b + t ** 3

def fit_ease(f):
    """Least-max fit of f to a CSS/Lottie cubic bezier (x1,y1,x2,y2); returns (params, max error)."""
    ss = [i / 160 for i in range(161)]
    def err(p):
        x1, y1, x2, y2 = p
        if not (0 <= x1 <= 1 and 0 <= x2 <= 1): return 9
        return max(abs(bez1(y1, y2, s) - f(bez1(x1, x2, s))) for s in ss)
    best = None
    for start in ([.42, 0, .58, 1], [.645, .045, .355, 1], [.77, 0, .175, 1], [.25, .46, .45, .94],
                  [.55, .055, .675, .19], [.175, .885, .32, 1.275], [.6, -.28, .735, .045]):
        p = start[:]; step = [.2] * 4; e = err(p)
        for _ in range(500):                    # coordinate search with shrinking steps
            improved = False
            for i in range(4):
                for d in (step[i], -step[i]):
                    q = p[:]; q[i] += d; eq = err(q)
                    if eq < e: p, e, improved = q, eq, True
            if not improved:
                step = [s / 2 for s in step]
                if max(step) < 1e-5: break
        if best is None or e < best[1]: best = (p, e)
    return best

FITTED = {}
def ease(name):
    if name not in FITTED: FITTED[name] = fit_ease(EASES[name])
    return FITTED[name][0]

# ── geometry: SVG path → cubic segments ──────────────────────────────────────
def arc_to_cubics(p0, rx, large, sweep, p1):
    x1, y1 = p0; x2, y2 = p1
    dx, dy = (x1 - x2) / 2, (y1 - y2) / 2
    r = rx; lam = (dx * dx + dy * dy) / (r * r)
    if lam > 1: r *= math.sqrt(lam)
    sign = -1 if large == sweep else 1
    num = r * r * r * r - r * r * (dx * dx + dy * dy)
    co = sign * math.sqrt(max(0, num) / (r * r * (dx * dx + dy * dy)))
    cx_, cy_ = co * dy, -co * dx
    cx, cy = cx_ + (x1 + x2) / 2, cy_ + (y1 + y2) / 2
    a0 = math.atan2(y1 - cy, x1 - cx); a1 = math.atan2(y2 - cy, x2 - cx)
    da = a1 - a0
    if sweep and da < 0: da += 2 * math.pi
    if not sweep and da > 0: da -= 2 * math.pi
    n = max(1, math.ceil(abs(da) / (math.pi / 2)))
    k = 4 / 3 * math.tan(da / n / 4)
    segs, a = [], a0
    for _ in range(n):
        b = a + da / n
        P0 = (cx + r * math.cos(a), cy + r * math.sin(a)); P3 = (cx + r * math.cos(b), cy + r * math.sin(b))
        C1 = (P0[0] - k * r * math.sin(a), P0[1] + k * r * math.cos(a))
        C2 = (P3[0] + k * r * math.sin(b), P3[1] - k * r * math.cos(b))
        segs.append((P0, C1, C2, P3)); a = b
    segs[-1] = (segs[-1][0], segs[-1][1], segs[-1][2], (x2, y2))
    return segs

def parse(d):
    """Absolute M/L/C/A/Z only (all this artwork uses). → (segments, closed)."""
    tok = re.findall(r"[MLCAZ]|-?\d*\.?\d+(?:e-?\d+)?", d)
    i, cur, start, segs, closed = 0, None, None, [], False
    def num():
        nonlocal i; i += 1; return float(tok[i - 1])
    while i < len(tok):
        c = tok[i]; i += 1
        if c == 'M': cur = start = (num(), num())
        elif c == 'L':
            p = (num(), num())
            if p != cur: segs.append((cur, cur, p, p))
            cur = p
        elif c == 'C':
            c1, c2, p = (num(), num()), (num(), num()), (num(), num())
            segs.append((cur, c1, c2, p)); cur = p
        elif c == 'A':
            rx, ry, rot, large, sweep, x, y = num(), num(), num(), num(), num(), num(), num()
            segs += arc_to_cubics(cur, rx, int(large), int(sweep), (x, y)); cur = (x, y)
        elif c == 'Z': closed = True
    return segs, closed

def to_lottie_shape(d):
    segs, closed = parse(d)
    v = [segs[0][0]] + [s[3] for s in segs]
    i_t = [(0, 0)] + [(s[2][0] - s[3][0], s[2][1] - s[3][1]) for s in segs]
    o_t = [(s[1][0] - s[0][0], s[1][1] - s[0][1]) for s in segs] + [(0, 0)]
    if closed and math.dist(v[0], v[-1]) < 1e-3:       # path returns to its start: merge
        i_t[0] = i_t[-1]; v, i_t, o_t = v[:-1], i_t[:-1], o_t[:-1]
    r = lambda p: [round(p[0], 3), round(p[1], 3)]
    return {'c': closed, 'v': [r(p) for p in v], 'i': [r(p) for p in i_t], 'o': [r(p) for p in o_t]}

def circle_path(r):  # starts at 12 o'clock, clockwise — matches the SVG circle under rotate(-90)
    k = 4 / 3 * math.tan(math.pi / 8) * r
    v = [[C, C - r], [C + r, C], [C, C + r], [C - r, C]]
    o = [[k, 0], [0, k], [-k, 0], [0, -k]]
    return {'c': True, 'v': v, 'i': [[-a, -b] for a, b in o], 'o': o}

class Sampler:
    """Arc-length lookup along a path: point and heading at a fraction of its length."""
    def __init__(self, d):
        self.pts = []
        for P0, C1, C2, P3 in parse(d)[0]:
            for j in range(0 if not self.pts else 1, 129):
                t = j / 128; u = 1 - t
                self.pts.append((u ** 3 * P0[0] + 3 * u * u * t * C1[0] + 3 * u * t * t * C2[0] + t ** 3 * P3[0],
                                 u ** 3 * P0[1] + 3 * u * u * t * C1[1] + 3 * u * t * t * C2[1] + t ** 3 * P3[1]))
        self.cum = [0]
        for a, b in zip(self.pts, self.pts[1:]): self.cum.append(self.cum[-1] + math.dist(a, b))
        self.L = self.cum[-1]
    def at(self, frac):
        s = max(0, min(1, frac)) * self.L
        j = next((k for k in range(1, len(self.cum)) if self.cum[k] >= s), len(self.cum) - 1)
        a, b = self.pts[j - 1], self.pts[j]
        seg = self.cum[j] - self.cum[j - 1] or 1
        t = (s - self.cum[j - 1]) / seg
        return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t), math.degrees(math.atan2(b[1] - a[1], b[0] - a[0]))

# ── Lottie property helpers ──────────────────────────────────────────────────
def static(v): return {'a': 0, 'k': v}
def rgb(h, a=None):
    c = [int(h[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    return c + ([a] if a is not None else [])

def anim(keys):
    """keys: [(frame, value, ease_to_next)], ease 'hold' | 'linear' | GSAP ease name | None (last)."""
    out = []
    for t, val, e in keys:
        val = val if isinstance(val, list) else [val]
        k = {'t': round(t, 4), 's': [round(x, 4) for x in val]}
        if e == 'hold': k['h'] = 1
        elif e:
            x1, y1, x2, y2 = (0, 0, 1, 1) if e == 'linear' else ease(e)
            n = len(val)
            k['o'] = {'x': [round(x1, 4)] * n, 'y': [round(y1, 4)] * n}
            k['i'] = {'x': [round(x2, 4)] * n, 'y': [round(y2, 4)] * n}
        out.append(k)
    return {'a': 1, 'k': out}

def tr(p=(0, 0), a=(0, 0), s=None, r=None, o=None):
    return {'ty': 'tr', 'p': p if isinstance(p, dict) else static(list(p)),
            'a': static(list(a)), 's': s or static([100, 100]), 'r': r or static(0),
            'o': o or static(100), 'sk': static(0), 'sa': static(0)}
def sh(path): return {'ty': 'sh', 'ks': static(path)}
def fill(hexc): return {'ty': 'fl', 'c': static(rgb(hexc, 1)), 'o': static(100), 'r': 1}
def stroke(hexc, w): return {'ty': 'st', 'c': static(rgb(hexc, 1)), 'o': static(100), 'w': static(w), 'lc': 1, 'lj': 1, 'ml': 10}
def trim(s=None, e=None): return {'ty': 'tm', 's': s or static(0), 'e': e or static(100), 'o': static(0), 'm': 1}
def grad(kind, s, e, color_stops, op_stops):
    k = []
    for pos, hexc in color_stops: k += [pos] + rgb(hexc)
    for pos, op in op_stops: k += [pos, op]
    return {'ty': 'gf', 'o': static(100), 'r': 1, 't': kind, 's': static(list(s)), 'e': static(list(e)),
            'g': {'p': len(color_stops), 'k': static(k)}, 'h': static(0), 'a': static(0)}
def group(items, name, transform=None): return {'ty': 'gr', 'nm': name, 'it': items + [transform or tr()]}

OP = None   # set once the timeline is known
IND = [0]
def layer(name, shapes, ks=None, **extra):
    IND[0] += 1
    L = {'ddd': 0, 'ind': IND[0], 'ty': 4, 'nm': name, 'parent': 1, 'sr': 1,
         'ks': ks or {'o': static(100), 'r': static(0), 'p': static([0, 0]), 'a': static([0, 0]), 's': static([100, 100])},
         'ao': 0, 'shapes': shapes, 'ip': 0, 'op': OP, 'st': 0, 'bm': 0}
    L.update(extra); return L
def ks_center(o=None, s=None, r=None):  # transform pivoting on the artwork centre (GSAP svgOrigin)
    return {'o': o or static(100), 'r': r or static(0), 'p': static([C, C]), 'a': static([C, C]), 's': s or static([100, 100])}
def mask(path): return {'inv': False, 'mode': 'a', 'pt': static(path), 'o': static(100), 'x': static(0), 'nm': 'G'}

# ── timings — mirror buildTimeline() in greenstreets-logo-anim.js ────────────
BREAK = 1.45; FLY = BREAK + 0.2; DRAW = FLY + 0.55; DRAW_DUR = 0.85
OFFS = {'top': 0, 'left': 0, 'bottom': 0.08, 'center': 0.16}
DONE = DRAW + 0.16 + DRAW_DUR
SW = DRAW + 0.35
END = DONE + 0.1 + 0.7
OP = math.ceil(F(END))

def build():
    G = to_lottie_shape(G_PATH)
    layers = []

    # sheen: a gradient bar crossing the G, clipped to it
    bar = group([{'ty': 'rc', 'p': static([0, 0]), 's': static([110, VB + 80]), 'r': static(0), 'd': 1},
                 grad(1, (-55, 0), (55, 0), [(0, '#ffffff'), (.5, '#ffffff'), (1, '#ffffff')], [(0, 0), (.5, .75), (1, 0)])],
                'bar', tr(p=anim([(0, [-85, C], 'hold'), (F(DONE + .1), [-85, C], 'power1.inOut'), (F(END), [VB + 60 + 55, C], None)])))
    layers.append(layer('sheen', [group([bar], 'sheen', tr(p=(C, C), a=(C, C), r=static(18)))], hasMask=True, masksProperties=[mask(G)]))

    # the four squares
    for k in reversed(ORDER):
        fx, fy, frot = CHECK_SQUARES[k]
        d = math.hypot(fx - 190, fy - 192) or 1
        cx, cy = fx + (fx - 190) / d * 6, fy + (fy - 192) / d * 6
        S = Sampler(G_STROKES[k]); (sx, sy), srot = S.at(0)
        at = DRAW + OFFS[k]
        pos = [(0, [fx, fy], 'hold'), (F(BREAK), [fx, fy], 'power2.out'), (F(BREAK + .18), [cx, cy], 'hold'),
               (F(FLY), [cx, cy], 'power3.inOut'), (F(FLY + .5), [sx, sy], 'hold')]
        rot = [(0, frot, 'hold'), (F(FLY), frot, 'power3.inOut'), (F(FLY + .5), srot, 'hold')]
        # ride: baked per frame from the exact GSAP ease, heading unwrapped so it never spins
        f0, f1 = F(at), F(at + DRAW_DUR)
        frames = [f0] + [f for f in range(math.floor(f0) + 1, math.ceil(f1))] + [f1]
        prev = srot
        for f in frames:
            (px, py), ang = S.at(EASES['power2.inOut']((f - f0) / (f1 - f0)))
            while ang - prev > 180: ang -= 360
            while ang - prev < -180: ang += 360
            prev = ang
            last = f == f1
            pos.append((f, [px, py], None if last else 'linear')); rot.append((f, ang, None if last else 'linear'))
        scale = [(0, [150, 150], 'hold'), (F(BREAK), [150, 150], 'power2.out'), (F(BREAK + .18), [130, 130], 'hold'),
                 (F(FLY), [130, 130], 'power3.inOut'), (F(FLY + .5), [100, 100], 'hold'),
                 (F(at + DRAW_DUR - .22), [100, 100], 'power2.in'), (F(at + DRAW_DUR + .02), [0, 0], None)]
        rect = group([{'ty': 'rc', 'p': static([0, 0]), 's': static([SQ, SQ]), 'r': static(1.5), 'd': 1}, fill(COL['mark'])], 'square')
        layers.append(layer('square ' + k, [rect],
            {'o': anim([(0, 0, 'hold'), (F(BREAK), 100, None)]), 'r': anim(rot), 'p': anim(pos), 'a': static([0, 0]), 's': anim(scale)}))

    layers.append(layer('G', [group([sh(G), fill(COL['mark'])], 'G')],
        {'o': anim([(0, 0, 'hold'), (F(DONE), 100, None)]), 'r': static(0), 'p': static([0, 0]), 'a': static([0, 0]), 's': static([100, 100])}))

    # the G drawn as four strokes, clipped to the real letter
    strokes = []
    for k in ORDER:
        S = Sampler(G_STROKES[k]); f0, f1 = F(DRAW + OFFS[k]), F(DRAW + OFFS[k] + DRAW_DUR)
        frames = [f0] + [f for f in range(math.floor(f0) + 1, math.ceil(f1))] + [f1]
        e = [(0, 0, 'hold')] + [(f, 100 * EASES['power2.inOut']((f - f0) / (f1 - f0)), None if f == f1 else 'linear') for f in frames]
        strokes.append(group([sh(to_lottie_shape(G_STROKES[k])), trim(e=anim(e)), stroke(COL['mark'], 30)], 'stroke ' + k))
    layers.append(layer('G strokes', strokes,
        {'o': anim([(0, 100, 'hold'), (F(DONE), 0, None)]), 'r': static(0), 'p': static([0, 0]), 'a': static([0, 0]), 's': static([100, 100])},
        hasMask=True, masksProperties=[mask(G)]))

    layers.append(layer('checkmark', [group([sh(to_lottie_shape(CHECK_LINE)),
            trim(e=anim([(0, 0, 'hold'), (F(.6), 0, 'power3.inOut'), (F(1.02), 100, None)])), stroke(COL['mark'], 30)], 'check')],
        ks_center(o=anim([(0, 100, 'hold'), (F(BREAK), 0, None)]),
                  s=anim([(0, [100, 100], 'hold'), (F(1.0), [100, 100], 'power2.out'), (F(1.14), [108, 108], 'power2.in'), (F(1.28), [100, 100], None)]))))

    # swooshes: drawn thick → thin through an alpha matte
    g36 = lambda cx, cy: grad(2, (cx, cy), (cx + 129.297, cy), [(0, COL['green']), (.7091, COL['green']), (.9214, COL['green'])], [(0, 0), (.7091, .5), (.9214, 1)])
    g48 = lambda s, e: grad(1, s, e, [(.0782, COL['green']), (.4201, COL['green']), (1, COL['green'])], [(.0782, 1), (.4201, .5), (1, 0)])
    for name, paths, fills, draw in (
        ('bottom', SWOOSH_BOTTOM, [g36(176.712, 197.453), g48((68.79, 315.076), (52.651, 222.394))], SWOOSH_DRAW_BOTTOM),
        ('top', SWOOSH_TOP, [g36(191.792, 171.051), g48((299.714, 53.428), (315.852, 146.11))], SWOOSH_DRAW_TOP)):
        layers.append(layer('swoosh %s matte' % name, [group([sh(to_lottie_shape(draw)),
            trim(e=anim([(0, 0, 'hold'), (F(SW), 0, 'power2.inOut'), (F(SW + .95), 100, None)])), stroke('#ffffff', 72)], 'reveal')], td=1))
        layers.append(layer('swoosh ' + name, [group([sh(to_lottie_shape(p)), f], 'part %d' % i) for i, (p, f) in enumerate(zip(paths, fills))], tt=1))

    seal = circle_path(SEAL_R)
    layers.append(layer('seal', [group([sh(seal), trim(
        s=anim([(0, 0, 'hold'), (F(SW - .15), 0, 'power2.inOut'), (F(SW + .55), 100, None)]),
        e=anim([(0, 0, 'power2.inOut'), (F(.7), 100, None)])), stroke(COL['seal'], 5)], 'ring')]))
    layers.append(layer('pulse', [group([sh(seal), stroke(COL['seal'], 3)], 'ring')],
        ks_center(o=anim([(0, 0, 'hold'), (F(1.0), 90, 'power2.out'), (F(1.6), 0, None)]),
                  s=anim([(0, [100, 100], 'hold'), (F(1.0), [100, 100], 'power2.out'), (F(1.6), [122, 122], None)]))))

    pts = []
    for i in range(POINT_COUNT):
        a = i / POINT_COUNT * 2 * math.pi - math.pi / 2
        x, y = round(C + math.cos(a) * POINT_R, 2), round(C + math.sin(a) * POINT_R, 2)
        tin, tout = .12 + .035 * i, 1.05 + .035 * (POINT_COUNT - 1 - i)
        s = anim([(0, [0, 0], 'hold'), (F(tin), [0, 0], 'back.out(3)'), (F(tin + .35), [100, 100], 'hold'),
                  (F(tout), [100, 100], 'back.in(2.5)'), (F(tout + .25), [0, 0], None)])
        pts.append(group([{'ty': 'el', 'p': static([x, y]), 's': static([10, 10]), 'd': 1}, fill(COL['point'])], 'point %d' % (i + 1),
                         tr(p=(x, y), a=(x, y), s=s)))
    layers.append(layer('points', pts))

    aura = group([{'ty': 'el', 'p': static([C, C]), 's': static([SEAL_R * 2] * 2), 'd': 1},
                  grad(2, (C, C), (C + SEAL_R, C), [(0, COL['sealGlow']), (.75, COL['sealGlow']), (1, COL['sealGlow'])], [(0, .38), (.75, .12), (1, 0)])], 'glow')
    layers.append(layer('aura', [aura], ks_center(
        o=anim([(0, 0, 'power2.out'), (F(.7), 100, 'hold'), (F(SW - .15), 100, 'power1.out'), (F(SW + .55), 0, None)]),
        s=anim([(0, [60, 60], 'power2.out'), (F(.7), [100, 100], None)]))))

    root = {'ddd': 0, 'ind': 1, 'ty': 3, 'nm': 'fit 368.504 → 368', 'sr': 1,
            'ks': {'o': static(100), 'r': static(0), 'p': static([0, 0]), 'a': static([0, 0]), 's': static([FIT * 100, FIT * 100])},
            'ao': 0, 'ip': 0, 'op': OP, 'st': 0, 'bm': 0}
    return {'v': '5.12.2', 'fr': FPS, 'ip': 0, 'op': OP, 'w': W, 'h': H, 'nm': 'Greenstreets logo', 'ddd': 0, 'assets': [],
            'markers': [{'tm': round(F(3.2), 2), 'cm': 'tagline', 'dr': 0}],
            'layers': layers + [root]}

if __name__ == '__main__':
    IND[0] = 1   # the root null is ind 1; content layers count from 2
    data = build()
    out = os.path.join(ROOT, 'lottie', 'greenstreets-logo.json')
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, 'w', encoding='utf-8') as fh: json.dump(data, fh, separators=(',', ':'))
    print('wrote', os.path.relpath(out, ROOT), '%.1f KB' % (os.path.getsize(out) / 1024), '| frames', OP, '@', FPS, 'fps =', '%.2f s' % (OP / FPS))
    for k, (p, e) in sorted(FITTED.items()):
        print('  %-13s cubic-bezier(%s)  max error %.3f' % (k, ', '.join('%.3f' % v for v in p), e))
