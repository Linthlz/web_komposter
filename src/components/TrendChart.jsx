import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { dateTimeFmt, dayFmt, num, timeFmt } from '../lib/format'

function ChartTooltip({ active, payload, label, series }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-lg">
      <div className="mb-1 text-muted">{dateTimeFmt.format(new Date(label))}</div>
      {series.map((s) => {
        const p = payload.find((x) => x.dataKey === s.key)
        if (!p) return null
        return (
          <div key={s.key} className="flex items-center gap-2">
            {series.length > 1 && <span className="size-2 rounded-full" style={{ background: s.color }} />}
            <span>{s.name}</span>
            <span className="ml-auto pl-3 font-mono tabular-nums">
              {num(p.value, s.decimals ?? 1)} {s.unit}
            </span>
          </div>
        )
      })}
    </div>
  )
}

/**
 * series: [{ key, name, color, unit, decimals, area?, dashed? }]
 * band:   { from, to, color }  rentang ideal (diarsir)
 * limit:  { y, color }          garis batas
 */
export default function TrendChart({ id, data, series, domain = ['auto', 'auto'], band, limit, range, colors, height = 220 }) {
  const tickFmt = (t) => (range === '24j' ? timeFmt : dayFmt).format(new Date(t))
  const axisTick = { fill: colors.muted, fontSize: 11 }

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
          <defs>
            {series
              .filter((s) => s.area)
              .map((s) => (
                <linearGradient key={s.key} id={`g-${id}-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity={0.28} />
                  <stop offset="60%" stopColor={s.color} stopOpacity={0.08} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0} />
                </linearGradient>
              ))}
          </defs>
          <CartesianGrid stroke={colors.grid} vertical={false} />
          {band && <ReferenceArea y1={band.from} y2={band.to} fill={band.color} fillOpacity={0.1} stroke="none" ifOverflow="extendDomain" />}
          {limit && <ReferenceLine y={limit.y} stroke={limit.color} strokeDasharray="4 4" ifOverflow="extendDomain" />}
          <XAxis
            dataKey="t"
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
            tickFormatter={tickFmt}
            tick={axisTick}
            axisLine={{ stroke: colors.line }}
            tickLine={false}
            minTickGap={40}
          />
          <YAxis domain={domain} width={40} tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(v) => num(v, 0)} />
          <Tooltip content={<ChartTooltip series={series} />} cursor={{ stroke: colors.line }} />
          {series.map((s) =>
            s.area ? (
              <Area
                key={s.key}
                type="linear"
                dataKey={s.key}
                stroke={s.color}
                strokeWidth={2}
                fill={`url(#g-${id}-${s.key})`}
                dot={false}
                activeDot={{ r: 4, fill: s.color, stroke: colors.surface, strokeWidth: 2 }}
                isAnimationActive={false}
              />
            ) : (
              <Line
                key={s.key}
                type="linear"
                dataKey={s.key}
                stroke={s.color}
                strokeWidth={s.dashed ? 1.5 : 2}
                strokeDasharray={s.dashed ? '3 4' : undefined}
                strokeLinecap="round"
                strokeLinejoin="round"
                dot={false}
                activeDot={{ r: 4, fill: s.color, stroke: colors.surface, strokeWidth: 2 }}
                isAnimationActive={false}
              />
            ),
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

export function Legend({ items }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
      {items.map((i) => (
        <span key={i.label} className="inline-flex items-center gap-1.5">
          {i.kind === 'band' ? (
            <span className="h-2.5 w-3.5 rounded-sm" style={{ background: i.color, opacity: 0.25 }} />
          ) : i.kind === 'limit' ? (
            <span className="w-3.5 border-t-2 border-dashed" style={{ borderColor: i.color }} />
          ) : (
            <span className="h-0.5 w-3.5 rounded-full" style={{ background: i.color, opacity: i.dashed ? 0.6 : 1 }} />
          )}
          {i.label}
        </span>
      ))}
    </div>
  )
}
