"use client";

import { useState, useEffect } from "react";
import NextLink from "next/link";
import {
    ArrowLeft,
    Banknote,
    Clock,
    Plus,
    Loader2,
    TrendingUp,
    TrendingDown,
    Save,
    X,
    CheckCircle2,
    Calendar,
    History,
    Sparkles
} from "lucide-react";
import { apiFetch } from "../../../../lib/api";
import { Shift, Expense, User } from "../types/pos";
import Toast, { ToastType } from "../../../../components/Toast";

export default function FinancePage() {
    const [activeShift, setActiveShift] = useState<Shift | null>(null);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);

    // New Expense State
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [newExpense, setNewExpense] = useState({
        description: "",
        amount: "",
        category: "Otros"
    });

    // Close Shift State
    const [showCloseModal, setShowCloseModal] = useState(false);
    const [realBalance, setRealBalance] = useState("");

    const categories = ["Luz", "Renta", "Proveedor", "Retiro Personal", "Otros"];

    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        fetchData();
    }, []);

    const showToast = (message: string, type: ToastType = 'success') => {
        setToast({ message, type });
    };

    const fetchData = async () => {
        try {
            setLoading(true);
            const shift = await apiFetch<Shift>("/finance/shift/active");
            setActiveShift(shift);

            if (shift) {
                const expensesData = await apiFetch<Expense[]>(`/finance/expenses?shiftId=${shift.id}`);
                setExpenses(expensesData);
            }
        } catch (error) {
            console.error("Error fetching finance data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateExpense = async () => {
        if (!newExpense.description || !newExpense.amount) {
            showToast("Completa todos los campos", "info");
            return;
        }

        try {
            setProcessing(true);
            await apiFetch("/finance/expenses", {
                method: 'POST',
                body: JSON.stringify({
                    ...newExpense,
                    amount: parseFloat(newExpense.amount)
                })
            });
            showToast("Gasto registrado");
            setShowExpenseModal(false);
            setNewExpense({ description: "", amount: "", category: "Otros" });
            fetchData();
        } catch (error: any) {
            showToast(error.message || "Error al registrar gasto", "error");
        } finally {
            setProcessing(false);
        }
    };

    const handleCloseShift = async () => {
        if (!realBalance) {
            showToast("Ingresa el saldo real en caja", "info");
            return;
        }

        try {
            setProcessing(true);
            const closedShift = await apiFetch<Shift>("/finance/shift/close", {
                method: 'POST',
                body: JSON.stringify({ realBalance: parseFloat(realBalance) || 0 })
            });
            setActiveShift(null);
            setExpenses([]);
            setShowCloseModal(false);
            showToast(`Turno cerrado. Descuadre: $${(Number(closedShift.realBalance || 0) - Number(closedShift.expectedBalance || 0)).toFixed(2)}`);
        } catch (error: any) {
            showToast(error.message || "Error al cerrar turno", "error");
        } finally {
            setProcessing(false);
        }
    };

    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-card sticky top-0 z-50">
                <NextLink className="flex items-center justify-center text-sm font-medium" href="/tools/pos">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver al POS
                </NextLink>
                <div className="ml-auto flex items-center gap-2 text-primary">
                    <Banknote className="h-5 w-5" />
                    <span className="font-bold tracking-tighter uppercase mr-4">Gestión de Finanzas</span>
                    {(typeof user?.role === 'object' ? user.role.name : user?.role) === 'GUEST' && (
                        <NextLink
                            href="/register"
                            className="bg-primary text-white text-[10px] font-black px-4 py-2 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20 animate-bounce"
                        >
                            <Sparkles className="h-3 w-3" />
                            REGÍSTRATE GRATIS
                        </NextLink>
                    )}
                </div>
            </header>

            <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-6 rounded-3xl border shadow-sm">
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter uppercase text-primary">Caja y Gastos</h1>
                        <p className="text-sm text-muted-foreground uppercase font-bold tracking-widest text-[10px]">Control operativo del turno actual</p>
                    </div>
                    {activeShift ? (
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowExpenseModal(true)}
                                className="px-4 py-2 bg-violet-100 text-primary rounded-xl font-bold text-xs uppercase hover:bg-violet-200 transition-all flex items-center gap-2"
                            >
                                <Plus className="h-4 w-4" /> Registrar Gasto
                            </button>
                            <button
                                onClick={() => setShowCloseModal(true)}
                                className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold text-xs uppercase hover:bg-red-700 transition-all shadow-lg shadow-red-200"
                            >
                                Cerrar Turno
                            </button>
                        </div>
                    ) : (
                        <NextLink
                            href="/tools/pos"
                            className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-xs uppercase shadow-xl shadow-primary/20"
                        >
                            Abrir Turno en POS
                        </NextLink>
                    )}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                        <p className="text-sm font-black uppercase tracking-widest opacity-50">Cargando datos...</p>
                    </div>
                ) : !activeShift ? (
                    <div className="bg-white border rounded-[2.5rem] p-20 text-center shadow-sm">
                        <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-20" />
                        <h2 className="text-xl font-black uppercase tracking-tighter mb-2">No hay un turno activo</h2>
                        <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-8 font-medium">Debes abrir un turno desde la pantalla principal del POS para comenzar a registrar operaciones.</p>
                        <NextLink href="/tools/pos" className="bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs">Ir al POS</NextLink>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in duration-500">
                        <div className="bg-white border rounded-2xl p-4 flex justify-between items-center mb-2">
                            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Iniciado: {new Date(activeShift.startTime || activeShift.openedAt || "").toLocaleString()}</span>
                        </div>
                        {/* Stats Summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white border rounded-[2rem] p-6 shadow-sm">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-2">
                                    <TrendingUp className="h-3 w-3 text-green-500" /> Fondo Inicial
                                </p>
                                <p className="text-3xl font-black text-slate-800 tracking-tighter">${Number(activeShift.initialBalance).toFixed(2)}</p>
                            </div>
                            <div className="bg-white border rounded-[2rem] p-6 shadow-sm">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-2">
                                    <TrendingDown className="h-3 w-3 text-red-500" /> Gastos del Turno
                                </p>
                                <p className="text-3xl font-black text-red-600 tracking-tighter">-${totalExpenses.toFixed(2)}</p>
                            </div>
                            <div className="bg-primary text-primary-foreground rounded-[2rem] p-6 shadow-xl shadow-primary/20">
                                <p className="text-[10px] font-black text-primary-foreground/70 uppercase tracking-widest mb-1">Efectivo Esperado</p>
                                <p className="text-3xl font-black tracking-tighter">${(Number(activeShift.initialBalance) - totalExpenses).toFixed(2)} + Ventas</p>
                            </div>
                        </div>

                        {/* Expenses Table */}
                        <div className="bg-white border rounded-[2.5rem] p-8 shadow-sm">
                            <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-6 flex items-center justify-between">
                                <span className="flex items-center gap-2"><History className="h-4 w-4" /> Gastos Registrados</span>
                                <span className="text-[10px] bg-muted px-2 py-1 rounded-full">{expenses.length} MOVIMIENTOS</span>
                            </h2>
                            {expenses.length === 0 ? (
                                <div className="text-center py-10 opacity-30">
                                    <TrendingDown className="h-10 w-10 mx-auto mb-2" />
                                    <p className="text-sm font-black uppercase tracking-widest">Sin gastos registrados</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {expenses.map((expense) => (
                                        <div key={expense.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-transparent">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-red-500 shadow-sm border">
                                                    <TrendingDown className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black uppercase leading-none">{expense.description}</p>
                                                    <p className="text-[10px] text-muted-foreground font-bold mt-1 uppercase">
                                                        {(typeof expense.category === 'object' ? expense.category?.name : expense.category) || 'Sin categoría'} • {new Date((expense as any).createdAt || expense.date || new Date()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <p className="text-lg font-black text-red-600 tracking-tighter">-${Number(expense.amount).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Modal de Gastos */}
            {showExpenseModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
                    <div className="bg-background w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black tracking-tighter uppercase text-primary">Registrar Gasto</h2>
                            <button onClick={() => setShowExpenseModal(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Descripción <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    value={newExpense.description}
                                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                                    placeholder="Ej. Pago de Luz"
                                    required
                                    className="w-full bg-muted/40 border-2 border-transparent focus:border-primary/20 rounded-2xl p-4 text-sm font-bold outline-none uppercase"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Monto ($) <span className="text-red-500">*</span></label>
                                    <input
                                        type="number"
                                        value={newExpense.amount ?? ''}
                                        placeholder="0.00"
                                        onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                        required
                                        className="w-full bg-muted/40 border-2 border-transparent focus:border-primary/20 rounded-2xl p-4 text-sm font-bold outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Categoría</label>
                                    <select
                                        value={newExpense.category}
                                        onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                                        className="w-full bg-muted/40 border-2 border-transparent focus:border-primary/20 rounded-2xl p-4 text-sm font-bold outline-none appearance-none"
                                    >
                                        {categories.map(cat => <option key={cat} value={cat}>{cat.toUpperCase()}</option>)}
                                    </select>
                                </div>
                            </div>
                            <button
                                onClick={handleCreateExpense}
                                disabled={processing}
                                className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2"
                            >
                                {processing ? <Loader2 className="h-5 w-5 animate-spin" /> : "Guardar Gasto"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Cierre de Turno */}
            {showCloseModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
                    <div className="bg-background w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in duration-300 border-t-8 border-red-500">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black tracking-tighter uppercase text-red-600 underline">Cerrar Turno</h2>
                            <button onClick={() => setShowCloseModal(false)} className="p-2 hover:bg-muted rounded-full transition-colors font-bold">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="space-y-6">
                            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 italic">
                                <p className="text-xs text-amber-800 font-medium">Contabiliza el efectivo físico en caja y regístralo a continuación para calcular descuadres.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Saldo Real en Caja (Efectivo)</label>
                                <input
                                    type="number"
                                    value={realBalance}
                                    onChange={(e) => setRealBalance(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full bg-muted/40 border-2 border-transparent focus:border-red-500/20 rounded-3xl p-6 text-center text-4xl font-black outline-none transition-all"
                                />
                            </div>
                            <button
                                onClick={handleCloseShift}
                                disabled={processing}
                                className="w-full py-5 bg-red-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-lg shadow-2xl shadow-red-200 transition-all flex items-center justify-center gap-2"
                            >
                                {processing ? <Loader2 className="h-6 w-6 animate-spin" /> : "Confirmar Cierre"}
                            </button>
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
