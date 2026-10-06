// lib/tools-catalog.ts
// Fuente única de verdad de las micro apps. La landing y el footer leen de aquí,
// así que cuando una herramienta salga basta con moverla de `upcomingTools`
// a `availableTools` y agregarle su `href`.
import {
    Receipt,
    FileText,
    FileSignature,
    Wallet,
    Calculator,
    BookOpen,
    Package,
    Tag,
    BarChart3,
    Users,
    type LucideIcon,
} from "lucide-react"

interface ToolBase {
    id: string
    title: string
    description: string
    icon: LucideIcon
}

export interface AvailableTool extends ToolBase {
    href: string
}

export type UpcomingTool = ToolBase

export const availableTools: readonly AvailableTool[] = [
    {
        id: "sales-note",
        title: "Notas de venta",
        description: "Haz recibos para tus clientes en segundos",
        icon: Receipt,
        href: "/tools/sales-note",
    },
    {
        id: "expenses",
        title: "Control de gastos",
        description: "Lleva el control de lo que entra y sale",
        icon: Wallet,
        href: "/tools/expenses",
    },
]

export const upcomingTools: readonly UpcomingTool[] = [
    {
        id: "quotes",
        title: "Cotizaciones",
        description: "Manda cotizaciones con tu marca por WhatsApp",
        icon: FileText,
    },
    {
        id: "event-contracts",
        title: "Contratos de evento",
        description: "Contratos de renta listos para firmar",
        icon: FileSignature,
    },
    {
        id: "daily-close",
        title: "Corte diario",
        description: "Cierra el día y conoce tus ganancias",
        icon: Calculator,
    },
    {
        id: "credit-book",
        title: "Libreta de fiado",
        description: "Para saber quién te debe, sin el cuaderno",
        icon: BookOpen,
    },
    {
        id: "inventory",
        title: "Inventario",
        description: "Cuenta lo que tienes y lo que se te está acabando",
        icon: Package,
    },
    {
        id: "price-calculator",
        title: "Calculadora de precio",
        description: "Súmale tu ganancia al costo y ya sabes cuánto cobrar",
        icon: Tag,
    },
    {
        id: "sales-reports",
        title: "Reportes de ventas",
        description: "Visualiza las tendencias de tus ventas y productos más vendidos",
        icon: BarChart3,
    },
    {
        id: "customers",
        title: "Directorio de clientes",
        description: "Registro de tus clientes y sus compras",
        icon: Users,
    },
]