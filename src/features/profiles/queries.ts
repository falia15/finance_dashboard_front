import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import {
  createProfile,
  deleteProfile,
  listProfiles,
  updateProfile,
  type ProfileInput,
} from './api'

export const profilesQueryKey = ['profiles'] as const

const profilesQuery = queryOptions({
  queryKey: profilesQueryKey,
  queryFn: listProfiles,
})

/**
 * Profile list, fetched once and shared by every component through the cache.
 */
export function useProfiles() {
  return useQuery({ ...profilesQuery, select: (data) => data.member })
}

/**
 * One profile, read from the cached list: `undefined` while loading,
 * `null` once loaded if no profile has this id.
 */
export function useProfile(id: number | null) {
  return useQuery({
    ...profilesQuery,
    select: (data) => data.member.find((profile) => profile.id === id) ?? null,
  })
}

/** Every profile mutation refreshes the list. */
function useProfileMutation<TVariables, TResult>(
  mutationFn: (variables: TVariables) => Promise<TResult>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: profilesQueryKey }),
  })
}

export function useCreateProfile() {
  return useProfileMutation((input: ProfileInput) => createProfile(input))
}

export function useUpdateProfile() {
  return useProfileMutation(
    ({ id, input }: { id: number; input: Partial<ProfileInput> }) =>
      updateProfile(id, input),
  )
}

export function useDeleteProfile() {
  return useProfileMutation((id: number) => deleteProfile(id))
}
