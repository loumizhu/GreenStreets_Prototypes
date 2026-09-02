# -*- coding: utf-8 -*-
"""TSX skeletons for the component library's Column 2.

One skeleton per component kind. Each returns idiomatic Next.js/React source
with Tailwind utilities inline and TypeScript prop types — NOT a mechanical
transliteration of the prototype's demo markup, which would produce a
throwaway snapshot rather than something a developer can adopt.

Placeholders are substituted with str.replace (`__C__` component name,
`__BASE__` the Tailwind classes translated from the component's real CSS),
deliberately not %-formatting or .format(): these strings are full of `%`
(CSS percentages) and `{}` (JSX expressions).
"""

def _sub(tpl, C, base='', extra=''):
    return (tpl.replace('__C__', C)
               .replace('__BASE__', base)
               .replace('__EXTRA__', extra)).strip()


# ── interactive ────────────────────────────────────────────────────────────
BUTTON = '''
type __C__Props = {
  label: string
  variant?: __KEYS__
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}

const VARIANT: Record<NonNullable<__C__Props['variant']>, string> = {
__VLINES__
}

const SIZE = {
  sm: 'h-7 px-2.5 text-[11px]',
  md: 'h-[34px] px-[13px] text-xs',
  lg: 'h-[42px] px-4 text-[13px]',
}

export function __C__({
  label,
  variant = '__FIRST__',
  size = 'lg',
  icon,
  onClick,
  disabled = false,
  className = '',
}: __C__Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "inline-flex items-center justify-center gap-[7px] whitespace-nowrap font-['Inter',sans-serif] font-semibold",
        'transition-[filter,box-shadow] duration-150 active:scale-[0.955]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5b9cf6]',
        VARIANT[variant],
        SIZE[size],
        disabled ? 'cursor-not-allowed opacity-45' : 'cursor-pointer',
        className,
      ].join(' ')}
    >
      {icon}
      {label}
    </button>
  )
}
'''

ICONBUTTON = '''
type __C__Props = {
  /** No visible text, so a label is required — it becomes title + aria-label. */
  label: string
  icon: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export function __C__({ label, icon, onClick, disabled = false, className = '' }: __C__Props) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={[
        "__BASE__",
        'inline-flex items-center justify-center transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5b9cf6]',
        disabled ? 'cursor-not-allowed opacity-45' : 'cursor-pointer',
        className,
      ].join(' ')}
    >
      {icon}
    </button>
  )
}
'''

INPUT = '''
type __C__Props = {
  label: string
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  hint?: string
  error?: string
  type?: 'text' | 'email' | 'password' | 'number'
  required?: boolean
  disabled?: boolean
}

export function __C__({
  label,
  value,
  onChange,
  placeholder,
  hint,
  error,
  type = 'text',
  required = false,
  disabled = false,
}: __C__Props) {
  return (
    <label className="mb-3 flex flex-col gap-1">
      <span className="text-[11.5px] font-medium text-white/[0.74]">
        {label}
        {required && <span className="ml-0.5 text-[#e0605a]">*</span>}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        aria-invalid={!!error}
        onChange={(e) => onChange?.(e.target.value)}
        className={[
          "__BASE__",
          'w-full outline-none transition-colors duration-150',
          'placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-60',
          error ? 'border-[#e0605a]' : 'focus:border-[#5b9cf6]',
        ].join(' ')}
      />
      {(error || hint) && (
        <span className={error ? 'text-[11px] text-[#e0605a]' : 'text-[11px] text-white/[0.62]'}>
          {error || hint}
        </span>
      )}
    </label>
  )
}
'''

SEARCH = '''
type __C__Props = {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

export function __C__({ value, onChange, placeholder = 'Search…', disabled = false }: __C__Props) {
  return (
    <div className="relative w-full">
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="pointer-events-none absolute left-3 top-1/2 h-[13px] w-[13px] -translate-y-1/2 text-white/[0.52]"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="search"
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className={"__BASE__ w-full pl-9 outline-none placeholder:text-white/40 focus:border-[#5b9cf6]"}
      />
    </div>
  )
}
'''

SELECT = '''
type __C__Props = {
  label: string
  options: string[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
}

export function __C__({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select…',
  required = false,
  disabled = false,
}: __C__Props) {
  return (
    <label className="mb-3 flex flex-col gap-1">
      <span className="text-[11.5px] font-medium text-white/[0.74]">
        {label}
        {required && <span className="ml-0.5 text-[#e0605a]">*</span>}
      </span>
      <div className="relative">
        <select
          value={value ?? ''}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.value)}
          className={"__BASE__ w-full appearance-none pr-8 outline-none focus:border-[#5b9cf6] disabled:opacity-60"}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <svg
          aria-hidden
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.4}
          className="pointer-events-none absolute right-3 top-1/2 h-3 w-3 -translate-y-1/2 text-white/[0.52]"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </div>
    </label>
  )
}
'''

TOGGLE = '''
type __C__Props = {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export function __C__({ label, description, checked, onChange, disabled = false }: __C__Props) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#94b4e6]/[0.16] py-3 last:border-b-0">
      <div className="min-w-0">
        <div className="text-xs font-medium text-white">{label}</div>
        {description && (
          <div className="mt-0.5 text-[11px] leading-relaxed text-white/[0.62]">{description}</div>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={[
          'relative h-[18px] w-8 shrink-0 rounded-full border transition-colors duration-150',
          checked ? 'border-[#4ebb81] bg-[#4ebb81]' : 'border-[#94b4e6]/[0.30] bg-white/[0.08]',
          disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5b9cf6]',
        ].join(' ')}
      >
        <span
          className={[
            'absolute top-[2px] h-3 w-3 rounded-full bg-white transition-[left] duration-150',
            checked ? 'left-[16px]' : 'left-[2px]',
          ].join(' ')}
        />
      </button>
    </div>
  )
}
'''

CHECKBOX = '''
type __C__Props = {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  /** Half-checked, for a select-all above a partial selection. */
  indeterminate?: boolean
  disabled?: boolean
}

export function __C__({ label, checked, onChange, indeterminate = false, disabled = false }: __C__Props) {
  const ref = React.useRef<HTMLInputElement>(null)
  React.useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate
  }, [indeterminate])

  return (
    <label className="inline-flex items-center gap-2 text-xs text-white/[0.74]">
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        className={"__BASE__"}
      />
      {label}
    </label>
  )
}
'''

SEGMENTED = '''
type __C__Props<T extends string> = {
  label?: string
  options: readonly T[]
  value: T
  onChange: (value: T) => void
  disabled?: boolean
}

export function __C__<T extends string>({
  label,
  options,
  value,
  onChange,
  disabled = false,
}: __C__Props<T>) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-[5px]">
      {options.map((o) => {
        const on = o === value
        return (
          <button
            key={o}
            type="button"
            role="radio"
            aria-checked={on}
            disabled={disabled}
            onClick={() => onChange(o)}
            className={[
              'rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold transition-colors duration-150',
              on
                ? 'border-[#4ebb81]/[0.45] bg-[#4ebb81]/[0.18] text-[#8fe3b6]'
                : 'border-[#94b4e6]/[0.26] bg-white/[0.04] text-white/[0.62] hover:text-white',
              disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
            ].join(' ')}
          >
            {o}
          </button>
        )
      })}
    </div>
  )
}
'''

SLIDER = '''
type __C__Props = {
  label?: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  unit?: string
  disabled?: boolean
}

export function __C__({ label, value, onChange, min = 0, max = 100, unit = '%', disabled = false }: __C__Props) {
  const clamp = (n: number) => Math.max(min, Math.min(max, Number.isFinite(n) ? n : min))
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(clamp(+e.target.value))}
        className="h-1 flex-1 accent-[#4ebb81]"
      />
      <div className="relative w-[86px] shrink-0">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(clamp(+e.target.value))}
          className="h-[34px] w-full rounded-[10px] border border-[#94b4e6]/[0.26] bg-white/[0.04] pl-2.5 pr-7 text-xs text-white outline-none focus:border-[#5b9cf6]"
        />
        <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-white/[0.52]">
          {unit}
        </span>
      </div>
    </div>
  )
}
'''

# ── display ────────────────────────────────────────────────────────────────
BADGE = '''
type __C__Props = {
  label: string
  tone?: __KEYS__
  className?: string
}

const TONE: Record<NonNullable<__C__Props['tone']>, string> = {
__VLINES__
}

export function __C__({ label, tone = '__FIRST__', className = '' }: __C__Props) {
  return (
    <span
      className={[
        'inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-[3px]',
        'text-[10.5px] font-semibold leading-none',
        TONE[tone],
        className,
      ].join(' ')}
    >
      {label}
    </span>
  )
}
'''

ALERT = '''
type __C__Props = {
  children: React.ReactNode
  tone?: 'info' | 'success' | 'warning' | 'danger'
  icon?: React.ReactNode
  className?: string
}

const TONE = {
  info: 'bg-[#5b9cf6]/[0.08] border-[#5b9cf6]/[0.22] text-[#9dc4ff]',
  success: 'bg-[#4ebb81]/[0.08] border-[#4ebb81]/[0.24] text-[#8fe3b6]',
  warning: 'bg-[#f5a623]/[0.08] border-[#f5a623]/[0.24] text-[#f8c778]',
  danger: 'bg-[#e0605a]/[0.08] border-[#e0605a]/[0.26] text-[#f0a09b]',
}

export function __C__({ children, tone = 'info', icon, className = '' }: __C__Props) {
  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={[
        'flex items-center gap-2 rounded-lg border px-3.5 py-2.5 text-[11.5px] leading-relaxed',
        TONE[tone],
        className,
      ].join(' ')}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </div>
  )
}
'''

CARD = '''
type __C__Props = {
  title?: string
  /** Right-aligned header slot — a button, a pill, a count. */
  actions?: React.ReactNode
  children: React.ReactNode
  /** Drop the body padding so a table's borders reach the card edge. */
  flush?: boolean
  className?: string
}

export function __C__({ title, actions, children, flush = false, className = '' }: __C__Props) {
  return (
    <section className={["__BASE__", className].join(' ')}>
      {title && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#94b4e6]/[0.16] bg-[linear-gradient(100deg,rgba(91,156,246,0.07),rgba(78,187,129,0.05))] p-4 text-[13px] font-semibold text-white">
          <span>{title}</span>
          {actions}
        </header>
      )}
      <div className={flush ? 'p-0' : 'p-4'}>{children}</div>
    </section>
  )
}
'''

TEXT = '''
type __C__Props = {
  children: React.ReactNode
  /** Keep the heading level correct for the document outline — the size comes
   *  from the class, not from the tag. */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'div' | 'span'
  muted?: boolean
  className?: string
}

export function __C__({ children, as: Tag = 'h1', muted = false, className = '' }: __C__Props) {
  return (
    <Tag className={["__BASE__", muted && 'text-white/[0.62]', className].filter(Boolean).join(' ')}>
      {children}
    </Tag>
  )
}
'''

PROGRESS = '''
type __C__Props = {
  value: number
  max?: number
  label?: string
  /** Always pair the bar with the figures — a supplier chasing a deadline
   *  needs "16 / 24", not a bar. */
  showValue?: boolean
  size?: 'sm' | 'lg'
}

export function __C__({ value, max = 100, label, showValue = true, size = 'sm' }: __C__Props) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className="flex items-center gap-2.5">
      {label && <span className="text-[11.5px] text-white/[0.62]">{label}</span>}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
        className={[
          'flex-1 overflow-hidden rounded-full bg-white/[0.10]',
          size === 'lg' ? 'h-1.5' : 'h-1',
        ].join(' ')}
      >
        <div
          className="h-full rounded-full bg-[#4ebb81] transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      {showValue && (
        <span className="text-[11.5px] font-bold tabular-nums text-[#8fe3b6]">
          {value} / {max}
        </span>
      )}
    </div>
  )
}
'''

TABLE = '''
type Column<R> = {
  key: keyof R & string
  header: string
  /** Right-align figures — a column of numbers must line up. */
  align?: 'left' | 'right' | 'center'
}

type __C__Props<R extends Record<string, React.ReactNode>> = {
  columns: Column<R>[]
  rows: R[]
  onRowClick?: (row: R) => void
  emptyMessage?: string
}

export function __C__<R extends Record<string, React.ReactNode>>({
  columns,
  rows,
  onRowClick,
  emptyMessage = 'No matching rows',
}: __C__Props<R>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                scope="col"
                className={[
                  'sticky top-0 border-b border-[#94b4e6]/[0.16] bg-[#0b1830] px-3.5 py-2.5',
                  'text-[10.5px] font-bold uppercase tracking-[0.08em] text-white/[0.62]',
                  c.align === 'right' ? 'text-right' : c.align === 'center' ? 'text-center' : 'text-left',
                ].join(' ')}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-3.5 py-6 text-center text-white/[0.52]">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((r, i) => (
              <tr
                key={i}
                onClick={onRowClick ? () => onRowClick(r) : undefined}
                className={[
                  'border-b border-[#94b4e6]/[0.10] text-white/[0.74]',
                  onRowClick ? 'cursor-pointer hover:bg-white/[0.04]' : '',
                ].join(' ')}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={[
                      'px-3.5 py-2.5',
                      c.align === 'right'
                        ? 'text-right tabular-nums'
                        : c.align === 'center'
                        ? 'text-center'
                        : 'text-left',
                    ].join(' ')}
                  >
                    {r[c.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
'''

DIALOG = '''
type __C__Props = {
  open: boolean
  onClose: () => void
  /** Names the dialog for assistive tech — an unlabelled dialog fails audit. */
  label: string
  children: React.ReactNode
}

export function __C__({ open, onClose, label, children }: __C__Props) {
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div
      role="presentation"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-[500] flex items-center justify-center bg-[#040a14]/[0.65] backdrop-blur-[4px]"
    >
      <div role="dialog" aria-modal="true" aria-label={label} className={"__BASE__"}>
        {children}
      </div>
    </div>
  )
}
'''

CONFIRM = '''
type __C__Props = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  /** Quantify the consequence — "referenced by 4 packaging components". */
  description: string
  confirmLabel?: string
  cancelLabel?: string
  /** A destructive confirm must NOT use the brand primary. */
  variant?: 'danger' | 'primary'
  icon?: React.ReactNode
}

export function __C__({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  icon,
}: __C__Props) {
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div
      role="presentation"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-[500] flex items-center justify-center bg-[#040a14]/[0.65] backdrop-blur-[4px]"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-[420px] rounded-[18px] border border-[#94b4e6]/[0.26] bg-[#0b1830] p-5 shadow-[0_18px_46px_-18px_rgba(2,6,14,0.6)]"
      >
        <div className="mb-3.5 flex items-start gap-3">
          {icon && (
            <span
              className={[
                'flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[9px]',
                variant === 'danger'
                  ? 'bg-[#e0605a]/[0.15] text-[#e0605a]'
                  : 'bg-[#4ebb81]/[0.15] text-[#4ebb81]',
              ].join(' ')}
            >
              {icon}
            </span>
          )}
          <div>
            <h2 id="confirm-title" className="text-sm font-semibold text-white">
              {title}
            </h2>
            <p className="mt-0.5 text-[11.5px] leading-relaxed text-white/[0.74]">{description}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-[34px] cursor-pointer rounded-[10px] border border-[#94b4e6]/[0.30] bg-white/[0.04] px-[13px] text-xs text-white/[0.74] hover:bg-white/[0.08] hover:text-white"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={[
              'h-[34px] cursor-pointer rounded-[10px] px-4 text-xs font-bold',
              variant === 'danger'
                ? 'bg-[#e0605a] text-white hover:brightness-110'
                : 'bg-[#4ebb81] text-[#04160e] hover:brightness-105',
            ].join(' ')}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
'''

GENERIC = '''
type __C__Props = {
  children?: React.ReactNode__STATEDOC__
  className?: string
}
__STATE__
export function __C__({ children__SARG__, className = '' }: __C__Props) {
  return (
    <div className={["__BASE__"__SAPPLY__, className].filter(Boolean).join(' ')}>
      {children}
    </div>
  )
}
'''


def button(C, base, states, extra):
    variants = extra.get('variants') or {'primary': base}
    # DOUBLE-quoted TS string values: a generated class list can contain a
    # single quote (`content-['']`), which would terminate a single-quoted one.
    vlines = '\n'.join('  %s: "%s",' % (k, v) for k, v in variants.items())
    keys = ' | '.join("'%s'" % k for k in variants)
    return (_sub(BUTTON, C, base)
            .replace('__KEYS__', keys)
            .replace('__VLINES__', vlines)
            .replace('__FIRST__', list(variants)[0]))


def badge(C, base, states, extra):
    tones = extra.get('tones') or {'neutral': base}
    vlines = '\n'.join('  %s: "%s",' % (k, v) for k, v in tones.items())
    keys = ' | '.join("'%s'" % k for k in tones)
    return (_sub(BADGE, C, base)
            .replace('__KEYS__', keys)
            .replace('__VLINES__', vlines)
            .replace('__FIRST__', list(tones)[0]))


def generic(C, base, states, extra):
    state_block, statedoc, sarg, sapply = '', '', '', ''
    if states:
        rows = '\n'.join('  \'%s\': "%s",' % (k.lstrip('.'), ' '.join(v)) for k, v in states.items())
        state_block = '\nconst STATE = {\n%s\n}\n' % rows
        statedoc = ('\n  /** Modifier state carried by the original CSS: %s */\n  state?: keyof typeof STATE'
                    % ', '.join(k.lstrip('.') for k in states))
        sarg = ', state'
        sapply = ", state ? STATE[state] : ''"
    return (_sub(GENERIC, C, base)
            .replace('__STATE__', state_block)
            .replace('__STATEDOC__', statedoc)
            .replace('__SARG__', sarg)
            .replace('__SAPPLY__', sapply))


SIMPLE = {
    'iconbutton': ICONBUTTON, 'input': INPUT, 'search': SEARCH, 'select': SELECT,
    'toggle': TOGGLE, 'checkbox': CHECKBOX, 'segmented': SEGMENTED, 'slider': SLIDER,
    'alert': ALERT, 'card': CARD, 'text': TEXT, 'progress': PROGRESS, 'table': TABLE,
    'dialog': DIALOG, 'confirm': CONFIRM,
}

DIALOG_FALLBACK_BASE = ('w-full max-w-[420px] rounded-[18px] border border-[#94b4e6]/[0.26] '
                        'bg-[#0b1830] p-5 shadow-[0_18px_46px_-18px_rgba(2,6,14,0.6)]')


def render(kind, C, base, states, extra):
    if kind == 'button':
        return button(C, base, states, extra)
    if kind == 'badge':
        return badge(C, base, states, extra)
    if kind in SIMPLE:
        if kind == 'dialog' and not base:
            base = DIALOG_FALLBACK_BASE
        return _sub(SIMPLE[kind], C, base)
    return generic(C, base, states, extra)


# ── usage snippets ─────────────────────────────────────────────────────────
USAGE = {
    'button': '<__C__ label="Provision retailer" variant="primary" onClick={() => save()} />\n'
              '      <__C__ label="Cancel" variant="secondary" onClick={close} />\n'
              '      <__C__ label="Delete" variant="danger" disabled={!canDelete} onClick={remove} />',
    'iconbutton': '<__C__ label="Row actions" icon={<MoreIcon />} onClick={openMenu} />',
    'input': '<__C__\n        label="Registered company name"\n        value={name}\n'
             '        onChange={setName}\n        placeholder="e.g. Primark Stores Ltd"\n'
             '        hint="As it appears on the trade register."\n        required\n      />',
    'search': '<__C__ value={query} onChange={setQuery} placeholder="Search SKU or description…" />',
    'select': "<__C__\n        label=\"Packaging level\"\n        options={['Primary', 'Secondary', 'Tertiary']}\n"
              '        value={level}\n        onChange={setLevel}\n        required\n      />',
    'toggle': '<__C__\n        label="Send invitation email"\n'
              '        description="Email the primary contact a secure link."\n'
              '        checked={notify}\n        onChange={setNotify}\n      />',
    'checkbox': '<__C__ label="Select all" checked={all} indeterminate={some} onChange={setAll} />',
    'segmented': "<__C__\n        label=\"Packaging level\"\n"
                 "        options={['Primary', 'Secondary', 'Tertiary'] as const}\n"
                 '        value={level}\n        onChange={setLevel}\n      />',
    'slider': '<__C__ label="Post-consumer recycled content" value={pcr} onChange={setPcr} unit="%" />',
    'badge': '<__C__ label="Compliant" tone="green" />\n      <__C__ label="Overdue" tone="red" />',
    'alert': '<__C__ tone="warning">\n'
             '        Citeo Q2 closes in 48 hours — 3 product weights are still missing.\n'
             '      </__C__>',
    'card': '<__C__ title="Supporting documents" actions={<AddDocButton />}>\n'
            '        <DocumentList items={docs} />\n      </__C__>',
    'text': '<__C__ as="h1">Primark Stores Ltd</__C__>',
    'progress': '<__C__ label="Completion" value={16} max={24} size="lg" />',
    'table': "<__C__\n        columns={[\n          { key: 'supplier', header: 'Supplier' },\n"
             "          { key: 'country', header: 'Country' },\n"
             "          { key: 'products', header: 'Products', align: 'right' },\n        ]}\n"
             '        rows={suppliers}\n'
             '        onRowClick={(r) => router.push(`/suppliers/${r.id}`)}\n      />',
    'dialog': '<__C__ open={open} onClose={() => setOpen(false)} label="Document preview">\n'
              '        <DocumentPreview id={docId} />\n      </__C__>',
    'confirm': '<__C__\n        open={open}\n        onClose={() => setOpen(false)}\n'
               '        onConfirm={deleteDoc}\n        title="Delete FSC-2026-Q2.pdf?"\n'
               '        description="Referenced by 4 packaging components. They will be marked as missing evidence."\n'
               '        confirmLabel="Delete document"\n        variant="danger"\n'
               '        icon={<TrashIcon />}\n      />',
}
USAGE_DEFAULT = '<__C__>\n        {/* content */}\n      </__C__>'


def usage(kind, C):
    body = (USAGE.get(kind) or USAGE_DEFAULT).replace('__C__', C)
    return ("import { %s } from '@/components/%s'\n\n"
            'export default function Page() {\n'
            '  return (\n'
            '    <div className="space-y-3">\n'
            '      %s\n'
            '    </div>\n'
            '  )\n'
            '}' % (C, C, body))
