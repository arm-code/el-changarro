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

/** Con pocas notas buscar es ruido; el buscador aparece a partir de aquí. */
const SEARCH_MIN_NOTES = 3

const FOCUS_RING = 'outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50'

/** Pantalla principal de la herramienta: historial, búsqueda, detalle y borrado. */
export function NotesHistory() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Note | null>(null)
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null)
  const [businessOpen, setBusinessOpen] = useState(false)

  const { data: notes = [], isLoading, isError, refetch } = useSalesNotes()
  const business = useBusinessInfo()
  const deleteMutation = useDeleteSalesNote()

  const hasNotes = notes.length > 0
  const hasBusinessName = Boolean(business.name.trim())

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
    <div className="space-y-6 pb-28 sm:pb-8">
      {/* Navegación + encabezado */}
      <div>
        <Button asChild variant="ghost" className="-ml-3 mb-2 text-muted-foreground hover:text-foreground">
          <Link href="/">
            <ArrowLeft aria-hidden="true" />
            Volver a herramientas
          </Link>
        </Button>
        <PageHeader
          title="Notas de venta"
          description="Tus notas y cotizaciones, guardadas en este dispositivo."
          // En móvil la acción es el botón flotante; en el estado vacío, la tarjeta de bienvenida.
          action={
            hasNotes ? (
              <Button asChild className={cn(TOUCH, 'hidden sm:inline-flex')}>
                <Link href={SALES_NOTES_ROUTES.create}>
                  <FilePlus2 aria-hidden="true" />
                  Crear nota
                </Link>
              </Button>
            ) : undefined
          }
        />
      </div>

      {/* Datos del negocio: invitación si falta el nombre, fila discreta si ya existe */}
      <button
        type="button"
        onClick={() => setBusinessOpen(true)}
        className={cn(
          'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors',
          hasBusinessName
            ? 'min-h-14 bg-card hover:bg-accent active:bg-accent'
            : 'min-h-16 border-primary/30 bg-primary/5 hover:bg-primary/10 active:bg-primary/10',
          FOCUS_RING
        )}
      >
        <Store
          className={cn('size-5 shrink-0', hasBusinessName ? 'text-muted-foreground' : 'text-primary')}
          aria-hidden="true"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-medium capitalize">
            {hasBusinessName ? business.name : 'Agrega el nombre de tu negocio'}
          </span>
          <span className="block truncate text-sm text-muted-foreground">
            {hasBusinessName ? 'Así sale en tus notas y cotizaciones' : 'Para que aparezca en tus notas y cotizaciones'}
          </span>
        </span>
        <Pencil className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      </button>

      {notes.length > SEARCH_MIN_NOTES && (
        <section aria-label="Buscar notas">
          <SearchInput value={query} onChange={setQuery} placeholder="Buscar por folio o cliente" />
        </section>
      )}

      <section aria-label="Lista de notas">
        <NotesList
          notes={filtered}
          isLoading={isLoading}
          isError={isError}
          isFiltered={hasNotes}
          onRetry={() => refetch()}
          onSelect={setSelected}
        />
      </section>

      {hasNotes && <MobileFab href={SALES_NOTES_ROUTES.create} aria-label="Nueva nota de venta" title="Nueva nota" />}

      {/* Detalle de la nota */}
      <AppBottomSheet
        open={selected !== null}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected ? `${selectedKind} ${selected.folio}` : ''}
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