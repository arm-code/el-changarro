// components/home/receipt-preview.tsx
// Ejemplo visual (decorativo) de una nota de venta. Muestra de un vistazo
// qué hace la app sin necesidad de explicarlo. Es solo contenido de muestra.

export function ReceiptPreview() {
    return (
        <div aria-hidden="true" className="receipt-shadow rotate-[1.5deg] select-none">
            <div className="receipt-edge border-x border-t bg-card px-5 pb-8 pt-5 text-card-foreground">
                <div className="flex items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                        TN
                    </span>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold leading-tight">Tu negocio</p>
                        <p className="text-xs text-muted-foreground">Nota de venta</p>
                    </div>
                </div>

                <div className="my-4 border-t border-dashed" />

                <dl className="space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                        <dt>10 mesas</dt>
                        <dd className="tabular-nums">$500</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                        <dt>40 sillas</dt>
                        <dd className="tabular-nums">$400</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                        <dt>Entrega</dt>
                        <dd className="tabular-nums">$100</dd>
                    </div>
                </dl>

                <div className="my-4 border-t border-dashed" />

                <div className="flex items-baseline justify-between gap-4">
                    <span className="text-sm font-medium">Total</span>
                    <span className="text-xl font-semibold tabular-nums">$1,000</span>
                </div>

                <p className="mt-4 rounded-lg bg-primary px-3 py-2 text-center text-xs font-medium text-primary-foreground">
                    Enviar por WhatsApp
                </p>
            </div>
        </div>
    )
}