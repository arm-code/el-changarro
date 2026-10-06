export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">

      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
