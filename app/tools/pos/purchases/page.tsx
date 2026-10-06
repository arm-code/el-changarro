"use client";

import { useState, useEffect } from "react";
import NextLink from "next/link";
import {
    ArrowLeft,
    Truck,
    Plus,
    Loader2,
    Search,
    Package,
    ShoppingCart,
    Trash2,
    Save,
    X,
    UserPlus,
    History,
    CheckCircle2,
    Phone,
    Sparkles
} from "lucide-react";
import { apiFetch } from "../../../../lib/api";
import { Product, Supplier, CreatePurchaseDto, Purchase, User } from "../types/pos";
import Toast, { ToastType } from "../../../../components/Toast";

export default function PurchasesPage() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);
    const [user, setUser] = useState<User | null>(null);

    // Purchase Form State
    const [selectedSupplier, setSelectedSupplier] = useState<string>("");
    const [purchaseItems, setPurchaseItems] = useState<{ productId: string, quantity: string | number, costPrice: string | number, productName: string }[]>([]);
    const [productSearch, setProductSearch] = useState("");

    // UI State
    const [showSupplierModal, setShowSupplierModal] = useState(false);
    const [newSupplier, setNewSupplier] = useState({ name: "", phone: "" });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        fetchInitialData();
    }, []);

    const showToast = (message: string, type: ToastType = 'success') => {
        setToast({ message, type });
    };

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [sData, pData, purData] = await Promise.all([
                apiFetch<Supplier[]>("/purchases/suppliers"),
                apiFetch<Product[]>("/inventory/products"),
                apiFetch<Purchase[]>("/purchases")
            ]);
            setSuppliers(sData);
            setProducts(pData);
            setPurchases(purData);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSupplier = async () => {
        if (!newSupplier.name || !newSupplier.phone) {
            showToast("Completa los campos del proveedor", "info");
            return;
        }

        try {
            setProcessing(true);
            const saved = await apiFetch<Supplier>("/purchases/suppliers", {
                method: 'POST',
                body: JSON.stringify(newSupplier)
            });
            setSuppliers([...suppliers, saved]);
            setSelectedSupplier(saved.id);
            setShowSupplierModal(false);
            setNewSupplier({ name: "", phone: "" });
            showToast("Proveedor registrado");
        } catch (error: any) {
            showToast(error.message || "Error al registrar proveedor", "error");
        } finally {
            setProcessing(false);
        }
    };

    const addItemToPurchase = (product: Product) => {
        const existing = purchaseItems.find(item => item.productId === product.id);
        if (existing) {
            showToast("El producto ya está en la lista", "info");
            return;
        }
        setPurchaseItems([...purchaseItems, {
            productId: product.id,
            productName: product.name,
            quantity: 1,
            costPrice: product.purchasePrice || 0
        }]);
    };

    const updateItem = (index: number, field: string, value: string | number) => {
        const newItems = [...purchaseItems];
        newItems[index] = { ...newItems[index], [field]: value };
        setPurchaseItems(newItems);
    };

    const removeItem = (index: number) => {
        setPurchaseItems(purchaseItems.filter((_, i) => i !== index));
    };

    const handleSavePurchase = async () => {
        if (!selectedSupplier) {
            showToast("Selecciona un proveedor", "info");
            return;
        }
        if (purchaseItems.length === 0) {
            showToast("Agrega al menos un producto", "info");
            return;
        }

        try {
            setProcessing(true);

            // Validation
            for (let i = 0; i < purchaseItems.length; i++) {
                const item = purchaseItems[i];
                const qty = Number(item.quantity);
                const cost = Number(item.costPrice);

                if (isNaN(qty) || qty <= 0) {
                    throw new Error(`La cantidad para ${item.productName} debe ser mayor a 0`);
                }
                if (isNaN(cost) || cost <= 0) {
                    throw new Error(`El costo para ${item.productName} debe ser mayor a 0`);
                }
            }

            const purchaseData: CreatePurchaseDto = {
                supplierId: selectedSupplier,
                items: purchaseItems.map(item => ({
                    productId: item.productId,
                    quantity: Number(item.quantity),
                    costPrice: Number(item.costPrice)
                }))
            };

            await apiFetch("/purchases", {
                method: 'POST',
                body: JSON.stringify(purchaseData)
            });

            showToast("Compra registrada con éxito");
            setPurchaseItems([]);
            setSelectedSupplier("");
            fetchInitialData();
        } catch (error: any) {
            showToast(error.message || "Error al registrar compra", "error");
        } finally {
            setProcessing(false);
        }
    };

    const calculateTotal = () => {
        return purchaseItems.reduce((total, item) => total + (Number(item.quantity) * Number(item.costPrice)), 0);
    };

    const filteredProducts = products.filter(p =>
        p.name.toUpperCase().includes(productSearch.toUpperCase()) ||
        p.barcode.includes(productSearch)
    );

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-card sticky top-0 z-50">
                <NextLink className="flex items-center justify-center text-sm font-medium" href="/tools/pos">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver al POS
                </NextLink>
                <div className="ml-auto flex items-center gap-2 text-primary">
                    <Truck className="h-5 w-5" />
                    <span className="font-bold tracking-tighter uppercase mr-4">Compras y Proveedores</span>
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

            <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Nueva Compra (Izquierda) */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white border rounded-[2.5rem] p-8 shadow-sm">
                            <h2 className="text-xl font-black uppercase tracking-tighter text-primary mb-6 flex items-center gap-3">
                                <ShoppingCart className="h-6 w-6" /> Registrar Nueva Compra
                            </h2>

                            <div className="space-y-6">
                                {/* Supplier Select */}
                                <div className="flex gap-3">
                                    <div className="flex-1 space-y-2">
                                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Proveedor</label>
                                        <select
                                            value={selectedSupplier}
                                            onChange={(e) => setSelectedSupplier(e.target.value)}
                                            className="w-full bg-muted/40 border-2 border-transparent focus:border-primary/20 rounded-2xl p-4 text-sm font-bold outline-none appearance-none transition-all uppercase"
                                        >
                                            <option value="">-- SELECCIONAR PROVEEDOR --</option>
                                            {suppliers.map(s => <option key={s.id} value={s.id}>{s.name.toUpperCase()}</option>)}
                                        </select>
                                    </div>
                                    <button
                                        onClick={() => setShowSupplierModal(true)}
                                        className="mt-6 p-4 bg-violet-100 text-primary rounded-2xl hover:bg-violet-200 transition-all font-bold text-xs uppercase flex items-center gap-2"
                                        title="Nuevo Proveedor"
                                    >
                                        <UserPlus className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Product Search */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Buscar Producto para agregar</label>
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                        <input
                                            type="text"
                                            value={productSearch}
                                            onChange={(e) => setProductSearch(e.target.value)}
                                            placeholder="Nombre o Código de Barras..."
                                            className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/20 rounded-2xl p-4 pl-12 text-sm font-bold outline-none uppercase"
                                        />
                                        {productSearch && filteredProducts.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border rounded-2xl shadow-2xl z-[60] max-h-60 overflow-y-auto overflow-x-hidden p-2 space-y-1 animate-in slide-in-from-top-2 duration-200">
                                                {filteredProducts.map(p => (
                                                    <button
                                                        key={p.id}
                                                        onClick={() => {
                                                            addItemToPurchase(p);
                                                            setProductSearch("");
                                                        }}
                                                        className="w-full text-left p-3 hover:bg-violet-50 rounded-xl transition-all flex justify-between items-center group font-bold"
                                                    >
                                                        <div>
                                                            <p className="text-sm uppercase">{p.name}</p>
                                                            <p className="text-[10px] text-muted-foreground">{p.barcode} • <span className="text-violet-600 font-black">Stock: {p.stock}</span></p>
                                                        </div>
                                                        <Plus className="h-4 w-4 opacity-0 group-hover:opacity-100 text-primary transition-all" />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Items Table */}
                                <div className="space-y-3 pt-4 border-t">
                                    {purchaseItems.length === 0 ? (
                                        <div className="py-10 text-center text-muted-foreground opacity-30 italic">
                                            <Package className="h-10 w-10 mx-auto mb-2" />
                                            <p className="text-xs font-black uppercase tracking-widest">No hay productos en el reporte de compra</p>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="grid grid-cols-12 gap-4 px-4 text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                                                <div className="col-span-5">Producto</div>
                                                <div className="col-span-3 text-center">Cant.</div>
                                                <div className="col-span-3 text-center">Costo Unit.</div>
                                                <div className="col-span-1"></div>
                                            </div>
                                            {purchaseItems.map((item, idx) => (
                                                <div key={idx} className="grid grid-cols-12 gap-4 bg-muted/20 p-3 rounded-2xl items-center border border-transparent hover:border-violet-100 transition-all">
                                                    <div className="col-span-5">
                                                        <p className="text-xs font-black uppercase text-slate-800 truncate">{item.productName}</p>
                                                    </div>
                                                    <div className="col-span-3">
                                                        <input
                                                            type="number"
                                                            value={item.quantity ?? ''}
                                                            placeholder="0"
                                                            onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                                                            className="w-full bg-white border rounded-xl py-2 px-1 text-center text-xs font-bold outline-none"
                                                        />
                                                    </div>
                                                    <div className="col-span-3">
                                                        <input
                                                            type="number"
                                                            value={item.costPrice ?? ''}
                                                            placeholder="0.00"
                                                            onChange={(e) => updateItem(idx, 'costPrice', e.target.value)}
                                                            className="w-full bg-white border rounded-xl py-2 px-1 text-center text-xs font-bold outline-none"
                                                        />
                                                    </div>
                                                    <div className="col-span-1 text-right">
                                                        <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 transition-colors">
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}

                                            <div className="pt-6 mt-6 border-t flex items-center justify-between">
                                                <div>
                                                    <p className="text-[10px] font-black uppercase text-muted-foreground mb-1">Total de Compra</p>
                                                    <p className="text-4xl font-black text-primary tracking-tighter">${calculateTotal().toFixed(2)}</p>
                                                </div>
                                                <button
                                                    onClick={handleSavePurchase}
                                                    disabled={processing}
                                                    className="px-8 py-5 bg-primary text-white rounded-[2rem] font-black uppercase tracking-widest shadow-2xl shadow-primary/30 transition-all flex items-center gap-3 active:scale-[0.98]"
                                                >
                                                    {processing ? <Loader2 className="h-6 w-6 animate-spin" /> : <><Save className="h-6 w-6" /> Guardar Compra</>}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Historial (Derecha) */}
                    <div className="space-y-6">
                        <div className="bg-white border rounded-[2.5rem] p-8 shadow-sm h-full flex flex-col">
                            <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
                                <History className="h-4 w-4" /> Historial Reciente
                            </h2>
                            <div className="space-y-4 flex-1 overflow-y-auto max-h-[600px] scrollbar-hide pr-2">
                                {purchases.length === 0 ? (
                                    <p className="text-center py-10 opacity-30 italic text-xs font-bold uppercase">Sin historial</p>
                                ) : (
                                    purchases.map(p => (
                                        <div key={p.id} className="p-4 bg-muted/20 rounded-3xl border border-transparent hover:border-violet-100 transition-all">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="p-2 bg-white rounded-xl border shadow-sm">
                                                    <Truck className="h-4 w-4 text-primary" />
                                                </div>
                                                <span className="text-[9px] font-black bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                                    #{p.id.slice(0, 6).toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="text-xs font-black uppercase truncate text-slate-800">{p.supplier?.name}</p>
                                            <p className="text-[10px] text-muted-foreground font-bold mb-3">
                                                {new Date(p.createdAt).toLocaleDateString()} • {p.items.length} PRD
                                            </p>
                                            <p className="text-xl font-black text-primary tracking-tighter">${Number(p.totalAmount).toFixed(2)}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Modal Nuevo Proveedor */}
            {showSupplierModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
                    <div className="bg-background w-full max-w-md rounded-[2.5rem] shadow-2xl p-8 animate-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black tracking-tighter uppercase text-primary">Nuevo Proveedor</h2>
                            <button onClick={() => setShowSupplierModal(false)} className="p-2 hover:bg-muted rounded-full transition-colors">
                                <X className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Nombre del Proveedor <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    required
                                    value={newSupplier.name}
                                    onChange={(e) => setNewSupplier({ ...newSupplier, name: e.target.value.toUpperCase() })}
                                    placeholder="EJ. ABARROTES DON JUAN"
                                    className="w-full bg-muted/40 border-2 border-transparent focus:border-primary/20 rounded-2xl p-4 text-sm font-bold outline-none uppercase"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Teléfono <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <input
                                        type="tel"
                                        required
                                        value={newSupplier.phone}
                                        onChange={(e) => setNewSupplier({ ...newSupplier, phone: e.target.value })}
                                        placeholder="656XXXXXXX"
                                        className="w-full bg-muted/40 border-2 border-transparent focus:border-primary/20 rounded-2xl p-4 pl-12 text-sm font-bold outline-none"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleCreateSupplier}
                                disabled={processing}
                                className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2"
                            >
                                {processing ? <Loader2 className="h-5 w-5 animate-spin" /> : <><CheckCircle2 className="h-5 w-5" /> Registrar</>}
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
