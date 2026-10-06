import { EditNote } from "@/features/sales-notes"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditNotePage({ params }: PageProps) {
  const { id } = await params
  return <EditNote noteId={id} />
}
