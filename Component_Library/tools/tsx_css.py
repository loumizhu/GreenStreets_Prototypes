# -*- coding: utf-8 -*-
"""CSS-to-Tailwind translation for the component library's generated TSX.

For each specimen in components.html this emits
  * a reusable typed React component using Tailwind utilities inline, and
  * a short import + usage snippet,
into Component_Library/js/tsx-index.js as window.CX_TSX.

The Tailwind classes are translated from the component's REAL declarations
(js/css-index.js, itself generated from the stylesheets), with every
`var(--token)` resolved to its literal value so a snippet pastes into any
Tailwind project and renders correctly with no config and no CSS file. The
token aliases are offered separately, once, in the Design tokens section.

Anything with no Tailwind utility of its own falls back to Tailwind's
arbitrary-property syntax (`[mask-composite:exclude]`) rather than being
dropped, so a generated component is never silently missing a rule.

Run from the repo root via Component_Library/tools/regenerate.sh.
"""
import html, io, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.path.dirname(HERE)
PAGE = os.path.join(LIB, 'components.html')
IDX = os.path.join(LIB, 'js', 'css-index.js')
THEME = os.path.join(LIB, 'css', 'greenstreets-theme.css')
OUT = os.path.join(LIB, 'js', 'tsx-index.js')

# ══ design tokens → literals ═══════════════════════════════════════════════
def load_tokens():
    txt = io.open(THEME, encoding='utf-8').read()
    txt = re.sub(r'/\*.*?\*/', '', txt, flags=re.S)
    m = re.search(r':root\s*\{(.*?)\}', txt, re.S)
    toks = {}
    if m:
        for d in m.group(1).split(';'):
            if ':' in d:
                p, _, v = d.partition(':')
                p, v = p.strip(), ' '.join(v.split())
                if p.startswith('--'):
                    toks[p] = v
    return toks

TOKENS = load_tokens()

def deref(value, depth=0):
    """Replace var(--x[, fallback]) with the token's literal value."""
    if depth > 6 or 'var(' not in value:
        return value
    def one(m):
        name, fallback = m.group(1), (m.group(2) or '').strip()
        return TOKENS.get(name, fallback or 'inherit')
    out = re.sub(r'var\((--[a-z0-9-]+)(?:\s*,\s*([^()]*))?\)', one, value)
    return deref(out, depth + 1) if out != value else out

# ══ css → tailwind ═════════════════════════════════════════════════════════
SPACE = {0: '0', 1: 'px', 2: '0.5', 4: '1', 6: '1.5', 8: '2', 10: '2.5', 12: '3',
         14: '3.5', 16: '4', 20: '5', 24: '6', 28: '7', 32: '8', 36: '9', 40: '10',
         44: '11', 48: '12', 56: '14', 64: '16', 80: '20', 96: '24'}
WEIGHT = {'100': 'thin', '200': 'extralight', '300': 'light', '400': 'normal',
          '500': 'medium', '600': 'semibold', '700': 'bold', '800': 'extrabold', '900': 'black'}

def arb(v):
    """Tailwind arbitrary value: spaces become underscores, and DOUBLE quotes
    are dropped. Single quotes survive on purpose — `content-['']` is the only
    way Tailwind can express an empty pseudo-element — which is why every
    skeleton hosts a generated class string inside a DOUBLE-quoted JS string."""
    return '[' + re.sub(r'\s+', '_', v.strip()).replace('"', '') + ']'

def px(v):
    v = v.strip()
    if v in ('0', '0px', '0em', '0rem'):
        return 0.0
    m = re.fullmatch(r'(-?\d+(?:\.\d+)?)px', v)
    return float(m.group(1)) if m else None

def space(prefix, v):
    n = px(v)
    if n is not None and n == int(n) and int(n) in SPACE:
        n = int(n)
        return prefix + '-' + (('-' if n < 0 else '') + SPACE[abs(n)])
    return prefix + '-' + arb(v)

def color(prefix, v):
    v = v.strip()
    low = v.lower()
    if low in ('#fff', '#ffffff', 'white'):
        return prefix + '-white'
    if low in ('#000', '#000000', 'black'):
        return prefix + '-black'
    if low == 'transparent':
        return prefix + '-transparent'
    if low == 'currentcolor':
        return prefix + '-current'
    if low == 'inherit':
        return prefix + '-inherit'
    m = re.fullmatch(r'rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*(\.?\d*\.?\d+)\s*\)', low)
    if m:
        return prefix + '-white/' + arb(m.group(1) if m.group(1).startswith('0') else '0' + m.group(1))
    m = re.fullmatch(r'rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*(\.?\d*\.?\d+)\s*\)', low)
    if m:
        return prefix + '-black/' + arb(m.group(1) if m.group(1).startswith('0') else '0' + m.group(1))
    return prefix + '-' + arb(v)

def is_color(v):
    return bool(re.match(r'^(#|rgba?\(|hsla?\(|transparent$|currentcolor$|inherit$|white$|black$)', v.strip(), re.I))

KEYWORD = {
    'display': {'flex': 'flex', 'inline-flex': 'inline-flex', 'grid': 'grid',
                'inline-grid': 'inline-grid', 'block': 'block', 'inline-block': 'inline-block',
                'inline': 'inline', 'none': 'hidden', 'contents': 'contents', 'table': 'table'},
    'flex-direction': {'column': 'flex-col', 'row': 'flex-row', 'column-reverse': 'flex-col-reverse',
                       'row-reverse': 'flex-row-reverse'},
    'flex-wrap': {'wrap': 'flex-wrap', 'nowrap': 'flex-nowrap', 'wrap-reverse': 'flex-wrap-reverse'},
    'align-items': {'center': 'items-center', 'flex-start': 'items-start', 'start': 'items-start',
                    'flex-end': 'items-end', 'end': 'items-end', 'baseline': 'items-baseline',
                    'stretch': 'items-stretch'},
    'align-self': {'center': 'self-center', 'flex-start': 'self-start', 'flex-end': 'self-end',
                   'stretch': 'self-stretch', 'auto': 'self-auto'},
    'justify-content': {'center': 'justify-center', 'space-between': 'justify-between',
                        'space-around': 'justify-around', 'flex-start': 'justify-start',
                        'flex-end': 'justify-end', 'end': 'justify-end', 'start': 'justify-start'},
    'position': {'relative': 'relative', 'absolute': 'absolute', 'fixed': 'fixed',
                 'sticky': 'sticky', 'static': 'static'},
    'text-align': {'center': 'text-center', 'left': 'text-left', 'right': 'text-right', 'justify': 'text-justify'},
    'text-transform': {'uppercase': 'uppercase', 'lowercase': 'lowercase', 'capitalize': 'capitalize', 'none': 'normal-case'},
    'text-decoration': {'none': 'no-underline', 'underline': 'underline', 'line-through': 'line-through'},
    'white-space': {'nowrap': 'whitespace-nowrap', 'pre': 'whitespace-pre', 'normal': 'whitespace-normal',
                    'pre-wrap': 'whitespace-pre-wrap'},
    'overflow': {'hidden': 'overflow-hidden', 'auto': 'overflow-auto', 'scroll': 'overflow-scroll',
                 'visible': 'overflow-visible'},
    'overflow-x': {'hidden': 'overflow-x-hidden', 'auto': 'overflow-x-auto'},
    'overflow-y': {'hidden': 'overflow-y-hidden', 'auto': 'overflow-y-auto'},
    'cursor': {'pointer': 'cursor-pointer', 'default': 'cursor-default', 'help': 'cursor-help',
               'not-allowed': 'cursor-not-allowed', 'copy': 'cursor-copy', 'text': 'cursor-text'},
    'font-style': {'italic': 'italic', 'normal': 'not-italic'},
    'font-variant-numeric': {'tabular-nums': 'tabular-nums'},
    'user-select': {'none': 'select-none', 'text': 'select-text'},
    'pointer-events': {'none': 'pointer-events-none', 'auto': 'pointer-events-auto', 'all': 'pointer-events-auto'},
    'box-sizing': {'border-box': 'box-border', 'content-box': 'box-content'},
    'flex-shrink': {'0': 'shrink-0', '1': 'shrink'},
    'flex-grow': {'0': 'grow-0', '1': 'grow'},
    'object-fit': {'cover': 'object-cover', 'contain': 'object-contain'},
    'mix-blend-mode': {'overlay': 'mix-blend-overlay', 'multiply': 'mix-blend-multiply', 'screen': 'mix-blend-screen'},
    'isolation': {'isolate': 'isolate'},
    'visibility': {'hidden': 'invisible', 'visible': 'visible'},
    'appearance': {'none': 'appearance-none'},
    'resize': {'none': 'resize-none', 'vertical': 'resize-y'},
}

SPACED = {'padding': 'p', 'padding-left': 'pl', 'padding-right': 'pr', 'padding-top': 'pt',
          'padding-bottom': 'pb', 'margin': 'm', 'margin-left': 'ml', 'margin-right': 'mr',
          'margin-top': 'mt', 'margin-bottom': 'mb', 'gap': 'gap', 'row-gap': 'gap-y',
          'column-gap': 'gap-x', 'width': 'w', 'height': 'h', 'min-width': 'min-w',
          'min-height': 'min-h', 'max-width': 'max-w', 'max-height': 'max-h',
          'top': 'top', 'left': 'left', 'right': 'right', 'bottom': 'bottom'}

def decl_to_tw(prop, value):
    """One declaration → a list of Tailwind classes."""
    p, v = prop.strip().lower(), ' '.join(value.split())
    lit = deref(v)

    if p in KEYWORD and lit.lower() in KEYWORD[p]:
        return [KEYWORD[p][lit.lower()]]

    if p == 'padding' or p == 'margin':
        parts = lit.split()
        pre = 'p' if p == 'padding' else 'm'
        if len(parts) == 1:
            return [space(pre, parts[0])]
        if len(parts) == 2:
            return [space(pre + 'y', parts[0]), space(pre + 'x', parts[1])]
        if len(parts) == 3:
            return [space(pre + 't', parts[0]), space(pre + 'x', parts[1]), space(pre + 'b', parts[2])]
        if len(parts) == 4:
            return [space(pre + 't', parts[0]), space(pre + 'r', parts[1]),
                    space(pre + 'b', parts[2]), space(pre + 'l', parts[3])]
    if p in SPACED:
        return [space(SPACED[p], lit)]

    if p == 'inset':
        return ['inset-0'] if lit in ('0', '0px') else ['inset-' + arb(lit)]
    if p == 'color':
        return [color('text', lit)]
    if p in ('background', 'background-color'):
        if is_color(lit):
            return [color('bg', lit)]
        return ['bg-' + arb(lit)]
    if p == 'border':
        m = re.fullmatch(r'(\S+)\s+(solid|dashed|dotted)\s+(.+)', lit)
        if m:
            w = px(m.group(1))
            out = ['border' if w == 1 else 'border-' + arb(m.group(1))]
            if m.group(2) != 'solid':
                out.append('border-' + m.group(2))
            out.append(color('border', m.group(3)))
            return out
        if lit in ('none', '0'):
            return ['border-0']
        return ['[border:' + re.sub(r'\s+', '_', lit) + ']']
    if p.startswith('border-') and p.endswith('-color'):
        side = {'border-top-color': 'border-t', 'border-bottom-color': 'border-b',
                'border-left-color': 'border-l', 'border-right-color': 'border-r'}.get(p, 'border')
        return [color(side, lit)]
    if p == 'border-color':
        return [color('border', lit)]
    if p == 'border-radius':
        if lit in ('50%', '999px', '9999px'):
            return ['rounded-full']
        return ['rounded-' + arb(lit)]
    if p == 'font-size':
        return ['text-' + arb(lit)]
    if p == 'font-weight':
        return ['font-' + WEIGHT[lit]] if lit in WEIGHT else ['font-' + arb(lit)]
    if p == 'line-height':
        return ['leading-' + arb(lit)]
    if p == 'letter-spacing':
        return ['tracking-' + arb(lit)]
    if p == 'font-family':
        return ["font-" + arb(lit.replace('"', "'"))]
    if p == 'box-shadow':
        return ['shadow-' + arb(lit)] if lit != 'none' else ['shadow-none']
    if p == 'opacity':
        return ['opacity-' + arb(lit)]
    if p == 'z-index':
        return ['z-' + arb(lit)]
    if p == 'transform':
        return ['[transform:' + re.sub(r'\s+', '_', lit) + ']']
    if p == 'transition':
        return ['[transition:' + re.sub(r'\s+', '_', lit) + ']']
    if p == 'backdrop-filter':
        return ['[backdrop-filter:' + re.sub(r'\s+', '_', lit) + ']']
    if p == 'grid-template-columns':
        m = re.fullmatch(r'repeat\((\d+),\s*1fr\)', lit)
        if m:
            return ['grid-cols-' + m.group(1)]
        if re.fullmatch(r'(1fr\s*)+', lit):
            return ['grid-cols-' + str(len(lit.split()))]
        return ['grid-cols-' + arb(lit)]
    if p == 'content':
        # Tailwind has no quote-free form: content-[''] is the only spelling.
        if lit in ("''", '""', ''):
            return ["content-['']"]
        return ['content-[' + '_'.join(lit.replace('"', "'").split()) + ']']
    if p == 'outline':
        return ['outline-none'] if lit == 'none' else ['[outline:' + re.sub(r'\s+', '_', lit) + ']']

    # nothing maps → Tailwind's arbitrary *property* syntax, so it is never lost
    return ['[' + p + ':' + re.sub(r'\s+', '_', lit) + ']']


PSEUDO_PREFIX = {':hover': 'hover:', ':focus': 'focus:', ':focus-visible': 'focus-visible:',
                 ':active': 'active:', ':disabled': 'disabled:', '::before': 'before:',
                 '::after': 'after:', ':first-child': 'first:', ':last-child': 'last:',
                 '::placeholder': 'placeholder:'}

def rule_to_classes(suffix, decls):
    """A rule's declarations → Tailwind classes, prefixed for pseudo variants.
    Returns (classes, skipped_suffix) — a suffix we cannot express is reported."""
    pre = ''
    if suffix:
        if suffix in PSEUDO_PREFIX:
            pre = PSEUDO_PREFIX[suffix]
        else:
            return [], suffix          # `.on`, `.active` etc. — state, not a variant
    out = []
    # a ::before/::after needs a content value; only add one if the rule has none
    if pre in ('before:', 'after:') and not any(p.strip() == 'content' for p, _ in decls):
        out.append(pre + "content-['']")
    for p, v in decls:
        for c in decl_to_tw(p, v):
            cc = pre + c
            if cc not in out:
                out.append(cc)
    return out, None


def tw_for(cls, index, want_states=True):
    """All Tailwind classes for one class name: base rule + pseudo variants.
    Also returns the state rules (`.on`, `.sel`, …) as {suffix: classes}."""
    rec = index['rules'].get(cls)
    if not rec:
        return '', {}
    base, states = [], {}
    for suffix, decls in rec['r']:
        cs, unhandled = rule_to_classes(suffix, decls)
        if unhandled is None:
            base.extend(c for c in cs if c not in base)
        elif want_states:
            sc, _ = rule_to_classes('', decls)
            states[unhandled] = sc
    return ' '.join(base), states
