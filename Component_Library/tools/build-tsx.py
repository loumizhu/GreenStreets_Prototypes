# -*- coding: utf-8 -*-
"""Generate the Next.js/Tailwind code shown beside every specimen.

For each specimen in components.html this emits
  * a reusable typed React component using Tailwind utilities inline, and
  * a short import + usage snippet,
into Component_Library/js/tsx-index.js as window.CX_TSX.

The Tailwind classes are translated (tsx_css.py) from the component's REAL
declarations — js/css-index.js, itself generated from the stylesheets — with
every `var(--token)` resolved to its literal value, so a snippet pastes into
any Tailwind project and renders with no config and no CSS file. The token
aliases are offered once, separately, in the Design tokens section.

The JSX comes from a per-kind skeleton (tsx_skeletons.py), NOT from a
transliteration of the prototype's demo markup: a developer needs a component
with a prop contract, not a snapshot of a demo row.

Run from the repo root via Component_Library/tools/regenerate.sh.
"""
import html, io, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

import tsx_css as CSSTW
import tsx_overrides as OV
import tsx_skeletons as SK

LIB = os.path.dirname(HERE)
PAGE = os.path.join(LIB, 'components.html')
IDX = os.path.join(LIB, 'js', 'css-index.js')
OUT = os.path.join(LIB, 'js', 'tsx-index.js')

# ── which skeleton does a specimen get? ────────────────────────────────────
SECTION_KIND = {
    'sec-typography': 'text', 'sec-buttons': 'button', 'sec-fields': 'input',
    'sec-selection': 'toggle', 'sec-alerts': 'alert', 'sec-cards': 'card',
    'sec-tables': 'table', 'sec-dialogs': 'dialog', 'sec-pills': 'badge',
    'sec-progress': 'progress',
}
NAME_KIND = {
    'Themed select': 'select', 'Editable picklist (combo)': 'select',
    'Search field': 'search', 'Themed checkbox': 'checkbox',
    'Segmented choice': 'segmented', 'Percentage slider + number': 'slider',
    'Icon-only buttons': 'iconbutton',
    'Confirmation dialog': 'confirm', 'Inline confirm popover': 'confirm',
    'Plain table': 'table', 'Data grid (full toolkit, live)': 'table',
    'Products listing (Supplier Portal)': 'table',
    'Field grid rows': 'generic', 'Stat cards': 'generic', 'Stepper': 'generic',
    'Toast': 'alert', 'Post-MVP note': 'alert', 'Inline notes & warnings': 'alert',
    'Keyboard coach hint': 'alert',
    'Notification count badge': 'badge', 'Chips': 'badge',
    'Identifier with identicon': 'badge', 'Health dot & RAG': 'badge',
    'AI confidence badge': 'badge',
    'Notification row': 'alert', 'Activity timeline': 'generic',
    'Sidebar nav item': 'generic', 'Breadcrumb': 'generic', 'Tabs': 'segmented',
    'Login fields': 'input', 'Read-only & copy-link fields': 'input',
    'Live values': 'input', 'Number field with stepper & unit': 'input',
    'MFA code field': 'input', 'Material breakdown rows': 'input',
    'Review field': 'input', 'Document chips on a field': 'generic',
}

# The generator cannot know that `.btn-g` is the *secondary* of `.btn-p`, or
# which pill colour carries which meaning. Those maps are stated here.
VARIANTS = {
    'Button variants': [('primary', 'btn-p'), ('secondary', 'btn-g'), ('danger', 'doc-del-pop-yes')],
    'Button sizes': [('primary', 'btn-p'), ('secondary', 'btn-g')],
    'Button states': [('primary', 'btn-p'), ('secondary', 'btn-g')],
    'Form action footer': [('primary', 'btn-p'), ('secondary', 'btn-g')],
    'Reminder split button': [('primary', 'btn-reminder'), ('urgent', 'btn-reminder-urgent')],
}
TONES = {
    'Status pill set': [('green', 'pill-green'), ('amber', 'pill-amber'), ('red', 'pill-red'),
                        ('blue', 'pill-blue'), ('grey', 'pill-grey'), ('accent', 'pill-gs')],
    'Product status pill': [('complete', 'prod-status-complete'), ('incomplete', 'prod-status-incomplete'),
                            ('ready', 'prod-status-ready'), ('submitted', 'prod-status-submitted'),
                            ('delisted', 'prod-status-delisted')],
}


def pascal(name):
    name = html.unescape(name)
    name = re.sub(r'\(.*?\)', ' ', name)
    words = re.findall(r'[A-Za-z0-9]+', name)
    out = ''.join(w[:1].upper() + w[1:] for w in words) or 'Component'
    if out[0].isdigit():
        out = 'Gs' + out
    return out


def first_sentence(tip):
    t = html.unescape(re.sub(r'`([^`]*)`', r'\1', tip or ''))
    t = re.sub(r'\*\*([^*]*)\*\*', r'\1', t)
    t = re.sub(r'\s+', ' ', t).strip()
    m = re.search(r'^(.{20,180}?[.!?])(\s|$)', t)
    return (m.group(1) if m else t)[:180].strip()


# Which of a specimen's classes actually styles the element the skeleton
# renders. `.fgrp` is the field WRAPPER, so an input skeleton that used the
# specimen's first class would put the wrapper's flex-column rules on the
# <input> itself.
PREFERRED_BASE = {
    'input':      ['fi', 'pkg-detail-feat-input', 'pd-input', 'invite-link-field', 'mfa-fi', 'notes-area'],
    'search':     ['fi-search', 'fi'],
    'select':     ['fi-select', 'fi', 'pkg-detail-feat-select'],
    'checkbox':   ['gs-row-check', 'gs-check-all'],
    'card':       ['grp', 'glass', 'pkg-card', 'pd-card', 'recap-card', 'stat'],
    'badge':      ['pill', 'air-badge', 'chip', 'pkg-level-pill', 'bell-badge', 'health'],
    'table':      ['tbl', 'prod-tbl'],
    'dialog':     ['modal-box', 'pkg-modal', 'dpick-box', 'docs-preview-card', 'theme-panel'],
    'alert':      ['alert', 'gs-toast', 'pd-note', 'postmvp-note', 'gs-grid-hint', 'notif-item'],
    'progress':   ['prog', 'pkg-bar'],
    'button':     ['btn-p', 'btn-g', 'btn-reminder'],
    'iconbutton': ['chev-btn', 'btn-kebab', 'pkg-back-btn'],
    'segmented':  ['gs-seg-opt', 'landing-tab', 'prod-filter-btn'],
    'toggle':     ['tgl', 'gs-toggle'],
}


def pick_base(kind, keys, rules):
    for want in PREFERRED_BASE.get(kind, []):
        if want in keys and want in rules:
            return want
    for want in PREFERRED_BASE.get(kind, []):
        if want in rules:
            return want
    for k in keys:
        if k in rules:
            return k
    return ''


def kind_for(name, section, cls_spec):
    if name in NAME_KIND:
        return NAME_KIND[name]
    if section == 'sec-buttons' and re.search(r'\bbtn|-btn\b', cls_spec, re.I):
        return 'button'
    return SECTION_KIND.get(section, 'generic')


def build():
    raw = io.open(IDX, encoding='utf-8').read()
    index = json.loads(raw.split('window.CX_CSS_INDEX=', 1)[1].rstrip().rstrip(';'))
    page = io.open(PAGE, encoding='utf-8').read()

    out, seen = {}, {}
    ARTICLE = re.compile(
        r'data-name="([^"]*)"[\s\S]{0,1400}?data-cls="([^"]*)"[\s\S]{0,2600}?data-tip="([^"]*)"')

    for sm in re.finditer(r'<section class="cx-sec" id="([^"]+)"', page):
        sid = sm.group(1)
        block = page[sm.end():page.index('</section>', sm.end())]
        for am in ARTICLE.finditer(block):
            name = html.unescape(am.group(1))
            cls_spec, tip = am.group(2), am.group(3)
            # a hand-authored component wins over the generator — see
            # tsx_overrides.py for when that is the right call
            if name in OV.OVERRIDES:
                out[name] = dict(OV.OVERRIDES[name])
                seen[out[name]['c']] = 1
                continue

            kind = kind_for(name, sid, cls_spec)

            C = pascal(name)
            if C in seen:
                seen[C] += 1
                C = '%s%d' % (C, seen[C])
            else:
                seen[C] = 1

            keys = index['specimens'].get(name) or []
            primary = pick_base(kind, keys, index['rules'])
            base, states = CSSTW.tw_for(primary, index) if primary else ('', {})

            extra = {}
            for src, dst in ((VARIANTS, 'variants'), (TONES, 'tones')):
                if name in src:
                    got = {}
                    for label, cl in src[name]:
                        b, _ = CSSTW.tw_for(cl, index)
                        if b:
                            got[label] = b
                    if got:
                        extra[dst] = got

            tsx = SK.render(kind, C, base, states, extra)

            header = '// components/%s.tsx\n' % C
            if 'React.useEffect' in tsx or 'React.useRef' in tsx:
                header += "'use client'\n\nimport React from 'react'\n\n"
            elif re.search(r'on(?:Click|Change|Close|Confirm|RowClick)\??\(', tsx):
                header += "'use client'\n\n"

            out[name] = {
                'c': C,
                'k': kind,
                'd': first_sentence(tip),
                'tsx': header + tsx + '\n',
                'use': SK.usage(kind, C) + '\n',
            }

    hdr = ('/* tsx-index.js - GENERATED by Component_Library/tools/build-tsx.py.\n'
           '   The Next.js/Tailwind code shown beside each specimen. Do not hand-edit. */\n')
    io.open(OUT, 'w', encoding='utf-8').write(
        hdr + 'window.CX_TSX=' + json.dumps(out, separators=(',', ':'), sort_keys=True) + ';\n')

    from collections import Counter
    kinds = Counter(v['k'] for v in out.values())
    hand = sorted(n for n in out if n in OV.OVERRIDES)
    print('js/tsx-index.js: %d components, %d KB' % (len(out), os.path.getsize(OUT) // 1024))
    print('  kinds: ' + ', '.join('%s=%d' % kv for kv in kinds.most_common()))
    print('  hand-authored (%d): %s' % (len(hand), ', '.join(hand)))
    empty = sorted(n for n, v in out.items() if "''," in v['tsx'].split('className')[0][:0] or False)
    noclass = sorted(n for n, v in out.items() if not (index['specimens'].get(n) or []))
    if noclass:
        print('  no class to translate (skeleton defaults used): ' + '; '.join(noclass))


if __name__ == '__main__':
    build()
