"use client"

import Link from "next/link"
import { useState } from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from "@/components/ui/sheet"
import { Menu, Wrench, Sun, Moon } from "lucide-react"
import { useHasMounted } from "@/hooks/useHasMounted"

const navItems = [
    { href: "/tools", label: "Herramientas" },
]

function ThemeToggle() {
    const { resolvedTheme, setTheme } = useTheme()
    const hasMounted = useHasMounted()

    if (!hasMounted) return <div className="size-11" aria-hidden="true" />

    const isDark = resolvedTheme === "dark"

    return (
        <Button
            variant="outline"
            size="icon"
            className="size-11 rounded-full"
            aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
            onClick={() => setTheme(isDark ? "light" : "dark")}
        >
            {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
        </Button>
    )
}

export function Header() {
    const [open, setOpen] = useState(false)

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                        <Wrench className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <span className="text-xl font-bold tracking-tight">El Changarro</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden items-center gap-6 md:flex">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="hidden items-center gap-3 md:flex">
                    <ThemeToggle />
                    <Button variant="ghost" asChild>
                        <Link href="/login">Ingresar</Link>
                    </Button>
                    <Button asChild>
                        <Link href="/register">Registrarse</Link>
                    </Button>
                </div>

                {/* Mobile Navigation */}
                <div className="flex items-center gap-2 md:hidden">
                    <ThemeToggle />
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Abrir menú</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                            <div className="flex flex-col gap-6 pt-6">
                                <div className="flex items-center justify-between px-4">
                                    <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                                            <Wrench className="h-5 w-5 text-primary-foreground" />
                                        </div>
                                        <span className="text-xl font-semibold">El Changarro</span>
                                    </Link>
                                </div>
                                <nav className="flex flex-col gap-4 px-4">
                                    {navItems.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className="text-lg font-medium text-muted-foreground transition-colors hover:text-foreground"
                                            onClick={() => setOpen(false)}
                                        >
                                            {item.label}
                                        </Link>
                                    ))}
                                </nav>
                                <div className="flex flex-col gap-3 px-4 pt-4">
                                    <Button variant="outline" asChild className="w-full">
                                        <Link href="/login" onClick={() => setOpen(false)}>Ingresar</Link>
                                    </Button>
                                    <Button asChild className="w-full">
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
