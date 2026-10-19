import { METRICS } from '../data/rules'
import { num } from '../lib/format'
import { Card, Sparkline, StatusPill } from './ui'

export default function MetricCard({ metric, value, status, series, color, Icon, className = '' }) {
  const m = METRICS[metric]
  return (
    <Card as="article" className={`flex flex-col gap-3 p-4 ${className}`} aria-label={m.label}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5 text-sm text-muted">
          <Icon className="size-4 shrink-0" aria-hidden="true" />
          <span className="truncate">{m.label}</span>
        </div>
        <StatusPill status={status} className="shrink-0" />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="font-display text-3xl tabular-nums">{num(value, m.decimals)}</span>
        {m.unit && <span className="text-sm text-muted">{m.unit}</span>}
      </div>
      <Sparkline values={series} color={color} />
      <div className="flex justify-between gap-2 text-xs text-muted">
        <span>24 jam</span>
        <span>Ideal {m.ideal}</span>
      </div>
    </Card>
  )
}
