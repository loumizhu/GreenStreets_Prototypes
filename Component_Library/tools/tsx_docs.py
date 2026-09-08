"""Generate the Props / States / Responsive strip for a specimen.

The six Buttons components are hand-authored in tsx_overrides.py and win over
everything here. This module covers the other ~107, and it is built on a rule:
**generate from measured facts, hand-write only what is a judgement.**

  pr — per KIND, matching the prop contract the skeleton in tsx_skeletons.py
       actually emits. 18 tables, not 107, because the generated component for
       every specimen of a kind has the same signature.

  st — per SPECIMEN, derived from the real pseudo-class rules in the CSS index.
       If `.btn-g:hover` exists in the stylesheet, the Hover row states what it
       changes; if there is no hover rule, the row says so instead of inventing
       one. A state a kind cannot have is marked not-applicable with a reason
       (ABSENT below).

  rs — the "today" line is per SPECIMEN and measured: every @media block in all
       four portals is indexed by the classes it targets, so a specimen either
       gets its real breakpoint rules quoted or a factual "no breakpoint rules".
       This matters — a blanket "nothing changes" would be a LIE for several
       components. At max-width:1000px the stylesheets really do restyle
       .fg2/.fg3/.fg4, .filter-toolbar, .stat-row/.stat-mini, .tier-grid and
       .recap-grid. The recommendation half is per kind and is labelled as a
       recommendation in the UI, never as spec.
"""
import io
import glob
import os
import re

PORTALS = ('Supplier_Portal', 'GreenStreets_Super_Admin',
           'Retailer_Admin_Portal', 'Retailer_User_Portal')

# ---------------------------------------------------------------------------
# measured: every @media block across the four portals, indexed by class
# ---------------------------------------------------------------------------


def _blocks(css):
    """Yield (condition, selector, declarations) for every rule in a @media."""
    for m in re.finditer(r'@media([^{]*)\{', css):
        cond = ' '.join(m.group(1).split())
        if 'reduced-motion' in cond:
            continue                      # motion, not layout
        i, depth = m.end(), 1
        while i < len(css) and depth:
            if css[i] == '{':
                depth += 1
            elif css[i] == '}':
                depth -= 1
            i += 1
        for r in re.finditer(r'([^{}]+)\{([^{}]*)\}', css[m.end():i - 1]):
            yield cond, ' '.join(r.group(1).split()), ' '.join(r.group(2).split())


def media_index(root):
    """{class name: [(condition, selector, declarations), ...]}"""
    idx = {}
    for portal in PORTALS:
        for f in sorted(glob.glob(os.path.join(root, portal, 'css', '*.css'))):
            css = io.open(f, encoding='utf-8', errors='replace').read()
            for cond, sel, decls in _blocks(css):
                for cl in set(re.findall(r'\.([A-Za-z][\w-]*)', sel)):
                    entry = (cond, sel, decls)
                    idx.setdefault(cl, [])
                    if entry not in idx[cl]:
                        idx[cl].append(entry)
    return idx


BASE_SHEETS = ('greenstreets-theme.css', 'supplier-portal.css', 'portal-extras.css')


def state_scan(lib):
    """{class: {state: (selector, declarations)}} across the WHOLE base sheets,
    descendant selectors included.

    The CSS index deliberately keeps only rules that target the element itself,
    so it cannot see `.tbl tbody tr:hover` — and a States panel that concluded
    "no hover rule" from that absence was simply wrong about tables. This scan
    is what makes a negative statement safe to print.
    """
    idx = {}
    for name in BASE_SHEETS:
        path = os.path.join(lib, 'css', name)
        if not os.path.exists(path):
            continue
        css = re.sub(r'/\*[\s\S]*?\*/', ' ', io.open(path, encoding='utf-8', errors='replace').read())
        css = re.sub(r'@media[^{]*\{', ' ', css)          # breakpoints are handled separately
        for m in re.finditer(r'([^{}]+)\{([^{}]*)\}', css):
            sel = ' '.join(m.group(1).split())
            decls = ' '.join(m.group(2).split())
            if not sel or sel.startswith('@'):
                continue
            if _ring_removal(decls):
                continue          # outline:none is not a focus state, it is its absence
            for rx, state in SUFFIX_STATE:
                if not rx.search(sel):
                    continue
                better = state == 'Focus' and ':focus-visible' in sel
                for cl in set(re.findall(r'\.([A-Za-z][\w-]*)', sel)):
                    d = idx.setdefault(cl, {})
                    if state not in d or better:
                        d[state] = (sel, decls)
                break
    return idx


def _classes(cls_spec):
    """The class names a specimen declares, in author order."""
    return [c for c in re.findall(r'\.([A-Za-z][\w-]*)', cls_spec or '')]


# ---------------------------------------------------------------------------
# pr — prop tables, one per kind, mirroring tsx_skeletons.py
# ---------------------------------------------------------------------------
_CN = ['className', 'string', '-',
       'Escape hatch, appended last so it wins. Use it for layout, not colour.']
_DIS = ['disabled', 'boolean', 'false', 'Greys the control out and blocks interaction.']

PROPS = {
    'button': [
        ['label', 'string', '', 'Button text; also the accessible name.'],
        ['variant', 'union', "first variant", 'Which colour treatment to use.'],
        ['size', "'sm' | 'md' | 'lg'", "'md'", 'Height and padding only.'],
        ['icon', 'React.ReactNode', '-', 'Optional leading glyph.'],
        ['onClick', '() => void', '-', 'Click handler.'],
        _DIS, _CN,
    ],
    'iconbutton': [
        ['label', 'string', '', 'Required — becomes the title and the aria-label, since there is no visible text.'],
        ['icon', 'React.ReactNode', '', 'Required. The glyph.'],
        ['onClick', '() => void', '-', 'Click handler.'],
        _DIS, _CN,
    ],
    'input': [
        ['label', 'string', '', 'The field label. Rendered above the control.'],
        ['value', 'string', '-', 'Controlled value.'],
        ['onChange', '(value: string) => void', '-', 'Fires on every keystroke with the new value.'],
        ['placeholder', 'string', '-', 'Shown while empty. Not a substitute for the label.'],
        ['hint', 'string', '-', 'Helper line under the control.'],
        ['error', 'string', '-', 'Validation message. Setting it puts the field in its error state and replaces the hint.'],
        ['type', "'text' | 'email' | 'password' | 'number'", "'text'", 'Native input type.'],
        ['required', 'boolean', 'false', 'Renders the asterisk and sets aria-required.'],
        _DIS,
    ],
    'search': [
        ['value', 'string', '-', 'Controlled value.'],
        ['onChange', '(value: string) => void', '-', 'Fires on every keystroke; debounce at the call site if the list is large.'],
        ['placeholder', 'string', "'Search…'", 'Say what is searchable, not just "Search".'],
        _DIS,
    ],
    'select': [
        ['label', 'string', '', 'The field label.'],
        ['options', 'string[]', '', 'Required. The choices, in the order they should appear.'],
        ['value', 'string', '-', 'Controlled value.'],
        ['onChange', '(value: string) => void', '-', 'Fires with the chosen value.'],
        ['placeholder', 'string', '-', 'The unselected prompt. Rendered as a disabled first option.'],
        ['required', 'boolean', 'false', 'Renders the asterisk and sets aria-required.'],
        _DIS,
    ],
    'toggle': [
        ['label', 'string', '', 'What the switch controls, phrased so that "on" is unambiguous.'],
        ['description', 'string', '-', 'Second line under the label.'],
        ['checked', 'boolean', '', 'Required — this is a controlled component.'],
        ['onChange', '(checked: boolean) => void', '', 'Required.'],
        _DIS,
    ],
    'checkbox': [
        ['label', 'string', '', 'The clickable label.'],
        ['checked', 'boolean', '', 'Required — controlled.'],
        ['onChange', '(checked: boolean) => void', '', 'Required.'],
        ['indeterminate', 'boolean', 'false', 'The half-checked state for a select-all whose rows are partly selected. Has no HTML attribute, so it is set on the DOM node via a ref.'],
        _DIS,
    ],
    'slider': [
        ['label', 'string', '-', 'Field label.'],
        ['value', 'number', '', 'Required — controlled.'],
        ['onChange', '(value: number) => void', '', 'Required.'],
        ['min', 'number', '0', 'Lower bound.'],
        ['max', 'number', '100', 'Upper bound.'],
        ['unit', 'string', '-', 'Suffix shown after the number, e.g. %.'],
        _DIS,
    ],
    'badge': [
        ['label', 'string', '', 'The text. Keep it to one or two words.'],
        ['tone', 'union', 'neutral', 'Which meaning the badge carries. Derive it from data — never set it by hand at the call site.'],
        _CN,
    ],
    'alert': [
        ['children', 'React.ReactNode', '', 'The message. A node, not a string, so it can carry a link.'],
        ['tone', "'info' | 'success' | 'warning' | 'danger'", "'info'", 'Severity. Drives colour and the default icon.'],
        ['icon', 'React.ReactNode', '-', 'Overrides the tone default.'],
        _CN,
    ],
    'card': [
        ['title', 'string', '-', 'Card heading. Omit for a bare surface.'],
        ['actions', 'React.ReactNode', '-', 'Buttons for the header’s right side.'],
        ['children', 'React.ReactNode', '', 'The body.'],
        ['flush', 'boolean', 'false', 'Drops the body padding, for a card whose content is a table or a list that should meet the edges.'],
        _CN,
    ],
    'text': [
        ['children', 'React.ReactNode', '', 'The content.'],
        ['as', "'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'div' | 'span'", "'p'", 'The element to render. Pick it for document structure, then size it with the style props — never pick a heading level for its size.'],
        ['muted', 'boolean', 'false', 'Secondary ink for supporting copy.'],
        _CN,
    ],
    'progress': [
        ['value', 'number', '', 'Required. Current progress.'],
        ['max', 'number', '100', 'The total.'],
        ['label', 'string', '-', 'Description above the bar.'],
        ['showValue', 'boolean', 'false', 'Prints the number beside the label.'],
        ['size', "'sm' | 'lg'", "'sm'", 'Bar thickness.'],
    ],
    'dialog': [
        ['open', 'boolean', '', 'Required. Render nothing when false; do not just hide it.'],
        ['onClose', '() => void', '', 'Required. Called by the backdrop, the close button and Escape.'],
        ['label', 'string', '', 'Required. The accessible name (aria-label) of the dialog.'],
        ['children', 'React.ReactNode', '', 'The body.'],
    ],
    'confirm': [
        ['open', 'boolean', '', 'Required.'],
        ['onClose', '() => void', '', 'Required. The cancel path — must always be available.'],
        ['onConfirm', '() => void', '', 'Required. The committing action.'],
        ['title', 'string', '', 'Required. Name the specific thing being acted on, not "Are you sure?".'],
        ['description', 'string', '', 'Required. Say what will happen and whether it can be undone.'],
        ['confirmLabel', 'string', "'Confirm'", 'Restate the verb ("Delete document"), never "OK".'],
        ['cancelLabel', 'string', "'Cancel'", 'The way out.'],
        ['variant', "'danger' | 'primary'", "'primary'", 'Use danger for anything destructive — the confirm button must not be the green primary.'],
        ['icon', 'React.ReactNode', '-', 'Optional glyph beside the title.'],
    ],
    'segmented': [
        ['label', 'string', '-', 'Group label; becomes the radiogroup’s accessible name.'],
        ['options', 'readonly T[]', '', 'Required. Two to four choices — more than that wants a dropdown list.'],
        ['value', 'T', '', 'Required — controlled.'],
        ['onChange', '(value: T) => void', '', 'Required.'],
        _DIS,
    ],
    'table': [
        ['columns', 'Column<R>[]', '', 'Required. Each is { key, header, align? } — right-align figures so digits line up.'],
        ['rows', 'R[]', '', 'Required. One object per row.'],
        ['onRowClick', '(row: R) => void', '-', 'Makes rows navigable. Omit for a read-only table so rows do not look clickable.'],
        ['emptyMessage', 'string', "'No matching rows'", 'Shown instead of an empty body. Say how to widen the search.'],
    ],
    'generic': [
        ['children', 'React.ReactNode', '-', 'The content.'],
        _CN,
    ],
}

# ---------------------------------------------------------------------------
# st — which states a kind genuinely cannot have, and why
# ---------------------------------------------------------------------------
_NO_ERR_CTRL = ('A control does not own an error state here — the error belongs to the '
                'field wrapper or the form summary.')
_NO_ERR_STATIC = 'Static presentation. There is nothing to be wrong with.'
_NO_LOAD_STATIC = 'Static presentation. Show loading on whatever is fetching it.'

ABSENT = {
    'text':     {'Hover': 'Not interactive.', 'Focus': 'Not focusable.',
                 'Active': 'Not interactive.', 'Disabled': 'Nothing to disable.',
                 'Loading': _NO_LOAD_STATIC, 'Error': _NO_ERR_STATIC},
    'badge':    {'Focus': 'Not focusable — a badge reports state, it is not a control.',
                 'Active': 'Not interactive.', 'Disabled': 'Nothing to disable.',
                 'Loading': _NO_LOAD_STATIC,
                 'Error': 'A danger TONE is not an error state — it is the value being reported.'},
    'alert':    {'Focus': 'The banner is not focusable; any button inside it is.',
                 'Active': 'Not interactive.', 'Disabled': 'Nothing to disable.',
                 'Loading': _NO_LOAD_STATIC,
                 'Error': 'A danger tone IS the error presentation; the alert has no separate error state.'},
    'card':     {'Disabled': 'Nothing to disable — disable the controls inside it.',
                 'Loading': 'Put the skeleton or spinner in the body, not on the surface.',
                 'Error': 'A failed load is content for the body, not a state of the surface.'},
    'progress': {'Hover': 'Not interactive.', 'Focus': 'Not focusable.',
                 'Active': 'Not interactive.', 'Disabled': 'Nothing to disable.',
                 'Loading': 'It IS the loading indicator.',
                 'Error': 'A failed job is a message beside the bar, not a red bar — red already means over-budget in this system.'},
    'table':    {'Disabled': 'Nothing to disable — a read-only table simply omits onRowClick.',
                 'Error': 'A failed fetch replaces the table; it is not a table state.'},
    'dialog':   {'Hover': 'The surface is not interactive.', 'Active': 'Not interactive.',
                 'Disabled': 'Nothing to disable.',
                 'Error': 'A form error goes inside the body.'},
    'generic':  {},
}

STATE_ORDER = ['Default', 'Hover', 'Focus', 'Active', 'Selected', 'Disabled', 'Loading', 'Error']

# CSS suffix -> which state row it evidences
SUFFIX_STATE = [
    (re.compile(r':hover'), 'Hover'),
    (re.compile(r':focus-visible|:focus'), 'Focus'),
    (re.compile(r':active'), 'Active'),
    (re.compile(r':disabled|\[disabled\]|\.disabled|\.is-disabled'), 'Disabled'),
    (re.compile(r'\.on\b|\.sel\b|\.active\b|\.cs-hi\b|\[aria-checked="true"\]|\[aria-expanded="true"\]'), 'Selected'),
    (re.compile(r'\.gs-shake|\.err\b|\.invalid\b|\.error\b'), 'Error'),
]

_SHARED_FOCUS = ('The shared focus treatment applies: a :focus-visible outline from '
                 'greenstreets-theme.css plus the animated conic ring that '
                 'greenstreets-theme.js draws over the focused control. Neither is in '
                 'this component’s own rules, and the JS ring is not reproduced in the TSX.')


def _ring_removal(decls):
    """True when a rule's only effect is to remove the focus ring.

    `.tbl th.gs-sortable:focus{outline:none}` is real CSS, but printing it as
    the component's focus state tells a developer the opposite of the truth —
    the visible ring comes from the shared :focus-visible block and the JS
    conic ring. Worse, it is the anti-pattern this codebase explicitly warns
    against, so quoting it approvingly would be doubly wrong.
    """
    d = decls.replace(' ', '').rstrip(';').lower()
    return d in ('outline:none', 'outline:0')


def _summarise(decls, limit=3):
    """decls is either a raw CSS string (the @media scan) or the css-index
    shape, which is a list of [property, value] pairs."""
    if isinstance(decls, str):
        parts = [d.strip() for d in decls.split(';') if d.strip()]
    else:
        parts = ['%s: %s' % (d[0], d[1]) for d in decls]
    head = '; '.join(parts[:limit])
    return head + (' …' if len(parts) > limit else '')


def states_for(kind, keys, rules, scan=None):
    """Real pseudo-rules first; then per-kind reasons for what is absent."""
    found = {}
    for k in keys:
        rec = rules.get(k)
        if not rec:
            continue
        for suffix, decls in rec['r']:
            if not suffix:
                continue
            if _ring_removal(_summarise(decls, 99)):
                continue
            for rx, state in SUFFIX_STATE:
                if rx.search(suffix):
                    found.setdefault(state, []).append(('.' + k + suffix, decls))
                    break

    base_decls = []
    for k in keys:
        rec = rules.get(k)
        if not rec:
            continue
        for suffix, decls in rec['r']:
            if not suffix:
                base_decls.append(('.' + k, decls))
                break
        if base_decls:
            break

    absent = ABSENT.get(kind, {})
    out = []
    for state in STATE_ORDER:
        if state == 'Default':
            d = _summarise(base_decls[0][1], 4) if base_decls else 'See the CSS pane.'
            out.append(['Default', 'Resting', (base_decls[0][0] + ' — ' if base_decls else '') + d])
            continue
        if state in found:
            sel, decls = found[state][0]
            trig = {'Hover': 'Pointer over', 'Focus': 'Keyboard focus (focus-visible)',
                    'Active': 'Pointer or key held down', 'Selected': 'Selected / open',
                    'Disabled': 'disabled prop', 'Error': 'Invalid value'}[state]
            out.append([state, trig, sel + ' — ' + _summarise(decls)])
            continue
        if state in absent:
            out.append([state, None, absent[state]])      # None = not applicable
            continue
        # Not a self rule — is it defined on a descendant? (.tbl tbody tr:hover)
        hit = None
        for k in keys:
            got = (scan or {}).get(k, {}).get(state)
            if got:
                hit = got
                break
        if hit:
            out.append([state, 'Defined on a descendant',
                        hit[0] + ' — ' + _summarise(hit[1])])
            continue
        # no rule of its own, but the system may still provide it
        if state == 'Focus':
            out.append(['Focus', 'Keyboard focus (focus-visible)', _SHARED_FOCUS])
        elif state == 'Active':
            out.append(['Active', 'Pointer or key held down',
                        'No rule of its own. Buttons get transform:scale(.955) from the shared '
                        'PRESS FEEDBACK block; rows get a click ripple instead.'])
        elif state == 'Selected':
            continue                       # only shown where it exists
        elif state == 'Disabled':
            out.append(['Disabled', 'disabled prop',
                        'No rule in the stylesheets — the generated component applies '
                        'disabled:opacity-45 and disabled:cursor-not-allowed so the prop is '
                        'not silently ignored. Worth promoting to real CSS.'])
        elif state == 'Loading':
            out.append(['Loading', '',
                        'Not implemented in the prototypes. If the action can be slow, add it '
                        'in the port — an unacknowledged click gets clicked twice.'])
        elif state == 'Error':
            out.append(['Error', None, _NO_ERR_CTRL])
        elif state == 'Hover':
            out.append(['Hover', '',
                        'No hover rule found for these classes anywhere in the base '
                        'stylesheets — not on the element and not on a descendant.'])
    return out


# ---------------------------------------------------------------------------
# rs — measured today, recommended for the port
# ---------------------------------------------------------------------------
_REC_CONTROL = [
    ['Mobile - base, < 640px',
     'Full-width, and raise the tap target to 44px (min-h-[44px]) — the prototype sizes are '
     'below the WCAG 2.5.5 / iOS minimum.'],
    ['Tablet - md:, 640-1024px', 'Intrinsic width, as designed.'],
    ['Desktop - lg:, >= 1024px', 'As the prototypes show. The only width they were designed at.'],
]
_REC_STATIC = [
    ['Mobile - base, < 640px', 'Reflows on its own; check that nothing is pinned to a fixed px width.'],
    ['Tablet - md:, 640-1024px', 'No change.'],
    ['Desktop - lg:, >= 1024px', 'As the prototypes show.'],
]

REC = {
    'input': _REC_CONTROL, 'select': _REC_CONTROL, 'search': _REC_CONTROL,
    'checkbox': _REC_CONTROL, 'toggle': _REC_CONTROL, 'slider': _REC_CONTROL,
    'segmented': [
        ['Mobile - base, < 640px',
         'Four options will not fit side by side. Either wrap to two rows (the flex-wrap is '
         'already there) or fall back to the dropdown list below ~360px.'],
        ['Tablet - md:, 640-1024px', 'Side by side, as designed.'],
        ['Desktop - lg:, >= 1024px', 'As designed.'],
    ],
    'table': [
        ['Mobile - base, < 640px',
         'THE unsolved problem in this codebase. A 9-column grid cannot shrink; pick one — '
         'horizontal scroll with the first column sticky, a card-per-row list, or a chosen '
         'subset of columns. Nothing in the prototypes decides this for you.'],
        ['Tablet - md:, 640-1024px',
         'Horizontal scroll inside the .tbl-wrap, header sticky. The filter toolbar already '
         'stacks at 1000px.'],
        ['Desktop - lg:, >= 1024px', 'As designed.'],
    ],
    'dialog': [
        ['Mobile - base, < 640px',
         'Go full-screen, or a bottom sheet. A centred modal with margins wastes the little '
         'height a phone has, and the keyboard covers half of it.'],
        ['Tablet - md:, 640-1024px', 'Centred, capped to about 90vw.'],
        ['Desktop - lg:, >= 1024px', 'As designed.'],
    ],
    'confirm': [
        ['Mobile - base, < 640px',
         'Full-width stacked buttons with the confirm on top, under the thumb — and keep '
         'cancel reachable, never off-screen.'],
        ['Tablet - md:, 640-1024px', 'Centred dialog, as designed.'],
        ['Desktop - lg:, >= 1024px', 'As designed.'],
    ],
    'card': [
        ['Mobile - base, < 640px',
         'One per row. Any card GRID needs an explicit single-column rule — see the measured '
         'note above for whether this one already has it.'],
        ['Tablet - md:, 640-1024px', 'Two per row.'],
        ['Desktop - lg:, >= 1024px', 'As designed.'],
    ],
    'button': _REC_CONTROL, 'iconbutton': _REC_CONTROL,
    'text': [
        ['Mobile - base, < 640px',
         'Cap measure at about 65 characters and step the display sizes down; the large '
         'headings are set for a desktop column.'],
        ['Tablet - md:, 640-1024px', 'No change.'],
        ['Desktop - lg:, >= 1024px', 'As designed.'],
    ],
    'alert': _REC_STATIC, 'badge': _REC_STATIC, 'progress': _REC_STATIC,
    'generic': _REC_STATIC,
}

FLAG = {
    'input': 'Field heights are 38-42px; the 44px touch minimum is not met.',
    'select': 'The themed menu is a fixed-position portal — it will not clip, but it is not '
              'width-capped for a phone either.',
    'search': 'Field heights are 38-42px; the 44px touch minimum is not met.',
    'checkbox': 'The box is 16px. Extend the hit area to 44px rather than growing the box.',
    'toggle': 'The track is under 44px tall.',
    'iconbutton': 'A 26-30px square is roughly half the 44px touch minimum.',
    'button': 'Small sizes are 28-34px tall against a 44px minimum.',
    'table': 'Also decide what a row TAP does on mobile when the row is both scrollable and '
             'clickable — drag and tap are easy to confuse.',
    'dialog': 'Check the focus trap and that Escape still closes it once it is a sheet.',
}


def resp_for(kind, cls_spec, mediax):
    """Measured breakpoint rules for this specimen's own classes, plus a
    per-kind recommendation the UI badges as a recommendation."""
    classes = _classes(cls_spec)
    hits = []
    for cl in classes:
        for cond, sel, decls in mediax.get(cl, []):
            line = '%s — %s { %s }' % (cond, sel, _summarise(decls, 4))
            if line not in hits:
                hits.append(line)

    if hits:
        now = ('This component DOES have breakpoint rules today: ' + ' · '.join(hits[:4]) +
               ('' if len(hits) <= 4 else ' · (+%d more)' % (len(hits) - 4)))
    else:
        shown = ', '.join('.' + c for c in classes[:5]) or 'its classes'
        now = ('No breakpoint rules. ' + shown + ' is unchanged at every viewport width — '
               'the four portals carry 13 @media blocks in total (640px, 820px, 1000px) and '
               'none of them match this component.')

    return {'now': now, 'rec': REC.get(kind, _REC_STATIC), 'flag': FLAG.get(kind)}


def docs_for(kind, name, cls_spec, keys, rules, mediax, scan=None):
    return {
        'pr': PROPS.get(kind, PROPS['generic']),
        'st': states_for(kind, keys, rules, scan),
        'rs': resp_for(kind, cls_spec, mediax),
    }
