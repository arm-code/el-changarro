// components/header.tsx
"use client"

import Link from "next/link"
import { useTheme } from "next-themes"
import { Wrench, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useHasMounted } from "@/hooks/useHasMounted"

function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme()
    const hasMounted = useHasMounted()

    // Evita el desajuste de hidratación: el tema real solo se conoce en el cliente
    if (!hasMounted) return <div className="size-11" aria-hidden="true" />

    const isDark = resolvedTheme === "dark"

    return (
        <Button
            variant="ghost"
            size="icon"
            className="size-11 rounded-full text-muted-foreground hover:text-foreground"
            aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            onClick={() => setTheme(isDark ? "light" : "dark")}
        >
            {isDark ? <Sun className="size-5" aria-hidden="true" /> : <Moon className="size-5" aria-hidden="true" />}
        </Button>
    )
}

export function Header() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/90 px-4 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-4xl items-center justify-between">
                <Link
                    href="/"
                    className="flex items-center gap-2 rounded-lg outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                >
                    <span className="flex size-9 items-center justify-center rounded-lg bg-primary">
                        <Wrench className="size-5 text-primary-foreground" aria-hidden="true" />
                    </span>
                    <span className="text-lg font-semibold tracking-tight sm:text-xl">El Changarro</span>
                </Link>

                <div className="flex items-center gap-1 sm:gap-2">
                    <ThemeToggle />
                    <Button variant="ghost" asChild className="h-11 rounded-xl px-3 sm:px-4">
                        <Link href="/login">Ingresar</Link>
                    </Button>
                    {/* En móvil se oculta para no saturar; el registro se alcanza desde /login */}
                    <Button asChild className="hidden h-11 rounded-xl px-4 sm:inline-flex">
                        <Link href="/register">Registrarse</Link>
                    </Button>
                </div>
            </div>
        </header>
    )
}