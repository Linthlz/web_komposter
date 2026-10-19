import { useEffect, useState } from 'react'
import { BINS, DAY, HOUR, buildHistory, readSensor } from '../data/simulator'

const LIVE_KEEP = 60

function init() {
  const now = Date.now()
  return Object.fromEntries(
    BINS.map((bin) => {
      const startedAt = now - bin.daysAgo * DAY
      const history = buildHistory(bin, startedAt, now)
      return [bin.id, { startedAt, history, live: [readSensor(bin, startedAt, now)] }]
    }),
  )
}

/**
 * Menyimpan riwayat per jam + aliran pembacaan langsung tiap `intervalMs`.
 * Untuk backend sungguhan: ganti isi setInterval dengan fetch / subscribe MQTT.
 */
export function useCompostData(intervalMs = 3000) {
  const [store, setStore] = useState(init)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const id = setInterval(() => {
      const t = Date.now()
      setStore((prev) => {
        const next = {}
        for (const bin of BINS) {
          const entry = prev[bin.id]
          const r = readSensor(bin, entry.startedAt, t)
          const lastHour = entry.history[entry.history.length - 1]
          const history = t - lastHour.t >= HOUR ? [...entry.history, r] : entry.history
          next[bin.id] = { ...entry, history, live: [...entry.live.slice(-(LIVE_KEEP - 1)), r] }
        }
        return next
      })
    }, intervalMs)
    return () => clearInterval(id)
  }, [paused, intervalMs])

  return { store, paused, setPaused }
}
