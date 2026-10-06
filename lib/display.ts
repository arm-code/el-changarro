const WEEKDAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"]
const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
]

function pad(n: number) {
  return n.toString().padStart(2, "0")
}

export function parseDate(value: unknown, options?: { dateOnly?: boolean }): Date | null {
  if (!value) return null

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value
  }

  if (typeof value !== "string" && typeof value !== "number") return null

  if (options?.dateOnly && typeof value === "string") {
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value)
    if (match) {
      const [, y, m, d] = match
      const date = new Date(Number(y), Number(m) - 1, Number(d))
      return Number.isNaN(date.getTime()) ? null : date
    }
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function toLocalDateInput(date: Date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function describeDate(
  value: unknown,
  options?: { dateOnly?: boolean }
): { label: string; relative: string; days: number } | null {
  const date = parseDate(value, options)
  if (!date) return null

  const now = new Date()
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const days = Math.round((startOfDay(date).getTime() - startOfDay(now).getTime()) / 86_400_000)

  const rtf = new Intl.RelativeTimeFormat("es-MX", { numeric: "auto" })
  const relative =
    days === 0 ? "Hoy" : days === 1 ? "Mañana" : days === -1 ? "Ayer" : rtf.format(days, "day")

  const sameYear = date.getFullYear() === now.getFullYear()
  const label = `${capitalize(WEEKDAYS[date.getDay()])} ${date.getDate()} de ${MONTHS[date.getMonth()]}${
    sameYear ? "" : ` de ${date.getFullYear()}`
  }`

  return { label, relative, days }
}

export function parseAmount(raw: string): number {
  if (typeof raw !== "string") return NaN
  const cleaned = raw.replace(/[$\s]/g, "").replace(/,/g, "")
  if (!/^\d*\.?\d*$/.test(cleaned) || cleaned === "" || cleaned === ".") return NaN
  return Number(cleaned)
}

export function toNumber(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value)
  return Number.isFinite(n) ? n : 0
}

const MX_PHONE_PREFIXES = ["521", "52", "+521", "+52"]

export function toMxPhone(raw: unknown): string | null {
  if (typeof raw !== "string") return null
  let digits = raw.replace(/\D/g, "")

  for (const prefix of MX_PHONE_PREFIXES) {
    const prefixDigits = prefix.replace("+", "")
    if (digits.length > 10 && digits.startsWith(prefixDigits)) {
      digits = digits.slice(prefixDigits.length)
      break
    }
  }

  return digits.length === 10 ? digits : null
}

export function formatMxPhone(digits: string): string {
  if (digits.length !== 10) return digits
  return `${digits.slice(0, 3)} ${digits.slice(3, 7)} ${digits.slice(7)}`
}

export function toSlug(value: string, fallback: string): string {
  const slug = normalizeSearch(value)
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return slug || fallback
}

export function normalizeSearch(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
}

export function capitalize(text: string): string {
  if (!text) return text
  return text.charAt(0).toUpperCase() + text.slice(1)
}
