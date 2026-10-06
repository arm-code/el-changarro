// app/tools/layout.tsx
export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return (
    // min-h-dvh: en móvil 100vh incluye la barra del navegador y provoca scroll de más.
    <div className="flex min-h-dvh flex-col">
      <main className="flex-1">
        {/* Los max() equivalen al py-8 de antes, pero respetan el notch y la barra de gestos en la PWA instalada */}
        <div className="mx-auto max-w-4xl px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))]">
          {children}
        </div>
      </main>
    </div>
  )
}