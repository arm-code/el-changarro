'use client'

import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notesStorage, STORAGE_KEYS } from '../lib/storage'
import type { NoteInput } from '../types'

export const notesKeys = {
  all: ['salesNotes'] as const,
  detail: (id: string) => ['salesNotes', id] as const,
}

/** Sincroniza la caché cuando otra pestaña modifica las notas. */
function useCrossTabSync() {
  const queryClient = useQueryClient()
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.notes) queryClient.invalidateQueries({ queryKey: notesKeys.all })
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [queryClient])
}

export function useSalesNotes() {
  useCrossTabSync()
  return useQuery({
    queryKey: notesKeys.all,
    queryFn: () => notesStorage.list(),
    staleTime: Infinity,
  })
}

export function useSalesNote(id: string | undefined) {
  return useQuery({
    queryKey: notesKeys.detail(id ?? ''),
    queryFn: () => notesStorage.get(id!),
    enabled: Boolean(id),
    staleTime: Infinity,
  })
}

export function useSaveSalesNote(id?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: NoteInput) => (id ? notesStorage.update(id, input) : notesStorage.create(input)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notesKeys.all }),
  })
}

export function useDeleteSalesNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (noteId: string) => notesStorage.remove(noteId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: notesKeys.all }),
  })
}
