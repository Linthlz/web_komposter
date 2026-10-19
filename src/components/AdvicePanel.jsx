import { Card, STATUS } from './ui'

export default function AdvicePanel({ advice }) {
  const open = advice.filter((a) => a.level !== 'ok').length
  return (
    <Card className="flex flex-col gap-4 p-5 sm:p-6" aria-labelledby="saran-title">
      <div className="flex items-baseline justify-between gap-2">
        <h2 id="saran-title" className="font-display text-lg font-medium">
          Peringatan & tindakan
        </h2>
        <span className="text-xs text-muted">{open ? `${open} perlu ditangani` : 'Tidak ada masalah'}</span>
      </div>
      <ul className="flex flex-col gap-2.5">
        {advice.map((a) => {
          const s = STATUS[a.level]
          return (
            <li key={a.title} className="flex gap-3 rounded-xl bg-surface-2 p-3">
              <s.Icon className={`mt-0.5 size-4 shrink-0 ${s.text}`} aria-hidden="true" />
              <div className="min-w-0">
                <div className="text-sm font-semibold">{a.title}</div>
                <p className="mt-0.5 text-sm text-muted">{a.action}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}
