export interface Category {
    id: string;
    name: string;
    description?: string;
}

export interface Product {
    id: string;
    name: string;
    description?: string;
    barcode: string;
    purchasePrice: number;
    sellPrice: number;
    stock: number;
    minStock?: number;
    unit: string;
    categoryId: string;
    category?: Category;
}

export interface Customer {
    id: string;
    name: string;
    phone: string;
    balance: number;
}

export interface SaleItem {
    productId: string;
    quantity: number;
}

export interface PaymentMethod {
    id: string;
    key: 'CASH' | 'CARD' | 'CREDIT' | string;
    name: string;
}

export interface CreateSaleDto {
    paymentMethodId: string;
    customerId?: string; // Requerido si el método es Crédito
    items: SaleItem[];
}

export interface SaleDetail extends CreateSaleDto {
    id: string;
    total: number;
    createdAt: string;
}

export interface CashClosingReport {
    date: string;
    totalSales: number;
    totalIncome: number;
    details: {
        [key: string]: number;
    };
}

export interface NetProfitReport {
    date?: string;
    revenue: number;
    cost: number;
    netProfit: number;
}

export interface SaleHistoryItem {
    id: string;
    createdAt: string;
    total: number | string;
    paymentMethod: PaymentMethod;
    customer?: Customer | null;
    items: {
        id: string;
        quantity: number | string;
        price: number | string;
        subtotal: number | string;
        product: Product;
    }[];
}

// --- New Interfaces ---

export interface Role {
    id: string;
    name: 'ADMIN' | 'USER' | 'GUEST' | string;
    description: string;
}

export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: Role | 'ADMIN' | 'USER' | 'GUEST';
    phone?: string | null;
    address?: string | null;
    avatar?: string | null;
    isActive?: boolean;
}

export interface AuthResponse {
    user: User;
    token: string;
}

export interface Shift {
    id: string;
    userId?: string;
    startTime: string;
    endTime?: string | null;
    initialBalance: string | number;
    realBalance?: string | number;
    expectedBalance?: string | number;
    difference?: string | number;
    status: 'OPEN' | 'CLOSED';
    openedAt?: string; // Mantener por compatibilidad temporal si es necesario
    closedAt?: string; // Mantener por compatibilidad temporal si es necesario
    user?: User;
    createdAt?: string;
    updatedAt?: string;
}

// Removed legacy Expense interface with string category. Use the later definition with ExpenseCategory.


export interface Supplier {
    id: string;
    name: string;
    phone: string;
}

export interface PurchaseItem {
    productId: string;
    quantity: number;
    costPrice: number;
}

export interface CreatePurchaseDto {
    supplierId: string;
    items: PurchaseItem[];
}

export interface Purchase {
    id: string;
    supplierId: string;
    supplier: Supplier;
    totalAmount: number;
    createdAt: string;
    items: {
        id: string;
        productId: string;
        quantity: number;
        costPrice: number;
        product: Product;
    }[];
}

export interface InventoryAdjustment {
    productId: string;
    quantity: number;
    reason: string;
}

export interface ShiftExpensesReport {
    expenses: Expense[];
    totalAmount: number;
    shift: {
        initialBalance: number;
        expectedBalance: number;
        realBalance: number;
    };
}

export interface ExpenseCategory {
  id: string; // GUID
  name: string;
  icon: string; // Emoji o nombre de icono
}

export interface Expense {
  id: string; // GUID
  description: string;
  amount: number;
  date: string; // ISO Date string
  categoryId: string;
  category?: ExpenseCategory;
}

export interface CreateExpenseDto {
  description: string;
  amount: number;
  date: string;
  categoryId: string;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  path: string;
  timestamp: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: ApiError;
}
