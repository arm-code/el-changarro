'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { FilePlus2, Pencil, Store, Trash2 } from 'lucide-react'
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
import { PageHeader } from '@/components/ui/page-header'
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
        toast.success('Nota eliminada')
        setNoteToDelete(null)
      },
      onError: () => toast.error('No se pudo eliminar la nota.'),
    })
  }

  return (
    <div className="space-y-8 pb-28 sm:pb-8">
      <PageHeader
        title="Tus notas"
        description="Busca, comparte o administra tus notas y cotizaciones."
        action={
          <Button asChild>
            <Link href={SALES_NOTES_ROUTES.create}>
              <FilePlus2 aria-hidden />
              Crear nota
            </Link>
          </Button>
        }
      />

      <button
        type="button"
        onClick={() => setBusinessOpen(true)}
        className="flex w-full items-center gap-3 rounded-xl border bg-card px-4 py-3 text-left transition-colors hover:bg-accent/60"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
          <Store className="size-5 text-muted-foreground" aria-hidden />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-medium">
            {business.name || 'Agrega el nombre de tu negocio'}
          </span>
          <span className="block text-sm text-muted-foreground">
            {business.name ? 'Sale en tus documentos · Toca para editar' : 'Para que salga en tus notas'}
          </span>
        </span>
        <Pencil className="size-4 shrink-0 text-muted-foreground" aria-hidden />
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
        mobileHeight="92dvh"
        headerAction={
          selected && (
            <Button asChild variant="ghost" size="icon" className="size-11 rounded-full text-muted-foreground hover:text-foreground">
              <Link
                href={SALES_NOTES_ROUTES.edit(selected.id)}
                onClick={() => setSelected(null)}
                aria-label={`Editar ${selectedKind.toLowerCase()}`}
              >
                <Pencil className="size-5" aria-hidden />
              </Link>
            </Button>
          )
        }
        footer={
          selected && (
            <DocumentActions
              placement="inline"
              filename={`${selectedKind.toLowerCase()}-${toSlug(selected.folio, 'nota')}`}
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
                <Trash2 aria-hidden />
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
