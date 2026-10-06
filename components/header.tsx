// components/header.tsx
"use client"

import Link from "next/link"
import Image from "next/image"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
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
                    <Image
                        src="/icon_192x192_nobg.png"
                        alt="El Changarro"
                        width={36}
                        height={36}
                        className="rounded-lg object-contain"
                        priority
                    />
                    <span className="text-lg font-semibold tracking-tight sm:text-xl">El Changarro</span>
                </Link>

                <div className="flex items-center gap-1 sm:gap-2">
                    <ThemeToggle />
                    <Button variant="ghost" disabled className="h-11 rounded-xl px-3 sm:px-4">
                        Ingresar
                    </Button>
                    {/* En móvil se oculta para no saturar; el registro se alcanza desde /login */}
                    <Button disabled className="hidden h-11 rounded-xl px-4 sm:inline-flex">
                        Registrarse
                    </Button>
                </div>
            </div>
        </header>
    )
}