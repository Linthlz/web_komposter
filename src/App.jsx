import { useMemo, useState } from 'react'
import { Droplets, FlaskConical, Info, Moon, Pause, Play, Sun, Thermometer, Wind, Biohazard } from 'lucide-react'
import { BINS, DAY, HOUR } from './data/simulator'
import { adviceFor, phaseOf, statusOf } from './data/rules'
import { useCompostData } from './hooks/useCompostData'
import { useTheme, useTokenColors } from './hooks/useTheme'
import { clockFmt } from './lib/format'
import { Card, CardHeader, Logo, Segmented } from './components/ui'
import BinTabs from './components/BinTabs'
import ProcessPanel from './components/ProcessPanel'
import AdvicePanel from './components/AdvicePanel'
import MetricCard from './components/MetricCard'
import TrendChart, { Legend } from './components/TrendChart'
import ReadingsTable from './components/ReadingsTable'

const RANGES = [
  { value: '24j', label: '24 jam', ms: DAY },
  { value: '7h', label: '7 hari', ms: 7 * DAY },
  { value: 'semua', label: 'Semua', ms: Infinity },
]

const SANITATION_HOURS_THRESHOLD = 55

export default function App() {
  const { theme, toggle } = useTheme()
  const c = useTokenColors(theme)
  const { store, paused, setPaused } = useCompostData(3000)
  const [binId, setBinId] = useState('C')
  const [range, setRange] = useState('7h')

  const bin = BINS.find((b) => b.id === binId)
  const entry = store[binId]
  const latest = entry.live.at(-1) ?? entry.history.at(-1)
  const phase = phaseOf(latest)
  const sanitationHours = entry.history.filter((p) => p.temp >= SANITATION_HOURS_THRESHOLD).length
  const advice = adviceFor(latest, sanitationHours)

  const chartData = useMemo(() => {
    const ms = RANGES.find((r) => r.value === range).ms
    const from = latest.t - ms
    const pts = entry.history.filter((p) => p.t >= from)
    return pts.at(-1)?.t < latest.t ? [...pts, latest] : pts
  }, [entry.history, latest, range])

  const last24 = useMemo(() => {
    const pts = entry.history.filter((p) => p.t >= latest.t - DAY)
    return [...pts, latest]
  }, [entry.history, latest])

  const logRows = useMemo(() => {
    const live = [...entry.live].reverse()
    return live.length >= 12 ? live : [...live, ...[...entry.history].reverse().filter((p) => p.t < (live.at(-1)?.t ?? Infinity) - HOUR / 2)].slice(0, 24)
  }, [entry.live, entry.history])

  const metricCards = [
    { metric: 'temp', Icon: Thermometer, color: c.heat, className: 'col-span-2 lg:col-span-1' },
    { metric: 'moisture', Icon: Droplets, color: c.water },
    { metric: 'ph', Icon: FlaskConical, color: c.accent },
    { metric: 'nh3', Icon: Biohazard, color: c.warn },
    { metric: 'o2', Icon: Wind, color: c.air },
  ]

  const rangeControl = <Segmented label="Rentang waktu grafik" value={range} options={RANGES} onChange={setRange} />

  return (
    <div className="min-h-screen bg-bg text-ink">
      <header className="sticky z-20 border-b border-line bg-surface/85 backdrop-blur" style={{ top: 'env(safe-area-inset-top, 0px)' }}>
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <Logo />
          <div className="min-w-0">
            <div className="font-display text-xl font-bold leading-tight">Komposter</div>
            <div className="truncate text-xs text-muted">Pemantauan pupuk kompos</div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs sm:flex" aria-live="polite">
              <span className={`size-2 rounded-full ${paused ? 'bg-muted' : 'live-dot bg-ok'}`} aria-hidden="true" />
              <span className="text-muted">{paused ? 'Dijeda' : 'Langsung'}</span>
              <span className="font-mono tabular-nums">{clockFmt.format(new Date(latest.t))}</span>
            </div>
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm font-medium hover:bg-surface-2"
            >
              {paused ? <Play className="size-4" aria-hidden="true" /> : <Pause className="size-4" aria-hidden="true" />}
              <span>{paused ? 'Lanjutkan' : 'Jeda'}</span>
            </button>
            <button
              type="button"
              onClick={toggle}
              aria-label={theme === 'dark' ? 'Ganti ke tema terang' : 'Ganti ke tema gelap'}
              className="inline-flex size-9 items-center justify-center rounded-lg border border-line bg-surface hover:bg-surface-2"
            >
              {theme === 'dark' ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
        <p className="flex items-start gap-2 rounded-xl border border-dashed border-line px-3 py-2 text-xs text-muted">
          <Info className="mt-px size-3.5 shrink-0" aria-hidden="true" />
          Mode demo: data sensor dibuat oleh simulator di browser (src/data/simulator.js), belum terhubung ke perangkat atau server.
        </p>

        <BinTabs store={store} selected={binId} onSelect={setBinId} />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <ProcessPanel bin={bin} entry={entry} latest={latest} />
          <AdvicePanel advice={advice} />
        </div>

        <section aria-labelledby="sensor-title" className="flex flex-col gap-3">
          <h2 id="sensor-title" className="font-display text-lg font-medium">
            Sensor saat ini
          </h2>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            {metricCards.map((m) => (
              <MetricCard
                key={m.metric}
                {...m}
                value={latest[m.metric]}
                status={statusOf(m.metric, latest[m.metric], phase)}
                series={last24.map((p) => p[m.metric])}
              />
            ))}
          </div>
        </section>

        <section aria-labelledby="tren-title" className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="tren-title" className="font-display text-lg font-medium">
              Tren {bin.name}
            </h2>
            {rangeControl}
          </div>

          <Card className="flex flex-col gap-4 p-5 sm:p-6">
            <CardHeader
              id="grafik-suhu"
              title="Suhu tumpukan vs suhu lingkungan"
              note="Pembacaan per jam. Zona arsir = suhu termofilik ideal; garis putus merah = batas 70 °C."
              right={
                <Legend
                  items={[
                    { label: 'Tumpukan', color: c.heat },
                    { label: 'Lingkungan', color: c.muted, dashed: true },
                    { label: '55–65 °C', color: c.heat, kind: 'band' },
                    { label: '70 °C', color: c.bad, kind: 'limit' },
                  ]}
                />
              }
            />
            <TrendChart
              id="suhu"
              data={chartData}
              range={range}
              colors={c}
              height={260}
              domain={[20, 75]}
              band={{ from: 55, to: 65, color: c.heat }}
              limit={{ y: 70, color: c.bad }}
              series={[
                { key: 'ambient', name: 'Lingkungan', color: c.muted, unit: '°C', dashed: true },
                { key: 'temp', name: 'Tumpukan', color: c.heat, unit: '°C', area: true },
              ]}
            />
          </Card>

          <div className="grid gap-3 md:grid-cols-2">
            <Card className="flex flex-col gap-4 p-5">
              <CardHeader id="grafik-lembap" title="Kelembapan" note="Ideal 40–60 %. Lonjakan = penyiraman." />
              <TrendChart
                id="lembap"
                data={chartData}
                range={range}
                colors={c}
                height={190}
                domain={[20, 80]}
                band={{ from: 40, to: 60, color: c.water }}
                series={[{ key: 'moisture', name: 'Kelembapan', color: c.water, unit: '%', area: true }]}
              />
            </Card>
            <Card className="flex flex-col gap-4 p-5">
              <CardHeader id="grafik-o2" title="Oksigen di dalam tumpukan" note="Di bawah 10 % mulai anaerob; balik tumpukan." />
              <TrendChart
                id="o2"
                data={chartData}
                range={range}
                colors={c}
                height={190}
                domain={[0, 22]}
                limit={{ y: 10, color: c.warn }}
                series={[{ key: 'o2', name: 'O₂', color: c.air, unit: '%', area: true }]}
              />
            </Card>
            <Card className="flex flex-col gap-4 p-5">
              <CardHeader id="grafik-ph" title="pH" note="Turun di awal (asam organik), lalu naik ke netral–basa saat matang." />
              <TrendChart
                id="ph"
                data={chartData}
                range={range}
                colors={c}
                height={190}
                domain={[5, 9]}
                band={{ from: 6, to: 8, color: c.accent }}
                series={[{ key: 'ph', name: 'pH', color: c.accent, unit: '', decimals: 2 }]}
              />
            </Card>
            <Card className="flex flex-col gap-4 p-5">
              <CardHeader id="grafik-nh3" title="Amonia (NH₃)" note="Di atas 25 ppm tercium bau; tanda nitrogen berlebih." />
              <TrendChart
                id="nh3"
                data={chartData}
                range={range}
                colors={c}
                height={190}
                domain={[0, 45]}
                limit={{ y: 25, color: c.warn }}
                series={[{ key: 'nh3', name: 'NH₃', color: c.warn, unit: 'ppm', area: true }]}
              />
            </Card>
          </div>
        </section>

        <ReadingsTable rows={logRows} />

        <footer className="pb-4 text-xs text-muted">
          Ambang batas mengacu pada praktik pengomposan aerob dan kriteria kompos matang SNI 19-7030-2004. Ubah di src/data/rules.js.
        </footer>
      </main>
    </div>
  )
}
