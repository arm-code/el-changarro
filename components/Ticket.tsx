"use client";

import React from 'react';
import { SaleHistoryItem } from '../app/tools/pos/types/pos';

interface TicketProps {
    sale: SaleHistoryItem | null;
}

export default function Ticket({ sale }: TicketProps) {
    if (!sale) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('es-MX', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="ticket-container bg-white text-black font-mono px-3 py-1 leading-tight text-[11px] w-[80mm] mx-auto print:m-0 print:w-full">
            <style jsx global>{`
                @media print {
                    @page {
                        margin: 20px;
                        size: 80mm auto;
                    }
                    body * {
                        visibility: hidden;
                    }
                    .ticket-container, .ticket-container * {
                        visibility: visible;
                    }
                    .ticket-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 80mm;
                    }
                }
            `}</style>

            <div className="text-center mb-4">
                <h1 className="text-sm font-bold uppercase">El Changarro</h1>
                <p className="text-[10px]">VENTA DE PRODUCTOS Y SERVICIOS</p>
                <div className="border-b border-dashed my-2"></div>
            </div>

            <div className="mb-2">
                <p>FECHA: {formatDate(sale.createdAt)}</p>
                <p>TICKET: {sale.id.slice(0, 8).toUpperCase()}</p>
                <p>PAGO: {sale.paymentMethod.name}</p>
                {sale.customer && <p>CLIENTE: {sale.customer.name.toUpperCase()}</p>}
            </div>

            <div className="border-b border-dashed my-2"></div>

            <table className="w-full mb-2">
                <thead>
                    <tr className="text-left border-b border-dashed">
                        <th className="font-normal">DSC</th>
                        <th className="font-normal text-right">CANT</th>
                        <th className="font-normal text-right">IMP</th>
                    </tr>
                </thead>
                <tbody>
                    {sale.items.map((item) => (
                        <tr key={item.id}>
                            <td className="py-1 uppercase max-w-[40mm] overflow-hidden">{item.product.name}</td>
                            <td className="py-1 text-right">{item.quantity}</td>
                            <td className="py-1 text-right">${Number(item.subtotal).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="border-b border-dashed my-2"></div>

            <div className="flex justify-between font-bold text-sm mb-4">
                <span>TOTAL:</span>
                <span>${Number(sale.total).toFixed(2)}</span>
            </div>

            <div className="text-center mt-6 mb-10">
                <p className="text-[10px] uppercase font-bold italic">¡Gracias por su compra!</p>
                <p className="text-[9px] mt-2">Este no es un comprobante fiscal.</p>
            </div>

            <div className="h-8"></div>
        </div>
    );
}
