// app/layout.tsx
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import { Providers } from '@/components/providers'

import './globals.css'

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" })
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" })

export const metadata: Metadata = {
  title: 'El Changarro - Herramientas sencillas para tu negocio',
  description: 'Notas de venta, cotizaciones, contratos y control de gastos, listos desde tu celular. Herramientas simples para changarros, tiendas y emprendedores.',
  manifest: "/manifest.json",
  icons: {
    icon: '/icon_192x192.png',
    apple: '/icon_192x192.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="es-MX"
      suppressHydrationWarning
      className={`bg-background ${geist.variable} ${geistMono.variable}`}
    >
      <body className="font-sans antialiased text-foreground">
        <Providers>
          <Toaster richColors closeButton position="bottom-right" />
          {children}
        </Providers>
      </body>
    </html>
  )
}