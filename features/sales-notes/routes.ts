// Rutas de la micro-app. Si se mueve la herramienta, solo se cambia aquí.
const BASE = '/tools/sales-note'

export const SALES_NOTES_ROUTES = {
  list: BASE,
  create: `${BASE}/new`,
  edit: (id: string) => `${BASE}/${encodeURIComponent(id)}/edit`,
} as const
