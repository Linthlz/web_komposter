import { METRICS, phaseOf, statusOf, worstStatus } from '../data/rules'
import { clockFmt, num } from '../lib/format'
import { Card, CardHeader, StatusPill } from './ui'

const COLS = ['temp', 'moisture', 'ph', 'nh3', 'o2']
const TONE = { ok: '', warn: 'text-warn font-medium', bad: 'text-bad font-semibold' }

export default function ReadingsTable({ rows }) {
  return (
    <Card className="flex flex-col gap-4 p-5 sm:p-6" aria-labelledby="log-title">
      <CardHeader id="log-title" title="Log pembacaan sensor" note="Pembacaan terbaru di atas, diperbarui tiap 3 detik" />
      <div className="max-h-80 overflow-auto rounded-xl border border-line">
        <table className="w-full min-w-[34rem] border-collapse text-sm">
          <thead>
            <tr className="text-left text-xs text-muted">
              <th className="sticky top-0 bg-surface-2 px-3 py-2 font-medium">Waktu</th>
              {COLS.map((k) => (
                <th key={k} className="sticky top-0 bg-surface-2 px-3 py-2 text-right font-medium">
                  {METRICS[k].short}
                  {METRICS[k].unit && <span className="font-normal"> ({METRICS[k].unit})</span>}
                </th>
              ))}
              <th className="sticky top-0 bg-surface-2 px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="font-mono text-xs tabular-nums">
            {rows.map((r) => {
              const phase = phaseOf(r)
              return (
                <tr key={r.t} className="border-t border-line">
                  <td className="px-3 py-2 text-muted">{clockFmt.format(new Date(r.t))}</td>
                  {COLS.map((k) => (
                    <td key={k} className={`px-3 py-2 text-right ${TONE[statusOf(k, r[k], phase)]}`}>
                      {num(r[k], METRICS[k].decimals)}
                    </td>
                  ))}
                  <td className="px-3 py-2 font-sans">
                    <StatusPill status={worstStatus(r)} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
