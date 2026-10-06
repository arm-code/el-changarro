import Link from "next/link"
import { Wrench } from "lucide-react"

const productLinks = [
    { href: "/tools/sales-note", label: "Notas de venta" },
    { href: "/tools/expenses", label: "Control de gastos" },
]

export function Footer() {
    return (
        <footer className="border-t border-border bg-card">
            <div className="container mx-auto max-w-6xl px-4 py-12">
                <div className="grid gap-8 sm:grid-cols-2">
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                                <Wrench className="h-5 w-5 text-primary-foreground" />
                            </div>
                            <span className="text-xl font-semibold">El Changarro</span>
                        </Link>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Desarrollado por <Link className="underline text-primary" href="https://www.arm-solutions.com.mx/">ARM Solutions</Link>
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Herramientas simples para changarros, tiendas y emprendedores.
                        </p>
                    </div>

                    <div>
                        <h3 className="mb-4 text-sm font-semibold">Herramientas</h3>
                        <ul className="space-y-3">
                            {productLinks.map((link) => (
                                <li key={link.href}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
                    <p className="text-sm text-muted-foreground">
                        &copy; {new Date().getFullYear()} El Changarro
                    </p>
                    <p className="text-sm text-muted-foreground">
                        Hecho para los changarros de México
                    </p>
                </div>
            </div>
        </footer>
    )
}
