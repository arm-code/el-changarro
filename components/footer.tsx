// components/footer.tsx
import Link from "next/link"
import { Wrench } from "lucide-react"

const productLinks = [
    { href: "/tools/sales-note", label: "Notas de venta" },
    { href: "/tools/expenses", label: "Control de gastos" },
]

export function Footer() {
    return (
        <footer className="border-t bg-card px-4 py-10 sm:py-16">
            <div className="mx-auto max-w-4xl space-y-10">
                <div className="grid gap-8 sm:grid-cols-2">
                    <div className="space-y-4">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 rounded-lg"
                        >
                            <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
                                <Wrench className="size-5 text-primary-foreground" aria-hidden="true" />
                            </div>
                            <span className="text-xl font-semibold tracking-tight">El Changarro</span>
                        </Link>
                        <p className="max-w-xs text-[15px] leading-relaxed text-muted-foreground text-pretty">
                            Herramientas simples para changarros, tiendas y emprendedores.
                        </p>
                        <p className="text-[15px] text-muted-foreground">
                            Desarrollado por{' '}
                            <a
                                href="https://dejuarez.mx/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-primary hover:underline outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 rounded"
                            >
                                dejuarez.mx
                            </a>
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Herramientas</h3>
                        <ul className="space-y-3">
                            {productLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-[15px] font-medium transition-colors hover:text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 rounded"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-between gap-3 sm:flex-row text-[15px] text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} El Changarro</p>
                    <p>Hecho para los changarros de México</p>
                </div>
            </div>
        </footer>
    )
}