import { BINS, TARGET_DAYS } from '../data/simulator'
import { PHASES, phaseOf, worstStatus } from '../data/rules'
import { num } from '../lib/format'
import { STATUS } from './ui'

export default function BinTabs({ store, selected, onSelect }) {
  return (
    <div role="tablist" aria-label="Pilih bak kompos" className="grid gap-3 sm:grid-cols-3">
      {BINS.map((bin) => {
        const entry = store[bin.id]
        const r = entry.live.at(-1) ?? entry.history.at(-1)
        const phase = PHASES.find((p) => p.id === phaseOf(r))
        const status = STATUS[worstStatus(r)]
        const active = bin.id === selected
        return (
          <button
            key={bin.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(bin.id)}
            className={`group flex flex-col gap-3 rounded-2xl border p-4 text-left transition-colors ${
              active ? 'border-accent bg-surface ring-1 ring-accent' : 'border-line bg-surface/60 hover:bg-surface'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-display text-lg font-bold">{bin.name}</span>
                  <span className={`size-2 rounded-full ${status.dot}`} title={status.label} aria-label={`Status ${status.label}`} />
                </div>
                <div className="truncate text-xs text-muted">{bin.material}</div>
              </div>
              <span className="shrink-0 rounded-full bg-surface-2 px-2 py-0.5 text-xs text-muted">
                Hari {Math.floor(r.day)}/{TARGET_DAYS}
              </span>
            </div>
            <div className="flex items-end justify-between gap-2">
              <div className="flex items-baseline gap-1">
                <span className="font-display text-3xl tabular-nums">{num(r.temp, 1)}</span>
                <span className="text-sm text-muted">°C</span>
              </div>
              <span
                className={`rounded-md px-2 py-1 text-xs font-medium ${
                  phase.id === 'termofilik' ? 'bg-heat-soft text-heat' : 'bg-accent-soft text-accent'
                }`}
              >
                {phase.label}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}
