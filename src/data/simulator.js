/**
 * SUMBER DATA SIMULASI
 * --------------------
 * Semua angka sensor di dashboard berasal dari file ini. Belum ada backend.
 * Saat sensor/IoT sudah siap, ganti `buildHistory()` dengan GET riwayat dari API
 * dan `readSensor()` dengan pembacaan terbaru (REST polling, WebSocket, atau MQTT).
 * Bentuk objek bacaan cukup dipertahankan:
 *   { t, day, temp, moisture, ph, nh3, o2 }
 */

export const HOUR = 3600e3
export const DAY = 24 * HOUR
export const TARGET_DAYS = 40 // perkiraan lama pengomposan aerob sampai matang

export const BINS = [
  { id: 'A', name: 'Bak A', material: 'Daun kering + sisa dapur', volumeL: 200, daysAgo: 29.4, k: 1.0, seed: 11 },
  { id: 'B', name: 'Bak B', material: 'Rumput + kotoran kambing', volumeL: 200, daysAgo: 22.4, k: 0.9, seed: 23, wetOffset: -11 },
  { id: 'C', name: 'Bak C', material: 'Sisa sayur pasar + serbuk gergaji', volumeL: 300, daysAgo: 15.4, k: 1.1, seed: 37, airOffset: -8 },
]

// PRNG ber-seed supaya riwayat selalu sama setiap halaman dibuka
function mulberry32(a) {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function gauss(rand) {
  let u = 0
  let v = 0
  while (!u) u = rand()
  while (!v) v = rand()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

const r1 = (x) => Math.round(x * 10) / 10
const r2 = (x) => Math.round(x * 100) / 100
const clamp = (x, a, b) => Math.min(b, Math.max(a, x))

/** Model kurva pengomposan aerob: naik ke termofilik, lalu turun ke pematangan. */
function model(bin, day, hour, rand) {
  const ambient = 28 + 3 * Math.sin(((hour - 9) / 24) * 2 * Math.PI)
  const x = Math.pow(Math.max(day, 0) / 3, 1.6)
  const temp = ambient + 36 * bin.k * (x / (1 + x)) * Math.exp(-Math.max(day - 12, 0) / 9) + gauss(rand) * 0.6

  const sinceWatering = day % 7 // penyiraman rutin tiap 7 hari
  const moisture =
    58 - 0.35 * day + 4 * Math.sin(day / 2.5) + (day > 1 ? 6 * Math.exp(-sinceWatering * 1.5) : 0) + (bin.wetOffset ?? 0) * Math.min(1, day / 10) + gauss(rand)

  const ph = 6.2 - 0.7 * Math.exp(-(((day - 3) / 2) ** 2)) + 1.6 * (1 - Math.exp(-day / 12)) + gauss(rand) * 0.04
  const nh3 = 2 + 28 * bin.k * Math.exp(-(((day - 8) / 5) ** 2)) + gauss(rand) * 0.8
  const o2 = 19 - 9 * Math.exp(-(((day - 7) / 6) ** 2)) + (bin.airOffset ?? 0) * Math.min(1, day / 10) + gauss(rand) * 0.4

  return {
    ambient: r1(ambient),
    temp: r1(temp),
    moisture: r1(clamp(moisture, 15, 85)),
    ph: r2(ph),
    nh3: r1(Math.max(0, nh3)),
    o2: r1(clamp(o2, 0, 20.9)),
  }
}

function reading(bin, startedAt, t, rand) {
  const day = (t - startedAt) / DAY
  return { t, day, ...model(bin, day, new Date(t).getHours() + new Date(t).getMinutes() / 60, rand) }
}

/** Riwayat per jam sejak bak mulai diisi sampai sekarang. */
export function buildHistory(bin, startedAt, now = Date.now()) {
  const rand = mulberry32(bin.seed)
  const first = Math.ceil(startedAt / HOUR) * HOUR
  const out = []
  for (let t = first; t <= now; t += HOUR) out.push(reading(bin, startedAt, t, rand))
  return out
}

/** Satu pembacaan sensor "langsung". */
export function readSensor(bin, startedAt, t = Date.now()) {
  return reading(bin, startedAt, t, Math.random)
}
