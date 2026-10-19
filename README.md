# Komposter — Dashboard Monitoring Pupuk Kompos

Dashboard web untuk memantau bak kompos: suhu tumpukan, kelembapan, pH, amonia (NH₃), dan oksigen (O₂),
lengkap dengan tahap pengomposan, progres sanitasi patogen, peringatan, dan saran tindakan.

Dibuat dengan **React 19 + Vite + Tailwind CSS v4** dan **Recharts**. Belum memakai backend:
semua data dibuat oleh simulator di browser.

## Menjalankan

```bash
npm install
npm run dev          # buka http://localhost:5173
npm run build        # hasil produksi di dist/
npm run build:single # satu file HTML mandiri di dist-single/
```

## Struktur

```
src/
├─ App.jsx                  susunan halaman
├─ data/
│  ├─ simulator.js          SUMBER DATA (simulasi) — ganti ke API/MQTT di sini
│  └─ rules.js              ambang batas, fase, peringatan & saran tindakan
├─ hooks/
│  ├─ useCompostData.js     riwayat per jam + pembacaan langsung tiap 3 detik
│  └─ useTheme.js           tema terang/gelap
├─ components/              BinTabs, ProcessPanel, AdvicePanel, MetricCard, TrendChart, ReadingsTable, ui
└─ lib/format.js            format angka & tanggal Indonesia
```

## Menyambungkan ke sensor sungguhan nanti

Bentuk satu bacaan sensor:

```js
{ t: 1729300000000, day: 15.4, temp: 54.6, ambient: 28.8, moisture: 52.6, ph: 7.35, nh3: 6.4, o2: 9.8 }
```

1. Di `useCompostData.js`, ganti `buildHistory()` dengan `fetch('/api/bins/C/readings?hours=720')`.
2. Ganti isi `setInterval` dengan polling `fetch('/api/bins/C/latest')`, atau berlangganan topik MQTT
   (misalnya `kompos/bak-c/sensor` lewat `mqtt.js` di atas WebSocket) dari ESP32.
3. Komponen lain tidak perlu diubah selama bentuk datanya sama.

Contoh sensor yang umum dipakai: DS18B20 tahan air (suhu tumpukan), sensor kelembapan tanah kapasitif,
sensor pH tanah, MQ-137 (NH₃), dan sensor O₂ elektrokimia.

## Ambang batas

| Parameter | Normal | Perhatikan | Kritis |
|---|---|---|---|
| Suhu | ≤ 65 °C | 65–70 °C, atau > 40 °C saat pematangan | > 70 °C |
| Kelembapan | 40–60 % | 35–40 % / 60–70 % | < 35 % / > 70 % |
| pH | 6,0–8,0 | 5,5–6,0 / 8,0–8,5 | < 5,5 / > 8,5 |
| NH₃ | ≤ 25 ppm | 25–40 ppm | > 40 ppm |
| O₂ | ≥ 10 % | 5–10 % | < 5 % |

Sanitasi patogen dianggap tercapai setelah total 72 jam di ≥ 55 °C. Kriteria kompos matang mengacu pada
SNI 19-7030-2004. Semua nilai bisa diubah di `src/data/rules.js`.
