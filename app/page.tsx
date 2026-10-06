// app/page.tsx
import Link from "next/link"
import { ChevronDown, ChevronRight, Store } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { InstallBanner } from "@/components/home/install-banner"
import { ReceiptPreview } from "@/components/home/receipt-preview"
import { availableTools, upcomingTools } from "@/lib/tools-catalog"
import { cn } from "@/lib/utils"

const focusRing = "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* 1. Hero: qué es y qué puedo hacer ya */}
        <section className="relative isolate overflow-hidden">
          <div aria-hidden="true" className="hero-grid absolute inset-0 -z-10" />

          <div className="mx-auto grid max-w-4xl gap-10 px-4 pb-14 pt-10 sm:pt-16 md:grid-cols-[1.15fr_0.85fr] md:items-center md:gap-12 md:pb-20">
            <div className="space-y-6">
              <h1 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
                Tu changarro, organizado desde el celular
              </h1>
              <p className="max-w-prose text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
                Haz notas de venta, lleva tus gastos y resuelve lo del día a día con herramientas
                sencillas. Se abren y se usan, sin complicarte.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button asChild size="lg" className="h-12 w-full rounded-xl px-6 text-base sm:w-auto">
                  <Link href="/tools/sales-note">Hacer una nota de venta</Link>
                </Button>
                <Button asChild variant="ghost" size="lg" className="h-12 w-full rounded-xl px-6 text-base sm:w-auto">
                  <Link href="#herramientas">Ver todas las herramientas</Link>
                </Button>
              </div>
            </div>

            <div className="mx-auto w-full max-w-[17rem] md:ml-auto md:mr-0">
              <ReceiptPreview />
            </div>
          </div>
        </section>

        {/* 2. Herramientas que ya funcionan */}
        <section
          id="herramientas"
          aria-labelledby="tools-title"
          className="mx-auto max-w-4xl scroll-mt-20 px-4 py-12 sm:py-16"
        >
          <h2 id="tools-title" className="text-xl font-semibold tracking-tight">
            Herramientas listas para usar
          </h2>

          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {availableTools.map((tool) => (
              <li key={tool.id}>
                <Link
                  href={tool.href}
                  className={cn(
                    "group flex min-h-24 items-center gap-4 rounded-2xl border bg-card p-4 sm:p-5",
                    "transition-colors hover:border-primary/40 hover:bg-accent active:bg-accent",
                    focusRing
                  )}
                >
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <tool.icon className="size-6" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-semibold">{tool.title}</span>
                    <span className="mt-0.5 block text-pretty text-sm leading-snug text-muted-foreground">
                      {tool.description}
                    </span>
                  </span>
                  <ChevronRight
                    className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>

          {/* Configuración: fila discreta, no compite con las herramientas */}
          <Link
            href="/tools/pos"
            className={cn(
              "group mt-4 flex min-h-14 items-center gap-3 rounded-xl border border-dashed px-4 py-3",
              "transition-colors hover:bg-accent active:bg-accent",
              focusRing
            )}
          >
            <Store className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-medium">Punto de venta</span>
              <span className="block text-sm text-muted-foreground">Configura tu negocio</span>
            </span>
            <ChevronRight
              className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>

          {/* Si el banner no renderiza nada (app ya instalada), el contenedor se oculta */}
          <div className="mt-8 empty:hidden">
            <InstallBanner />
          </div>
        </section>

        {/* 3. Próximamente: banda con otro fondo y colapsada para no saturar */}
        <section aria-labelledby="soon-title" className="border-t bg-secondary/40">
          <div className="mx-auto max-w-4xl px-4 py-8 sm:py-10">
            <details className="group">
              <summary
                className={cn(
                  "flex min-h-12 cursor-pointer list-none items-center gap-3 rounded-lg [&::-webkit-details-marker]:hidden",
                  focusRing
                )}
              >
                <h2 id="soon-title" className="mr-auto text-xl font-semibold tracking-tight">
                  Próximamente
                </h2>
                <span className="text-sm text-muted-foreground">{upcomingTools.length} herramientas</span>
                <ChevronDown
                  className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>

              <ul className="mt-4 divide-y rounded-2xl border bg-card">
                {upcomingTools.map((tool) => (
                  <li key={tool.id} className="flex items-start gap-3 px-4 py-3.5">
                    <tool.icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-[15px] font-medium">{tool.title}</p>
                      <p className="text-pretty text-sm text-muted-foreground">{tool.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </details>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}