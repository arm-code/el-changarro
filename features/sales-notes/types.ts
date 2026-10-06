// Tipos de dominio de la micro-app de notas de venta.

export interface Customer {
  name: string
  phone?: string
  address?: string
}

export interface NoteItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
}

export type NoteStatus = 'quote' | 'issued'

export interface Note {
  id: string
  folio: string
  customer: Customer
  items: NoteItem[]
  applyIva: boolean
  ivaRate: number // ej. 0.16
  notes?: string
  status: NoteStatus
  createdAt: string // ISO
  updatedAt?: string // ISO
}

/** Datos para crear o editar una nota (el id, folio y fechas los pone el storage). */
export type NoteInput = Omit<Note, 'id' | 'folio' | 'createdAt' | 'updatedAt'>

export interface NoteTotals {
  subtotal: number
  iva: number
  total: number
}

/** Datos del negocio que aparecen en el documento exportado. */
export interface BusinessInfo {
  name: string
  phone: string
}
