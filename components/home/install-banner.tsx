"use client"

import { useState } from "react"
import { X } from "lucide-react"
import { useHasMounted } from "@/hooks/useHasMounted"

const STORAGE_KEY = "changarro:pwa-banner-dismissed"

export function InstallBanner() {
  const hasMounted = useHasMounted()
  const [dismissed, setDismissed] = useState(false)

  if (!hasMounted || dismissed) return null

  let shouldShow = true
  try {
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
    shouldShow = !isStandalone && localStorage.getItem(STORAGE_KEY) !== "1"
  } catch {
    shouldShow = true
  }

  if (!shouldShow) return null

  const dismiss = () => {
    setDismissed(true)
    try {
      localStorage.setItem(STORAGE_KEY, "1")
    } catch {
      // localStorage no disponible, no es crítico
    }
  }

  return (
    <div className="flex items-start gap-3 rounded-xl bg-accent px-4 py-3.5">
      <div className="flex-1 space-y-0.5">
        <p className="text-[15px] font-semibold">Agrégala a tu pantalla de inicio</p>
        <p className="text-sm text-muted-foreground">
          Así la abres como una app, sin buscarla en el navegador.
        </p>
      </div>
      <button
        type="button"
        aria-label="Cerrar aviso"
        onClick={dismiss}
        className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}
