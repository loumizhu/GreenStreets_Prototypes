# -*- coding: utf-8 -*-
"""Hand-authored TSX for specimens where the generator is not good enough.

build-tsx.py consults this first and falls back to the per-kind skeleton.

Use an override when the mechanical translation would mislead a developer:
  * the component name — a specimen is a CATALOGUE label ("Button variants"),
    the component is `PrimaryButton`;
  * the prop contract — the generator cannot know that `.btn-g` is the
    *secondary* of `.btn-p`;
  * separation of concerns — the CSS bakes height, padding, colour and shadow
    into one class, but a React component wants `variant` and `size` apart.

One card per button, each self-contained: a developer who needs only a primary
button copies one file and nothing else. The three coloured buttons differ only
in their colour block, and each one says so — collapsing them into a single
`variant` prop is a one-minute edit if that is preferred.

Every class string is the real declaration set from the stylesheets, with
`var(--token)` resolved to its literal, so a snippet pastes into any Tailwind
project with no config and no CSS file.

Sections converted so far: Buttons.
"""

# ── shared preamble, repeated per file so each stands alone ────────────────
_SIZE = """const SIZE = {
  sm: 'h-7 gap-1.5 px-3 text-[11px]',
  md: 'h-[34px] gap-1.5 px-[13px] text-xs',
  lg: 'h-[42px] gap-[7px] px-4 text-[13px]',
}"""

_SPINNER = """      {loading && (
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          className="h-[13px] w-[13px] animate-spin"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.6}
        >
          <path d="M12 3a9 9 0 1 0 9 9" strokeLinecap="round" />
        </svg>
      )}"""


def _button_file(name, colour_comment, colour_classes, default_size='lg'):
    return '''// components/%(N)s.tsx
'use client'

import React from 'react'

type %(N)sProps = {
  label: string
  /** Context, not emphasis: `lg` for a page's committing action, `md` for
   *  header and toolbar actions, `sm` inside a table row. */
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  iconPosition?: 'start' | 'end'
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit'
  className?: string
}

%(SIZE)s

export function %(N)s({
  label,
  size = '%(D)s',
  icon,
  iconPosition = 'start',
  onClick,
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
}: %(N)sProps) {
  const inert = disabled || loading

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={inert}
      aria-busy={loading || undefined}
      className={[
        'inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-[10px]',
        "font-['Inter',sans-serif] font-semibold",
        'transition-[filter,box-shadow,background-color,border-color] duration-150 active:scale-[0.955]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5b9cf6]',
        %(COLOUR)s
        SIZE[size],
        inert ? 'cursor-not-allowed opacity-45' : 'cursor-pointer',
        className,
      ].join(' ')}
    >
%(SPIN)s
      {!loading && icon && iconPosition === 'start' && icon}
      {label}
      {!loading && icon && iconPosition === 'end' && icon}
    </button>
  )
}
''' % {'N': name, 'SIZE': _SIZE, 'D': default_size, 'SPIN': _SPINNER,
       'COLOUR': '/* %s */\n        %s,' % (colour_comment, colour_classes)}


PRIMARY_TSX = _button_file(
    'PrimaryButton',
    'the accent gradient + its lift; the only button that carries a shadow',
    '"border-0 text-[#04160e] bg-[linear-gradient(120deg,#8fe3b6_0%,#4ebb81_45%,#43b3ad_100%)] " +\n'
    '          "shadow-[0_10px_22px_-8px_rgba(78,187,129,0.45)] " +\n'
    '          "hover:brightness-[1.06] hover:shadow-[0_12px_26px_-8px_rgba(78,187,129,0.55)]"')

PRIMARY_USE = '''import { PrimaryButton } from '@/components/PrimaryButton'

export default function AddRetailerStep() {
  return (
    <>
      {/* the one committing action on the screen */}
      <PrimaryButton label="Provision retailer" onClick={() => provision()} />

      {/* size, icon and state are props, not separate components */}
      <PrimaryButton label="Import CSV / XLSX" size="md" icon={<UploadIcon />} onClick={openImport} />
      <PrimaryButton label="Saving" loading />
      <PrimaryButton label="Approve product" disabled={!canApprove} onClick={approve} />
      <PrimaryButton label="Save configuration" type="submit" />
    </>
  )
}
'''

SECONDARY_TSX = _button_file(
    'SecondaryButton',
    'a 1px outline on a translucent surface — no shadow, no fill',
    '"border border-[rgba(148,180,230,0.26)] bg-white/[0.04] text-white/[0.74] " +\n'
    '          "hover:border-white/30 hover:bg-white/[0.08] hover:text-white"',
    default_size='md')

SECONDARY_USE = '''import { SecondaryButton } from '@/components/SecondaryButton'

export default function ProductHeader() {
  return (
    <div className="flex items-center gap-2">
      <SecondaryButton label="Cancel" onClick={() => router.back()} />
      <SecondaryButton label="Add product" icon={<PlusIcon />} onClick={openNew} />

      {/* `sm` is the in-row size — the old .btn-g-sm */}
      <SecondaryButton label="View suppliers" size="sm" onClick={() => go('suppliers')} />
    </div>
  )
}
'''

DANGER_TSX = _button_file(
    'DangerButton',
    'solid red — reserved for an action that destroys or cannot be undone',
    "'border-0 bg-[#e05252] text-white hover:brightness-[1.1]',",
    default_size='md')
DANGER_TSX = DANGER_TSX.replace(
    "        /* solid red — reserved for an action that destroys or cannot be undone */\n"
    "        'border-0 bg-[#e05252] text-white hover:brightness-[1.1]',,",
    "        /* solid red — reserved for an action that destroys or cannot be undone */\n"
    "        'border-0 bg-[#e05252] text-white hover:brightness-[1.1]',")

DANGER_USE = '''import { DangerButton } from '@/components/DangerButton'

export default function DeleteDocumentDialog({ doc }: { doc: Document }) {
  return (
    <div className="flex justify-end gap-2">
      <SecondaryButton label="Cancel" onClick={close} />
      {/* the confirming button of a destructive dialog is NEVER the primary */}
      <DangerButton label="Delete document" onClick={() => remove(doc.id)} />
    </div>
  )
}
'''

ICONBUTTON_TSX = '''// components/IconButton.tsx
'use client'

import React from 'react'

type IconButtonProps = {
  /** There is no visible text, so this is required — it becomes both the
   *  tooltip and the accessible name. */
  label: string
  icon: React.ReactNode
  variant?: 'ghost' | 'accent'
  size?: 'sm' | 'md'
  onClick?: () => void
  disabled?: boolean
  className?: string
}

const VARIANT: Record<NonNullable<IconButtonProps['variant']>, string> = {
  ghost:
    'border border-[rgba(148,180,230,0.26)] bg-white/[0.04] text-white/[0.62] ' +
    'hover:border-white/30 hover:bg-white/[0.08] hover:text-white',
  accent:
    'border-0 bg-[linear-gradient(135deg,#4ebb81,#43b3ad)] text-[#04160e] ' +
    'shadow-[0_2px_8px_rgba(78,187,129,0.35)] hover:-translate-y-px',
}

const SIZE: Record<NonNullable<IconButtonProps['size']>, string> = {
  sm: 'h-[26px] w-[26px] rounded-[7px]',
  md: 'h-[30px] w-[30px] rounded-[9px]',
}

export function IconButton({
  label,
  icon,
  variant = 'ghost',
  size = 'md',
  onClick,
  disabled = false,
  className = '',
}: IconButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={[
        'inline-flex shrink-0 items-center justify-center transition-all duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5b9cf6]',
        VARIANT[variant],
        SIZE[size],
        disabled ? 'cursor-not-allowed opacity-45' : 'cursor-pointer',
        className,
      ].join(' ')}
    >
      {icon}
    </button>
  )
}
'''

ICONBUTTON_USE = '''import { IconButton } from '@/components/IconButton'

export default function ListingRow({ row }: { row: Supplier }) {
  return (
    <div className="flex items-center gap-1.5">
      <IconButton label="Row actions" icon={<KebabIcon />} onClick={() => openMenu(row.id)} />
      <IconButton label="Expand row" icon={<ChevronDownIcon />} size="sm" onClick={() => toggle(row.id)} />
      <IconButton label="Open supplier" icon={<ArrowRightIcon />} variant="accent" onClick={() => open(row.id)} />
    </div>
  )
}
'''

BUTTONGROUP_TSX = '''// components/ButtonGroup.tsx

import React from 'react'

type ButtonGroupProps = {
  children: React.ReactNode
  /** `end` is the form-footer default: secondary on the left, primary right. */
  align?: 'start' | 'end' | 'between'
  /** Adds the footer's top rule and spacing. Drop it for a toolbar cluster. */
  divided?: boolean
  className?: string
}

const ALIGN: Record<NonNullable<ButtonGroupProps['align']>, string> = {
  start: 'justify-start',
  end: 'justify-end',
  between: 'justify-between',
}

export function ButtonGroup({
  children,
  align = 'end',
  divided = true,
  className = '',
}: ButtonGroupProps) {
  return (
    <div
      className={[
        'flex flex-wrap items-center gap-2',
        ALIGN[align],
        divided ? 'mt-4 border-t border-[rgba(148,180,230,0.16)] pt-4' : '',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}
'''

BUTTONGROUP_USE = '''import { PrimaryButton } from '@/components/PrimaryButton'
import { SecondaryButton } from '@/components/SecondaryButton'
import { ButtonGroup } from '@/components/ButtonGroup'

export default function ConfigureForm() {
  return (
    <form onSubmit={save}>
      {/* …fields… */}
      <ButtonGroup align="end">
        <SecondaryButton label="Back" onClick={() => router.back()} />
        <PrimaryButton label="Save configuration" type="submit" />
      </ButtonGroup>
    </form>
  )
}
'''

REMINDER_TSX = '''// components/ReminderButton.tsx
'use client'

import React from 'react'

type ReminderButtonProps = {
  label: string
  /** Flips to the red treatment once the supplier is past its due date. */
  urgent?: boolean
  /** Escalation choices. Omit to render a plain button with no menu. */
  options?: { id: string; label: string }[]
  onSelect?: (id: string) => void
  onClick?: () => void
  disabled?: boolean
}

export function ReminderButton({
  label,
  urgent = false,
  options,
  onSelect,
  onClick,
  disabled = false,
}: ReminderButtonProps) {
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!open) return
    const away = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', away)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('pointerdown', away)
      document.removeEventListener('keydown', esc)
    }
  }, [open])

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        disabled={disabled}
        aria-haspopup={options ? 'menu' : undefined}
        aria-expanded={options ? open : undefined}
        onClick={() => (options ? setOpen((v) => !v) : onClick?.())}
        className={[
          'inline-flex h-7 items-center gap-1.5 rounded-[7px] border px-2.5',
          'text-[11px] font-semibold transition-colors duration-150',
          urgent
            ? 'border-[rgba(224,96,90,0.35)] bg-[rgba(224,96,90,0.14)] text-[#ff9c96] hover:bg-[rgba(224,96,90,0.22)]'
            : 'border-[rgba(148,180,230,0.26)] bg-white/[0.04] text-white/[0.74] hover:bg-white/[0.08] hover:text-white',
          disabled ? 'cursor-not-allowed opacity-45' : 'cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5b9cf6]',
        ].join(' ')}
      >
        {label}
      </button>

      {options && open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+6px)] z-50 w-[210px] overflow-hidden rounded-[10px] border border-[rgba(148,180,230,0.30)] bg-[#0f2340] shadow-[0_24px_60px_-18px_rgba(0,0,0,0.7)]"
        >
          {options.map((o) => (
            <button
              key={o.id}
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false)
                onSelect?.(o.id)
              }}
              className="block w-full px-3 py-2.5 text-left text-[11.5px] text-white/[0.74] hover:bg-[rgba(78,187,129,0.10)] hover:text-[#8fe3b6]"
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
'''

REMINDER_USE = '''import { ReminderButton } from '@/components/ReminderButton'

export default function SupplierRow({ supplier }: { supplier: Supplier }) {
  return (
    <ReminderButton
      label={supplier.overdueDays ? `Overdue ${supplier.overdueDays}d` : 'Remind'}
      urgent={supplier.overdueDays > 0}
      options={[
        { id: 'standard', label: 'Send standard reminder' },
        { id: 'escalate', label: 'Escalate to account owner' },
        { id: 'final', label: 'Send final notice' },
      ]}
      onSelect={(id) => sendReminder(supplier.id, id)}
    />
  )
}
'''

# specimen name → the component shown beside it
OVERRIDES = {
    'Primary button': {
        'c': 'PrimaryButton', 'k': 'button',
        'd': 'The one accent action per view — the thing the screen exists to let you do.',
        'tsx': PRIMARY_TSX, 'use': PRIMARY_USE,
    },
    'Secondary button': {
        'c': 'SecondaryButton', 'k': 'button',
        'd': 'The default button: Cancel, Back, and every action that does not commit. '
             'Never a second primary.',
        'tsx': SECONDARY_TSX, 'use': SECONDARY_USE,
    },
    'Danger button': {
        'c': 'DangerButton', 'k': 'button',
        'd': 'For an action that destroys or cannot be undone. The system has no generic '
             'danger class yet — this is the treatment to promote.',
        'tsx': DANGER_TSX, 'use': DANGER_USE,
    },
    'Icon button': {
        'c': 'IconButton', 'k': 'iconbutton',
        'd': 'A square button whose only content is an icon, so the label it requires '
             'becomes the tooltip and the accessible name.',
        'tsx': ICONBUTTON_TSX, 'use': ICONBUTTON_USE,
    },
    'Button group': {
        'c': 'ButtonGroup', 'k': 'generic',
        'd': 'The action row that closes a form or a wizard step — secondary on the left, '
             'primary on the right.',
        'tsx': BUTTONGROUP_TSX, 'use': BUTTONGROUP_USE,
    },
    'Reminder button': {
        'c': 'ReminderButton', 'k': 'button',
        'd': 'Chases a supplier from a listing row, with an escalation menu and a red '
             'treatment once they are past due.',
        'tsx': REMINDER_TSX, 'use': REMINDER_USE,
    },
}


# ---------------------------------------------------------------------------
# Per-component documentation: props table, states, responsive behaviour.
#
# Three deliberate honesty rules here, because a handoff doc that guesses is
# worse than one that admits a gap:
#
#   * A state a component does not have is recorded as None WITH the reason,
#     not invented. A button has no error state - validation error belongs to
#     the field - so `error` is a None entry and the card says why.
#   * rs['now'] is what the prototype stylesheets actually do, and it is
#     almost always "nothing": the four portals carry 13 media queries between
#     them (640/820/1000px) and not one touches a button, input, table or
#     card. These are desktop-only designs.
#   * rs['rec'] is therefore flagged as a RECOMMENDATION in the UI, never as
#     spec. Someone still has to decide the mobile design; this file does not
#     get to pretend that already happened.
#
# Keys are short because this dict is JSON-dumped into js/tsx-index.js:
#   pr = [[name, type, default, description], ...]   default '' means required
#   st = {key: [trigger, effect]}  - trigger None => "not applicable", and the
#        effect string must then explain why
#   rs = {'now': str, 'rec': [[breakpoint, change], ...], 'flag': str|None}
# ---------------------------------------------------------------------------

# Every button component takes the same contract, so define it once.
_BTN_PROPS = [
    ['label', 'string', '',
     'The button text. Required - it is also the accessible name.'],
    ['size', "'sm' | 'md' | 'lg'", "'lg'",
     'Height and padding only. A small primary is the same style as a large one, which is '
     'why size is a prop and not a second component.'],
    ['icon', 'ReactNode', '-',
     'Optional leading glyph, 14x14 in the prototypes. Hidden while loading.'],
    ['iconPosition', "'left' | 'right'", "'left'", 'Which side the icon sits on.'],
    ['onClick', '(e: MouseEvent<HTMLButtonElement>) => void', '-',
     'Click handler. Not called while disabled or loading.'],
    ['disabled', 'boolean', 'false',
     'Greys the button out and blocks pointer and keyboard activation.'],
    ['loading', 'boolean', 'false',
     'Swaps the icon for a spinner, sets aria-busy and suppresses onClick. Implies disabled.'],
    ['type', "'button' | 'submit' | 'reset'", "'button'",
     'Native type. Set submit only for the one committing button in a form.'],
    ['className', 'string', '-',
     'Escape hatch, appended last so it wins. Use it for layout (w-full, ml-auto), not colour.'],
]

_ICON_PROPS = [
    ['label', 'string', '',
     'Required. Becomes both title and aria-label - the button has no visible text, so '
     'without this it is unusable by screen reader and unexplained on hover.'],
    ['icon', 'ReactNode', '',
     'Required. The glyph; 14x14 stroke-based in the prototypes.'],
    ['tone', "'plain' | 'accent'", "'plain'",
     'plain is the neutral kebab/chevron; accent is the green .act-arrow that opens a record.'],
    ['size', "'sm' | 'md'", "'md'",
     '26px or 30px square. Both are below the 44px touch minimum - see Responsive.'],
    ['onClick', '(e: MouseEvent<HTMLButtonElement>) => void', '-', 'Click handler.'],
    ['disabled', 'boolean', 'false', 'Greys out and blocks activation.'],
    ['expanded', 'boolean', '-',
     'Pass it when the button toggles something, so aria-expanded is emitted and a chevron '
     'can rotate.'],
    ['className', 'string', '-', 'Layout escape hatch.'],
]

_GROUP_PROPS = [
    ['children', 'ReactNode', '',
     'The buttons. Secondary first, primary last - source order is visual order.'],
    ['align', "'split' | 'end'", "'end'",
     'split pushes the first child left and the rest right (Back ... Save); end right-aligns '
     'the lot.'],
    ['bordered', 'boolean', 'true',
     'The 1px top rule that separates the action row from the form above it.'],
    ['className', 'string', '-', 'Layout escape hatch.'],
]

_REMIND_PROPS = [
    ['label', 'string', "'Remind'", 'Button text.'],
    ['urgent', 'boolean', 'false',
     'Past-due treatment - red border, tint and text. Derive it from the due date; do not '
     'set it by hand.'],
    ['options', 'ReminderOption[]', '',
     'Required. The escalation choices; each is { id, label, onSelect }.'],
    ['onOpenChange', '(open: boolean) => void', '-',
     'Fires when the menu opens or closes.'],
    ['disabled', 'boolean', 'false', 'Greys out and blocks activation.'],
    ['className', 'string', '-', 'Layout escape hatch.'],
]

# --- states ----------------------------------------------------------------

_FOCUS = ['Keyboard focus (focus-visible)',
          'A 2px accent ring. A mouse click deliberately does NOT show it. The prototypes '
          'additionally draw an animated conic-gradient ring from greenstreets-theme.js - '
          'that is a JS layer and is not reproduced in the TSX. The ring here is the CSS '
          'fallback, and it is what ships unless you port that script too.']

_PRESS = ['Pointer or key held down',
          'transform: scale(.955) - a press-scale, not a translate. (In the prototypes a '
          'transform on a table row became a containing block for the focus ring and '
          'displaced it, which is why rows get a ripple instead.)']

_NO_ERR = [None,
           'A button has no error state. Validation error belongs to the field or the form '
           'summary; a button only ever reflects whether the action is available (disabled) '
           'or in flight (loading).']


def _btn_states(default_desc, hover_desc):
    return [
        ['Default', 'Resting', default_desc],
        ['Hover', 'Pointer over', hover_desc],
        ['Focus'] + _FOCUS,
        ['Active'] + _PRESS,
        ['Disabled', 'disabled or loading prop',
         'opacity .45, cursor not-allowed, pointer events off. It stays in the tab order '
         'so a keyboard user can still find it - the handler is what is blocked, not the '
         'discovery.'],
        ['Loading', 'loading prop',
         'The icon swaps for a spinning ring, aria-busy="true", onClick suppressed. The '
         'label stays put so the button does not change width mid-request.'],
        ['Error'] + _NO_ERR,
    ]


# --- responsive ------------------------------------------------------------

_BTN_RESP = {
    'now': 'Nothing changes. Height, padding and font-size are fixed at every viewport '
           'width. The four portal stylesheets carry 13 media queries in total '
           '(640px, 820px, 1000px) and none of them touch a button.',
    'rec': [
        ['Mobile - base, < 640px',
         'Full-width inside form footers and dialogs (w-full), stacked with gap-2 rather '
         'than side by side. Raise the tap target to 44px (min-h-[44px]), which the sm and '
         'md sizes currently miss.'],
        ['Tablet - md:, 640-1024px',
         'Back to intrinsic width, side by side. Nothing else: the lg size is already a '
         'reasonable touch target at 42px.'],
        ['Desktop - lg:, >= 1024px',
         'Exactly what the prototypes show today. This is the only width they were '
         'designed at.'],
    ],
    'flag': 'Touch targets: sm is 28px and md is 34px tall, against the 44px minimum in '
            'WCAG 2.5.5 and the iOS HIG. Fine for a mouse, too small for a thumb. Worth '
            'deciding before the port rather than after.',
}

_ICON_RESP = {
    'now': 'Nothing changes - 26px or 30px square at every width.',
    'rec': [
        ['Mobile - base, < 640px',
         'The most urgent fix in this section: a 26px square is a little over half the 44px '
         'touch minimum. Either grow the button to 44px, or keep the 30px visual box and '
         'extend the hit area with a padded wrapper or an inset ::after.'],
        ['Tablet - md:, 640-1024px', 'Same as mobile - a tablet is a touch device too.'],
        ['Desktop - lg:, >= 1024px', '26/30px as drawn. Correct for a mouse.'],
    ],
    'flag': 'Icon-only buttons are the worst offenders for touch size and the easiest to '
            'ship unlabelled. Both are handled in this component (required label prop, and '
            'the hit-area note above) - keep them handled.',
}

_GROUP_RESP = {
    'now': 'Nothing changes. The row stays horizontal and right-aligned at every width, so '
           'on a narrow screen the two buttons crowd the outer edges.',
    'rec': [
        ['Mobile - base, < 640px',
         'Stack, with the primary visually FIRST so the committing action sits under the '
         'thumb, and make both full-width. This is the one place where visual order should '
         'diverge from source order - use flex-col-reverse rather than reordering the DOM, '
         'so the tab order still reads secondary then primary.'],
        ['Tablet - md:, 640-1024px', 'Horizontal, as designed.'],
        ['Desktop - lg:, >= 1024px', 'Horizontal, as designed.'],
    ],
    'flag': None,
}

_REMIND_RESP = {
    'now': 'Nothing changes. The dropdown is a fixed-position portal measured against the '
           'trigger, so no ancestor can clip it - but it is not width-capped for a phone '
           'either.',
    'rec': [
        ['Mobile - base, < 640px',
         'Promote the menu to a bottom sheet, or at minimum cap it to the viewport '
         '(max-w-[calc(100vw-24px)]) and flip it above the trigger near the bottom edge. A '
         '200px menu anchored to a row inside a horizontally scrolling table is unusable.'],
        ['Tablet - md:, 640-1024px', 'Anchored dropdown, as designed.'],
        ['Desktop - lg:, >= 1024px', 'Anchored dropdown, as designed.'],
    ],
    'flag': 'This button lives inside a data table, which is itself the unsolved responsive '
            'problem in this codebase - see the Tables section when it is converted.',
}

_DOCS = {
    'Primary button': {
        'pr': _BTN_PROPS,
        'st': _btn_states(
            'Green gradient (#8fe3b6 -> #4ebb81 -> #43b3ad) on dark ink, no border, soft '
            'green shadow. One per view.',
            'brightness 1.06 and a taller shadow - it lifts rather than changes colour, so '
            'the accent stays the accent.'),
        'rs': _BTN_RESP,
    },
    'Secondary button': {
        'pr': _BTN_PROPS,
        'st': _btn_states(
            '1px translucent border on a barely-there surface, muted white text. The '
            'default button, and the one you reach for most.',
            'Border and text go to full white and the surface lifts to white/8. This is the '
            'only button whose colour changes on hover, because it starts almost invisible.'),
        'rs': _BTN_RESP,
    },
    'Danger button': {
        'pr': _BTN_PROPS,
        'st': _btn_states(
            'Solid red (#e05252) on white. Reserved for destroy-or-cannot-undo, and it '
            'should always sit behind a confirmation.',
            'brightness 1.1. No shape or size change - a destructive button should not feel '
            'eager.'),
        'rs': _BTN_RESP,
    },
    'Icon button': {
        'pr': _ICON_PROPS,
        'st': [
            ['Default', 'Resting',
             'Square, 1px translucent border, muted glyph via currentColor. The accent '
             'tone swaps in a green tint and a small green shadow.'],
            ['Hover', 'Pointer over',
             'Border and glyph to full white, surface to white/8. The accent tone '
             'additionally rises 1px.'],
            ['Focus'] + _FOCUS,
            ['Active'] + _PRESS,
            ['Disabled', 'disabled prop',
             'opacity .45, cursor not-allowed, pointer events off.'],
            ['Loading'] + [None,
             'Not supported, deliberately: there is nowhere to put a spinner in a 26px '
             'square without hiding the glyph that identifies the button. Disable it and '
             'show progress elsewhere.'],
            ['Error'] + _NO_ERR,
        ],
        'rs': _ICON_RESP,
    },
    'Button group': {
        'pr': _GROUP_PROPS,
        'st': [
            ['Default', 'Resting',
             'A flex row above a 1px top rule: first child pushed left, the rest right. '
             'It has no colour of its own - every state you can see belongs to the '
             'buttons inside it.'],
            ['Hover', None, 'None. It is a layout, not a control.'],
            ['Focus', None,
             'None of its own. Focus lands on the child buttons; the group is not '
             'focusable and must not be given a tabindex.'],
            ['Active', None, 'None.'],
            ['Disabled', None,
             'None. Disable the individual buttons - a disabled action row would leave '
             'the user with no way out of the form.'],
            ['Loading', None,
             'None. Put loading on the committing button so the cancel beside it stays live.'],
            ['Error', None, 'None. A form error goes above the group, not on it.'],
        ],
        'rs': _GROUP_RESP,
    },
    'Reminder button': {
        'pr': _REMIND_PROPS,
        'st': [
            ['Default', 'Resting',
             'A secondary-button shell at listing-row scale. urgent swaps border, tint '
             'and text to red - and that tone is derived from the due date, never set by '
             'hand.'],
            ['Hover', 'Pointer over',
             'Surface and text brighten; the urgent tone deepens its red tint instead.'],
            ['Focus'] + _FOCUS,
            ['Active'] + _PRESS,
            ['Open', 'Menu open',
             'aria-expanded="true", and the trigger holds its hover treatment while the '
             'menu is up so it stays clear which row the menu belongs to.'],
            ['Disabled', 'disabled prop',
             'opacity .45, cursor not-allowed, the menu cannot open.'],
            ['Error', None,
             'A failed send is not a button state - it is a toast, and the trigger '
             'returns to resting. Do not leave it in a red failed state: red already '
             'means past-due here.'],
        ],
        'rs': _REMIND_RESP,
    },
}

for _n, _d in _DOCS.items():
    OVERRIDES[_n].update(_d)
