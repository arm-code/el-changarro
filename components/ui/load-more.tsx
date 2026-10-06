"use client"

import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LoadMoreProps {
  hasNextPage: boolean
  isFetching: boolean
  isError: boolean
  showEnd: boolean
  onLoadMore: () => void
  label?: string
}

export function LoadMore({
  hasNextPage,
  isFetching,
  isError,
  showEnd,
  onLoadMore,
  label = "Ver más",
}: LoadMoreProps) {
  if (isError) {
    return (
      <div className="flex flex-col items-center gap-2 py-4 text-center">
        <p className="text-sm text-destructive">No se pudo cargar más. Intenta otra vez.</p>
        <Button variant="outline" onClick={onLoadMore}>
          Reintentar
        </Button>
      </div>
    )
  }

  if (hasNextPage) {
    return (
      <div className="flex justify-center py-4">
        <Button variant="outline" onClick={onLoadMore} disabled={isFetching}>
          {isFetching ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Cargando…
            </>
          ) : (
            `${label}…`
          )}
        </Button>
      </div>
    )
  }

  if (showEnd) {
    return (
      <p role="status" className="py-4 text-center text-sm text-muted-foreground">
        Ya viste todos los resultados
      </p>
    )
  }

  return null
}
