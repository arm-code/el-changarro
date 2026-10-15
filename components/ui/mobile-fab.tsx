"use client"

import * as React from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const FAB_CLASS = cn(
  "size-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25",
  "transition-transform active:scale-95 motion-reduce:transition-none"
)

const LABEL_VISIBLE_MS = 3000

type MobileFabProps = {
  title: string
  "aria-label": string
  icon?: React.ReactNode
} & ({ href: string; onClick?: never } | { href?: never; onClick: () => void })

export function MobileFab({ href, onClick, title, icon, ...rest }: MobileFabProps) {
  const ariaLabel = rest["aria-label"]
  const [labelVisible, setLabelVisible] = React.useState(true)

  // El badge aparece al abrir la página para dar contexto y se oculta solo.
  React.useEffect(() => {
    const t = setTimeout(() => setLabelVisible(false), LABEL_VISIBLE_MS)
    return () => clearTimeout(t)
  }, [])

  const show = () => setLabelVisible(true)
  const hide = () => setLabelVisible(false)

  const content = icon ?? <Plus className="size-6" strokeWidth={2.5} aria-hidden="true" />

  return (
    <div className="fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-40 sm:hidden">
      <div
        className="relative flex items-center"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute right-16 top-1/2 -translate-y-1/2 select-none",
            "whitespace-nowrap rounded-full bg-foreground/90 px-3 py-1.5 text-xs font-semibold text-background shadow-lg backdrop-blur-sm",
            "transition-all duration-200 ease-out motion-reduce:transition-none",
            labelVisible ? "translate-x-0 scale-100 opacity-100" : "translate-x-2 scale-95 opacity-0"
          )}
        >
          {title}
        </span>
        {href ? (
          <Button asChild size="icon" className={FAB_CLASS} aria-label={ariaLabel}>
            <Link href={href}>{content}</Link>
          </Button>
        ) : (
          <Button size="icon" className={FAB_CLASS} aria-label={ariaLabel} onClick={onClick}>
            {content}
          </Button>
        )}
      </div>
    </div>
  )
}
