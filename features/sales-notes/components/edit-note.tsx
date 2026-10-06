'use client'

import Link from 'next/link'
import { useSalesNote } from '../hooks/use-sales-notes'
import { SALES_NOTES_ROUTES } from '../routes'
import { NoteWizard } from './note-wizard'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

/** Carga la nota desde el storage y abre el asistente en modo edición. */
export function EditNote({ noteId }: { noteId: string }) {
  const { data: note, isLoading } = useSalesNote(noteId)

  if (isLoading) {
    return (
      <div className="space-y-6" aria-busy="true">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (!note) {
    return (
      <Card className="flex flex-col items-center gap-3 px-6 py-12 text-center">
        <p className="text-[15px] font-medium">No encontramos esta nota</p>
        <p className="text-sm text-muted-foreground">Puede que se haya borrado o que esté en otro dispositivo.</p>
        <Button asChild className="mt-2">
          <Link href={SALES_NOTES_ROUTES.list}>Ver mis notas</Link>
        </Button>
      </Card>
    )
  }

  // key: si cambia la nota, reinicia el estado del asistente
  return <NoteWizard key={note.id} initialNote={note} />
}
