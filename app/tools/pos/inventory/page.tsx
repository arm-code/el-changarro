"use client";

import { useState, useEffect } from "react";
import NextLink from "next/link";
import {
    ArrowLeft,
    Plus,
    Edit2,
    Trash2,
    Package,
    Tag,
    BarChart3,
    Search,
    Loader2,
    X,
    FolderPlus,
    PackagePlus,
    AlertCircle,
    Sparkles
} from "lucide-react";
import { apiFetch } from "../../../../lib/api";
import { Product, Category, User } from "../types/pos";
import Toast, { ToastType } from "../../../../components/Toast";

export default function InventoryPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Partial<Product>>({});
    const [editingCategory, setEditingCategory] = useState<Partial<Category>>({});
    const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
    const [selectedProductForStock, setSelectedProductForStock] = useState<Product | null>(null);
    const [stockAmountToAdd, setStockAmountToAdd] = useState<number>(0);
    const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null);
    const [user, setUser] = useState<User | null>(null);

    const showToast = (message: string, type: ToastType = 'success') => {
        setToast({ message, type });
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [pData, cData] = await Promise.all([
                apiFetch<Product[]>("/inventory/products"),
                apiFetch<Category[]>("/inventory/categories")
            ]);
            setProducts(pData);
            setCategories(cData);
        } catch (error) {
            console.error("Error fetching inventory data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = editingProduct?.id ? 'PATCH' : 'POST';
            const endpoint = editingProduct?.id ? `/inventory/products/${editingProduct.id}` : '/inventory/products';

            // Clean payload to ensure correct types
            const payload = {
                name: (editingProduct.name || "").toUpperCase(),
                description: (editingProduct.description || "").toUpperCase(),
                barcode: (editingProduct.barcode || "").toUpperCase(),
                purchasePrice: Number(editingProduct.purchasePrice),
                sellPrice: Number(editingProduct.sellPrice),
                stock: Number(editingProduct.stock),
                minStock: Number(editingProduct.minStock || 0),
                unit: editingProduct.unit || 'UNIDAD',
                categoryId: editingProduct.categoryId
            };

            await apiFetch(endpoint, {
                method,
                body: JSON.stringify(payload)
            });

            setIsProductModalOpen(false);
            setEditingProduct({});
            fetchData();
            showToast(editingProduct.id ? "Producto actualizado" : "Producto creado correctamente");
        } catch (error: any) {
            showToast(error.message, 'error');
        }
    };

    const handleAddStock = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProductForStock) return;

        try {
            await apiFetch(`/inventory/products/${selectedProductForStock.id}/add-stock`, {
                method: 'PATCH',
                body: JSON.stringify({ amount: Number(stockAmountToAdd) })
            });

            setIsAddStockModalOpen(false);
            setSelectedProductForStock(null);
            setStockAmountToAdd(0);
            fetchData();
            showToast("Stock actualizado correctamente");
        } catch (error: any) {
            showToast(error.message, 'error');
        }
    };

    const handleSaveCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = editingCategory?.id ? 'PATCH' : 'POST';
            const endpoint = editingCategory?.id ? `/inventory/categories/${editingCategory.id}` : '/inventory/categories';

            const payload = {
                name: (editingCategory.name || "").toUpperCase(),
                description: (editingCategory.description || "").toUpperCase()
            };

            await apiFetch(endpoint, {
                method,
                body: JSON.stringify(payload)
            });

            setEditingCategory({});
            fetchData();
            showToast(editingCategory.id ? "Categoría actualizada" : "Categoría creada correctamente");
        } catch (error: any) {
            showToast(error.message, 'error');
        }
    };

    const handleDeleteCategory = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar esta categoría? Esto podría afectar a los productos asociados.")) return;
        try {
            await apiFetch(`/inventory/categories/${id}`, { method: 'DELETE' });
            fetchData();
            showToast("Categoría eliminada");
        } catch (error: any) {
            showToast(error.message, 'error');
        }
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <header className="px-4 lg:px-6 h-16 flex items-center border-b bg-card sticky top-0 z-50">
                <NextLink className="flex items-center justify-center text-sm font-medium" href="/tools/pos">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver al POS
                </NextLink>
                <div className="ml-auto flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    <span className="font-bold tracking-tighter uppercase shrink-0 mr-4">Gestión de Inventario</span>
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
                {/* Stats & Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white border rounded-3xl p-6 shadow-sm flex items-center gap-4">
                        <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                            <Package className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Total Productos</p>
                            <p className="text-2xl font-black tracking-tighter">{products.length}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => { setEditingProduct({ unit: 'UNIDAD', categoryId: categories[0]?.id || '' }); setIsProductModalOpen(true); }}
                        className="bg-primary text-primary-foreground rounded-3xl p-6 shadow-xl shadow-primary/20 flex items-center justify-center gap-3 active:scale-95 transition-all"
                    >
                        <Plus className="h-6 w-6" />
                        <span className="font-black uppercase tracking-widest text-sm">Nuevo Producto</span>
                    </button>

                    <button
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="bg-white border border-primary text-primary rounded-3xl p-6 shadow-sm flex items-center justify-center gap-3 hover:bg-primary/5 active:scale-95 transition-all outline-none"
                    >
                        <FolderPlus className="h-6 w-6" />
                        <span className="font-black uppercase tracking-widest text-sm">Categorías</span>
                    </button>

                    <NextLink
                        href="/tools/pos/inventory/adjustments"
                        className="bg-red-50 border border-red-200 text-red-600 rounded-3xl p-6 shadow-sm flex items-center justify-center gap-3 hover:bg-red-100 active:scale-95 transition-all outline-none"
                    >
                        <AlertCircle className="h-6 w-6" />
                        <span className="font-black uppercase tracking-widest text-sm">Ajustes Manuales</span>
                    </NextLink>
                </div>

                {/* Search & Table */}
                <div className="bg-white border rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-6 border-b flex flex-col md:flex-row gap-4 justify-between items-center">
                        <h2 className="font-black tracking-tighter uppercase text-xl">Lista de Existencias</h2>
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Filtrar..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-muted/30 border rounded-xl py-2 pl-10 pr-4 text-sm outline-none"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-muted/30 text-[10px] uppercase font-black tracking-widest text-muted-foreground">
                                <tr>
                                    <th className="px-6 py-4">Producto</th>
                                    <th className="px-6 py-4">Coste</th>
                                    <th className="px-6 py-4">Venta</th>
                                    <th className="px-6 py-4">Stock</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="py-20 text-center">
                                            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                                            <p className="text-sm font-bold opacity-50 uppercase">Cargando catálogo...</p>
                                        </td>
                                    </tr>
                                ) : filteredProducts.map(p => (
                                    <tr key={p.id} className="hover:bg-muted/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <p className="font-black text-sm uppercase truncate max-w-[200px]">{p.name}</p>
                                            <p className="text-[10px] text-muted-foreground font-bold">{p.barcode}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium text-muted-foreground">${Number(p.purchasePrice).toFixed(2)}</td>
                                        <td className="px-6 py-4 text-sm font-black text-primary">${Number(p.sellPrice).toFixed(2)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${p.stock > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {p.stock} {p.unit.toLowerCase()}(s)
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => { setSelectedProductForStock(p); setIsAddStockModalOpen(true); }}
                                                    className="p-2 hover:bg-green-100 rounded-lg text-green-700 transition-colors"
                                                    title="Agregar Stock"
                                                >
                                                    <PackagePlus className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => { setEditingProduct(p); setIsProductModalOpen(true); }}
                                                    className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button className="p-2 hover:bg-destructive/10 rounded-lg text-destructive transition-colors" title="Eliminar">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Product Modal */}
            {isProductModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100] backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-8 my-8 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black uppercase tracking-tighter">{editingProduct?.id ? 'Editar Producto' : 'Nuevo Producto'}</h2>
                            <button onClick={() => { setIsProductModalOpen(false); setEditingProduct({}); }} className="p-2 hover:bg-muted rounded-full">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveProduct} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1 mb-1 block">Nombre del Producto <span className="text-red-500">*</span></label>
                                <input
                                    required
                                    type="text"
                                    value={editingProduct?.name || ''}
                                    onChange={e => setEditingProduct({ ...editingProduct, name: e.target.value.toUpperCase() })}
                                    className="w-full bg-muted/40 border-2 border-transparent focus:border-primary/30 rounded-2xl p-3 text-sm font-bold uppercase outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1 mb-1 block">Descripción (Opcional)</label>
                                <textarea
                                    value={editingProduct?.description || ''}
                                    onChange={e => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                    className="w-full bg-muted/40 border-2 border-transparent focus:border-primary/30 rounded-2xl p-3 text-sm font-bold outline-none h-20 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1 mb-1 block">Categoría <span className="text-red-500">*</span></label>
                                    <select
                                        required
                                        value={editingProduct?.categoryId || ''}
                                        onChange={e => setEditingProduct({ ...editingProduct, categoryId: e.target.value })}
                                        className="w-full bg-muted/40 border-2 border-transparent focus:border-primary/30 rounded-2xl p-3 text-sm font-bold outline-none"
                                    >
                                        <option value="" disabled>Seleccionar...</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1 mb-1 block">Unidad de Medida</label>
                                    <select
                                        value={editingProduct?.unit || 'UNIDAD'}
                                        onChange={e => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                                        className="w-full bg-muted/40 border-2 border-transparent focus:border-primary/30 rounded-2xl p-3 text-sm font-bold outline-none"
                                    >
                                        <option value="UNIDAD">POR UNIDAD / PIEZA</option>
                                        <option value="PESO">POR PESO / GRANEL</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1 mb-1 block">Código de Barras <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        type="text"
                                        value={editingProduct?.barcode || ''}
                                        onChange={e => setEditingProduct({ ...editingProduct, barcode: e.target.value })}
                                        className="w-full bg-muted/40 border-2 border-transparent focus:border-primary/30 rounded-2xl p-3 text-sm font-bold outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1 mb-1 block">Stock Mínimo <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        type="number"
                                        value={editingProduct?.minStock ?? ''}
                                        placeholder="0"
                                        onChange={e => setEditingProduct({ ...editingProduct, minStock: parseFloat(e.target.value) })}
                                        className="w-full bg-muted/40 border-2 border-transparent focus:border-primary/30 rounded-2xl p-3 text-sm font-bold outline-none"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1 mb-1 block">P. Compra <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        type="number" step="0.01"
                                        value={editingProduct?.purchasePrice ?? ''}
                                        placeholder="0.00"
                                        onChange={e => setEditingProduct({ ...editingProduct, purchasePrice: parseFloat(e.target.value) })}
                                        className="w-full bg-muted/40 border-2 border-transparent focus:border-primary/30 rounded-2xl p-3 text-sm font-bold outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1 mb-1 block">P. Venta <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        type="number" step="0.01"
                                        value={editingProduct?.sellPrice ?? ''}
                                        placeholder="0.00"
                                        onChange={e => setEditingProduct({ ...editingProduct, sellPrice: parseFloat(e.target.value) })}
                                        className="w-full bg-muted/40 border-2 border-transparent focus:border-primary/30 rounded-2xl p-3 text-sm font-bold outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1 mb-1 block">Stock Actual <span className="text-red-500">*</span></label>
                                    <input
                                        required
                                        type="number" step="0.1"
                                        value={editingProduct?.stock ?? ''}
                                        placeholder="0"
                                        onChange={e => setEditingProduct({ ...editingProduct, stock: parseFloat(e.target.value) })}
                                        className="w-full bg-muted/40 border-2 border-transparent focus:border-primary/30 rounded-2xl p-3 text-sm font-bold outline-none"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 mt-4 active:scale-95 transition-all"
                            >
                                {editingProduct.id ? 'Actualizar Producto' : 'Guardar Producto'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
            {/* Add Stock Modal */}
            {isAddStockModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[110] backdrop-blur-sm">
                    <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black uppercase tracking-tighter text-primary">Agregar Existencia</h2>
                            <button onClick={() => { setIsAddStockModalOpen(false); setSelectedProductForStock(null); }} className="p-2 hover:bg-muted rounded-full">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mb-6 p-4 bg-muted/30 rounded-2xl">
                            <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Producto</p>
                            <p className="font-black text-sm uppercase">{selectedProductForStock?.name}</p>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Stock Actual: {selectedProductForStock?.stock} {selectedProductForStock?.unit}</p>
                        </div>

                        <form onSubmit={handleAddStock} className="space-y-4">
                            <div>
                                <input
                                    required
                                    autoFocus
                                    type="number"
                                    step="0.01"
                                    value={stockAmountToAdd ?? ''}
                                    onChange={e => setStockAmountToAdd(parseFloat(e.target.value))}
                                    placeholder="0"
                                    className="w-full bg-muted/40 border-2 border-transparent focus:border-primary/30 rounded-2xl p-4 text-2xl font-black text-center outline-none"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-primary/20 mt-4 active:scale-95 transition-all"
                            >
                                Confirmar Ingreso
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {isCategoryModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-8 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-black uppercase tracking-tighter">Gestión de Categorías</h2>
                            <button onClick={() => { setIsCategoryModalOpen(false); setEditingCategory({}); }} className="p-2 hover:bg-muted rounded-full">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Form */}
                            <div>
                                <h3 className="text-xs font-black uppercase text-primary mb-4 tracking-widest">Nueva / Editar</h3>
                                <form onSubmit={handleSaveCategory} className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1 mb-1 block">Nombre <span className="text-red-500">*</span></label>
                                        <input
                                            required
                                            type="text"
                                            value={editingCategory?.name || ''}
                                            onChange={e => setEditingCategory({ ...editingCategory, name: e.target.value.toUpperCase() })}
                                            className="w-full bg-muted/40 border-2 border-transparent focus:border-primary/30 rounded-2xl p-3 text-sm font-bold uppercase outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1 mb-1 block">Descripción</label>
                                        <textarea
                                            value={editingCategory?.description || ''}
                                            onChange={e => setEditingCategory({ ...editingCategory, description: e.target.value.toUpperCase() })}
                                            className="w-full bg-muted/40 border-2 border-transparent focus:border-primary/30 rounded-2xl p-3 text-sm font-bold uppercase outline-none h-24 resize-none"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full py-3 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 active:scale-95 transition-all"
                                    >
                                        {editingCategory?.id ? 'Actualizar' : 'Crear Categoría'}
                                    </button>
                                    {editingCategory?.id && (
                                        <button
                                            type="button"
                                            onClick={() => setEditingCategory({})}
                                            className="w-full py-3 border border-muted-foreground/20 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-muted transition-all"
                                        >
                                            Cancelar Edición
                                        </button>
                                    )}
                                </form>
                            </div>

                            {/* List */}
                            <div className="border-l pl-8 overflow-y-auto max-h-[400px]">
                                <h3 className="text-xs font-black uppercase text-primary mb-4 tracking-widest">Categorías Existentes</h3>
                                <div className="space-y-2">
                                    {categories.map(c => (
                                        <div key={c.id} className="flex items-center justify-between p-3 bg-muted/20 rounded-2xl group hover:bg-muted/40 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                                                    <Tag className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black uppercase leading-none">{c.name}</p>
                                                    <p className="text-[10px] text-muted-foreground font-bold mt-1 line-clamp-1">{c.description}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => setEditingCategory(c)} className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors">
                                                    <Edit2 className="h-4 w-4" />
                                                </button>
                                                <button onClick={() => handleDeleteCategory(c.id)} className="p-2 hover:bg-destructive/10 rounded-lg text-destructive transition-colors">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
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
