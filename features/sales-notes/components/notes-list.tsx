'use client'

import Link from 'next/link'
import { ChevronRight, FileText, RotateCw } from 'lucide-react'
import { noteTotal } from '../lib/calculations'
import { formatCurrency, formatDate } from '../lib/format'
import { SALES_NOTES_ROUTES } from '../routes'
import type { Note } from '../types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface NotesListProps {
  notes: Note[]
  isLoading: boolean
  isError: boolean
  /** Hay notas guardadas pero la búsqueda no encontró ninguna. */
  isFiltered?: boolean
  onRetry: () => void
  onSelect: (note: Note) => void
}

export function NotesList({ notes, isLoading, isError, isFiltered, onRetry, onSelect }: NotesListProps) {
  if (isLoading) return <NotesSkeleton />
  if (isError) return <InlineError message="No se pudieron cargar tus notas." onRetry={onRetry} />
  if (notes.length === 0) return isFiltered ? <NoResults /> : <EmptyNotes />

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <ul className="divide-y">
        {notes.map((note) => (
          <li key={note.id}>
            <Button
              variant="ghost"
              onClick={() => onSelect(note)}
              className={cn(
                'flex h-auto min-h-16 w-full items-center justify-start gap-3 rounded-none px-4 py-3 text-left font-normal',
                'transition-colors hover:bg-accent/60 active:bg-accent',
                'outline-none focus-visible:bg-accent'
              )}
            >
              <div className="flex size-12 shrink-0 flex-col items-center justify-center rounded-lg bg-muted leading-none">
                <FileText className="size-5 text-muted-foreground" aria-hidden />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-medium text-foreground capitalize">{note.customer.name}</p>
                <div className="mt-0.5 flex items-center gap-1.5 text-[13px] text-muted-foreground">
                  <span className="font-mono uppercase">{note.folio}</span>
                  <span aria-hidden>&bull;</span>
                  <span className="capitalize">{formatDate(note.createdAt)}</span>
                </div>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-0.5 sm:mr-4">
                <span className="text-[15px] font-medium tabular-nums text-foreground">
                  {formatCurrency(noteTotal(note))}
                </span>
                <span className={cn('text-xs', note.status === 'quote' ? 'text-muted-foreground' : 'text-success')}>
                  {note.status === 'quote' ? 'Cotización' : 'Nota'}
                </span>
              </div>

              <div className="flex items-center text-muted-foreground/40 sm:mr-2">
                <ChevronRight className="size-5" aria-hidden />
              </div>
            </Button>
          </li>
        ))}
      </ul>
    </Card>
  )
}

/* ─── Subcomponentes ────────────────────────────────────────────────────── */

function EmptyNotes() {
  return (
    <Card className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <FileText className="size-6" aria-hidden />
      </div>
      <p className="text-[15px] font-medium">Aún no tienes notas registradas</p>
      <p className="text-sm text-muted-foreground">Se guardan en este dispositivo.</p>
      <Button asChild className="mt-2">
        <Link href={SALES_NOTES_ROUTES.create}>Crear nota</Link>
      </Button>
    </Card>
  )
}

function NoResults() {
  return (
    <Card className="px-6 py-10 text-center">
      <p className="text-[15px] text-muted-foreground">No encontramos notas con esa búsqueda.</p>
    </Card>
  )
}

function InlineError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card className="flex flex-col items-center justify-between gap-4 p-5 sm:flex-row">
      <p className="text-[15px] text-muted-foreground">{message}</p>
      <Button variant="outline" onClick={onRetry} className="w-full sm:w-auto">
        <RotateCw className="mr-2 size-4" aria-hidden />
        Reintentar
      </Button>
    </Card>
  )
}

function NotesSkeleton() {
  return (
    <Card className="gap-0 py-0" aria-busy="true" aria-label="Cargando notas">
      <div className="divide-y">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex min-h-16 items-center gap-3 px-4 py-3 text-left">
            <Skeleton className="size-12 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="h-3.5 w-2/5" />
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-10" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
