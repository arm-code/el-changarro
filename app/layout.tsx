import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import './globals.css'
import { Toaster } from 'sonner';
import { Providers } from '@/components/providers';

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: 'El Changarro - Herramientas sencillas para tu negocio',
  description: 'Notas de venta, cotizaciones, contratos y control de gastos, listos desde tu celular. Herramientas simples para changarros, tiendas y emprendedores.',
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}
) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`bg-background ${geist.variable} ${geistMono.variable}`}
    >
      <body
        className="font-sans antialiased"
      >
        <Providers>
          <Toaster richColors closeButton position="bottom-right" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
