# -*- coding: utf-8 -*-
"""Draw every state a component actually has, on a static page.

A handoff sheet has to show more than a resting component. A dropdown list has
a collapsed state, an open state and a state with a value chosen; a checkbox has
unchecked, checked and indeterminate; most controls have hover, focus and
disabled. None of that can be captured from a page where nothing is hovering
and nothing is open.

Two different problems, solved two different ways:

CSS STATES — hover, focus, active, disabled.
    `:hover` cannot be forced, so the real declarations are read out of the
    stylesheets and RE-APPLIED under a wrapper class: `.btn-p:hover{...}`
    becomes `.bk-st-hover .btn-p{...}`, verbatim. What the sheet draws is the
    real state by construction, and being regenerated it cannot drift.

STRUCTURAL STATES — collapsed/open, selected, checked, filled, sorted.
    These are not pseudo-classes: they are a different DOM. The CSS already
    styles them (`.on` 31 rules, `.active` 38, `.open` 19, `:checked` 12), so
    nothing needs generating — the cell is realised at runtime by base-kit.js
    doing what a user would do: open the menu, choose the option, tick the box.

What is NOT drawn, and why: `error`. The system has two error rules and both
are `.gs-shake`, a keyframe animation. There is no static error appearance to
draw, and inventing one would put a state in front of a developer that the
system does not have.
"""
import io
import os
import re

BASE_SHEETS = ('greenstreets-theme.css', 'supplier-portal.css', 'portal-extras.css')

# Properties that change the drawing. A rule that only sets `cursor` is not a
# state worth its own cell.
VISUAL = (
    'background', 'background-color', 'background-image', 'background-position',
    'color', 'border', 'border-color', 'border-top-color', 'border-right-color',
    'border-bottom-color', 'border-left-color', 'border-width', 'border-style',
    'box-shadow', 'text-shadow', 'transform', 'opacity', 'filter', 'outline',
    'outline-color', 'outline-offset', 'text-decoration', 'text-decoration-color',
    'fill', 'stroke', 'font-weight', 'letter-spacing',
)

# Dropped when re-applying. Motion matters most: this stylesheet is emitted
# AFTER base-kit.css, so an `animation` carried over with !important would
# defeat the "no motion in a still" rule and let a capture catch a mid-tween.
DROP = ('animation', 'animation-name', 'animation-duration', 'animation-timing-function',
        'transition', 'transition-property', 'transition-duration', 'will-change', 'cursor')

# The CSS states, in the order a developer reads them.
CSS_STATES = (
    ('hover',    re.compile(r':hover')),
    ('focus',    re.compile(r':focus-visible|:focus(?![\w-])')),
    ('active',   re.compile(r':active')),
    ('disabled', re.compile(r':disabled|\[disabled\]|\.disabled(?![\w-])')),
)

# A state on a REPEATED child is pinned to one of them: `.tbl tbody tr:hover`
# across a whole table draws every row hovered, which reads as a bug rather
# than as a state. Beware that `:first-of-type` is evaluated INDEPENDENTLY of
# `:not()` — `:not(.on):first-of-type` matches nothing when the first item is
# the selected one, which is exactly the case in a segmented control and in
# tabs, so those pin to the last instead.
REPEATED = (
    (re.compile(r'(?<![\w-])tr:(hover|focus|active)'), r'tr:first-child'),
    (re.compile(r'\.cs-opt:(hover|focus|active)'), r'.cs-opt:first-child'),
    (re.compile(r'\.gs-seg-opt:(hover|focus|active)'), r'.gs-seg-opt:not(.on):last-of-type'),
    (re.compile(r'\.landing-tab:(hover|focus|active)'), r'.landing-tab:not(.active):last-of-type'),
    (re.compile(r'\.nav-item:(hover|focus|active)'), r'.nav-item:not(.active):last-of-type'),
    (re.compile(r'[A-Za-z]*\.gs-crumb:(hover|focus|active)'),
     r'.gs-crumb:not(.gs-crumb-current):first-of-type'),
    (re.compile(r'(?<![\w-])li:(hover|focus|active)'), r'li:first-child'),
)

# ---------------------------------------------------------------------------
# STRUCTURAL states, hand-authored per component.
#
# This is the part that cannot be derived: only a person knows that a dropdown
# has a collapsed and an open state, and that "selected" means a value is
# showing in the trigger. Each entry is (cell label, action for base-kit.js).
# The actions are implemented in base-kit.js — keep the two in step.
#
# The DEFAULT cell's label is overridden where "Default" is the wrong word: a
# dropdown's resting state is "Collapsed", a checkbox's is "Unchecked".
# ---------------------------------------------------------------------------
DEFAULT_LABEL = {
    'Dropdown list': 'Collapsed',
    'Editable dropdown list': 'Collapsed',
    'Checkbox': 'Unchecked',
    'Text input': 'Empty',
    'Input field with icon': 'Empty',
    'Progress bar': 'In progress',
    'Sortable header': 'Unsorted',
    'Number input': 'With a value',
}

STRUCTURAL = {
    # An open list with nothing hovered, plus a separate hover cell, was two
    # near-identical drawings of the same menu - and the plain hover cell drew
    # NOTHING, because this component's hover lives on `.cs-opt`, which only
    # exists once the list is open. So one cell carries both: the list open with
    # one option hovered. Entries may be (label, action) or
    # (label, css state, action).
    'Dropdown list': [
        ('Open, one item hovered', 'hover', 'open'),
    ],
    'Editable dropdown list': [
        ('Open, one item hovered', 'hover', 'open'),
        ('Typed', 'typed'),
    ],
    'Checkbox': [
        ('Checked', 'checked'),
        ('Indeterminate', 'indeterminate'),
    ],
    'Text input': [
        ('Filled', 'filled'),
    ],
    'Input field with icon': [
        # "With a query" read as a search-only label. The control is a text
        # field with an icon, so it matches Text input's own filled cell.
        ('Filled', 'query'),
    ],
    'Number input': [
        ('Empty', 'empty'),
    ],
    'Sortable header': [
        ('Sorted ascending', 'sort-asc'),
        ('Sorted descending', 'sort-desc'),
    ],
    'Progress bar': [
        ('Complete', 'progress-full'),
        ('Just started', 'progress-low'),
    ],
    'Segmented control': [
        ('Second option selected', 'seg-next'),
    ],
    'Tabs': [
        ('Second tab active', 'tab-next'),
    ],
    'Table': [
        ('Row selected', 'row-selected'),
    ],
    # The chip's two real variants. Both are markup the product emits, not CSS
    # a wrapper class can force: the quantity badge and the note glyph only
    # exist when there is a quantity above one / a note to show.
    'Component chip': [
        ('Quantity above one', 'pcmp-qty'),
        ('With a retailer note', 'pcmp-note'),
    ],
    'Status pill': [],          # the specimen already draws every tone
    'Alert banner': [],         # ditto
}


# The system's focus treatment, reproduced statically. Written by hand because
# it is not a per-class rule that could be extracted: `.fi` and the three button
# classes get the animated `.fs-ring` OVERLAY from greenstreets-theme.js, and
# everything else focusable gets the generic keyboard `outline` rule. The kit
# removes that overlay (a positioned overlay imports as a detached layer), so
# the drawn-on appearance is recreated here.
#
# `outline` rather than `box-shadow` on purpose: the field's own `:focus` rule
# already sets a box-shadow glow, and an outline stacks with it instead of
# overwriting it — so the cell shows the ring AND the glow, which is what the
# product actually looks like.
SYSTEM_FOCUS = """/* ---- the system focus ring (see SYSTEM_FOCUS in tools/kit_states.py) ---- */
/* EVERY control in a focus cell gets the ring, not one marked target. A spec
   sheet documents the treatment; a frame holding a text input and a textarea
   should show the ring on both, even though a browser can only focus one. */
/* .fi and the button classes carry the .fs-ring overlay in the product: a ring
   at the control's own radius, hugging it with no offset. */
.bk-st-focus .fi,
.bk-st-focus .btn-p,
.bk-st-focus .btn-g,
.bk-st-focus .btn-g-sm,
.bk-st-focus .cs-trigger{
  outline:var(--field-stroke-weight,2px) solid var(--field-stroke-color,var(--gs,#4ebb81))!important;
  outline-offset:0!important;
}
/* Everything else focusable gets the generic keyboard ring, offset by 2px -
   the same rule greenstreets-theme.css applies. */
.bk-st-focus input:not(.fi):not([tabindex="-1"]),
.bk-st-focus textarea:not(.fi):not([tabindex="-1"]),
.bk-st-focus select:not(.fi):not([tabindex="-1"]),
.bk-st-focus button:not(.btn-p):not(.btn-g):not(.btn-g-sm):not([tabindex="-1"]):not(.gs-num-btn),
.bk-st-focus a[href],
.bk-st-focus .gs-crumb,
.bk-st-focus .nav-item,
.bk-st-focus .landing-tab,
.bk-st-focus .bc-link,
.bk-st-focus .docs-vbtn{
  outline:2px solid var(--field-stroke-color,var(--gs,#4ebb81))!important;
  outline-offset:2px!important;
}
/* Last word: `tabindex="-1"` cannot take keyboard focus, so it must never draw
   a focus ring - not even from its own extracted rule. The number stepper's
   arrows and the editable combo's caret are both tabIndex=-1 and were each
   drawing a ring INSIDE the focused field. */
.bk-st-focus [tabindex="-1"]{outline:none!important}
"""


# The system's disabled treatment, reproduced statically - and, like
# SYSTEM_FOCUS, hand-written because it is not a per-class rule that could be
# extracted. No portal declares `:disabled` for `.btn-p` / `.btn-g` /
# `.btn-g-sm`, so the four button frames drew NO deactivated state at all,
# though `disabled` is a documented prop. The treatment itself is not invented:
# every product button class that DOES carry it agrees on dim + no pointer
# (`.gs-pager .btn-g-sm[disabled]`, `.prod-submit-btn`, `.pcmp-step`,
# `.prod-pg-btn`, `.dpg-btn`, `.air-finish-btn`), and .45 is the opacity the
# handoff docs in tools/tsx_overrides.py already specify.
SYSTEM_DISABLED = """/* ---- the system disabled treatment (see SYSTEM_DISABLED in tools/kit_states.py) ---- */
/* Keyed off the ATTRIBUTE, not a class list. Keyed off classes, this missed the
   two button specimens that are catalogued under a generic name but authored
   with the portal's own class - `.doc-del-pop-yes` for Danger, `.btn-kebab` for
   Icon - and both drew identically to their default cell, which is exactly the
   lie a state cell must never tell. */
/* Scoped to `-sys`, NOT to every disabled cell. A component that declares its
   OWN :disabled rule must keep it: the packaging component chip dims its
   stepper to .32, and this block - emitted last, so it wins on source order -
   was overriding that to .45 and shipping a value the product never renders.
   Only the allowlist cells, which exist precisely because no rule was found,
   carry `.bk-st-disabled-sys`. */
.bk-st-disabled-sys [disabled],
.bk-st-disabled-sys [aria-disabled="true"]{
  opacity:.45!important;
  cursor:not-allowed!important;
  pointer-events:none!important;
  box-shadow:none!important;
}
/* The label beside a disabled control dims with it - a bright label over a
   greyed field reads as a rendering fault rather than an unavailable control. */
.bk-st-disabled-sys .flbl,
.bk-st-disabled-sys .fi-unit,
.bk-st-disabled-sys label:has([disabled]){opacity:.45!important}
"""

# Specimens whose primary control really does take `disabled`. An allowlist, not
# a scan for `<button>`: a Table's rows are not disablable and dimming its
# toolbar would assert a state the component does not have. The themed dropdown
# is out because its trigger is a div with no disabled attribute and no product
# rule to reproduce.
SYSTEM_DISABLED_FOR = {
    'Primary button', 'Secondary button', 'Danger button', 'Icon button',
    'Button group', 'Reminder button',
    'Text input', 'Input field with icon', 'Login input', 'Number input', 'Checkbox',
}


# The press feedback, reproduced statically - the third system treatment,
# alongside SYSTEM_FOCUS and SYSTEM_DISABLED. There is exactly ONE `:active`
# declaration in the whole system (greenstreets-theme.css, the PRESS FEEDBACK
# block): `transform:scale(.955)` on a long list of button selectors, most of
# which are the bare `button` / `[role="button"]` TAGS. No control has a bespoke
# pressed state.
#
# Extraction matches on the specimen's CLASSES, so it caught `.btn-p` and
# `.btn-g` and missed Danger button, whose specimen is authored as a plain
# `<button class="doc-del-pop-yes">` - which the product shrinks exactly like
# the others. Omitting a state the control has is the same lie as inventing one
# it lacks, so the tag reach is reproduced here.
#
# The one exception is real and load-bearing: `.gs-num-btn:active{transform:none}`
# - the number stepper's arrows deliberately do NOT shrink, because a 4.5%
# shrink on a 14px arrow reads as a glitch.
SYSTEM_ACTIVE = """/* ---- press feedback (see SYSTEM_ACTIVE in tools/kit_states.py) ---- */
.bk-st-active button,
.bk-st-active [role="button"],
.bk-st-active .btn-p,
.bk-st-active .btn-g,
.bk-st-active .btn-g-sm{transform:scale(.955)!important}
/* The stepper arrows are excluded in the product too. Last word, as with the
   focus suppression - the rule it overrides shares its specificity. */
.bk-st-active .gs-num-btn,
.bk-st-active .gs-num-steppers button{transform:none!important}
"""

# Specimens whose control really is pressable. An allowlist for the same reason
# SYSTEM_DISABLED_FOR is one: a Table's toolbar shrinking would document a press
# state for the table.
SYSTEM_ACTIVE_FOR = {
    'Primary button', 'Secondary button', 'Danger button', 'Icon button',
    'Button group', 'Reminder button',
}


# These carry their hover on the combined open cell above, so the plain CSS
# hover cell would be a duplicate - and an empty one, since the hover target
# only exists when the list is open.
SKIP_CSS_STATE = {
    'Dropdown list': {'hover'},
    'Editable dropdown list': {'hover'},
}


def _visual(decls):
    return any(d.split(':', 1)[0].strip().lower() in VISUAL
               for d in decls.split(';') if ':' in d)


def state_rules(lib):
    """{state: [(selector, declarations), ...]} for every CSS state."""
    found = {name: [] for name, _ in CSS_STATES}
    for sheet in BASE_SHEETS:
        path = os.path.join(lib, 'css', sheet)
        if not os.path.exists(path):
            continue
        css = re.sub(r'/\*[\s\S]*?\*/', ' ',
                     io.open(path, encoding='utf-8', errors='replace').read())
        css = re.sub(r'@media[^{]*\{', ' ', css)      # a breakpoint is not a state
        for m in re.finditer(r'([^{}]+)\{([^{}]*)\}', css):
            sel = ' '.join(m.group(1).split())
            decls = ' '.join(m.group(2).split()).strip().rstrip(';')
            if not decls or not _visual(decls):
                continue
            if _ring_removal(decls):
                continue
            for name, rx in CSS_STATES:
                if rx.search(sel):
                    found[name].append((sel, decls))
                    break
    return found


def _ring_removal(decls):
    """A rule whose only effect is removing the focus ring is not a focus state
    — it is the absence of one, and quoting it would tell a developer the
    opposite of the truth."""
    d = decls.replace(' ', '').rstrip(';').lower()
    return d in ('outline:none', 'outline:0')


def primary_classes(cls_spec):
    return set(re.findall(r'\.([A-Za-z][\w-]*)', cls_spec or ''))


def rules_for(cls_spec, rules, rx):
    """The rules of one state that belong to THIS specimen.

    The class carrying the pseudo must be one of the specimen's own — without
    that test a colour-swatch grid gains a hover from a `.gs-lp` that merely
    appears in its markup, and every table gains one from a button inside it.
    """
    own = primary_classes(cls_spec)
    if not own:
        return []
    keep = []
    for sel, decls in rules:
        for part in sel.split(','):
            if not rx.search(part):
                continue
            target = rx.split(part)[0]
            target = re.sub(r':not\([^)]*\)', '', target)
            last = re.split(r'[\s>+~]', target.strip())[-1]
            if set(re.findall(r'\.([A-Za-z][\w-]*)', last)) & own:
                keep.append((part.strip(), decls))
                break
    return keep


def rewrite(part, state, rx):
    """`.tbl tbody tr:hover` -> `.bk-st-hover .tbl tbody tr:first-child`.

    Focus and active both gain `.bk-st-target`, a marker base-kit.js puts on
    ONE element per cell. Both states are physically singular — only one
    element can hold focus, and only one can be held down — so applying them to
    every matching control drew two focus rings (or two pressed buttons) at
    once, a state no browser can produce.
    """
    for r, repl in REPEATED:
        if r.search(part):
            part = r.sub(repl, part)
            break
    part = rx.sub('', part)
    part = part.replace('[disabled]', '').replace('.disabled', '')
    part = ' '.join(part.split())
    return '.bk-st-%s %s' % (state, part)


def emit(lib, used, out_name='base-kit-states.css'):
    """Write the generated state stylesheet. `used` is [(state, part, decls)].

    `!important` on every declaration is deliberate. The rewritten selector
    gains a class so it usually wins on specificity, but "usually" is not good
    enough: a state cell that silently failed to apply would look identical to
    the default cell and quietly tell a developer the state does not exist. The
    sheet is scoped to `.bk-st-*`, which exists only inside a state cell.
    """
    lines = [
        '/* base-kit-states.css - GENERATED by tools/kit_states.py. Do not hand-edit.',
        '   The real hover/focus/active/disabled declarations from the base stylesheets,',
        '   re-applied under .bk-st-<state> so a static sheet can DRAW them. Structural',
        '   states (open, selected, checked) need no CSS here - the product CSS already',
        '   styles .on/.sel/.active/.open, and base-kit.js puts the markup in that state. */',
        '',
    ]
    lines.append(SYSTEM_FOCUS)
    lines.append(SYSTEM_DISABLED)
    lines.append(SYSTEM_ACTIVE)

    seen, n = set(), 0
    by_state = {}
    for state, part, decls in used:
        by_state.setdefault(state, []).append((part, decls))
    for state, rx in CSS_STATES:
        if state not in by_state:
            continue
        lines.append('/* ---- %s ---- */' % state)
        for part, decls in by_state[state]:
            sel = rewrite(part, state, rx)
            body = '; '.join(
                d.strip() + ('' if '!important' in d else ' !important')
                for d in decls.split(';')
                if d.strip() and d.split(':', 1)[0].strip().lower() not in DROP)
            if not body:
                continue
            rule = '%s{%s}' % (sel, body)
            if rule in seen:
                continue
            seen.add(rule)
            lines.append(rule)
            n += 1
        lines.append('')
    # SYSTEM_FOCUS goes LAST. The rules it must override sit at the same
    # specificity - the product's own generic keyboard rule extracts as
    # `.bk-st-focus [tabindex]:not(...)`, which matches tabindex="-1" too - so
    # ORDER is what decides. Emitted first, the suppression lost and the number
    # stepper's arrows kept drawing their own rings inside the focused field.
    lines.append(SYSTEM_FOCUS)
    lines.append(SYSTEM_DISABLED)
    lines.append(SYSTEM_ACTIVE)

    io.open(os.path.join(lib, 'css', out_name), 'w',
            encoding='utf-8', newline='\n').write('\n'.join(lines) + '\n')
    return n


def plan(name, cls_spec, all_rules, markup):
    """The ordered list of cells for one specimen.

    [(label, css state or '', js action or ''), ...] — Default always first,
    then the CSS states the stylesheets actually define for this component,
    then the structural states a person has declared for it.
    """
    cells = [(DEFAULT_LABEL.get(name, 'Default'), '', '')]
    used = []

    focusable = re.search(r'<(input|button|select|textarea|a\s)\b', markup) \
        or 'tabindex' in markup

    skip = SKIP_CSS_STATE.get(name, set())
    for state, rx in CSS_STATES:
        got = rules_for(cls_spec, all_rules.get(state, []), rx)
        if state in skip:
            # the rules are still needed - a combined cell (e.g. open + hovered
            # option) applies them - only the standalone cell is suppressed
            used += [(state, p_, d_) for p_, d_ in got]
            continue
        # Focus is a SYSTEM treatment, not a per-class rule — the ring comes
        # from the shared overlay (or the generic keyboard outline), so every
        # focusable component has one whether or not it owns a :focus rule.
        # Without this, buttons had no Focus cell at all.
        if state == 'focus' and not got and focusable:
            cells.append(('Focus', 'focus', ''))
            continue
        # Disabled is a SYSTEM treatment too - see SYSTEM_DISABLED. The button
        # classes carry no `:disabled` rule anywhere, so without this the four
        # button frames had no deactivated state at all.
        if state == 'disabled' and not got and name in SYSTEM_DISABLED_FOR:
            cells.append(('Disabled', 'disabled-sys', 'disable'))
            continue
        # Same for the press feedback - see SYSTEM_ACTIVE. Extraction reads
        # classes, and this rule reaches most of its targets through the bare
        # `button` tag, so Danger button had no Active cell.
        if state == 'active' and name in SYSTEM_ACTIVE_FOR:
            cells.append(('Pressed', 'active', ''))
            continue
        # A rule whose whole effect is `transform:none` REMOVES the press
        # feedback rather than being one - `.gs-num-btn:active{transform:none}`
        # is there precisely so the stepper arrows do not shrink. Reported as a
        # state it drew a cell identical to the default, asserting a press the
        # control does not have. Same reasoning as skipping an `outline:none`
        # rule when scanning for focus states.
        if state == 'active' and got and all(
                d.split(':', 1)[-1].strip() in ('none', 'unset', 'initial')
                for _p, dec in got for d in dec.split(';') if d.strip()):
            continue
        if not got:
            continue
        # A disabled cell is only honest if the markup has something to disable.
        if state == 'disabled' and not re.search(r'<(input|button|select|textarea)\b', markup):
            continue
        used += [(state, p, d) for p, d in got]
        cells.append((state.capitalize(), state, ''))

    for entry in STRUCTURAL.get(name, []):
        if len(entry) == 3:
            cells.append(entry)                     # (label, css state, action)
        else:
            cells.append((entry[0], '', entry[1]))  # (label, action)

    return cells, used
