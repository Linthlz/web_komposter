const nf = {}
export function num(v, decimals = 1) {
  if (v == null || Number.isNaN(v)) return '—'
  nf[decimals] ??= new Intl.NumberFormat('id-ID', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
  return nf[decimals].format(v)
}

export const timeFmt = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' })
export const clockFmt = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
export const dayFmt = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' })
export const longDateFmt = new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
export const dateTimeFmt = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
