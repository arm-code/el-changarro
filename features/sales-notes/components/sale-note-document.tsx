// features/sales-notes/components/sale-note-document.tsx
import { computeNoteTotals, itemAmount } from '../lib/calculations'
import { formatCurrency, formatDate } from '../lib/format'
import type { BusinessInfo, Note } from '../types'
import { cn } from '@/lib/utils'

interface SaleNoteDocumentProps {
  note: Note
  business: BusinessInfo
}

/**
 * Nodo de exportación (PDF/PNG). Ancho fijo de 794px = hoja Carta.
 * IMPORTANTE: aquí solo van colores fijos (neutral-*, emerald-*), nunca tokens del tema
 * (text-success, bg-primary...). Los tokens cambian en modo oscuro y el documento
 * siempre debe salir igual: es lo que recibe el cliente.
 */
export function PrintSaleNoteDocument({ note, business }: SaleNoteDocumentProps) {
  const totals = computeNoteTotals(note.items, note.applyIva, note.ivaRate)
  const businessName = business.name.trim() || 'Mi negocio'
  const kind = note.status === 'quote' ? 'Cotización' : 'Nota de venta'

  return (
    <div className="bg-white p-10 text-neutral-950" style={{ width: 794, fontSize: '14px', lineHeight: '1.5' }}>
      <header className="mb-8 flex items-start justify-between border-b border-neutral-200 pb-6">
        <div>
          <h1 className="text-2xl font-semibold">{businessName}</h1>
          {business.phone && <p className="mt-1 text-neutral-500">{business.phone}</p>}
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={cn(
              'rounded-md border px-3 py-1 text-xs font-semibold',
              note.status === 'quote'
                ? 'border-neutral-200 bg-neutral-100 text-neutral-600'
                : 'border-emerald-200 bg-emerald-50 text-emerald-700'
            )}
          >
            {kind}
          </span>
          <div className="mt-2 text-xl font-semibold">{note.folio}</div>
          <div className="text-neutral-500">{formatDate(note.createdAt)}</div>
        </div>
      </header>

      <section className="mb-8 rounded-xl border border-neutral-200 p-5">
        <h2 className="text-sm font-semibold text-neutral-500">Cliente</h2>
        <p className="mt-2 font-medium capitalize">{note.customer.name}</p>
        {note.customer.phone && <p className="mt-1">{note.customer.phone}</p>}
        {note.customer.address && <p className="mt-1 capitalize">{note.customer.address}</p>}
      </section>

      <table className="mb-8 w-full border-collapse text-left text-sm">
        <thead className="bg-neutral-100 text-neutral-500">
          <tr>
            <th className="border-b border-neutral-200 p-3 font-semibold">Descripción</th>
            <th className="w-16 border-b border-neutral-200 p-3 text-center font-semibold">Cant.</th>
            <th className="w-28 border-b border-neutral-200 p-3 text-right font-semibold">P. Unitario</th>
            <th className="w-32 border-b border-neutral-200 p-3 text-right font-semibold">Importe</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-200">
          {note.items.map((item) => (
            <tr key={item.id}>
              <td className="p-3 capitalize">{item.description}</td>
              <td className="p-3 text-center">{item.quantity}</td>
              <td className="p-3 text-right tabular-nums">{formatCurrency(item.unitPrice)}</td>
              <td className="p-3 text-right font-medium tabular-nums">{formatCurrency(itemAmount(item))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className="mb-10 flex justify-end">
        <div className="w-72 space-y-2 rounded-xl border border-neutral-200 bg-neutral-50 p-5">
          <div className="flex justify-between text-neutral-500">
            <span>Subtotal</span>
            <span className="tabular-nums">{formatCurrency(totals.subtotal)}</span>
          </div>
          {note.applyIva && (
            <div className="flex justify-between text-neutral-500">
              <span>IVA ({Math.round(note.ivaRate * 100)}%)</span>
              <span className="tabular-nums">{formatCurrency(totals.iva)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-neutral-200 pt-3 font-semibold">
            <span>Total</span>
            <span className="text-lg tabular-nums">{formatCurrency(totals.total)}</span>
          </div>
        </div>
      </section>

      {note.notes && (
        <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-5 text-sm">
          <h2 className="font-semibold text-neutral-500">Notas</h2>
          <p className="mt-2 whitespace-pre-line leading-relaxed first-letter:uppercase">{note.notes}</p>
        </section>
      )}

      <footer className="mt-12 text-center text-sm text-neutral-500">Gracias por su preferencia · {businessName}</footer>
    </div>
  )
}