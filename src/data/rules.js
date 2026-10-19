/**
 * Ambang batas & aturan rekomendasi.
 * Rentang mengacu pada praktik pengomposan aerob umum dan kriteria kematangan
 * SNI 19-7030-2004 (suhu mendekati suhu air tanah, kadar air ≤ 50 %, pH 6,8–7,49).
 * Sesuaikan dengan bahan dan metode di lapangan.
 */

export const METRICS = {
  temp: { label: 'Suhu tumpukan', short: 'Suhu', unit: '°C', decimals: 1, ideal: '55–65 °C saat termofilik' },
  moisture: { label: 'Kelembapan', short: 'Lembap', unit: '%', decimals: 1, ideal: '40–60 %' },
  ph: { label: 'pH', short: 'pH', unit: '', decimals: 2, ideal: '6,0–8,0' },
  nh3: { label: 'Amonia (NH₃)', short: 'NH₃', unit: 'ppm', decimals: 1, ideal: '< 25 ppm' },
  o2: { label: 'Oksigen (O₂)', short: 'O₂', unit: '%', decimals: 1, ideal: '> 10 %' },
}

export const METRIC_KEYS = Object.keys(METRICS)

export const PHASES = [
  { id: 'mesofilik', label: 'Mesofilik', hint: 'Mikroba mulai mengurai gula dan pati, suhu naik.' },
  { id: 'termofilik', label: 'Termofilik', hint: '≥ 45 °C. Patogen dan biji gulma mati, penguraian paling cepat.' },
  { id: 'pendinginan', label: 'Pendinginan', hint: 'Bahan mudah urai habis, suhu turun perlahan.' },
  { id: 'pematangan', label: 'Pematangan', hint: 'Humus terbentuk, suhu mendekati suhu lingkungan.' },
]

export const SANITATION_HOURS = 72 // ≥ 55 °C selama 3 hari untuk mematikan patogen

export function phaseOf(r) {
  if (r.temp >= 45) return 'termofilik'
  if (r.day < 3) return 'mesofilik'
  if (r.day < 25) return 'pendinginan'
  return 'pematangan'
}

export function statusOf(key, v, phase) {
  switch (key) {
    case 'temp':
      if (v > 70) return 'bad'
      if (v > 65) return 'warn'
      if (phase === 'pematangan' && v > 40) return 'warn'
      return 'ok'
    case 'moisture':
      if (v < 35 || v > 70) return 'bad'
      if (v < 40 || v > 60) return 'warn'
      return 'ok'
    case 'ph':
      if (v < 5.5 || v > 8.5) return 'bad'
      if (v < 6 || v > 8) return 'warn'
      return 'ok'
    case 'nh3':
      if (v > 40) return 'bad'
      if (v > 25) return 'warn'
      return 'ok'
    case 'o2':
      if (v < 5) return 'bad'
      if (v < 10) return 'warn'
      return 'ok'
    default:
      return 'ok'
  }
}

const RANK = { ok: 0, warn: 1, bad: 2 }
export function worstStatus(r) {
  const phase = phaseOf(r)
  return METRIC_KEYS.map((k) => statusOf(k, r[k], phase)).reduce((a, b) => (RANK[b] > RANK[a] ? b : a), 'ok')
}

/** Daftar peringatan + tindakan yang disarankan untuk pembacaan terbaru. */
export function adviceFor(r, sanitationHours) {
  const phase = phaseOf(r)
  const list = []
  const push = (level, title, action) => list.push({ level, title, action })

  if (r.temp > 70) push('bad', 'Suhu terlalu tinggi', 'Balik tumpukan dan percikkan air. Di atas 70 °C mikroba pengurai ikut mati.')
  else if (r.temp > 65) push('warn', 'Suhu mendekati batas atas', 'Pantau tiap jam. Balik tumpukan bila terus naik.')

  if (r.moisture < 40) push(r.moisture < 35 ? 'bad' : 'warn', 'Tumpukan mulai kering', 'Siram merata sampai bahan terasa seperti spons yang diperas (sekitar 50 %).')
  if (r.moisture > 60) push(r.moisture > 70 ? 'bad' : 'warn', 'Tumpukan terlalu basah', 'Tambah bahan cokelat kering (daun, serbuk gergaji, kardus) lalu balik.')

  if (r.o2 < 10) push(r.o2 < 5 ? 'bad' : 'warn', 'Oksigen rendah', 'Balik atau tusuk tumpukan untuk aerasi agar tidak berubah anaerob dan berbau.')
  if (r.nh3 > 25) push(r.nh3 > 40 ? 'bad' : 'warn', 'Bau amonia tinggi', 'Rasio C/N terlalu rendah. Tambah bahan kaya karbon.')

  if (r.ph < 6) push('warn', 'Tumpukan asam', 'Wajar di awal proses. Bila bertahan, tambah sedikit kapur dolomit atau abu kayu.')
  if (r.ph > 8) push('warn', 'Tumpukan basa', 'Kurangi bahan berkapur, tambah bahan hijau segar.')

  if (phase === 'pematangan' && r.temp <= r.ambient + 4 && r.day >= 28)
    push('ok', 'Siap uji kematangan', 'Cek warna kehitaman, bau tanah, dan tekstur remah sebelum diayak dan dikemas.')

  if (sanitationHours >= SANITATION_HOURS && phase !== 'mesofilik')
    push('ok', 'Sanitasi patogen tercapai', `Tumpukan sudah ≥ 55 °C selama ${SANITATION_HOURS} jam atau lebih.`)

  if (!list.some((a) => a.level !== 'ok')) list.unshift({ level: 'ok', title: 'Semua parameter normal', action: 'Lanjutkan jadwal pembalikan rutin.' })

  return list.sort((a, b) => RANK[b.level] - RANK[a.level])
}
