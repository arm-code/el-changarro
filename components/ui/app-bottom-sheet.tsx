// components/ui/app-bottom-sheet.tsx
"use client"

import * as React from "react"
import { X } from "lucide-react"
import { useIsMobile } from "@/hooks/useIsMobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"

interface AppBottomSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  headerAction?: React.ReactNode
  footer?: React.ReactNode
  children: React.ReactNode
  /**
   * Alto en móvil. Por defecto "auto": la hoja mide lo que mide su contenido.
   * Si pasas un alto CSS válido ("70dvh", "480px") la hoja lo usa como alto fijo.
   * En cualquier caso NUNCA pasa de MOBILE_MAX_HEIGHT: lo que sobre se desplaza dentro del cuerpo.
   * Valores que no son largos CSS (ej. clases de Tailwind) se ignoran.
   */
  mobileHeight?: string
  contentClassName?: string
}

/** Deja siempre un borde visible arriba para que se entienda que es una hoja y se pueda tocar fuera. */
const MOBILE_MAX_HEIGHT = "92dvh"
const CSS_LENGTH = /^\d+(\.\d+)?(px|rem|vh|svh|dvh|%)$/

export function AppBottomSheet({
  open,
  onOpenChange,
  title,
  description,
  headerAction,
  footer,
  children,
  mobileHeight = "auto",
  contentClassName,
}: AppBottomSheetProps) {
  const isMobile = useIsMobile()

  const fixedHeight = CSS_LENGTH.test(mobileHeight) ? mobileHeight : undefined

  // shrink-0: el encabezado nunca se encoge ni se desplaza; siempre se ve el botón de cerrar.
  const header = (
    <div className="flex min-h-14 shrink-0 items-center gap-1 border-b py-2 pl-4 pr-2">
      <div className="min-w-0 flex-1">
        {title && <h2 className="truncate text-base font-semibold">{title}</h2>}
        {description && <p className="truncate text-sm text-muted-foreground">{description}</p>}
      </div>
      {headerAction}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-11 shrink-0 rounded-full text-muted-foreground hover:text-foreground"
        aria-label="Cerrar"
        onClick={() => onOpenChange(false)}
      >
        <X className="size-5" aria-hidden="true" />
      </Button>
    </div>
  )

  // min-h-0 es la clave: sin él, un hijo flex no puede ser más chico que su contenido y no hace scroll.
  const body = (
    <div className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4", contentClassName)}>
      {children}
    </div>
  )

  const footerBlock = footer && (
    <div className="shrink-0 border-t bg-background px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      {footer}
    </div>
  )

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="flex flex-col gap-0 overflow-hidden rounded-t-2xl p-0"
          style={{ height: fixedHeight, maxHeight: MOBILE_MAX_HEIGHT }}
        >
          <SheetTitle className="sr-only">{title ?? "Detalle"}</SheetTitle>
          {header}
          {body}
          {footerBlock}
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="flex max-h-[85dvh] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
      >
        <DialogTitle className="sr-only">{title ?? "Detalle"}</DialogTitle>
        {header}
        {body}
        {footerBlock}
      </DialogContent>
    </Dialog>
  )
}