# -*- coding: utf-8 -*-
"""Build the CSS index the component library shows beside each specimen.

Reads the catalogue's own stylesheets (the copies in Component_Library/css) and,
for every class or custom property a specimen names in `data-cls`, records the
real declarations that define it: the base rule first, then its modifier and
state rules.

A rule counts as "defining" a class only when one of its comma parts targets the
element itself — `.cls`, `a.cls`, `.cls.on`, `.cls:hover`, `.cls::after`.
Descendant selectors are skipped: `.tbl td.gs-check-col input` is not what a
developer means by "the CSS for .gs-check-col". Rules with more than four comma
parts are skipped too — those are shared resets, not a component's definition.

Baked at build time rather than read from `document.styleSheets` at runtime
because these pages are opened by double-click: over `file://` Chrome refuses
`cssRules` on a linked stylesheet, which would leave the panel empty exactly
where it is most likely to be used.

Output: Component_Library/js/css-index.js — a plain script assigning
  window.CX_CSS_INDEX = {
    "rules":     {"<class>": {"f": "<sheet>", "r": [["<suffix>", [[prop,val],…]], …]}},
    "specimens": {"<data-name>": ["<class>", …]}}

  A `<script src>` rather than JSON because `fetch()` of a local file is blocked
  by CORS over `file://`, and these pages are opened by double-click.

Run from the repo root via Component_Library/tools/regenerate.sh.
"""
import html, io, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.path.dirname(HERE)

SHEETS = [                                     # browser load order
    ('greenstreets-theme.css', os.path.join(LIB, 'css', 'greenstreets-theme.css')),
    ('supplier-portal.css',    os.path.join(LIB, 'css', 'supplier-portal.css')),
    ('portal-extras.css',      os.path.join(LIB, 'css', 'portal-extras.css')),
]
PAGE = os.path.join(LIB, 'components.html')
OUT = os.path.join(LIB, 'js', 'css-index.js')

MAX_RULES_PER_CLASS = 5
MAX_DECLS_PER_CLASS = 26
MAX_CLASSES_PER_SPECIMEN = 6
MAX_COMMA_PARTS = 4

# Classes build-tsx.py maps to a component variant/tone. They are not always
# among a specimen's first few `data-cls` entries, so index them regardless —
# otherwise a variant silently drops out of the generated TSX.
ALWAYS = [
    'btn-p', 'btn-g', 'btn-g-sm', 'doc-del-pop-yes', 'btn-reminder', 'btn-reminder-urgent',
    'pill', 'pill-gs', 'pill-green', 'pill-amber', 'pill-red', 'pill-blue', 'pill-grey',
    'pill-expired', 'prod-status-complete', 'prod-status-incomplete', 'prod-status-ready',
    'prod-status-submitted', 'prod-status-delisted', 'fi', 'fi-search', 'fi-select',
    'grp', 'grp-hdr', 'grp-body', 'gs-row-check', 'tbl', 'modal-box', 'modal-overlay',
    'alert', 'alert-info', 'alert-warn', 'prog', 'prog-f', 'tgl', 'gs-seg-opt',
]

# ── css parsing ────────────────────────────────────────────────────────────
def strip_comments(t):
    return re.sub(r'/\*.*?\*/', '', t, flags=re.S)


def top_rules(text):
    """(selector, body) for top-level rules, flattening one @media level in."""
    out, i, n, buf = [], 0, len(text), ''
    while i < n:
        ch = text[i]
        if ch == '{':
            depth, j = 1, i + 1
            while j < n and depth > 0:
                if text[j] == '{':
                    depth += 1
                elif text[j] == '}':
                    depth -= 1
                j += 1
            sel, body = buf.strip(), text[i + 1:j - 1]
            low = sel.lower()
            if low.startswith(('@media', '@supports', '@container', '@layer')):
                out.extend(top_rules(body))
            elif not low.startswith('@'):
                out.append((sel, body))
            buf, i = '', j
        elif ch == '}':
            buf, i = '', i + 1
        else:
            buf += ch
            i += 1
    return out


def split_decls(body):
    """(prop, value) pairs, respecting nested () and quoted strings."""
    raw, buf, depth, quote = [], '', 0, None
    for ch in body:
        if quote:
            buf += ch
            if ch == quote:
                quote = None
            continue
        if ch in '"\'':
            quote = ch; buf += ch; continue
        if ch == '(':
            depth += 1
        elif ch == ')':
            depth -= 1
        if ch == ';' and depth == 0:
            raw.append(buf); buf = ''
        else:
            buf += ch
    if buf.strip():
        raw.append(buf)
    out = []
    for d in raw:
        d = ' '.join(d.split())
        if ':' not in d:
            continue
        p, _, v = d.partition(':')
        p, v = p.strip(), v.strip()
        if p and v and not p.startswith('/'):
            out.append([p, v])
    return out


# a selector part that targets the element itself, e.g. `.cls`, `a.cls:hover`
SELF_RX = re.compile(
    r'^(?:[a-zA-Z][\w-]*)?'
    r'((?:\.[A-Za-z][\w-]*|::?[a-zA-Z-]+(?:\([^)]*\))?|\[[^\]]*\])+)$')


def self_suffix(part, cls):
    """'' for the base rule, the trailing modifiers otherwise, None if no match."""
    part = part.strip()
    m = SELF_RX.match(part)
    if not m:
        return None
    tail = m.group(1)
    hit = re.search(r'\.' + re.escape(cls) + r'(?![\w-])', tail)
    if not hit:
        return None
    return (tail[:hit.start()] + tail[hit.end():]) or ''


# ── which classes does each specimen name? ─────────────────────────────────
def classes_from_spec(spec, all_classes):
    """Parse a data-cls string. Handles `.pill-gs|-green` shorthand and `.foo-*`."""
    out = []

    def add(c):
        if c and c not in out:
            out.append(c)

    for m in re.finditer(r'--[a-z0-9-]+|\.([A-Za-z][\w-]*)(-\*)?((?:\|-[\w-]+)*)', spec):
        if m.group(0).startswith('--'):
            add(m.group(0)); continue
        base, star, alts = m.group(1), m.group(2), m.group(3)
        if star:                                        # `.notif-stripe-*`
            for c in sorted(all_classes):
                if c.startswith(base + '-'):
                    add(c)
            continue
        add(base)
        if alts:                                        # `.pill-gs|-green|-red`
            stem = base.rsplit('-', 1)[0] if '-' in base else base
            for a in re.findall(r'\|-([\w-]+)', alts):
                add(stem + '-' + a)
    return out


def main():
    page = io.open(PAGE, encoding='utf-8').read()

    parsed = []
    for fname, path in SHEETS:
        if not os.path.exists(path):
            sys.exit('missing stylesheet: ' + path)
        parsed.append((fname, top_rules(strip_comments(io.open(path, encoding='utf-8').read()))))

    all_classes = set()
    for _, rules in parsed:
        for sel, _ in rules:
            all_classes.update(c[1:] for c in re.findall(r'\.[A-Za-z][\w-]*', sel))

    # root custom properties, for the token specimens
    root_vars = {}
    for fname, rules in parsed:
        for sel, body in rules:
            if sel.strip() in (':root', 'html', ':root,html'):
                for p, v in split_decls(body):
                    if p.startswith('--'):
                        root_vars[p] = (fname, v)

    specimens, wanted = {}, set()
    for m in re.finditer(r'data-name="([^"]*)"[\s\S]{0,900}?data-cls="([^"]*)"', page):
        # key by the DECODED name: the runtime looks these up with
        # getAttribute('data-name'), which returns `Body & muted copy`, not the
        # raw `Body &amp; muted copy` that appears in the file.
        name, spec = html.unescape(m.group(1)), m.group(2)
        keys = classes_from_spec(spec, all_classes)
        keys = [k for k in keys if k.startswith('--') or k in all_classes]
        specimens[name] = keys[:MAX_CLASSES_PER_SPECIMEN]
        wanted.update(specimens[name])
    wanted.update(c for c in ALWAYS if c in all_classes)

    rules_out = {}
    for cls in sorted(c for c in wanted if not c.startswith('--')):
        found = {}                                    # suffix -> (sheet, selector, decls)
        for fname, rules in parsed:
            for sel, body in rules:
                parts = [p.strip() for p in re.sub(r'\s+', ' ', sel).split(',') if p.strip()]
                if len(parts) > MAX_COMMA_PARTS:
                    continue
                sfx = None
                for p in parts:
                    s = self_suffix(p, cls)
                    if s is not None:
                        sfx = s; break
                if sfx is None:
                    continue
                decls = split_decls(body)
                if not decls:
                    continue
                if sfx in found:                       # later sheet overrides
                    merged = dict(found[sfx][2])
                    order = [p for p, _ in found[sfx][2]]
                    for p, v in decls:
                        if p not in merged:
                            order.append(p)
                        merged[p] = v
                    found[sfx] = (fname, sel, [[p, merged[p]] for p in order])
                else:
                    found[sfx] = (fname, sel, decls)
        if not found:
            continue
        # base rule first, then shortest modifiers
        keys = sorted(found, key=lambda s: (0 if s == '' else 1, len(s), s))[:MAX_RULES_PER_CLASS]
        budget, out_rules = MAX_DECLS_PER_CLASS, []
        for k in keys:
            fname, sel, decls = found[k]
            if budget <= 0:
                break
            out_rules.append([k, decls[:budget]])
            budget -= len(decls[:budget])
        rules_out[cls] = {'f': found[keys[0]][0], 'r': out_rules}

    for v in sorted(c for c in wanted if c.startswith('--')):
        if v in root_vars:
            fname, val = root_vars[v]
            rules_out[v] = {'f': fname, 'r': [['', [[v, val]]]]}

    data = {'rules': rules_out, 'specimens': specimens}
    header = ('/* css-index.js - GENERATED by Component_Library/tools/extract-css-index.py.\n'
              '   The declarations shown beside each specimen. Do not hand-edit. */\n')
    io.open(OUT, 'w', encoding='utf-8').write(
        header + 'window.CX_CSS_INDEX=' + json.dumps(data, separators=(',', ':'), sort_keys=True) + ';\n')

    n_decl = sum(len(d) for rec in rules_out.values() for _, d in rec['r'])
    covered = [n for n, ks in specimens.items() if any(k in rules_out for k in ks)]
    print('js/css-index.js: %d classes, %d declarations, %d KB' % (len(rules_out), n_decl, os.path.getsize(OUT) // 1024))
    print('  specimens with CSS: %d of %d' % (len(covered), len(specimens)))
    empty = [n for n in specimens if n not in covered]
    if empty:
        print('  no CSS of their own: ' + '; '.join(sorted(empty)))


if __name__ == '__main__':
    main()
