# -*- coding: utf-8 -*-
"""Hand-authored TSX for specimens where the generator is not good enough.

build-tsx.py consults this first and falls back to the per-kind skeleton.

Use an override when the mechanical translation would mislead a developer:
  * the component name — a specimen is a CATALOGUE label ("Button variants"),
    the component is `Button`;
  * the prop contract — the generator cannot know that `.btn-g` is the
    *secondary* of `.btn-p`;
  * separation of concerns — the CSS bakes height, padding, colour and shadow
    into one class, but a React component wants variant and size apart, or
    `size="lg"` and `variant="primary"` fight over the same properties.

Every class string here is the real declaration set from the stylesheets, with
`var(--token)` resolved to its literal, so a snippet pastes into any Tailwind
project with no config and no CSS file.

Sections are being converted one at a time. Done so far: Buttons.
"""

BUTTON_TSX = '''// components/Button.tsx
'use client'

import React from 'react'

type ButtonProps = {
  label: string
  /** One primary action per view. Destructive actions must use `danger` —
   *  never the brand primary. */
  variant?: 'primary' | 'secondary' | 'danger'
  /** Chosen by context, not emphasis: `lg` for a page's committing action,
   *  `md` for header and toolbar actions, `sm` inside a table row. */
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  iconPosition?: 'start' | 'end'
  onClick?: () => void
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit'
  className?: string
}

/* Colour only — height, padding and font-size belong to SIZE, so the two
   never fight over the same properties. */
const VARIANT: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    "border-0 text-[#04160e] bg-[linear-gradient(120deg,#8fe3b6_0%,#4ebb81_45%,#43b3ad_100%)] " +
    "shadow-[0_10px_22px_-8px_rgba(78,187,129,0.45)] " +
    "hover:brightness-[1.06] hover:shadow-[0_12px_26px_-8px_rgba(78,187,129,0.55)]",
  secondary:
    "border border-[rgba(148,180,230,0.26)] bg-white/[0.04] text-white/[0.74] " +
    "hover:border-white/30 hover:bg-white/[0.08] hover:text-white",
  danger:
    "border-0 bg-[#e05252] text-white hover:brightness-[1.1]",
}

const SIZE: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-7 gap-1.5 px-3 text-[11px]',
  md: 'h-[34px] gap-1.5 px-[13px] text-xs',
  lg: 'h-[42px] gap-[7px] px-4 text-[13px]',
}

export function Button({
  label,
  variant = 'primary',
  size = 'lg',
  icon,
  iconPosition = 'start',
  onClick,
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
}: ButtonProps) {
  const inert = disabled || loading

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={inert}
      aria-busy={loading || undefined}
      className={[
        "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-[10px]",
        "font-['Inter',sans-serif] font-semibold transition-[filter,box-shadow,background-color,border-color]",
        'duration-150 active:scale-[0.955]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5b9cf6] focus-visible:ring-offset-0',
        VARIANT[variant],
        SIZE[size],
        inert ? 'cursor-not-allowed opacity-45' : 'cursor-pointer',
        className,
      ].join(' ')}
    >
      {loading && (
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
      )}
      {!loading && icon && iconPosition === 'start' && icon}
      {label}
      {!loading && icon && iconPosition === 'end' && icon}
    </button>
  )
}
'''

BUTTON_USE = '''import { Button } from '@/components/Button'

export default function RetailerPage() {
  return (
    <div className="flex items-center gap-2">
      <Button label="Provision retailer" variant="primary" onClick={() => provision()} />
      <Button label="Cancel" variant="secondary" size="md" onClick={() => router.back()} />
      <Button label="Delete document" variant="danger" onClick={() => remove(id)} />
      <Button label="Saving" variant="primary" loading />
      <Button label="Approve" variant="primary" disabled={!canApprove} onClick={approve} />
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
      <IconButton label="Expand row" icon={<ChevronDownIcon />} onClick={() => toggle(row.id)} />
      <IconButton label="Row actions" icon={<KebabIcon />} onClick={() => openMenu(row.id)} />
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

BUTTONGROUP_USE = '''import { Button } from '@/components/Button'
import { ButtonGroup } from '@/components/ButtonGroup'

export default function ConfigureForm() {
  return (
    <form onSubmit={save}>
      {/* …fields… */}
      <ButtonGroup align="end">
        <Button label="Back" variant="secondary" size="md" onClick={() => router.back()} />
        <Button label="Save configuration" variant="primary" type="submit" />
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
    'Button': {
        'c': 'Button',
        'k': 'button',
        'd': 'The one accent action per view, plus its secondary and destructive '
             'counterparts. Colour comes from the variant prop, geometry from size.',
        'tsx': BUTTON_TSX,
        'use': BUTTON_USE,
    },
    'Icon button': {
        'c': 'IconButton',
        'k': 'iconbutton',
        'd': 'A square button whose only content is an icon, so the label it '
             'requires becomes the tooltip and the accessible name.',
        'tsx': ICONBUTTON_TSX,
        'use': ICONBUTTON_USE,
    },
    'Button group': {
        'c': 'ButtonGroup',
        'k': 'generic',
        'd': 'The action row that closes a form or a wizard step — secondary on '
             'the left, primary on the right.',
        'tsx': BUTTONGROUP_TSX,
        'use': BUTTONGROUP_USE,
    },
    'Reminder button': {
        'c': 'ReminderButton',
        'k': 'button',
        'd': 'Chases a supplier from a listing row, with an escalation menu and '
             'a red treatment once they are past due.',
        'tsx': REMINDER_TSX,
        'use': REMINDER_USE,
    },
}
