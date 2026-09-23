import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createProfile, deleteProfile, listProfiles, updateProfile, type ProfileInput } from './api'

export const profilesQueryKey = ['profiles'] as const

export function useProfiles() {
  return useQuery({
    queryKey: profilesQueryKey,
    queryFn: listProfiles,
  })
}

export function useCreateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: ProfileInput) => createProfile(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profilesQueryKey }),
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: Partial<ProfileInput> }) => updateProfile(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profilesQueryKey }),
  })
}

export function useDeleteProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteProfile(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: profilesQueryKey }),
  })
}
