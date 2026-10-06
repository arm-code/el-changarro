// Persistencia local (localStorage) de las notas de venta.
// Reemplaza a financeApi de El Changarro OS. Si algún día hay API, solo cambia este archivo.

import type { BusinessInfo, Note, NoteInput } from '../types'
import { genId } from './format'

const NOTES_KEY = 'bt:sales-notes:v1'
const SEQ_KEY = 'bt:sales-notes:seq'
const BUSINESS_KEY = 'bt:business-info:v1'

export const STORAGE_KEYS = { notes: NOTES_KEY, business: BUSINESS_KEY } as const

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  const raw = window.localStorage.getItem(key)
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  // Puede lanzar (modo privado / cuota llena); quien llama lo convierte en error de UI
  window.localStorage.setItem(key, JSON.stringify(value))
}

function nextFolio(): string {
  const seq = read<number>(SEQ_KEY, 0) + 1
  write(SEQ_KEY, seq)
  return `NV-${String(seq).padStart(4, '0')}`
}

function sortByDate(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
}

export const notesStorage = {
  list(): Note[] {
    const notes = read<Note[]>(NOTES_KEY, [])
    return sortByDate(Array.isArray(notes) ? notes : [])
  },

  get(id: string): Note | null {
    return this.list().find((n) => n.id === id) ?? null
  },

  create(input: NoteInput): Note {
    const note: Note = { ...input, id: genId('nv'), folio: nextFolio(), createdAt: new Date().toISOString() }
    write(NOTES_KEY, [note, ...this.list()])
    return note
  },

  update(id: string, input: NoteInput): Note {
    const notes = this.list()
    const current = notes.find((n) => n.id === id)
    if (!current) throw new Error('Nota no encontrada')
    const updated: Note = { ...current, ...input, updatedAt: new Date().toISOString() }
    write(NOTES_KEY, notes.map((n) => (n.id === id ? updated : n)))
    return updated
  },

  remove(id: string) {
    write(NOTES_KEY, this.list().filter((n) => n.id !== id))
  },
}

export const businessStorage = {
  get(): BusinessInfo {
    return { name: '', phone: '', ...read<Partial<BusinessInfo>>(BUSINESS_KEY, {}) }
  },
  save(info: BusinessInfo): BusinessInfo {
    write(BUSINESS_KEY, info)
    return info
  },
}
