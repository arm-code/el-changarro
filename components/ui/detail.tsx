import { Phone, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { describeDate, toMxPhone, toNumber } from "@/lib/display"

export const LABEL = "text-sm font-medium text-muted-foreground"
export const TOUCH = "h-12 rounded-xl text-[15px]"

export function DetailSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h3 className="mb-3 text-base font-semibold">{title}</h3>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

export function DetailSummary({ children }: { children: React.ReactNode }) {
  return <dl className="divide-y divide-border rounded-xl bg-muted/60">{children}</dl>
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3">
      <dt className={LABEL}>{label}</dt>
      <dd className="flex items-baseline gap-1.5 text-base font-medium">{children}</dd>
    </div>
  )
}

export function DetailDateRow({
  label = "Fecha",
  value,
  dateOnly,
  highlightUpcoming,
  emptyText = "Por definir",
}: {
  label?: string
  value: unknown
  dateOnly?: boolean
  highlightUpcoming?: boolean
  emptyText?: string
}) {
  const described = describeDate(value, { dateOnly })

  if (!described) {
    return (
      <DetailRow label={label}>
        <span className="text-muted-foreground">{emptyText}</span>
      </DetailRow>
    )
  }

  const upcoming = highlightUpcoming && described.days >= 0 && described.days <= 7

  return (
    <DetailRow label={label}>
      <span className={cn(upcoming && "text-primary")}>{described.label}</span>
      <span className="text-muted-foreground">· {described.relative}</span>
    </DetailRow>
  )
}

export function DetailAmountRow({ label = "Total", amount }: { label?: string; amount: unknown }) {
  const value = toNumber(amount)

  return (
    <DetailRow label={label}>
      <span className="text-base font-semibold tabular-nums">
        ${value.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    </DetailRow>
  )
}

export function ContactButtons({ phone, message }: { phone: unknown; message?: string }) {
  const normalized = toMxPhone(phone)
  if (!normalized) return null

  const waQuery = message ? `?text=${encodeURIComponent(message)}` : ""

  return (
    <div className="flex gap-2" role="group" aria-label="Contactar">
      <Button variant="outline" className={cn(TOUCH, "flex-1")} asChild>
        <a href={`tel:${normalized}`}>
          <Phone aria-hidden="true" />
          Llamar
        </a>
      </Button>
      <Button variant="outline" className={cn(TOUCH, "flex-1")} asChild>
        <a href={`https://wa.me/52${normalized}${waQuery}`} target="_blank" rel="noopener noreferrer">
          <MessageCircle aria-hidden="true" />
          WhatsApp
        </a>
      </Button>
    </div>
  )
}
