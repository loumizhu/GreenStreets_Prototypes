# -*- coding: utf-8 -*-
"""Generate base-kit.html — the BASE components only, no code, laid out as a
design sheet for import into Figma.

Why generated and not hand-written: the specimen markup is the same
`<script type="text/html" class="cx-src">` source as components.html, extracted
at build time. Hand-copying 55 specimens would fork the catalogue on day one.
Re-run via regenerate.sh whenever components.html changes.

What it deliberately leaves out
-------------------------------
* Composed specimens (47) — the request is base only.
* All code: no TSX, no usage snippet, no CSS pane, no props/states/responsive.
* 11 base specimens that have NO STATIC FORM (see BEHAVIOURS). A motion
  behaviour or a build technique would import into Figma as an empty frame,
  which is worse than an honest omission — so they are listed as text in an
  appendix instead of being drawn.

Figma-import hygiene, all in css/base-kit.css
---------------------------------------------
* `backdrop-filter` is neutralised (23 declarations across the base sheets).
  Figma cannot import a backdrop blur, and a capture would bake in a blur of
  whatever happens to sit behind — so the glass surfaces are given the solid
  equivalent they should become in Figma.
* Nothing on the page is `position:fixed`. Fixed elements import as detached
  layers parked in the wrong place.
* The ripple/particle FX layer is disabled and removed, so the export has no
  stray full-viewport layer.
* One fixed 1440px artboard, a 3-column grid and one gap value, so the whole
  sheet maps onto Figma auto-layout frames cleanly.
"""
import html as H
import io
import os
import re
import sys
from datetime import date

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import kit_states as ST

HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.path.dirname(HERE)
PAGE = os.path.join(LIB, 'components.html')
PARTS = 4
OUT = os.path.join(LIB, 'base-kit-%d.html')     # one page per part

# Base specimens with no static appearance: a behaviour, or a build technique.
# Each carries the reason, which is printed in the appendix.
BEHAVIOURS = {
    'Animated focus ring':          'Only visible while a control holds keyboard focus.',
    'Click ripple & particle burst': 'Plays for about half a second on pointerdown.',
    'Screen entrance cascade':      'Plays once, on entering a screen.',
    'Press feedback':               'Only visible while a control is held down.',
    'Invalid-submit shake':         'Plays on a rejected submit.',
    'Rotating placeholder':         'Cycles placeholder text while the field is empty and unfocused.',
    'Keyboard operability layer':   'Adds tab order and Enter/Space handling. Nothing to draw.',
    'Native title tooltip':         'Drawn by the browser and the OS — it cannot be styled, and it cannot be captured.',
    'Icon sprite pattern':          'A build technique: one inline <symbol> per icon, referenced with <use>.',
    'Screens & mount points':       'Prototype scaffolding — how a screen is shown or hidden.',
    'Prototype nav bar':            'A reviewer aid for jumping between screens. Not product UI.',
}

# Base specimens deliberately left OUT of the kit - not behaviours, just not
# distinct controls. Login input is a text field with a leading icon, which the
# Text input and Input-field-with-icon frames already cover between them. Excluded here
# only: the specimen stays in components.html, where a composed specimen
# references it through `data-parts`.
NOT_A_CONTROL = {'Login input'}

# Specimens whose hover rule exists but produces NO visible difference, checked
# by diffing computed styles between the two rendered cells. They get one cell:
# two identical drawings side by side would assert a state that isn't there.
NO_VISIBLE_HOVER = {
    'Empty state & search highlight':
        'the row hover is covered by the empty-state row own background',
}

# How many of the 3 columns a frame takes. Decided from the markup, because the
# generator cannot measure: anything carrying a full-width construct gets the
# whole row, a few mid-size ones get two columns.
FULL = re.compile(r'\bclass="[^"]*\b(?:tbl|tbl-wrap|sidebar|pshell|grp|cx-frame|fg2|fg3|fg4|'
                  r'stat-row|hdr-stat-row|modal|dlg|dlg-card|side-panel|pnav|'
                  r'act-timeline|onb-body|air-layout|filter-toolbar|type-scale)\b')
HALF = re.compile(r'\bclass="[^"]*\b(?:gs-bulkbar|docs-bulk-bar|gs-colmenu|upload-dz|'
                  r'login-card|toast|coach|imp-banner|tok-grid|swatch-grid)\b')
SPAN_OVERRIDE = {
    'Type scale': 3, 'Heading levels': 3, 'Table': 3, 'Sortable header': 3,
    'Dialog surface': 3, 'Activity timeline': 3, 'Sidebar user footer': 2,
    'Brand & status colours': 3, 'Ink, line & surface': 3,
    'Radius, elevation & spacing scale': 3, 'Impersonation banner': 3,
    'Empty state & search highlight': 3, 'Bulk-selection bar': 2,
    'Documents bulk bar': 2, 'Light-theme presets': 2, 'Upload dropzone': 2,
    'Stat cards': 3, 'Card': 2, 'Text input': 2, 'Dropdown list': 2,
    'Login input': 2, 'Number input': 2, 'Editable dropdown list': 2,
}


def span_for(name, markup):
    if name in SPAN_OVERRIDE:
        return SPAN_OVERRIDE[name]
    if FULL.search(markup):
        return 3
    if HALF.search(markup):
        return 2
    return 1


def dedent(block):
    lines = [l for l in block.split('\n')]
    while lines and not lines[0].strip():
        lines.pop(0)
    while lines and not lines[-1].strip():
        lines.pop()
    if not lines:
        return ''
    pad = min((len(l) - len(l.lstrip()) for l in lines if l.strip()), default=0)
    return '\n'.join(l[pad:] if len(l) >= pad else l for l in lines)


CODEISH = re.compile(
    r'\.[A-Za-z][\w-]*'          # .btn-p, select.fi.fi-select
    r'|<[A-Za-z/]'                # <select>, </div>
    r'|[A-Za-z_]\w*\([^)]*\)'     # gsFilterToolbar(this), GSEnhanceSelects(root)
    r'|--[a-z][\w-]*'             # --gs, --tw3
    r'|\[[a-z-]+[=\]]'            # [data-mt=...]
    r'|(?<![\w-])[a-z]{4,}(?:-[a-z]+)*:[a-z0-9%.#-]{2,}(?![\w-])'   # position:fixed
)


def purpose(tip, name=''):
    """One line of what the component is FOR, in plain English.

    The specimen tooltips are written for developers, so they often open with
    the implementation ("Author a plain select.fi.fi-select") — which put a
    class name on a sheet that is going to Figma, where a class name means
    nothing. So the first sentence that contains no code is used, and if every
    sentence has some, the code tokens are stripped from the first one rather
    than dropping the purpose altogether.
    """
    txt = H.unescape(tip or '').replace('`', '')
    txt = re.sub(r'<[^>]+>', '', txt)
    sentences = [x.strip() for x in re.split(r'(?<=[.!?])\s', txt.strip()) if x.strip()]
    if not sentences:
        return ''

    line = next((x for x in sentences if not CODEISH.search(x)), '')
    if not line:
        line = PURPOSE.get(name, '')     # hand-written, or nothing at all
    if len(line) > 190:
        line = line[:187].rsplit(' ', 1)[0] + '...'
    return line


# Hand-written purposes, for specimens whose every tooltip sentence carries
# code. Stripping code out of those produced gibberish, and a wrong sentence on
# a handoff sheet is worse than none - so these few are written plainly.
PURPOSE = {
    'Dropdown list':
        'A single choice from a fixed list. The menu is drawn by the system, '
        'not by the browser, so it matches the rest of the interface.',
    'Number input':
        'A numeric field with its own increment controls and an optional unit '
        'suffix, in place of the browser default.',
    'Input field with icon':
        'The filter control at the head of every listing. Typing narrows the '
        'rows below it.',
    'Table':
        'A read-only listing. Rows become clickable only when there is '
        'somewhere for them to go.',
    'Card':
        'The default surface for a group of related content, with an optional '
        'header row for its title and actions.',
    'Tour target highlight':
        'Lifts one control out of the page while a guided tour is pointing at '
        'it, so the step being described is unmistakable.',
    'Ink, line & surface':
        'The neutral palette: text at three emphasis levels, border tints and '
        'the translucent surfaces the panels are built from.',
    'Icon sprite pattern': '',
}

TAG_SPLIT = re.compile(r'(<[^>]*>)')

# Class-name annotations inside the demo TEXT, e.g. "Heading 1 - .pg-title" or
# "Page subtitle - .pg-sub - one line of context under a title."
CODE_IN_TEXT = re.compile(
    r'\s*[\u00b7|]\s*\.[A-Za-z][\w-]*'        # " . .pg-title" after a separator
    r'|\s*\.[A-Za-z][\w-]{2,}(?![\w-])'        # a bare ".pg-sub"
    r'|\s*--[a-z][\w-]+'                       # a bare "--gs"
    r'|\s*[A-Za-z_]\w*\(\)'                    # "GSEnhanceNumbers()"
)


def strip_code_text(markup):
    """Remove class names from the specimen's visible text, not its attributes.

    The typography specimens label themselves with their class - "Heading 1 -
    .pg-title", "Page subtitle - .pg-sub - one line of context under a title."
    That is useful in the developer catalogue and meaningless on a design sheet
    bound for Figma, where a class name is not a thing a designer can act on.

    Only text nodes are touched: splitting on tags keeps `class="..."` intact,
    which matters because the components are drawn BY those classes.
    """
    out = []
    for part in TAG_SPLIT.split(markup):
        if part.startswith('<'):
            out.append(part)
            continue
        t = CODE_IN_TEXT.sub('', part)
        # tidy what the removal leaves behind: doubled spaces, and a separator
        # or dash now dangling at either end of the run of text
        t = re.sub(r'[ \t]{2,}', ' ', t)
        t = re.sub(r'(?m)^([ \t]*)[\u00b7|\u2014\u2013-]\s+', r'\1', t)
        t = re.sub(r'\s+[\u00b7|\u2014\u2013-]\s*$', '', t)
        out.append(t)
    return ''.join(out)


CARET_SVG = ('<svg width="13" height="13" viewBox="0 0 24 24" fill="none" '
             'stroke="currentColor" stroke-width="2">'
             '<polyline points="6 9 12 15 18 9"/></svg>')

SELECT_RX = re.compile(r'<select class="fi fi-select"([^>]*)>(.*?)</select>', re.S)
OPTION_RX = re.compile(r'<option([^>]*)>(.*?)</option>', re.S)
MENU_SAMPLE = 6          # keep in step with base-kit.js


def theme_select(markup, open_menu=False):
    """Replace `select.fi.fi-select` with the themed control the enhancer builds.

    `open_menu` also renders the option list, so an "Open" cell is open in the
    HTML itself rather than waiting on a script.
    """
    def one(m):
        attrs, inner = m.group(1), m.group(2)
        opts = []
        for om in OPTION_RX.finditer(inner):
            oa, text = om.group(1), re.sub(r'<[^>]+>', '', om.group(2)).strip()
            opts.append(('selected' in oa, 'disabled' in oa, text))
        if not opts:
            return m.group(0)

        shown = [(sel, txt) for sel, dis, txt in opts if not dis]
        trigger_text = next((t for sel, dis, t in opts if sel),
                            opts[0][2] if opts else '')

        items = ''
        if open_menu:
            for sel, txt in shown[:MENU_SAMPLE]:
                items += ('<div class="cs-opt%s">%s</div>'
                          % (' sel' if sel else '', H.escape(txt)))
            if len(shown) > MENU_SAMPLE:
                items += ('<div class="bk-menu-more">+ %d more</div>'
                          % (len(shown) - MENU_SAMPLE))

        op = ' open' if open_menu else ''
        return (
            '<div class="cs-wrap%s">'
            '<select class="fi fi-select" data-cs="1" style="display:none"%s>%s</select>'
            '<div class="fi cs-trigger" tabindex="0">'
            '<span class="cs-val">%s</span><span class="cs-caret">%s</span></div>'
            '<div class="cs-menu%s">%s</div>'
            '</div>'
        ) % (op, attrs, inner, H.escape(trigger_text), CARET_SVG, op, items)

    return SELECT_RX.sub(one, markup)


def parse():
    """[(section title, [item, ...]), ...] - base only.

    item = (name, stage class, markup, data-cls, purpose)
    """
    src = io.open(PAGE, encoding='utf-8').read()
    out = []
    for sm in re.finditer(r'<section class="cx-sec" id="([^"]+)" data-title="([^"]*)"', src):
        title = H.unescape(sm.group(2))
        block = src[sm.end():src.index('</section>', sm.end())]
        items = []
        for am in re.finditer(r'<article class="cx-item"(.*?)</article>', block, re.S):
            attrs = am.group(1)
            if 'data-kind="base"' not in attrs:
                continue
            name = H.unescape(re.search(r'data-name="([^"]*)"', attrs).group(1))
            if name in NOT_A_CONTROL:
                continue
            stage = re.search(r'data-stage="([^"]*)"', attrs)
            cls = re.search(r'data-cls="([^"]*)"', attrs)
            tip = re.search(r'data-tip="([^"]*)"', attrs)
            body = re.search(r'<script type="text/html" class="cx-src">(.*?)</script>',
                             attrs, re.S)
            if not body:
                continue
            items.append((
                name,
                stage.group(1) if stage else '',
                strip_code_text(dedent(body.group(1))),
                H.unescape(cls.group(1)) if cls else '',
                purpose(tip.group(1) if tip else '', name),
            ))
        if items:
            out.append((title, items))
    return out


def uniquify(markup, suffix):
    """The hover copy is a second render of the same markup, so any id in it
    would be a duplicate. Suffix ids and the references that point at them —
    an invalid document imports unpredictably, and a duplicated `for=` breaks
    the label/control pairing that makes the frame readable."""
    ids = re.findall(r'\sid="([^"]+)"', markup)
    for i in ids:
        markup = markup.replace('id="%s"' % i, 'id="%s%s"' % (i, suffix))
        markup = markup.replace('for="%s"' % i, 'for="%s%s"' % (i, suffix))
        markup = markup.replace('href="#%s"' % i, 'href="#%s%s"' % (i, suffix))
        markup = markup.replace('list="%s"' % i, 'list="%s%s"' % (i, suffix))
    return markup


def split_drawn(sections):
    """(sections that have something to draw, names of the behaviours skipped)."""
    drawn, skipped, frames = [], [], 0
    for title, items in sections:
        keep = [it for it in items if it[0] not in BEHAVIOURS]
        skipped += [it[0] for it in items if it[0] in BEHAVIOURS]
        if keep:
            drawn.append((title, keep))
            frames += len(keep)
    return drawn, skipped, frames


def render(drawn, all_rules):
    """Render the sections. Shared by the four-part kit and the SP sheet."""
    used_rules, multi, cells_all = [], [], []
    parts = []
    for i, (title, items) in enumerate(drawn, 1):
        cards = []
        for name, stage, markup, cls_spec, why in items:
            cells_plan, used = ST.plan(name, cls_spec, all_rules, markup)
            if name in NO_VISIBLE_HOVER:          # measured: draws identically
                cells_plan = [c for c in cells_plan if c[1] != 'hover']
            used_rules += used
            cells_all += cells_plan
            if len(cells_plan) > 1:
                multi.append(name)

            # Width follows the number of cells: three states stacked in one
            # column is unreadable, and the spans were sized for one specimen.
            span = span_for(name, markup)
            span = min(3, max(span, len(cells_plan)))

            cells = []
            for ci, (label, css_state, action) in enumerate(cells_plan):
                cls = ['bk-cell-box']
                if stage:
                    cls.append(stage)
                if css_state:
                    cls.append('bk-st-' + css_state)
                body = uniquify(markup, '-s%d' % ci) if ci else markup
                # Bake the themed dropdown, open where the cell asks for it, so
                # the drawing does not depend on a script having run.
                if '<select class="fi fi-select"' in body:
                    body = theme_select(body, open_menu=(action == 'open'))
                    if action == 'open':
                        action = ''      # nothing left for the runtime to do
                cells.append(
                    '            <div class="bk-cell"%s>\n'
                    '              <div class="%s"%s>\n%s\n              </div>\n'
                    '              <span class="bk-cell-lbl%s">%s</span>\n'
                    '            </div>' % (
                        '' if ci == 0 else ' data-bk-variant="1"',
                        ' '.join(cls),
                        ' data-bk-do="%s"' % action if action else '',
                        indent(body, 16),
                        '' if ci == 0 else ' bk-cell-lbl-alt',
                        H.escape(label)))

            cards.append(
                '      <figure class="bk-frame bk-span-%d" data-frame="%s" data-cells="%d">\n'
                '        <figcaption class="bk-label">\n'
                '          <span class="bk-name">%s</span>\n'
                '          <span class="bk-purpose">%s</span>\n'
                '        </figcaption>\n'
                '        <div class="bk-states">\n%s\n        </div>\n'
                '      </figure>' % (
                    span, H.escape(name, quote=True), len(cells_plan),
                    H.escape(name), H.escape(why), '\n'.join(cells)))

        parts.append(
            '    <section class="bk-sec">\n'
            '      <header class="bk-sec-hd">\n'
            '        <span class="bk-sec-n">%02d</span>\n'
            '        <h2>%s</h2>\n'
            '        <span class="bk-sec-c">%d</span>\n'
            '      </header>\n'
            '      <div class="bk-grid">\n%s\n      </div>\n'
            '    </section>' % (i, H.escape(title), len(items), '\n'.join(cards)))

    return parts, used_rules, cells_all, multi


def build():
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    sections = parse()
    all_rules = ST.state_rules(LIB)
    drawn, skipped, frames = split_drawn(sections)
    parts, used_rules, cells_all, multi = render(drawn, all_rules)

    n_rules = ST.emit(LIB, used_rules)

    appendix = '\n'.join(
        '        <li><b>%s</b><span>%s</span></li>' % (H.escape(n), H.escape(BEHAVIOURS[n]))
        for n in skipped)

    # Divide by FRAME count so the parts are a similar length. A section is
    # never split across two parts.
    per = max(1, (frames + PARTS - 1) // PARTS)
    buckets, cur, run = [], [], 0
    for section_html, n in zip(parts, [len(items) for _t, items in drawn]):
        if run and run + n > per and len(buckets) < PARTS - 1:
            buckets.append(cur)
            cur, run = [], 0
        cur.append(section_html)
        run += n
    if cur:
        buckets.append(cur)
    while len(buckets) < PARTS:
        buckets.append([])

    written = []
    for i, bucket in enumerate(buckets, 1):
        n_frames = sum(b.count('<figure class="bk-frame') for b in bucket)
        html = TEMPLATE % {
            'date': date.today().isoformat(),
            'part': i,
            'parts': PARTS,
            'frames': n_frames,
            'sections': len(bucket),
            'cells': sum(b.count('class="bk-cell"') for b in bucket),
            'skipped': len(skipped),
            'body': '\n'.join(bucket),
            # the appendix belongs once, on the last part
            'appendix_block': APPENDIX % {'skipped': len(skipped), 'appendix': appendix}
                              if i == PARTS else '',
        }
        path = OUT % i
        io.open(path, 'w', encoding='utf-8', newline='\n').write(html)
        written.append((i, n_frames, len(bucket), os.path.getsize(path) // 1024))

    print('base-kit split across %d pages:' % PARTS)
    for i, nf, ns, kb in written:
        print('  base-kit-%d.html  %2d frames in %2d sections  %3d KB' % (i, nf, ns, kb))
    print('  %d state cells planned, %d generated state rules' % (len(cells_all), n_rules))
    print('  behaviours listed but not drawn (%d, on part %d): %s'
          % (len(skipped), PARTS, ', '.join(skipped)))

    build_sp(sections, all_rules)

    old = os.path.join(LIB, 'base-kit.html')
    if os.path.exists(old):
        os.remove(old)
        print('  removed the old single-page base-kit.html')


SP_OUT = os.path.join(LIB, 'base-kit-5.html')

# Read once from the real sheets so the cover cannot drift from the product.
TOKEN_RX = re.compile(r'(--[a-z0-9-]+)\s*:\s*([^;}]+)')


def sp_tokens():
    """The :root custom properties of the Supplier Portal's own stylesheets."""
    tok = {}
    for f in ('greenstreets-theme.css', 'supplier-portal.css'):
        css = io.open(os.path.join(LIB, 'css', f), encoding='utf-8').read()
        for m in re.finditer(r':root\{(.*?)\}', css, re.S):
            for k, v in TOKEN_RX.findall(m.group(1)):
                tok[k] = v.strip()
    return tok


def sp_specimens(sections):
    """Sections filtered to the components the Supplier Portal actually has.

    `data-used` is a list of EXAMPLE links, not a record of presence, so it
    cannot be the filter - it points Primary button at three other portals.
    The stylesheets can: greenstreets-theme.css + supplier-portal.css are the
    Supplier Portal's own, and portal-extras.css carries only what is exclusive
    to the other three. A specimen whose classes resolve in the base sheets is
    a Supplier Portal component; one whose classes resolve only in the extras
    is somebody else's.
    """
    base = ''
    for f in ('greenstreets-theme.css', 'supplier-portal.css'):
        base += io.open(os.path.join(LIB, 'css', f), encoding='utf-8').read()
    have = set(re.findall(r'\.([A-Za-z][\w-]+)', base))

    out, dropped = [], []
    for title, items in sections:
        keep = []
        for it in items:
            cls = set(re.findall(r'\.([A-Za-z][\w-]+)', it[3]))
            # No classes at all = a token or behaviour specimen; those are the
            # system's, so they stay.
            if not cls or (cls & have):
                keep.append(it)
            else:
                dropped.append(it[0])
        if keep:
            out.append((title, keep))
    return out, dropped


def build_sp(sections, all_rules):
    """One page, Supplier Portal only, with a cover that describes the UI."""
    scoped, dropped = sp_specimens(sections)
    drawn, skipped, frames = split_drawn(scoped)
    parts, used, cells, _multi = render(drawn, all_rules)

    # No ST.emit here on purpose. The four-part kit is a superset of this page
    # and is built first, so css/base-kit-states.css already holds every rule
    # these frames need; emitting again would truncate that sheet to this
    # subset and silently strip states from parts 1-4.
    del used

    t = sp_tokens()
    swatches = [
        ('Canvas', t.get('--bg-0', '#070f1c'), 'the page behind everything'),
        ('Accent', t.get('--gs', '#4ebb81'), 'brand green - primary actions, active nav, focus'),
        ('Accent light', t.get('--gs-l', '#8fe3b6'), 'gradient top end, active indicator'),
        ('Info', t.get('--bl', '#5b9cf6'), 'links and informational status'),
        ('Warning', t.get('--amber', '#f5a623'), 'attention, expiring, low confidence'),
        ('Danger', t.get('--red', '#e0605a'), 'destructive actions and failures'),
    ]
    swatch_html = '\n'.join(
        '        <li><span class="bk-sw" style="background:%s"></span>'
        '<b>%s</b><code>%s</code><span class="bk-sw-note">%s</span></li>'
        % (v, H.escape(n), H.escape(v), H.escape(note))
        for n, v, note in swatches)

    facts = [
        ('Type', "Inter 300-700. Body 13px, labels 11px uppercase, page title 21px."),
        ('Corner radius', '%s controls, %s cards, %s panels.'
         % (t.get('--rs', '10px'), t.get('--rm', '13px'), t.get('--rl', '18px'))),
        ('Spacing', 'A 7-step scale: %s.'
         % ', '.join(t.get('--sp-%d' % i, '') for i in range(1, 8))),
        ('Control height', 'Buttons 42px. Fields 10px/12px padding at 13px, so ~39px.'),
        ('Ink', 'Full white for primary text, %s for secondary, %s for muted.'
         % (t.get('--tw2', ''), t.get('--tw3', ''))),
        ('Hairline', '1px %s; %s where a border needs to read as an edge.'
         % (t.get('--line', ''), t.get('--line-2', ''))),
        ('Focus', 'A 2px ring in the accent, drawn on at the control\'s own radius. '
                  'It follows the accent, so re-theming moves it.'),
        ('Surfaces', 'Cards are a near-transparent white wash over the page, with a '
                     'blur behind them - so the background gradient reads through every panel.'),
    ]
    fact_html = '\n'.join(
        '        <div><dt>%s</dt><dd>%s</dd></div>' % (H.escape(k), H.escape(v))
        for k, v in facts)

    html = SP_TEMPLATE % {
        'body': '\n'.join(parts),
        'canvas': t.get('--bg-0', '#070f1c'),
        'swatches': swatch_html,
        'facts': fact_html,
    }
    io.open(SP_OUT, 'w', encoding='utf-8', newline='\n').write(html)
    print('  base-kit-5.html  %2d frames in %2d sections  %3d KB   (Supplier Portal only)'
          % (frames, len(drawn), os.path.getsize(SP_OUT) // 1024))
    print('     %d state cells; not a Supplier Portal component (%d): %s'
          % (len(cells), len(dropped), ', '.join(dropped) or 'none'))


def indent(block, n):
    pad = ' ' * n
    return '\n'.join(pad + l for l in block.split('\n'))


TEMPLATE = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>GreenStreets — Base component kit %(part)d/%(parts)d</title>
<meta name="description" content="The base components of the GreenStreets design system, laid out as a design sheet for import into Figma. No code.">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<!-- The REAL portal stylesheets, in portal load order: every frame below is
     rendered by the CSS that ships in the prototypes, not by a redraw. -->
<link rel="stylesheet" href="css/greenstreets-theme.css?v=1">
<link rel="stylesheet" href="css/supplier-portal.css?v=1">
<link rel="stylesheet" href="css/portal-extras.css?v=1">
<link rel="stylesheet" href="css/greenstreets-light.css?v=1">
<link rel="stylesheet" href="css/portal-extras-light.css?v=1">
<!-- The sheet's own layout, plus the Figma-import hygiene overrides -->
<link rel="stylesheet" href="css/base-kit.css?v=26">
<!-- GENERATED: the real :hover declarations, re-applied under .bk-st-hover
     so this static sheet can draw the hover state. See tools/kit_states.py -->
<link rel="stylesheet" href="css/base-kit-states.css?v=16">
</head>
<body class="bk-body">

<div class="bk-artboard">

  <header class="bk-cover">
    <div class="bk-cover-main">
      <p class="bk-eyebrow">GreenStreets design system</p>
      <h1>Base component kit</h1>
      <p class="bk-part">Part %(part)d of %(parts)d</p>
      <p class="bk-lede">Every base component in the system — one primitive per frame, drawn by the
        production stylesheets. Where a component's hover changes its appearance, that state is drawn
        beside the default, from the real <code>:hover</code> declarations. Compositions, code and
        documentation live in the component library; this sheet is the drawing.</p>
    </div>
    <dl class="bk-facts">
      <div><dt>Frames</dt><dd>%(frames)d</dd></div>
      <div><dt>Sections</dt><dd>%(sections)d</dd></div>
      <div><dt>State cells</dt><dd>%(cells)d</dd></div>
      <div><dt>Theme</dt><dd>Dark (primary)</dd></div>
      <div><dt>Generated</dt><dd>%(date)s</dd></div>
    </dl>
    <button class="bk-theme" type="button" id="bkTheme" aria-pressed="false">Light theme</button>
  </header>

%(body)s

%(appendix_block)s
  <footer class="bk-foot">
    <span>GreenStreets — base component kit</span>
    <span>Generated from components.html by tools/build-base-kit.py · do not hand-edit</span>
  </footer>

</div>

<script src="js/gs-schema.js?v=1"></script>
<script src="js/gs-pkg-controls.js?v=1"></script>
<script src="js/greenstreets-theme.js?v=1"></script>
<script src="js/base-kit.js?v=16"></script>
</body>
</html>
'''

APPENDIX = '''  <section class="bk-sec bk-appendix">
    <header class="bk-sec-hd">
      <span class="bk-sec-n">—</span>
      <h2>Behaviours, not drawings</h2>
      <span class="bk-sec-c">%(skipped)d</span>
    </header>
    <div class="bk-appendix-body">
      <p>These are base components too, but they have no static form — a motion behaviour or a
        build technique. Drawn as frames they would import into Figma empty, so they are named
        here instead.</p>
      <ul>
%(appendix)s
      </ul>
    </div>
  </section>
'''

SP_TEMPLATE = '''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>GreenStreets — Supplier Portal base components</title>
<meta name="description" content="The Supplier Portal's base components, laid out as a design sheet for import into Figma. No code.">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<!-- The Supplier Portal's OWN stylesheets, in its load order. portal-extras is
     deliberately absent: it carries only the other three portals' exclusive
     rules, and nothing on this page should be drawn by them. -->
<link rel="stylesheet" href="css/greenstreets-theme.css?v=1">
<link rel="stylesheet" href="css/supplier-portal.css?v=1">
<link rel="stylesheet" href="css/greenstreets-light.css?v=1">
<link rel="stylesheet" href="css/base-kit.css?v=26">
<link rel="stylesheet" href="css/base-kit-states.css?v=22">
</head>
<body class="bk-body">

<div class="bk-artboard">

  <header class="bk-cover bk-cover-ui">
    <div class="bk-cover-main">
      <p class="bk-eyebrow">GreenStreets design system</p>
      <h1>Supplier Portal — base components</h1>
      <p class="bk-lede">Every primitive the Supplier Portal is built from, one per frame, drawn by
        the portal's own production stylesheets. Where a component has more than one state, each
        state is drawn beside the default from the real declarations. This sheet is the drawing;
        code and documentation live in the component library.</p>
    </div>
    <button class="bk-theme" type="button" id="bkTheme" aria-pressed="false">Light theme</button>
  </header>

  <section class="bk-sec bk-ui">
    <header class="bk-sec-hd">
      <span class="bk-sec-n">—</span>
      <h2>The surface everything sits on</h2>
    </header>
    <div class="bk-ui-body">
      <figure class="bk-canvas">
        <div class="bk-canvas-swatch"></div>
        <figcaption>
          <b>Page background</b>
          <p>A near-black navy, %(canvas)s, with four soft radial washes over it — green at the top
            left, blue at the top right, a deeper blue rising from the bottom centre, and a faint
            teal at the lower right — above a dark navy diagonal. It is fixed to the viewport, so it
            does not scroll with the content.</p>
          <p class="bk-canvas-note">The frames below sit on a flat panel instead: Figma cannot
            import a multi-layer gradient or a backdrop blur, and the real background would arrive
            as a stack of detached shapes. Rebuild it in Figma from the description above.</p>
        </figcaption>
      </figure>

      <ul class="bk-swatches">
%(swatches)s
      </ul>

      <dl class="bk-ui-facts">
%(facts)s
      </dl>
    </div>
  </section>

%(body)s

  <footer class="bk-foot">
    <span>GreenStreets — Supplier Portal base components</span>
    <span>Generated from components.html by tools/build-base-kit.py · do not hand-edit</span>
  </footer>

</div>

<script src="js/gs-schema.js?v=1"></script>
<script src="js/gs-pkg-controls.js?v=1"></script>
<script src="js/greenstreets-theme.js?v=1"></script>
<script src="js/base-kit.js?v=22"></script>
</body>
</html>
'''

if __name__ == '__main__':
    build()
