// components/footer.tsx
import Link from "next/link"
import { Wrench } from "lucide-react"
import { availableTools } from "@/lib/tools-catalog"

const focusRing = "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"

export function Footer() {
    return (
        <footer className="border-t bg-card px-4 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-10 sm:pt-14">
            <div className="mx-auto max-w-4xl space-y-10">
                <div className="grid gap-8 sm:grid-cols-2">
                    <div className="space-y-4">
                        <Link href="/" className={`inline-flex items-center gap-2 rounded-lg ${focusRing}`}>
                            <span className="flex size-9 items-center justify-center rounded-lg bg-primary">
                                <Wrench className="size-5 text-primary-foreground" aria-hidden="true" />
                            </span>
                            <span className="text-xl font-semibold tracking-tight">El Changarro</span>
                        </Link>
                        <p className="max-w-xs text-pretty text-[15px] leading-relaxed text-muted-foreground">
                            Herramientas simples para changarros, tiendas y emprendedores.
                        </p>
                    </div>

                    <nav aria-label="Herramientas" className="space-y-4">
                        <h3 className="text-sm font-medium text-muted-foreground">Herramientas</h3>
                        <ul className="space-y-1">
                            {availableTools.map((tool) => (
                                <li key={tool.id}>
                                    <Link
                                        href={tool.href}
                                        className={`inline-flex min-h-11 items-center rounded text-[15px] font-medium transition-colors hover:text-primary ${focusRing}`}
                                    >
                                        {tool.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>

                <div className="flex flex-col gap-2 border-t pt-6 text-[15px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                    <p>&copy; {new Date().getFullYear()} El Changarro. Hecho en Ciudad Juárez.</p>
                    <p>
                        Desarrollado por{" "}
                        <a
                            href="https://dejuarez.mx/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`rounded font-medium text-primary hover:underline ${focusRing}`}
                        >
                            dejuarez.mx
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    )
}