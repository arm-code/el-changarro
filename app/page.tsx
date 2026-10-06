import Link from "next/link"
import {
  Receipt,
  FileText,
  FileSignature,
  Wallet,
  Calculator,
  Store,
  BookOpen,
  Package,
  Tag,
  ChevronRight,
  type LucideIcon,
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Badge } from "@/components/ui/badge"
import { InstallBanner } from "@/components/home/install-banner"

const dailyTools: {
  title: string
  description: string
  icon: LucideIcon
  href?: string
}[] = [
  {
    title: "Notas de venta",
    description: "Haz recibos para tus clientes en segundos",
    icon: Receipt,
    href: "/tools/sales-note",
  },
  {
    title: "Cotizaciones",
    description: "Manda cotizaciones con tu marca por WhatsApp",
    icon: FileText,
  },
  {
    title: "Contratos de evento",
    description: "Contratos de renta listos para firmar",
    icon: FileSignature,
  },
  {
    title: "Control de gastos",
    description: "Lleva el control de lo que entra y sale",
    icon: Wallet,
    href: "/tools/expenses",
  },
  {
    title: "Corte diario",
    description: "Cierra el día y conoce tus ganancias",
    icon: Calculator,
  },
]

const upcomingTools: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: "Libreta de fiado",
    description: "Para saber quién te debe, sin el cuaderno",
    icon: BookOpen,
  },
  {
    title: "Inventario",
    description: "Cuenta lo que tienes y lo que se te está acabando",
    icon: Package,
  },
  {
    title: "Calculadora de precio",
    description: "Súmale tu ganancia al costo y ya sabes cuánto cobrar",
    icon: Tag,
  },
]

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="mx-auto max-w-4xl space-y-8 px-4 py-8">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Las herramientas de tu changarro
            </h1>
            <p className="max-w-md text-base text-muted-foreground">
              Notas de venta, cotizaciones, gastos y contratos, listos desde tu celular.
            </p>
          </div>

          <InstallBanner />

          <section aria-labelledby="daily-tools-title">
            <h2 id="daily-tools-title" className="sr-only">
              Herramientas del día a día
            </h2>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {dailyTools.map((tool) => (
                <li key={tool.title}>
                  {tool.href ? (
                    <Link
                      href={tool.href}
                      className="flex min-h-19 items-center gap-3.5 rounded-xl border bg-card p-4 active:bg-accent"
                    >
                      <ToolIcon icon={tool.icon} />
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-semibold">{tool.title}</p>
                        <p className="text-sm text-muted-foreground">{tool.description}</p>
                      </div>
                      <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                    </Link>
                  ) : (
                    <div className="flex min-h-19 items-center gap-3.5 rounded-xl border border-dashed p-4 opacity-70">
                      <ToolIcon icon={tool.icon} muted />
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-semibold">{tool.title}</p>
                        <p className="text-sm text-muted-foreground">{tool.description}</p>
                      </div>
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        Pronto
                      </Badge>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="config-title">
            <h2 id="config-title" className="mb-3 text-base font-semibold">
              Configura tu negocio
            </h2>
            <ul>
              <li>
                <Link
                  href="/tools/pos"
                  className="flex min-h-16 items-center gap-3.5 rounded-xl border bg-card px-4 py-3.5 active:bg-accent"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Store className="size-5 text-muted-foreground" aria-hidden="true" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                    <span className="text-base font-semibold">Punto de venta</span>
                    <Badge variant="secondary" className="text-xs">
                      Configuración
                    </Badge>
                  </span>
                  <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                </Link>
              </li>
            </ul>
          </section>

          <section aria-labelledby="upcoming-title">
            <h2 id="upcoming-title" className="mb-3 text-base font-semibold">
              Más adelante
            </h2>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {upcomingTools.map((tool) => (
                <li key={tool.title} className="rounded-xl border border-dashed p-4 opacity-70">
                  <div className="mb-2.5 flex items-center justify-between gap-2">
                    <span className="flex size-9 items-center justify-center rounded-lg bg-muted">
                      <tool.icon className="size-[18px] text-muted-foreground" aria-hidden="true" />
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      Pronto
                    </Badge>
                  </div>
                  <p className="text-[15px] font-semibold">{tool.title}</p>
                  <p className="text-sm text-muted-foreground">{tool.description}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}

function ToolIcon({ icon: Icon, muted = false }: { icon: LucideIcon; muted?: boolean }) {
  return (
    <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-accent">
      <Icon className={muted ? "size-[22px] text-muted-foreground" : "size-[22px] text-primary"} aria-hidden="true" />
    </span>
  )
}
