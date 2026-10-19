import { useEffect, useState } from 'react'

const KEY = 'kompos-theme'

function initialTheme() {
  try {
    const saved = localStorage.getItem(KEY)
    if (saved === 'light' || saved === 'dark') return saved
  } catch {
    /* penyimpanan tidak tersedia */
  }
  const attr = document.documentElement.dataset.theme
  if (attr === 'light' || attr === 'dark') return attr
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState(initialTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    try {
      localStorage.setItem(KEY, next)
    } catch {
      /* abaikan */
    }
  }

  return { theme, toggle }
}

/** Warna token CSS terkini, untuk dipakai di grafik SVG. */
export function useTokenColors(theme) {
  const [colors, setColors] = useState({})
  useEffect(() => {
    const cs = getComputedStyle(document.documentElement)
    const get = (n) => cs.getPropertyValue(`--${n}`).trim()
    setColors(
      Object.fromEntries(
        ['ink', 'muted', 'line', 'grid', 'surface', 'accent', 'heat', 'heat-soft', 'water', 'air', 'ok', 'warn', 'bad'].map((n) => [n, get(n)]),
      ),
    )
  }, [theme])
  return colors
}
