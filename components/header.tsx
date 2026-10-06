// components/header.tsx
"use client"

import Link from "next/link"
import { useState } from "react"
import { useTheme } from "next-themes"
import { Menu, Wrench, Sun, Moon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { useHasMounted } from "@/hooks/useHasMounted"
import { cn } from "@/lib/utils"
import { TOUCH } from "@/components/ui/detail"

const navItems: { href: string; label: string }[] = []

function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme()
    const hasMounted = useHasMounted()

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
    const [open, setOpen] = useState(false)

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 px-4 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-4xl items-center justify-between">
                <Link
                    href="/"
                    className="flex items-center gap-2 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 rounded-lg"
                >
                    <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
                        <Wrench className="size-5 text-primary-foreground" aria-hidden="true" />
                    </div>
                    <span className="text-xl font-semibold tracking-tight">El Changarro</span>
                </Link>

                {/* Escritorio */}
                <nav className="hidden items-center gap-6 md:flex">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="text-[15px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="hidden items-center gap-2 md:flex">
                    <ThemeToggle />
                    <Button variant="ghost" asChild className="rounded-xl px-4">
                        <Link href="/login">Ingresar</Link>
                    </Button>
                    <Button asChild className="rounded-xl px-4">
                        <Link href="/register">Registrarse</Link>
                    </Button>
                </div>

                {/* Móvil */}
                <div className="flex items-center md:hidden">
                    <ThemeToggle />
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-11 rounded-full text-muted-foreground hover:text-foreground">
                                <Menu className="size-5" aria-hidden="true" />
                                <span className="sr-only">Abrir menú</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[85vw] max-w-xs border-l p-0 sm:max-w-sm">
                            <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
                            <div className="flex h-full flex-col">
                                <div className="flex h-16 shrink-0 items-center border-b px-6">
                                    <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                                        <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
                                            <Wrench className="size-5 text-primary-foreground" aria-hidden="true" />
                                        </div>
                                        <span className="text-xl font-semibold tracking-tight">El Changarro</span>
                                    </Link>
                                </div>

                                <nav className="flex flex-1 flex-col overflow-y-auto p-6">
                                    {navItems.length > 0 && (
                                        <div className="mb-6 space-y-4">
                                            {navItems.map((item) => (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    className="block text-lg font-medium text-muted-foreground transition-colors hover:text-foreground"
                                                    onClick={() => setOpen(false)}
                                                >
                                                    {item.label}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </nav>

                                <div className="shrink-0 space-y-3 border-t p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                                    <Button variant="outline" asChild className={cn(TOUCH, "w-full")}>
                                        <Link href="/login" onClick={() => setOpen(false)}>Ingresar</Link>
                                    </Button>
                                    <Button asChild className={cn(TOUCH, "w-full")}>
                                        <Link href="/register" onClick={() => setOpen(false)}>Registrarse</Link>
                                    </Button>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    )
}