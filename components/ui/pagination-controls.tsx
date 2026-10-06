"use client"

import { Button } from "@/components/ui/button"

interface PaginationControlsProps {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
}

export function PaginationControls({ page, pageCount, onPageChange }: PaginationControlsProps) {
  return (
    <nav aria-label="Paginación" className="flex items-center justify-center gap-3 py-4 text-sm">
      <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Anterior
      </Button>
      <span className="text-muted-foreground">
        Página {page} de {pageCount}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
      >
        Siguiente
      </Button>
    </nav>
  )
}
