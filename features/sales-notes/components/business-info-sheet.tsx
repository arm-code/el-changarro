'use client'

import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { useBusinessInfo, useSaveBusinessInfo } from '../hooks/use-business-info'
import { AppBottomSheet } from '@/components/ui/app-bottom-sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TOUCH } from '@/components/ui/detail'

interface BusinessInfoSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/** Nombre y teléfono del negocio que salen en el documento. Se guardan en este dispositivo. */
export function BusinessInfoSheet({ open, onOpenChange }: BusinessInfoSheetProps) {
  return (
    <AppBottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Datos de tu negocio"
      description="Aparecen en tus notas y cotizaciones"
      mobileHeight="auto"
    >
      {/* key: reinicia el formulario con los datos guardados cada vez que se abre */}
      {open && <BusinessInfoForm onDone={() => onOpenChange(false)} />}
    </AppBottomSheet>
  )
}

function BusinessInfoForm({ onDone }: { onDone: () => void }) {
  const current = useBusinessInfo()
  const save = useSaveBusinessInfo()
  const [name, setName] = useState(current.name)
  const [phone, setPhone] = useState(current.phone)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    save.mutate(
      { name: name.trim(), phone: phone.trim() },
      {
        onSuccess: () => {
          toast.success('Datos guardados')
          onDone()
        },
        onError: () => toast.error('No se pudieron guardar los datos.'),
      }
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 pb-2">
      <div className="space-y-2">
        <Label htmlFor="bname">Nombre del negocio</Label>
        <Input
          id="bname"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. Abarrotes Doña Mary"
          className="h-11 text-base"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="bphone">Teléfono</Label>
        <Input
          id="bphone"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Ej. 656 123 4567"
          className="h-11 text-base"
        />
      </div>
      <Button type="submit" className={`${TOUCH} w-full`} disabled={save.isPending}>
        Guardar
      </Button>
    </form>
  )
}
