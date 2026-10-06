"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const FAB_CLASS = cn(
  "fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-40",
  "size-14 rounded-full bg-primary text-primary-foreground shadow-lg sm:hidden"
)

type MobileFabProps = {
  title: string
  "aria-label": string
} & ({ href: string; onClick?: never } | { href?: never; onClick: () => void })

export function MobileFab({ href, onClick, title, ...rest }: MobileFabProps) {
  const ariaLabel = rest["aria-label"]

  if (href) {
    return (
      <Button asChild size="icon" className={FAB_CLASS} aria-label={ariaLabel} title={title}>
        <Link href={href}>
          <Plus className="size-6" aria-hidden="true" />
        </Link>
      </Button>
    )
  }

  return (
    <Button size="icon" className={FAB_CLASS} aria-label={ariaLabel} title={title} onClick={onClick}>
      <Plus className="size-6" aria-hidden="true" />
    </Button>
  )
}
