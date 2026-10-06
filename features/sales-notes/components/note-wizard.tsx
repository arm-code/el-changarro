// features/sales-notes/components/note-wizard.tsx
'use client'

import { useMemo, useState, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Loader2, Plus, Save, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { computeNoteTotals, itemAmount, IVA_RATE } from '../lib/calculations'
import { formatCurrency, genId } from '../lib/format'
import { useSaveSalesNote } from '../hooks/use-sales-notes'
import { useBusinessInfo } from '../hooks/use-business-info'
import { SALES_NOTES_ROUTES } from '../routes'
import type { Note, NoteItem, NoteStatus } from '../types'
import { PrintSaleNoteDocument } from './sale-note-document'
import { NoteCardPreview } from './note-card-preview'
import { DocumentActions } from './document-actions'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { toSlug } from '@/lib/display'
import { cn } from '@/lib/utils'

type Step = 1 | 2 | 3

/** Límites de captura: evitan datos absurdos o documentos imposibles de imprimir. */
const LIMITS = {
  name: 80,
  phone: 20,
  address: 120,
  description: 120,
  notes: 500,
  maxQuantity: 100_000,
  maxPrice: 10_000_000,
} as const

/** Convierte lo tecleado en un número entre 0 y `max` (nunca negativo, NaN ni infinito). */
function toBoundedNumber(raw: string, max: number): number {
  const value = Number(raw)
  if (!Number.isFinite(value)) return 0
  return Math.min(Math.max(value, 0), max)
}

function emptyItem(): NoteItem {
  return { id: genId('it'), description: '', quantity: 1, unitPrice: 0 }
}

function kindLabel(status: NoteStatus): string {
  return status === 'quote' ? 'Cotización' : 'Nota'
}

const OPTION_CARD =
  'flex h-full cursor-pointer flex-col items-center justify-between rounded-xl border-2 border-muted bg-transparent p-4 transition-all hover:bg-muted/50 active:scale-[0.98] motion-reduce:transition-none peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5'

const STEP_ENTER = 'animate-in fade-in slide-in-from-right-4 duration-300 motion-reduce:animate-none'

interface NoteWizardProps {
  /** Si viene, el asistente edita esa nota; si no, crea una nueva. */
  initialNote?: Note
}

/** Asistente de 3 pasos para crear o editar una nota de venta / cotización. */
export function NoteWizard({ initialNote }: NoteWizardProps) {
  const router = useRouter()
  const isEditing = Boolean(initialNote)
  const business = useBusinessInfo()
  const saveMutation = useSaveSalesNote(initialNote?.id)

  const [step, setStep] = useState<Step>(1)

  const [customerName, setCustomerName] = useState(initialNote?.customer.name ?? '')
  const [customerPhone, setCustomerPhone] = useState(initialNote?.customer.phone ?? '')
  const [customerAddress, setCustomerAddress] = useState(initialNote?.customer.address ?? '')

  const [items, setItems] = useState<NoteItem[]>(() =>
    initialNote?.items.length ? initialNote.items : [emptyItem()]
  )
  const [expandedItemId, setExpandedItemId] = useState<string>(isEditing ? '' : items[0].id)

  const [applyIva, setApplyIva] = useState(initialNote?.applyIva ?? false)
  const [notes, setNotes] = useState(initialNote?.notes ?? '')
  const [status, setStatus] = useState<NoteStatus>(initialNote?.status ?? 'quote')

  const [savedNote, setSavedNote] = useState<Note | null>(null)
  const [confirmExit, setConfirmExit] = useState(false)

  const ivaRate = initialNote?.ivaRate ?? IVA_RATE
  const totals = useMemo(() => computeNoteTotals(items, applyIva, ivaRate), [items, applyIva, ivaRate])

  // Detecta cambios sin guardar comparando contra la foto del primer render (sin ids de conceptos).
  const snapshot = JSON.stringify([
    customerName,
    customerPhone,
    customerAddress,
    items.map((it) => [it.description, it.quantity, it.unitPrice]),
    applyIva,
    notes,
    status,
  ])
  const [initialSnapshot] = useState(snapshot)
  const isDirty = snapshot !== initialSnapshot

  function requestExit() {
    if (isDirty && !savedNote) setConfirmExit(true)
    else router.push(SALES_NOTES_ROUTES.list)
  }

  function handleNextStep1() {
    if (!customerName.trim()) {
      toast.error('Falta el nombre del cliente')
      return
    }
    setStep(2)
  }

  function handleNextStep2() {
    if (!items.some((it) => it.description.trim() !== '')) {
      toast.error('Agrega al menos un concepto con descripción')
      return
    }
    setStep(3)
  }

  function updateItem(id: string, patch: Partial<NoteItem>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)))
  }

  function addItem() {
    const newItem = emptyItem()
    setItems((prev) => [...prev, newItem])
    setExpandedItemId(newItem.id)
  }

  function removeItem(id: string) {
    setItems((prev) => {
      const filtered = prev.filter((it) => it.id !== id)
      if (filtered.length > 0 && expandedItemId === id) setExpandedItemId(filtered[filtered.length - 1].id)
      return filtered.length > 0 ? filtered : [emptyItem()]
    })
  }

  function handleSave() {
    saveMutation.mutate(
      {
        customer: {
          name: customerName.trim(),
          phone: customerPhone.trim() || undefined,
          address: customerAddress.trim() || undefined,
        },
        items: items
          .filter((it) => it.description.trim() !== '')
          .map((it) => ({ ...it, description: it.description.trim() })),
        applyIva,
        ivaRate,
        notes: notes.trim() || undefined,
        status,
      },
      {
        onSuccess: (note) => {
          toast.success(isEditing ? 'Cambios guardados' : 'Nota guardada')
          setSavedNote(note)
        },
        onError: () => {
          toast.error('No se pudo guardar la nota. Revisa que tu navegador permita guardar datos.')
        },
      }
    )
  }

  // Footer de navegación. En móvil: [Atrás | Siguiente] en una fila y "Cancelar" discreto debajo.
  const renderWizardFooter = (primaryAction: () => void, primaryLabel: string, showBack = true) => (
    <div className="flex flex-col gap-2 border-t bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <Button
        type="button"
        variant="ghost"
        onClick={requestExit}
        className="order-last h-11 text-muted-foreground sm:order-first"
      >
        Cancelar
      </Button>

      <div className="flex gap-3">
        {showBack && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep((s) => (s - 1) as Step)}
            className="h-12 px-4 sm:h-11"
          >
            <ArrowLeft aria-hidden="true" />
            Atrás
          </Button>
        )}
        <Button
          type="button"
          onClick={primaryAction}
          disabled={saveMutation.isPending}
          className="h-12 flex-1 px-8 sm:h-11 sm:flex-none"
        >
          {saveMutation.isPending ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : step === 3 ? (
            <Save aria-hidden="true" />
          ) : null}
          {primaryLabel}
          {step !== 3 && <ArrowRight aria-hidden="true" />}
        </Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 pb-28 sm:pb-8">
      <PageHeader
        title={isEditing ? `Editar ${kindLabel(initialNote!.status).toLowerCase()}` : 'Nueva nota'}
        description={isEditing ? initialNote!.folio : undefined}
      />

      <div
        role="progressbar"
        aria-label="Progreso"
        aria-valuemin={1}
        aria-valuemax={3}
        aria-valuenow={step}
        aria-valuetext={`Paso ${step} de 3`}
        className="flex items-center gap-2 px-1"
      >
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors motion-reduce:transition-none',
              step >= n ? 'bg-primary' : 'bg-muted'
            )}
          />
        ))}
      </div>

      {/* ─── PASO 1 ──────────────────────────────────────────────── */}
      {step === 1 && (
        <section aria-labelledby="step-1-title" className={STEP_ENTER}>
          <div className="mb-4">
            <h2 id="step-1-title" className="text-lg font-semibold">
              Datos del cliente
            </h2>
            <p className="text-sm text-muted-foreground">Paso 1 de 3: ¿A quién le estás vendiendo o cotizando?</p>
          </div>
          <Card className="gap-0 py-0">
            <div className="space-y-5 p-4 sm:p-5">
              <div className="space-y-2">
                <Label htmlFor="cname">
                  Nombre <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cname"
                  value={customerName}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomerName(e.target.value)}
                  placeholder="Nombre completo / negocio"
                  maxLength={LIMITS.name}
                  autoComplete="off"
                  className="h-11 text-base capitalize"
                  autoFocus
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cphone">Teléfono (opcional)</Label>
                  <Input
                    id="cphone"
                    inputMode="tel"
                    value={customerPhone}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomerPhone(e.target.value)}
                    placeholder="Ej. 656 123 4567"
                    maxLength={LIMITS.phone}
                    autoComplete="off"
                    className="h-11 text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="caddr">Dirección (opcional)</Label>
                  <Input
                    id="caddr"
                    value={customerAddress}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setCustomerAddress(e.target.value)}
                    placeholder="Lugar de entrega"
                    maxLength={LIMITS.address}
                    autoComplete="off"
                    className="h-11 text-base capitalize"
                  />
                </div>
              </div>
            </div>
            {renderWizardFooter(handleNextStep1, 'Siguiente', false)}
          </Card>
        </section>
      )}

      {/* ─── PASO 2 ────────────────────────────────────────────── */}
      {step === 2 && (
        <section aria-labelledby="step-2-title" className={STEP_ENTER}>
          <div className="mb-4">
            <h2 id="step-2-title" className="text-lg font-semibold">
              Conceptos
            </h2>
            <p className="text-sm text-muted-foreground">Paso 2 de 3: ¿Qué artículos o servicios incluyes?</p>
          </div>

          <Card className="gap-0 py-0">
            <Accordion type="single" collapsible value={expandedItemId} onValueChange={setExpandedItemId} className="w-full">
              {items.map((item, index) => (
                <AccordionItem key={item.id} value={item.id} className="border-b-0">
                  <AccordionTrigger className="rounded-none border-b px-4 py-4 hover:bg-muted/30 hover:no-underline sm:px-5">
                    <div className="flex w-full min-w-0 flex-1 items-center justify-between pr-4">
                      <div className="flex min-w-0 flex-col items-start gap-1">
                        <span className="truncate text-[15px] font-semibold capitalize text-foreground">
                          {item.description.trim() ? item.description : `Concepto ${index + 1}`}
                        </span>
                        <span className="text-xs font-normal text-muted-foreground">
                          {item.quantity} x {formatCurrency(item.unitPrice)}
                        </span>
                      </div>
                      <span className="shrink-0 font-medium tabular-nums text-primary">
                        {formatCurrency(itemAmount(item))}
                      </span>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="border-b bg-muted/10 px-4 pb-5 pt-4 sm:px-5">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`desc-${item.id}`}>Descripción</Label>
                        <Input
                          id={`desc-${item.id}`}
                          value={item.description}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => updateItem(item.id, { description: e.target.value })}
                          placeholder="Ej. Renta de mesa y sillas"
                          maxLength={LIMITS.description}
                          autoComplete="off"
                          className="h-11 bg-background text-base capitalize"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`qty-${item.id}`}>Cantidad</Label>
                          <Input
                            id={`qty-${item.id}`}
                            type="number"
                            inputMode="numeric"
                            min={1}
                            max={LIMITS.maxQuantity}
                            value={item.quantity === 0 ? '' : item.quantity}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              updateItem(item.id, { quantity: toBoundedNumber(e.target.value, LIMITS.maxQuantity) })
                            }
                            className="h-11 bg-background text-base tabular-nums"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`price-${item.id}`}>Precio unitario ($)</Label>
                          <Input
                            id={`price-${item.id}`}
                            type="number"
                            inputMode="decimal"
                            min={0}
                            max={LIMITS.maxPrice}
                            value={item.unitPrice === 0 ? '' : item.unitPrice}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              updateItem(item.id, { unitPrice: toBoundedNumber(e.target.value, LIMITS.maxPrice) })
                            }
                            className="h-11 bg-background text-base tabular-nums"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => removeItem(item.id)}
                          disabled={items.length === 1}
                        >
                          <Trash2 aria-hidden="true" />
                          Eliminar este concepto
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="p-4 sm:p-5">
              <Button type="button" variant="outline" onClick={addItem} className="h-11 w-full border-dashed text-primary">
                <Plus aria-hidden="true" />
                Agregar otro concepto
              </Button>
            </div>
            {renderWizardFooter(handleNextStep2, 'Siguiente')}
          </Card>
        </section>
      )}

      {/* ─── PASO 3 ───────────────────────────────────────── */}
      {step === 3 && (
        <section aria-labelledby="step-3-title" className={STEP_ENTER}>
          <div className="mb-4">
            <h2 id="step-3-title" className="text-lg font-semibold">
              Detalles finales
            </h2>
            <p className="text-sm text-muted-foreground">Paso 3 de 3: Ajustes, notas adicionales y guardado.</p>
          </div>

          <Card className="gap-0 py-0">
            <div className="grid gap-6 p-4 sm:p-5 lg:grid-cols-2">
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">Tipo de documento</Label>
                  <RadioGroup
                    value={status}
                    onValueChange={(v) => setStatus(v as NoteStatus)}
                    className="grid grid-cols-2 gap-3"
                  >
                    <div>
                      <RadioGroupItem value="quote" id="quote" className="peer sr-only" />
                      <Label htmlFor="quote" className={OPTION_CARD}>
                        <span className="text-[15px] font-semibold">Cotización</span>
                        <span className="mt-1 text-center text-xs font-normal text-muted-foreground">Precio propuesto</span>
                      </Label>
                    </div>
                    <div>
                      <RadioGroupItem value="issued" id="issued" className="peer sr-only" />
                      <Label htmlFor="issued" className={OPTION_CARD}>
                        <span className="text-[15px] font-semibold">Nota de venta</span>
                        <span className="mt-1 text-center text-xs font-normal text-muted-foreground">Venta confirmada</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <label
                  className={cn(
                    'flex cursor-pointer items-center justify-between rounded-xl border-2 p-4 transition-all hover:bg-muted/50 active:scale-[0.98] motion-reduce:transition-none',
                    applyIva ? 'border-primary bg-primary/5' : 'border-muted bg-transparent'
                  )}
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-[15px] font-semibold">Impuestos</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      Incluir IVA ({Math.round(ivaRate * 100)}%) al total
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={applyIva}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setApplyIva(e.target.checked)}
                    className="size-5 rounded accent-primary"
                  />
                </label>

                <div className="space-y-2">
                  <Label htmlFor="obs">Notas u observaciones</Label>
                  <textarea
                    id="obs"
                    value={notes}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                    placeholder="Condiciones de pago, validez de la cotización..."
                    maxLength={LIMITS.notes}
                    className="flex min-h-[100px] w-full resize-none rounded-xl border border-input bg-background px-4 py-3 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  />
                </div>
              </div>

              <div className="flex flex-col justify-end space-y-4 rounded-xl border bg-muted/30 p-5">
                <h3 className="border-b pb-2 text-sm font-semibold text-muted-foreground">Resumen a cobrar</h3>
                <div className="flex justify-between text-[15px] text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-medium tabular-nums">{formatCurrency(totals.subtotal)}</span>
                </div>
                {applyIva && (
                  <div className="flex justify-between text-[15px] text-muted-foreground">
                    <span>IVA ({Math.round(ivaRate * 100)}%)</span>
                    <span className="font-medium tabular-nums">{formatCurrency(totals.iva)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-4">
                  <span className="text-lg font-semibold">Total</span>
                  <span className="text-2xl font-bold tabular-nums text-primary">{formatCurrency(totals.total)}</span>
                </div>
              </div>
            </div>

            {renderWizardFooter(handleSave, isEditing ? 'Guardar cambios' : 'Finalizar y guardar')}
          </Card>
        </section>
      )}

      {/* Visor post-guardado */}
      <AppBottomSheet
        open={savedNote !== null}
        onOpenChange={(o) => !o && router.push(SALES_NOTES_ROUTES.list)}
        title={savedNote ? `${kindLabel(savedNote.status)} ${savedNote.folio}` : ''}
        mobileHeight="max-h-[92dvh]"
        footer={
          savedNote && (
            <DocumentActions
              placement="inline"
              filename={`${toSlug(kindLabel(savedNote.status), 'nota')}-${toSlug(savedNote.folio, 'folio')}`}
              exportNode={<PrintSaleNoteDocument note={savedNote} business={business} />}
            />
          )
        }
      >
        {savedNote && <NoteCardPreview note={savedNote} />}
      </AppBottomSheet>

      {/* Confirmación al salir con datos sin guardar */}
      <ConfirmDialog
        open={confirmExit}
        onOpenChange={setConfirmExit}
        title="¿Salir sin guardar?"
        description="Los datos que capturaste se perderán."
        confirmText="Sí, salir"
        onConfirm={() => router.push(SALES_NOTES_ROUTES.list)}
        isPending={false}
      />
    </div>
  )
}