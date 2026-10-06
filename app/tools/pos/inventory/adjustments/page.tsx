"use client";

import { useState, useEffect } from "react";
import NextLink from "next/link";
import {
    ArrowLeft,
    Box,
    Loader2,
    Search,
    Package,
    Save,
    AlertCircle,
    History,
    TrendingUp,
    TrendingDown,
    Plus,
    X,
    Filter
} from "lucide-react";
import { apiFetch } from "../../../../../lib/api";
import { Product, InventoryAdjustment } from "../../types/pos";
import Toast, { ToastType } from "../../../../../components/Toast";

export default function InventoryAdjustmentsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);

    // Adjustment Form State
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [quantity, setQuantity] = useState("");
    const [reason, setReason] = useState("");
    const [search, setSearch] = useState("");

    const reasons = [
        "Merma (Dañado/Caducado)",
        "Robo / Extravío",
        "Error de Conteo (Inventario Físico)",
        "Ajuste de Entrada (Donación/Extra)",
        "Otro"
    ];

    useEffect(() => {
        fetchProducts();
    }, []);

    const showToast = (message: string, type: ToastType = 'success') => {
        setToast({ message, type });
    };

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await apiFetch<Product[]>("/inventory/products");
            setProducts(data);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAdjustment = async () => {
        if (!selectedProduct) {
            showToast("Selecciona un producto", "info");
            return;
        }
        if (!quantity || isNaN(parseFloat(quantity))) {
            showToast("Ingresa una cantidad válida", "info");
            return;
        }
        if (!reason) {
            showToast("Selecciona una razón", "info");
            return;
        }

        try {
            setProcessing(true);
            await apiFetch("/inventory/adjustments", {
                method: 'POST',
                body: JSON.stringify({
                    productId: selectedProduct.id,
                    quantity: parseFloat(quantity),
                    reason: reason
                })
            });

            showToast("Ajuste de inventario aplicado");
            setSelectedProduct(null);
            setQuantity("");
            setReason("");
            fetchProducts(); // Refresh stock
        } catch (error: any) {
            showToast(error.message || "Error al aplicar ajuste", "error");
        } finally {
            setProcessing(false);
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toUpperCase().includes(search.toUpperCase()) ||
        p.barcode.includes(search)
    );

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-card sticky top-0 z-50">
                <NextLink className="flex items-center justify-center text-sm font-medium" href="/tools/pos">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver al POS
                </NextLink>
                <div className="ml-auto flex items-center gap-2 text-primary">
                    <Box className="h-5 w-5" />
                    <span className="font-bold tracking-tighter uppercase">Ajustes de Inventario</span>
                </div>
            </header>

            <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-6 rounded-3xl border shadow-sm">
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter uppercase text-primary">Corrección de Stock</h1>
                        <p className="text-sm text-muted-foreground uppercase font-bold tracking-widest text-[10px]">Ajustes manuales por merma o error</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Formulario (Izquierda/Arriba) */}
                    <div className="bg-white border rounded-[2.5rem] p-8 shadow-sm space-y-6">
                        <h2 className="text-xl font-black uppercase tracking-tighter text-primary flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" /> Nuevo Ajuste
                        </h2>

                        <div className="space-y-4">
                            {!selectedProduct ? (
                                <div className="space-y-4">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <input
                                            type="text"
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            placeholder="Buscar producto a ajustar..."
                                            className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/20 rounded-2xl p-4 pl-12 text-sm font-bold outline-none uppercase"
                                        />
                                    </div>
                                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2 scrollbar-hide">
                                        {loading ? (
                                            <p className="text-center py-4"><Loader2 className="h-5 w-5 animate-spin mx-auto text-primary" /></p>
                                        ) : filteredProducts.map(p => (
                                            <button
                                                key={p.id}
                                                onClick={() => setSelectedProduct(p)}
                                                className="w-full text-left p-4 hover:bg-violet-50 border-2 border-transparent hover:border-violet-100 rounded-2xl transition-all flex justify-between items-center group"
                                            >
                                                <div>
                                                    <p className="text-xs font-black uppercase text-slate-800">{p.name}</p>
                                                    <p className="text-[10px] text-muted-foreground font-bold">Stock Actual: <span className="text-primary">{p.stock}</span> {p.unit}</p>
                                                </div>
                                                <Plus className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-all" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-in zoom-in-95 duration-200">
                                    <div className="bg-violet-50 p-6 rounded-3xl border border-violet-100 relative group">
                                        <button
                                            onClick={() => setSelectedProduct(null)}
                                            className="absolute top-4 right-4 p-1 hover:bg-violet-200 rounded-full text-violet-600 transition-all"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                        <p className="text-[10px] font-black uppercase text-violet-600 tracking-widest mb-1">Producto Seleccionado</p>
                                        <h3 className="text-lg font-black uppercase tracking-tight text-slate-900">{selectedProduct.name}</h3>
                                        <p className="text-xs font-bold text-slate-500">Stock actual en sistema: {selectedProduct.stock} {selectedProduct.unit}</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Cantidad a Ajustar (+ o -)</label>
                                        <div className="relative">
                                            {/* Indicador de tendencia basado en el signo */}
                                            {quantity.startsWith("-") ? (
                                                <TrendingDown className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />
                                            ) : quantity && parseFloat(quantity) > 0 ? (
                                                <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />
                                            ) : (
                                                <Box className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                            )}
                                            <input
                                                type="number"
                                                value={quantity}
                                                onChange={(e) => setQuantity(e.target.value)}
                                                placeholder="Ej: -5 o 10"
                                                className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/20 rounded-2xl p-4 pl-12 text-sm font-bold outline-none"
                                            />
                                        </div>
                                        <p className="text-[10px] italic text-muted-foreground px-2">Usa valores negativos para merma/robo y positivos para ingresos no esperados.</p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Razón del Ajuste</label>
                                        <select
                                            value={reason}
                                            onChange={(e) => setReason(e.target.value)}
                                            className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/20 rounded-2xl p-4 text-sm font-bold outline-none appearance-none"
                                        >
                                            <option value="">-- Seleccionar Razón --</option>
                                            {reasons.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
                                        </select>
                                    </div>

                                    <button
                                        onClick={handleSaveAdjustment}
                                        disabled={processing}
                                        className="w-full py-5 bg-primary text-white rounded-[2rem] font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
                                    >
                                        {processing ? <Loader2 className="h-6 w-6 animate-spin" /> : <><Save className="h-5 w-5" /> Aplicar Ajuste</>}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Información de Ayuda (Derecha) */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-violet-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute -top-10 -right-10 opacity-10">
                                <Box className="h-40 w-40" />
                            </div>
                            <h2 className="text-xl font-black uppercase tracking-tighter mb-4 relative z-10">Auditoría de Stock</h2>
                            <p className="text-violet-200 text-sm font-medium leading-relaxed relative z-10">
                                Todos los ajustes manuales quedan registrados con el ID del usuario que realizó la acción.
                                <br /><br />
                                <span className="text-white font-bold italic underline">Nota Importante:</span> Los ajustes afectan directamente al valor del inventario en los reportes de administración.
                            </p>
                        </div>

                        <div className="bg-white border rounded-[2.5rem] p-8 shadow-sm flex-1">
                            <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4 flex items-center gap-2">
                                <History className="h-4 w-4" /> Resumen de Impacto
                            </h2>
                            {selectedProduct ? (
                                <div className="space-y-4 animate-in slide-in-from-bottom-2">
                                    <div className="flex justify-between items-center py-2 border-b">
                                        <span className="text-xs font-bold text-slate-500 uppercase">Stock Actual</span>
                                        <span className="text-sm font-black">{selectedProduct.stock} {selectedProduct.unit}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b">
                                        <span className="text-xs font-bold text-slate-500 uppercase">Variación</span>
                                        <span className={`text-sm font-black ${parseFloat(quantity) < 0 ? 'text-red-500' : 'text-green-500'}`}>
                                            {quantity || 0} {selectedProduct.unit}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b">
                                        <span className="text-xs font-bold text-slate-500 uppercase">Stock Final</span>
                                        <span className="text-sm font-black text-primary">
                                            {(selectedProduct.stock + (parseFloat(quantity) || 0))} {selectedProduct.unit}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-center py-10 text-[10px] font-black uppercase text-slate-300 tracking-widest italic">Selecciona un producto para ver el impacto</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
