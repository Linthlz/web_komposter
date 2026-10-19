import { useId } from 'react'
import { CircleCheck, OctagonAlert, TriangleAlert } from 'lucide-react'

export const STATUS = {
  ok: { label: 'Normal', cls: 'bg-ok-soft text-ok', dot: 'bg-ok', text: 'text-ok', Icon: CircleCheck },
  warn: { label: 'Perhatikan', cls: 'bg-warn-soft text-warn', dot: 'bg-warn', text: 'text-warn', Icon: TriangleAlert },
  bad: { label: 'Kritis', cls: 'bg-bad-soft text-bad', dot: 'bg-bad', text: 'text-bad', Icon: OctagonAlert },
}

export function StatusPill({ status, className = '' }) {
  const s = STATUS[status]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${s.cls} ${className}`}>
      <span className={`size-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
      {s.label}
    </span>
  )
}

export function Card({ as: Tag = 'section', className = '', children, ...rest }) {
  return (
    <Tag className={`rounded-2xl border border-line bg-surface ${className}`} {...rest}>
      {children}
    </Tag>
  )
}

export function CardHeader({ title, note, right, id }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 id={id} className="font-display text-base font-medium">
          {title}
        </h3>
        {note && <p className="mt-0.5 text-xs text-muted">{note}</p>}
      </div>
      {right}
    </div>
  )
}

export function Segmented({ value, options, onChange, label }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-lg border border-line bg-surface-2 p-0.5 text-xs">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          onClick={() => onChange(o.value)}
          className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
            value === o.value ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Sparkline({ values, color, height = 36 }) {
  if (!values.length || !color) return <div style={{ height }} />
  const w = 120
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const pts = values.map((v, i) => [(i / (values.length - 1 || 1)) * w, height - 4 - ((v - min) / span) * (height - 8)])
  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('')
  const area = `${line}L${w},${height}L0,${height}Z`
  const [lx, ly] = pts[pts.length - 1]
  return (
    <svg viewBox={`0 0 ${w} ${height}`} width="100%" height={height} preserveAspectRatio="none" aria-hidden="true">
      <path d={area} fill={color} fillOpacity="0.12" />
      <path d={line} fill="none" stroke={color} strokeWidth="1.75" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      <circle cx={lx} cy={ly} r="2.5" fill={color} vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

/** Logo: gundukan kompos dengan tunas tumbuh, di atas lencana hijau bergradasi. */
export function Logo() {
  const id = useId()
  return (
    <svg viewBox="0 0 40 40" className="size-9 shrink-0 drop-shadow-sm" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#4ade80" />
          <stop offset="100%" stopColor="#15803d" />
        </linearGradient>
        <linearGradient id={`${id}-soil`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b45309" />
          <stop offset="100%" stopColor="#6b3410" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <rect width="40" height="40" rx="11" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}-clip)`}>
        <rect width="40" height="40" fill={`url(#${id}-bg)`} />
        <circle cx="31" cy="9" r="9" fill="#fff" opacity=".12" />
        <path d="M2 40V33c4-7.5 10-11 18-11s14 3.5 18 11v7Z" fill={`url(#${id}-soil)`} />
        <path d="M9 31.5c3-3.5 6.8-5.2 11-5.2s8 1.7 11 5.2" fill="none" stroke="#f59e0b" strokeWidth="1.4" strokeLinecap="round" opacity=".7" />
        <circle cx="14" cy="35" r="1.1" fill="#fbbf24" opacity=".8" />
        <circle cx="21" cy="33.5" r="0.9" fill="#fbbf24" opacity=".7" />
        <circle cx="27" cy="36" r="1.1" fill="#fbbf24" opacity=".8" />
      </g>
      <path d="M20 22.5V13.5" stroke="#ecfccb" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 17.5c-4.6 0-7.4-2.8-7.4-7 4.4 0 7.4 2.6 7.4 7Z" fill="#ecfccb" />
      <path d="M20 14.5c0-4.4 2.9-7.2 7.6-7.2 0 4.4-2.9 7.2-7.6 7.2Z" fill="#fef9c3" />
      <path d="M20 14.5 24.6 10" stroke="#16a34a" strokeWidth="1" strokeLinecap="round" opacity=".55" />
      <path d="M20 17.5 15.4 13" stroke="#16a34a" strokeWidth="1" strokeLinecap="round" opacity=".55" />
      <rect x=".5" y=".5" width="39" height="39" rx="10.5" fill="none" stroke="#fff" strokeOpacity=".25" />
    </svg>
  )
}
