import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  addExternalMember,
  createHousehold,
  deleteHousehold,
  detachMember,
  listHouseholds,
  renameHousehold,
} from './api'

export const householdsQueryKey = ['households'] as const

export function useHouseholds() {
  return useQuery({
    queryKey: householdsQueryKey,
    queryFn: listHouseholds,
  })
}

/** Every household mutation refreshes the list, members being embedded in it. */
function useHouseholdMutation<TVariables, TResult>(mutationFn: (variables: TVariables) => Promise<TResult>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: householdsQueryKey }),
  })
}

export function useCreateHousehold() {
  return useHouseholdMutation((name: string) => createHousehold(name))
}

export function useRenameHousehold() {
  return useHouseholdMutation(({ id, name }: { id: number; name: string }) => renameHousehold(id, name))
}

export function useDeleteHousehold() {
  return useHouseholdMutation((id: number) => deleteHousehold(id))
}

export function useAddExternalMember() {
  return useHouseholdMutation(({ householdId, externalLabel }: { householdId: number; externalLabel: string }) =>
    addExternalMember(householdId, externalLabel),
  )
}

export function useDetachMember() {
  return useHouseholdMutation(({ id, leftAt }: { id: number; leftAt: string }) => detachMember(id, leftAt))
}
