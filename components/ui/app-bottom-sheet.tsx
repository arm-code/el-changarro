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
  mobileHeight?: string
  contentClassName?: string
}

export function AppBottomSheet({
  open,
  onOpenChange,
  title,
  description,
  headerAction,
  footer,
  children,
  mobileHeight = "85vh",
  contentClassName,
}: AppBottomSheetProps) {
  const isMobile = useIsMobile()

  const header = (
    <div className="flex items-center gap-1 border-b px-4 py-3">
      <div className="min-w-0 flex-1">
        {title && <h2 className="truncate text-base font-semibold">{title}</h2>}
        {description && <p className="truncate text-sm text-muted-foreground">{description}</p>}
      </div>
      {headerAction}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="rounded-full"
        aria-label="Cerrar"
        onClick={() => onOpenChange(false)}
      >
        <X aria-hidden="true" />
      </Button>
    </div>
  )

  const body = <div className={cn("flex-1 overflow-y-auto px-4 py-4", contentClassName)}>{children}</div>

  const footerBlock = footer && (
    <div className="border-t px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">{footer}</div>
  )

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="flex flex-col gap-0 rounded-t-2xl p-0"
          style={{ height: mobileHeight }}
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
      <DialogContent showCloseButton={false} className="flex max-h-[85vh] flex-col gap-0 p-0 sm:max-w-lg">
        <DialogTitle className="sr-only">{title ?? "Detalle"}</DialogTitle>
        {header}
        {body}
        {footerBlock}
      </DialogContent>
    </Dialog>
  )
}
