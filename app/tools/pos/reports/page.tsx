"use client";

import { useState, useEffect } from "react";
import NextLink from "next/link";
import {
    ArrowLeft,
    BarChart3,
    Banknote,
    TrendingUp,
    TrendingDown,
    Calendar,
    Loader2,
    DollarSign,
    History,
    CheckCircle2,
    X,
    Eye,
    AlertTriangle,
    ArrowRight,
    Sparkles
} from "lucide-react";
import { apiFetch } from "../../../../lib/api";
import { CashClosingReport, NetProfitReport, SaleHistoryItem, Shift, User, ShiftExpensesReport, Expense } from "../types/pos";
import Toast, { ToastType } from "../../../../components/Toast";

export default function ReportsPage() {
    const [user, setUser] = useState<User | null>(null);
    const [netProfit, setNetProfit] = useState<NetProfitReport | null>(null);
    const [shiftExpenses, setShiftExpenses] = useState<ShiftExpensesReport | null>(null);
    const [salesHistory, setSalesHistory] = useState<SaleHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedShiftId, setSelectedShiftId] = useState("");
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);

    useEffect(() => {
        // Load user from localStorage to check roles
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        fetchBasicData();
    }, []);

    useEffect(() => {
        const role = typeof user?.role === 'object' ? user.role.name : user?.role;
        if (role === 'ADMIN') {
            fetchAdminReports();
        }
    }, [user, selectedDate, selectedShiftId]);

    const showToast = (message: string, type: ToastType = 'success') => {
        setToast({ message, type });
    };

    const fetchBasicData = async () => {
        try {
            setLoading(true);
            const [sales, shiftsData] = await Promise.all([
                apiFetch<SaleHistoryItem[]>("/sales/history?limit=10"),
                apiFetch<Shift[]>("/finance/shifts?limit=5")
            ]);
            setSalesHistory(sales);
            setShifts(shiftsData);
            if (shiftsData.length > 0 && !selectedShiftId) {
                setSelectedShiftId(shiftsData[0].id);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAdminReports = async () => {
        try {
            const [profitData] = await Promise.all([
                apiFetch<NetProfitReport>(`/reports/net-profit?date=${selectedDate}`)
            ]);
            setNetProfit(profitData);

            if (selectedShiftId) {
                const expenseData = await apiFetch<ShiftExpensesReport>(`/reports/shift-expenses?shiftId=${selectedShiftId}`);
                setShiftExpenses(expenseData);
            }
        } catch (error) {
            console.error("Admin report error:", error);
        }
    };

    const isAdmin = user?.role === 'ADMIN';

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-card sticky top-0 z-50">
                <NextLink className="flex items-center justify-center text-sm font-medium" href="/tools/pos">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver al POS
                </NextLink>
                <div className="ml-auto flex items-center gap-2 text-primary">
                    <BarChart3 className="h-5 w-5" />
                    <span className="font-bold tracking-tighter uppercase mr-4">Reportes e Inteligencia</span>
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

            <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter uppercase text-primary">Análisis de Negocio</h1>
                        <p className="text-sm text-muted-foreground uppercase font-bold tracking-widest text-[11px] opacity-70">Monitoreo de rendimiento y finanzas</p>
                    </div>

                    {isAdmin ? (
                        <div className="flex gap-4">
                            <div className="bg-white border rounded-2xl p-2 px-4 flex items-center gap-3">
                                <Calendar className="h-4 w-4 text-primary" />
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="text-xs font-black uppercase outline-none"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-3">
                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                            <p className="text-xs font-bold text-amber-800 uppercase italic">Se requiere rol de ADMINISTRADOR para ver informes financieros detallados.</p>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Admin Dashboard */}
                    <div className="lg:col-span-2 space-y-8">
                        {isAdmin ? (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                {/* Profit Summary Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white border rounded-[2.5rem] p-8 shadow-sm">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Ventas Brutas</p>
                                        <p className="text-4xl font-black text-slate-800 tracking-tighter">${netProfit?.revenue.toFixed(2) || "0.00"}</p>
                                    </div>
                                    <div className="bg-white border rounded-[2.5rem] p-8 shadow-sm">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Costo de Inversión</p>
                                        <p className="text-4xl font-black text-red-500 tracking-tighter">-${netProfit?.cost.toFixed(2) || "0.00"}</p>
                                    </div>
                                    <div className="bg-primary text-white rounded-[2.5rem] p-8 shadow-2xl shadow-primary/20">
                                        <p className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">Utilidad Neta</p>
                                        <p className="text-4xl font-black tracking-tighter">${netProfit?.netProfit.toFixed(2) || "0.00"}</p>
                                    </div>
                                </div>

                                {/* Shift Details Section */}
                                <div className="bg-white border rounded-[3rem] p-8 shadow-sm">
                                    <div className="flex justify-between items-center mb-8">
                                        <h2 className="text-lg font-black uppercase tracking-tighter text-primary flex items-center gap-2">
                                            <Banknote className="h-5 w-5" /> Desglose por Turno
                                        </h2>
                                        <select
                                            value={selectedShiftId}
                                            onChange={(e) => setSelectedShiftId(e.target.value)}
                                            className="bg-muted/50 border-none rounded-xl p-3 text-xs font-black uppercase outline-none"
                                        >
                                            <option value="">Seleccionar Turno</option>
                                            {shifts.map(s => (
                                                <option key={s.id} value={s.id}>
                                                    Turno {new Date(s.startTime || s.openedAt || "").toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({s.id.slice(0, 5).toUpperCase()})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {shiftExpenses ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest border-b pb-2">Gastos Operativos</p>
                                                <div className="space-y-3">
                                                    {shiftExpenses.expenses?.length === 0 ? (
                                                        <p className="text-xs italic text-center py-6 opacity-30">Sin gastos</p>
                                                    ) : shiftExpenses.expenses?.map((e: Expense) => (
                                                        <div key={e.id} className="flex justify-between items-center text-sm font-bold">
                                                            <span className="text-slate-500 uppercase">{e.description}</span>
                                                            <span className="text-red-500">-${Number(e.amount).toFixed(2)}</span>
                                                        </div>
                                                    ))}
                                                    <div className="pt-4 border-t flex justify-between items-center font-black">
                                                        <span className="text-xs uppercase">Total Gastos</span>
                                                        <span className="text-lg tracking-tighter text-red-600">-${Number(shiftExpenses.totalAmount).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-6 bg-slate-50 rounded-3xl border">
                                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">Balance de Turno</p>
                                                <div className="space-y-4">
                                                    <div className="flex justify-between">
                                                        <span className="text-xs font-bold uppercase">Base Caja:</span>
                                                        <span className="text-sm font-black">${Number(shiftExpenses.shift?.initialBalance || 0).toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-xs font-bold uppercase">Esperado:</span>
                                                        <span className="text-sm font-black text-primary">${Number(shiftExpenses.shift?.expectedBalance || 0).toFixed(2)}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-xs font-bold uppercase">Real Registrado:</span>
                                                        <span className="text-sm font-black">${Number(shiftExpenses.shift?.realBalance || 0).toFixed(2)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 opacity-20 italic font-black uppercase tracking-widest">
                                            Selecciona un turno para auditar los gastos
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white border rounded-[3rem] p-20 text-center shadow-sm">
                                <AlertTriangle className="h-20 w-20 text-amber-200 mx-auto mb-6" />
                                <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">Contenido Restringido</h2>
                                <p className="text-muted-foreground text-sm max-w-sm mx-auto font-medium">Los reportes de utilidad, costos y auditoría de turnos solo están disponibles para perfiles con rango de administración.</p>
                            </div>
                        )}
                    </div>

                    {/* Sales History Sidebar */}
                    <div className="space-y-8">
                        <div className="bg-white border rounded-[3rem] p-8 shadow-sm flex flex-col min-h-[500px]">
                            <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-6 flex items-center justify-between">
                                <span className="flex items-center gap-2"><History className="h-4 w-4" /> Últimas Ventas</span>
                                <span className="bg-muted px-2 py-0.5 rounded-full text-[9px]">{salesHistory.length}</span>
                            </h2>
                            <div className="space-y-4 flex-1 overflow-y-auto pr-2 scrollbar-hide">
                                {salesHistory.map(sale => (
                                    <div key={sale.id} className="p-4 bg-muted/20 rounded-3xl border border-transparent hover:border-violet-100 transition-all group">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[10px] font-black uppercase text-slate-400">#{sale.id.slice(-6)}</span>
                                            <span className="text-[10px] font-bold text-muted-foreground">{new Date(sale.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-xs font-black uppercase">{sale.customer?.name || "VENTA PÚBLICO"}</p>
                                                <p className="text-[9px] text-muted-foreground font-bold mt-1 uppercase">{sale.paymentMethod.name}</p>
                                            </div>
                                            <p className="text-lg font-black text-primary tracking-tighter">${Number(sale.total).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <NextLink href="/tools/pos" className="mt-6 flex items-center justify-center gap-2 text-primary font-black uppercase text-[10px] group">
                                Nueva Venta <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                            </NextLink>
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
