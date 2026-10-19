import { DAY, TARGET_DAYS } from '../data/simulator'
import { PHASES, SANITATION_HOURS, phaseOf } from '../data/rules'
import { longDateFmt, num } from '../lib/format'
import { Card } from './ui'

function Meter({ value, max, colorClass, label, valueText, note }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2 text-sm">
        <span className="text-muted">{label}</span>
        <span className="font-mono text-xs tabular-nums">{valueText}</span>
      </div>
      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2"
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={Math.round(Math.min(value, max))}
      >
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
      {note && <p className="mt-1.5 text-xs text-muted">{note}</p>}
    </div>
  )
}

export default function ProcessPanel({ bin, entry, latest }) {
  const phaseId = phaseOf(latest)
  const idx = PHASES.findIndex((p) => p.id === phaseId)
  const phase = PHASES[idx]
  const sanitation = entry.history.filter((p) => p.temp >= 55).length
  const harvest = new Date(entry.startedAt + TARGET_DAYS * DAY)

  return (
    <Card className="flex flex-col gap-6 p-5 sm:p-6" aria-labelledby="proses-title">
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Proses {bin.name}</p>
          <h2 id="proses-title" className="mt-1 font-display text-3xl font-bold sm:text-4xl">
            Hari ke-{Math.floor(latest.day)} · <span className={phaseId === 'termofilik' ? 'text-heat' : 'text-accent'}>{phase.label}</span>
          </h2>
          <p className="mt-1 text-sm text-muted">
            {bin.material} · {bin.volumeL} L · mulai {longDateFmt.format(new Date(entry.startedAt))}
          </p>
        </div>
      </div>

      <div>
        <ol className="grid grid-cols-4 gap-1.5" aria-label="Tahap pengomposan">
          {PHASES.map((p, i) => {
            const state = i < idx ? 'done' : i === idx ? 'now' : 'next'
            const bar =
              state === 'now' ? (p.id === 'termofilik' ? 'bg-heat' : 'bg-accent') : state === 'done' ? 'bg-accent/45' : 'bg-surface-2'
            return (
              <li key={p.id} className="min-w-0" aria-current={state === 'now' ? 'step' : undefined}>
                <div className={`h-2 rounded-full ${bar}`} />
                <div className={`mt-2 truncate text-xs ${state === 'now' ? 'font-semibold text-ink' : 'text-muted'}`}>{p.label}</div>
              </li>
            )
          })}
        </ol>
        <p className="mt-3 max-w-prose text-sm">{phase.hint}</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Meter
          label="Kemajuan menuju matang"
          value={latest.day}
          max={TARGET_DAYS}
          colorClass="bg-accent"
          valueText={`${num(latest.day, 1)} / ±${TARGET_DAYS} hari`}
          note={`Perkiraan panen ${longDateFmt.format(harvest)}`}
        />
        <Meter
          label="Sanitasi patogen (≥ 55 °C)"
          value={sanitation}
          max={SANITATION_HOURS}
          colorClass="bg-heat"
          valueText={`${sanitation} / ${SANITATION_HOURS} jam`}
          note={sanitation >= SANITATION_HOURS ? 'Target 3 hari panas sudah terpenuhi.' : 'Butuh total 3 hari di atas 55 °C.'}
        />
      </div>
    </Card>
  )
}
