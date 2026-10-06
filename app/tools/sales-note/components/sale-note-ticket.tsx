"use client";

import { Box, Edit2, Trash2, Check, X } from "lucide-react";
import { SaleItem } from "../types";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SaleNoteTicketProps {
    businessName: string;
    setBusinessName: (val: string) => void;
    client: string;
    setClient: (val: string) => void;
    date: string;
    setDate: (val: string) => void;
    items: SaleItem[];
    total: number;
    onEditItem: (item: SaleItem) => void;
    onRemoveItem: (id: string) => void;
}

export function SaleNoteTicket({
    businessName,
    setBusinessName,
    client,
    setClient,
    date,
    setDate,
    items,
    total,
    onEditItem,
    onRemoveItem,
}: SaleNoteTicketProps) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState(businessName);

    const handleSaveName = () => {
        setBusinessName(tempName || "BUSINESS TOOLBOX");
        setIsEditingName(false);
    };

    const handleCancelName = () => {
        setTempName(businessName);
        setIsEditingName(false);
    };

    return (
        <div className="w-full max-w-2xl bg-white border border-slate-200 shadow-sm rounded-md p-6 md:p-10 tansition-all print: border-none print:shadow-none">

            {/* Header of Note */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">

                <div className="space-y-1">
                    <div className="flex items-center gap-2 group relative">

                        {isEditingName ? (
                            <div className="flex items-center gap-1">
                                <input
                                    type="text"
                                    value={tempName}
                                    onChange={(e) => setTempName(e.target.value.toUpperCase())}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleSaveName();
                                        if (e.key === "Escape") handleCancelName();
                                    }}
                                    className="text-xl font-bold tracking-tight text-slate-950 uppercase border-b-2 border-slate-950 outline-none w-full max-w-[250px]"
                                    autoFocus
                                />
                                <Button onClick={handleSaveName} className="p-1 hover:bg-slate-100 rounded text-green-600">
                                    <Check className="h-4 w-4" />
                                </Button>
                                <Button onClick={handleCancelName} className="p-1 hover:bg-slate-100 rounded text-red-600">
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold tracking-tight text-slate-950 uppercase">
                                    {businessName}
                                </h1>
                                <Button
                                    onClick={() => {
                                        setTempName(businessName);
                                        setIsEditingName(true);
                                    }}
                                    variant={"secondary"}
                                    title="Editar nombre del negocio"
                                    className="print:hidden"
                                >
                                    <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        )}
                    </div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
                        Nota de Venta / Comprobante
                    </p>
                </div>


                <div className="flex flex-col gap-1.5 w-full md:w-auto bg-slate-50 p-3 rounded-sm border border-slate-100">
                    <label className="text-[9px] uppercase text-slate-500 font-bold leading-none">
                        Fecha de emisión
                    </label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="bg-transparent text-sm outline-none border-none p-0 h-auto font-semibold text-slate-950"
                    />
                </div>

            </div>

            {/* Client Info */}
            <div className="mb-10 p-4 border-l-2 border-slate-500 bg-slate-50/50">
                <label className="text-[9px] uppercase text-slate-500 font-bold mb-1.5 block tracking-wider">
                    Cliente / Concepto
                </label>
                <input
                    type="text"
                    placeholder="Nombre del cliente o referencia..."
                    value={client}
                    onChange={(e) => setClient(e.target.value.toUpperCase())}
                    className="w-full bg-transparent border-none outline-none text-sm font-bold text-slate-950 placeholder:text-slate-300 uppercase"
                />
            </div>

            {/* Items Section (Web) */}
            <div className="print:hidden mb-10 space-y-3">
                <label className="text-[10px] uppercase text-slate-400 font-bold px-1 tracking-widest">
                    Artículos ({items.length})
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="flex flex-col p-4 border border-slate-200 rounded-md bg-white shadow-sm hover:border-slate-400 transition-all space-y-4"
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-950 uppercase tracking-tight truncate max-w-[150px]">
                                        {item.description || "Sin descripción"}
                                    </p>
                                    <p className="text-xs text-slate-500 font-medium">
                                        {item.quantity} x ${item.price.toFixed(2)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-slate-950">
                                        ${(item.quantity * item.price).toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            {/* Botones siempre visibles con estilo Slate */}
                            <div className="flex gap-2 pt-3 border-t border-slate-100">
                                <button
                                    onClick={() => onEditItem(item)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors"
                                >
                                    <Edit2 className="h-3 w-3" /> Editar
                                </button>
                                <button
                                    onClick={() => onRemoveItem(item.id)}
                                    className="flex-1 flex items-center justify-center gap-2 py-2 text-[10px] font-bold uppercase bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors border border-red-100"
                                >
                                    <Trash2 className="h-3 w-3" /> Quitar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Items Section - Print View (Table) */}
            <div className="hidden print:block mb-8">
                <div className="grid grid-cols-[50px_1fr_80px_100px] gap-2 border-b-2 border-primary/20 pb-2 mb-2 text-[10px] uppercase font-bold text-muted-foreground px-2">
                    <div>Cant.</div>
                    <div>Descripción</div>
                    <div className="text-right">Precio</div>
                    <div className="text-right">Importe</div>
                </div>
                <div className="space-y-1">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className="grid grid-cols-[50px_1fr_80px_100px] gap-2 items-center px-2 py-1 border-b border-muted/20"
                        >
                            <div className="text-sm">{item.quantity}</div>
                            <div className="text-sm">{item.description}</div>
                            <div className="text-sm text-right font-medium">
                                ${item.price.toFixed(2)}
                            </div>
                            <div className="text-sm text-right font-bold text-primary">
                                ${(item.quantity * item.price).toFixed(2)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Totals */}
            <div className="mt-6 flex flex-col items-end border-t-2 border-primary/20 pt-4">
                <div className="w-full sm:w-64 space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground font-medium">
                        <span>Subtotal</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-primary">
                        <span>TOTAL</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            <div className="mt-12 text-center text-[10px] text-muted-foreground border-t pt-4 space-y-4">
                <p>
                    Gracias por su preferencia • Generado con El Changarro, una herramienta creada por <Link href="https://www.arm-solutions.com.mx/">ARM Solutions</Link>. Puedes hacer uso de esta herramienta de forma gratuita en cualquier momento, visítanos en:
                    <Link href="https://elchangarro.dejuarez.mx/" className="ml-1 text-slate-900 font-medium">elchangarro.dejuarez.mx</Link>
                </p>

                <div className="flex items-center justify-center gap-1.5 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-default select-none">
                    <Box className="h-3 w-3" />
                    <span className="font-bold tracking-tighter uppercase">El Changarro</span>
                </div>
            </div>

        </div>
    );
}