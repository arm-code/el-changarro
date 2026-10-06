import type { Note, NoteItem, NoteTotals } from '../types'

export const IVA_RATE = 0.16

export function itemAmount(item: Pick<NoteItem, 'quantity' | 'unitPrice'>): number {
  return (item.quantity || 0) * (item.unitPrice || 0)
}

export function computeNoteTotals(items: NoteItem[], applyIva: boolean, ivaRate: number): NoteTotals {
  const subtotal = items.reduce((acc, it) => acc + itemAmount(it), 0)
  const iva = applyIva ? subtotal * ivaRate : 0
  return { subtotal, iva, total: subtotal + iva }
}

export function noteTotal(note: Note): number {
  return computeNoteTotals(note.items, note.applyIva, note.ivaRate).total
}
