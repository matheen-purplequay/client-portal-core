export function parseMonth(mmYyyy: string): Date {
  const [mm, yyyy] = mmYyyy.split('-')
  return new Date(parseInt(yyyy, 10), parseInt(mm, 10) - 1, 1)
}

export function formatMonthValue(date: Date): string {
  return `${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`
}

export function subtractMonths(date: Date, n: number): Date {
  return new Date(date.getFullYear(), date.getMonth() - n, 1)
}

export function monthShortLabel(mmYyyy: string): string {
  const d = parseMonth(mmYyyy)
  return d.toLocaleString('default', { month: 'short', year: 'numeric' })
}

// Produces the key format the SP uses for dynamic month columns e.g. "Mar-2026"
export function spMonthKey(mmYyyy: string): string {
  const d = parseMonth(mmYyyy)
  const mon = d.toLocaleString('default', { month: 'short' })
  return `${mon}-${d.getFullYear()}`
}
