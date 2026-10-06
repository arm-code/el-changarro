// features/sales-notes/components/notes-history.tsx
'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, FilePlus2, Pencil, Store, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useDeleteSalesNote, useSalesNotes } from '../hooks/use-sales-notes'
import { useBusinessInfo } from '../hooks/use-business-info'
import { SALES_NOTES_ROUTES } from '../routes'
import type { Note } from '../types'
import { NotesList } from './notes-list'
import { NoteCardPreview } from './note-card-preview'
import { PrintSaleNoteDocument } from './sale-note-document'
import { DocumentActions } from './document-actions'
import { BusinessInfoSheet } from './business-info-sheet'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { TOUCH } from '@/components/ui/detail'
import { MobileFab } from '@/components/ui/mobile-fab'
import { SearchInput } from '@/components/ui/search-input'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet'
import { normalizeSearch, toSlug } from '@/lib/display'
import { cn } from '@/lib/utils'

/** Pantalla principal de la herramienta: historial, búsqueda, detalle y borrado. */
export function NotesHistory() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Note | null>(null)
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null)
  const [businessOpen, setBusinessOpen] = useState(false)

  const { data: notes = [], isLoading, isError, refetch } = useSalesNotes()
  const business = useBusinessInfo()
  const deleteMutation = useDeleteSalesNote()

  const filtered = useMemo(() => {
    const q = normalizeSearch(query.trim())
    if (!q) return notes
    return notes.filter(
      (n) => normalizeSearch(n.folio).includes(q) || normalizeSearch(n.customer.name).includes(q)
    )
  }, [notes, query])

  const selectedKind = selected?.status === 'quote' ? 'Cotización' : 'Nota'

  function confirmDelete() {
    if (!noteToDelete) return
    deleteMutation.mutate(noteToDelete.id, {
      onSuccess: () => {
        toast.success(`${noteToDelete.status === 'quote' ? 'Cotización eliminada' : 'Nota eliminada'}`)
        setNoteToDelete(null)
      },
      onError: () => toast.error('No se pudo eliminar el documento. Revisa tu conexión.'),
    })
  }

  return (
    <div className="space-y-8 pb-28 sm:pb-8">
      {/* Grupo: Navegación + Encabezado. Así conviven sin romper el space-y-8 */}
      <div>
        <Button
          asChild
          variant="ghost"
          className="-ml-3 mb-2 text-muted-foreground hover:text-foreground"
        >
          <Link href="/">
            <ArrowLeft aria-hidden="true" />
            Volver a herramientas
          </Link>
        </Button>
        <PageHeader
          title="Tus notas"
          description="Busca, comparte o administra tus notas y cotizaciones."
          action={
            <Button asChild className={TOUCH}>
              <Link href={SALES_NOTES_ROUTES.create}>
                <FilePlus2 aria-hidden="true" />
                Crear nota
              </Link>
            </Button>
          }
        />
      </div>

      <button
        type="button"
        onClick={() => setBusinessOpen(true)}
        className={cn(
          "flex w-full min-h-20 items-center gap-3.5 rounded-xl border bg-card p-4 text-left",
          "transition-colors hover:bg-accent active:bg-accent",
          "outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        )}
      >
        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-muted">
          <Store className="size-5 text-muted-foreground" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-base font-medium">
            {business.name || 'Agrega el nombre de tu negocio'}
          </span>
          <span className="block truncate text-sm text-muted-foreground text-pretty">
            {business.name ? 'Sale en tus documentos · Toca para editar' : 'Para que salga en tus notas'}
          </span>
        </span>
        <Pencil className="size-5 shrink-0 text-muted-foreground/60" aria-hidden="true" />
      </button>

      <section aria-label="Buscar notas">
        <SearchInput value={query} onChange={setQuery} placeholder="Buscar por folio o cliente" />
      </section>

      <section aria-label="Lista de notas">
        <NotesList
          notes={filtered}
          isLoading={isLoading}
          isError={isError}
          isFiltered={notes.length > 0}
          onRetry={() => refetch()}
          onSelect={setSelected}
        />
      </section>

      <MobileFab href={SALES_NOTES_ROUTES.create} aria-label="Nueva nota de venta" title="Nueva nota" />

      {/* Detalle de la nota */}
      <AppBottomSheet
        open={selected !== null}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected ? `${selectedKind} ${selected.folio}` : ''}
        mobileHeight="max-h-[92dvh]"
        headerAction={
          selected && (
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="size-11 rounded-full text-muted-foreground hover:text-foreground"
            >
              <Link
                href={SALES_NOTES_ROUTES.edit(selected.id)}
                onClick={() => setSelected(null)}
                aria-label={`Editar ${selectedKind.toLowerCase()}`}
              >
                <Pencil className="size-5" aria-hidden="true" />
              </Link>
            </Button>
          )
        }
        footer={
          selected && (
            <DocumentActions
              placement="inline"
              filename={`${toSlug(selectedKind, 'nota')}-${toSlug(selected.folio, 'folio')}`}
              exportNode={<PrintSaleNoteDocument note={selected} business={business} />}
            />
          )
        }
      >
        {selected && (
          <div className="space-y-8">
            <NoteCardPreview note={selected} />

            <div className="border-t pt-6">
              <Button
                variant="ghost"
                className={cn(TOUCH, 'w-full text-destructive hover:bg-destructive/10 hover:text-destructive')}
                onClick={() => {
                  setNoteToDelete(selected)
                  setSelected(null)
                }}
              >
                <Trash2 aria-hidden="true" />
                Eliminar {selectedKind.toLowerCase()}
              </Button>
            </div>
          </div>
        )}
      </AppBottomSheet>

      <ConfirmDialog
        open={noteToDelete !== null}
        onOpenChange={(isOpen) => !isOpen && setNoteToDelete(null)}
        title={`¿Eliminar la ${noteToDelete?.status === 'quote' ? 'cotización' : 'nota'} ${noteToDelete?.folio ?? ''}?`}
        description="Se borrará por completo de este dispositivo y no podrás recuperarla."
        confirmText="Sí, eliminar"
        onConfirm={confirmDelete}
        isPending={deleteMutation.isPending}
      />

      <BusinessInfoSheet open={businessOpen} onOpenChange={setBusinessOpen} />
    </div>
  )
}