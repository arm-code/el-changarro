'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { businessStorage } from '../lib/storage'
import type { BusinessInfo } from '../types'

const businessKey = ['businessInfo'] as const
const EMPTY: BusinessInfo = { name: '', phone: '' }

export function useBusinessInfo() {
  const { data } = useQuery({
    queryKey: businessKey,
    queryFn: () => businessStorage.get(),
    staleTime: Infinity,
  })
  return data ?? EMPTY
}

export function useSaveBusinessInfo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (info: BusinessInfo) => businessStorage.save(info),
    onSuccess: (info) => queryClient.setQueryData(businessKey, info),
  })
}
