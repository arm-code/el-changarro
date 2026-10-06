"use client";

import { useState, useEffect } from "react";
import NextLink from "next/link";
import {
    ArrowLeft,
    User,
    Search,
    Plus,
    Edit3,
    Wallet,
    Phone,
    Loader2,
    X,
    UserPlus,
    CheckCircle2,
    DollarSign
} from "lucide-react";
import { apiFetch } from "../../../../lib/api";
import { Customer } from "../types/pos";
import Toast, { ToastType } from "../../../../components/Toast";

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [search, setSearch] = useState("");
    const [editingCustomer, setEditingCustomer] = useState<Partial<Customer> | null>(null);
    const [isAbonoModalOpen, setIsAbonoModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [abonoAmount, setAbonoAmount] = useState("");
    const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);

    useEffect(() => {
        fetchCustomers();
    }, []);

    const showToast = (message: string, type: ToastType = 'success') => {
        setToast({ message, type });
    };

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const data = await apiFetch<Customer[]>("/customers");
            setCustomers(data);
        } catch (error) {
            console.error("Error fetching customers:", error);
            showToast("Error al cargar clientes", 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveCustomer = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setProcessing(true);
            const method = editingCustomer?.id ? 'PUT' : 'POST';
            const url = editingCustomer?.id ? `/customers/${editingCustomer.id}` : '/customers';

            await apiFetch(url, {
                method,
                body: JSON.stringify({
                    ...editingCustomer,
                    name: editingCustomer?.name?.toUpperCase().trim(),
                    phone: editingCustomer?.phone?.trim(),
                })
            });

            showToast(editingCustomer?.id ? "Cliente actualizado" : "Cliente creado");
            setEditingCustomer(null);
            fetchCustomers();
        } catch (error: any) {
            showToast(error.message || "Error al guardar cliente", 'error');
        } finally {
            setProcessing(false);
        }
    };

    const handleRegisterAbono = async () => {
        if (!selectedCustomer || !abonoAmount || Number(abonoAmount) <= 0) {
            showToast("Ingresa un monto válido", 'info');
            return;
        }

        try {
            setProcessing(true);
            await apiFetch(`/customers/${selectedCustomer.id}/payment`, {
                method: 'POST',
                body: JSON.stringify({ amount: Number(abonoAmount) })
            });

            showToast(`Abono de $${abonoAmount} registrado`);
            setIsAbonoModalOpen(false);
            setAbonoAmount("");
            fetchCustomers();
        } catch (error: any) {
            showToast(error.message || "Error al registrar abono", 'error');
        } finally {
            setProcessing(false);
        }
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search)
    );

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-card sticky top-0 z-50">
                <NextLink className="flex items-center justify-center text-sm font-medium" href="/tools/pos">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver al POS
                </NextLink>
                <div className="ml-auto flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    <span className="font-bold tracking-tighter uppercase">Directorio de Clientes</span>
                </div>
            </header>

            <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left: Search & List (8 cols) */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-[2rem] border shadow-sm">
                            <div className="w-full md:w-auto">
                                <h1 className="text-2xl font-black tracking-tighter uppercase text-primary">Clientes Registrados</h1>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest leading-none">Gestión de créditos y saldos</p>
                            </div>
                            <div className="relative w-full md:w-80">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre o teléfono..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value.toUpperCase())}
                                    className="w-full bg-muted/50 border-none rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none uppercase ring-1 ring-black/5 focus:ring-primary/20"
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white/50 rounded-[2rem] border border-dashed">
                                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                                <p className="text-sm font-black uppercase tracking-widest opacity-50">Cargando directorio...</p>
                            </div>
                        ) : filteredCustomers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2rem] border border-dashed opacity-50">
                                <User className="h-16 w-16 mb-4" />
                                <p className="text-xl font-black uppercase tracking-tighter">Sin resultados</p>
                                <p className="text-sm">No se encontraron clientes que coincidan</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredCustomers.map((c) => (
                                    <div key={c.id} className="bg-white border rounded-[2rem] p-6 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group flex flex-col justify-between">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                                                    <User className="h-6 w-6" />
                                                </div>
                                                <div>
                                                    <p className="text-base font-black uppercase leading-tight">{c.name}</p>
                                                    <p className="text-xs font-bold text-muted-foreground flex items-center gap-1 mt-1">
                                                        <Phone className="h-3 w-3" /> {c.phone}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="bg-primary/5 px-2 py-1 rounded-lg">
                                                <p className="text-[9px] font-black text-primary uppercase text-center">Deuda</p>
                                                <p className={`text-sm font-black text-center ${Number(c.balance) > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                                    ${Number(c.balance).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 border-t pt-4 mt-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedCustomer(c);
                                                    setIsAbonoModalOpen(true);
                                                }}
                                                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-50 text-green-700 rounded-xl font-black uppercase text-[10px] hover:bg-green-100 transition-colors"
                                            >
                                                <Wallet className="h-4 w-4" /> Registrar Abono
                                            </button>
                                            <button
                                                onClick={() => setEditingCustomer(c)}
                                                className="flex items-center justify-center gap-2 p-2.5 bg-blue-50 text-blue-700 rounded-xl font-black uppercase text-[10px] hover:bg-blue-100 transition-colors px-4"
                                            >
                                                <Edit3 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Add/Edit Form (4 cols) */}
                    <div className="lg:col-span-4 sticky top-24">
                        <div className="bg-white p-8 rounded-[2.5rem] border shadow-sm">
                            <h2 className="text-xl font-black tracking-tighter uppercase text-primary mb-6 flex items-center gap-3">
                                {editingCustomer?.id ? <Edit3 className="h-6 w-6" /> : <UserPlus className="h-6 w-6" />}
                                {editingCustomer?.id ? 'Editar Cliente' : 'Nuevo Cliente'}
                            </h2>
                            <form onSubmit={handleSaveCustomer} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground px-1 tracking-widest">Nombre Completo <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="EJ: ALEXIS ROMERO"
                                        value={editingCustomer?.name || ""}
                                        onChange={(e) => setEditingCustomer({ ...editingCustomer, name: e.target.value.toUpperCase() })}
                                        className="w-full bg-muted/40 border-2 border-transparent focus:border-primary/20 rounded-2xl p-4 text-sm font-bold outline-none uppercase transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground px-1 tracking-widest">Teléfono de Contacto <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <input
                                            type="tel"
                                            placeholder="656XXXXXXX"
                                            value={editingCustomer?.phone || ""}
                                            onChange={(e) => setEditingCustomer({ ...editingCustomer, phone: e.target.value })}
                                            required
                                            className="w-full bg-muted/40 border-2 border-transparent focus:border-primary/20 rounded-2xl p-4 pl-12 text-sm font-bold outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        {processing ? <Loader2 className="h-5 w-5 animate-spin" /> : editingCustomer?.id ? 'Actualizar Cliente' : 'Guardar en Directorio'}
                                    </button>
                                    {editingCustomer?.id && (
                                        <button
                                            type="button"
                                            onClick={() => setEditingCustomer(null)}
                                            className="w-full py-3 mt-2 text-muted-foreground font-black text-xs uppercase hover:text-foreground transition-colors"
                                        >
                                            Cancelar Edición
                                        </button>
                                    )}
                                </div>
                            </form>
                        </div>

                        {!editingCustomer?.id && (
                            <div className="mt-8 bg-violet-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-125 transition-transform duration-500">
                                    <DollarSign className="h-32 w-32" />
                                </div>
                                <h3 className="text-lg font-black uppercase tracking-tighter mb-2">Control de Créditos</h3>
                                <p className="text-violet-200 text-xs leading-relaxed font-medium">
                                    Registra abonos a la deuda de tus clientes para mantener las cuentas claras y el flujo de caja activo.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Abono Modal (Remains as modal as it's a quick sub-action) */}
            {isAbonoModalOpen && selectedCustomer && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
                    <div className="bg-background w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in duration-300">
                        <div className="text-center">
                            <div className="h-20 w-20 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Wallet className="h-10 w-10" />
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-tighter text-primary">Registrar Abono</h2>
                            <p className="text-xs font-bold text-muted-foreground uppercase opacity-70 mb-8">{selectedCustomer.name}</p>

                            <div className="bg-muted/30 p-6 rounded-3xl border mb-8">
                                <p className="text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">Saldo Deudor Actual</p>
                                <p className="text-3xl font-black text-primary tracking-tighter">${Number(selectedCustomer.balance).toFixed(2)}</p>
                            </div>

                            <div className="space-y-4 text-left">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground px-1 tracking-widest">Monto del Abono ($) <span className="text-red-500">*</span></label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={abonoAmount}
                                        onChange={(e) => setAbonoAmount(e.target.value)}
                                        required
                                        placeholder="0.00"
                                        className="w-full bg-background border-none rounded-2xl py-4 px-4 text-2xl font-black text-primary text-center outline-none ring-2 ring-primary/10 focus:ring-primary/40 transition-all shadow-inner"
                                        autoFocus
                                    />
                                    <span></span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setIsAbonoModalOpen(false)}
                                        className="py-4 bg-muted text-muted-foreground rounded-2xl font-black uppercase text-xs hover:bg-muted/80 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleRegisterAbono}
                                        disabled={processing || !abonoAmount}
                                        className="py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase text-xs shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center justify-center gap-2"
                                    >
                                        {processing ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Confirmar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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
