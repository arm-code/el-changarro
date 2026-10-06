// features/sales-notes/components/notes-list.tsx
'use client'

import Link from 'next/link'
import { ChevronRight, FilePlus2, FileText, Receipt, RotateCw } from 'lucide-react'
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
        {notes.map((note) => {
          const isQuote = note.status === 'quote'

          return (
            <li key={note.id}>
              <Button
                variant="ghost"
                onClick={() => onSelect(note)}
                className={cn(
                  'flex h-auto min-h-[4.5rem] w-full items-center justify-start gap-3 rounded-none px-4 py-3 text-left font-normal',
                  'transition-colors hover:bg-accent active:bg-accent',
                  'outline-none focus-visible:bg-accent'
                )}
              >
                {/* El ícono distingue de un vistazo: nota confirmada (color) vs cotización (neutro) */}
                <span
                  className={cn(
                    'flex size-11 shrink-0 items-center justify-center rounded-xl',
                    isQuote ? 'bg-muted text-muted-foreground' : 'bg-primary/10 text-primary'
                  )}
                  aria-hidden="true"
                >
                  {isQuote ? <FileText className="size-5" /> : <Receipt className="size-5" />}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[15px] font-medium capitalize text-foreground">
                    {note.customer.name}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-[13px] text-muted-foreground">
                    <span className="font-mono uppercase">{note.folio}</span>
                    <span aria-hidden="true">&bull;</span>
                    <span className="capitalize">{formatDate(note.createdAt)}</span>
                  </span>
                </span>

                <span className="flex shrink-0 flex-col items-end gap-0.5">
                  <span className="text-[15px] font-semibold tabular-nums text-foreground">
                    {formatCurrency(noteTotal(note))}
                  </span>
                  <span className="text-xs text-muted-foreground">{isQuote ? 'Cotización' : 'Nota'}</span>
                </span>

                <ChevronRight className="size-5 shrink-0 text-muted-foreground/50" aria-hidden="true" />
              </Button>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

/* ─── Subcomponentes ────────────────────────────────────────────────────── */

function EmptyNotes() {
  return (
    <Card className="flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Receipt className="size-7" aria-hidden="true" />
      </span>
      <h3 className="text-lg font-semibold">Haz tu primera nota</h3>
      <p className="max-w-xs text-pretty text-sm leading-relaxed text-muted-foreground">
        Agrega a tu cliente y sus conceptos. Luego compártela por WhatsApp o descárgala en PDF.
      </p>
      <Button asChild className="mt-2 h-12 px-6 text-base">
        <Link href={SALES_NOTES_ROUTES.create}>
          <FilePlus2 aria-hidden="true" />
          Crear nota
        </Link>
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
        <RotateCw aria-hidden="true" />
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
          <div key={i} className="flex min-h-[4.5rem] items-center gap-3 px-4 py-3 text-left">
            <Skeleton className="size-11 shrink-0 rounded-xl" />
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