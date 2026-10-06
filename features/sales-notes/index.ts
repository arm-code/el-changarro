// API pública de la micro-app de notas de venta.
// Las páginas de app/ solo deben importar desde aquí.

export { NotesHistory } from './components/notes-history'
export { NoteWizard } from './components/note-wizard'
export { EditNote } from './components/edit-note'
export { SALES_NOTES_ROUTES } from './routes'
export type { Note, NoteItem, NoteStatus, BusinessInfo } from './types'
