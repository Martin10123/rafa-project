import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createShowcase,
  deleteShowcase,
  deleteShowcaseImage,
  getPublishedShowcase,
  listAdminShowcases,
  listPublishedShowcases,
  updateShowcase,
  uploadShowcaseImage,
} from '@/data/repositories/showcases'
import type {
  CreateShowcaseInput,
  ShowcaseImage,
  UpdateShowcaseInput,
} from '@/domain/showcase/types'
import { isSupabaseConfigured } from '@/data/supabase/client'

export const showcaseKeys = {
  all: ['showcases'] as const,
  public: () => [...showcaseKeys.all, 'public'] as const,
  detail: (id: string) => [...showcaseKeys.all, 'detail', id] as const,
  admin: () => [...showcaseKeys.all, 'admin'] as const,
}

export function usePublishedShowcases() {
  return useQuery({
    queryKey: showcaseKeys.public(),
    queryFn: listPublishedShowcases,
    enabled: isSupabaseConfigured(),
  })
}

export function usePublishedShowcase(id: string | null) {
  return useQuery({
    queryKey: showcaseKeys.detail(id ?? ''),
    queryFn: () => getPublishedShowcase(id!),
    enabled: isSupabaseConfigured() && id !== null,
  })
}

export function useAdminShowcases() {
  return useQuery({
    queryKey: showcaseKeys.admin(),
    queryFn: listAdminShowcases,
    enabled: isSupabaseConfigured(),
  })
}

export function useCreateShowcase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateShowcaseInput) => createShowcase(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: showcaseKeys.all })
    },
  })
}

export function useUpdateShowcase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateShowcaseInput }) =>
      updateShowcase(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: showcaseKeys.all })
    },
  })
}

export function useDeleteShowcase() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteShowcase(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: showcaseKeys.all })
    },
  })
}

export function useUploadShowcaseImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      showcaseId,
      file,
      sortOrder,
    }: {
      showcaseId: string
      file: File
      sortOrder: number
    }) => uploadShowcaseImage(showcaseId, file, sortOrder),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: showcaseKeys.all })
    },
  })
}

export function useDeleteShowcaseImage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (image: ShowcaseImage) => deleteShowcaseImage(image),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: showcaseKeys.all })
    },
  })
}
