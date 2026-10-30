import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useActiveProfile } from '#/features/profiles/ActiveProfileContext'
import {
  createIncome,
  deleteIncome,
  getProfileIncomes,
  listHouseholdIncomes,
  updateIncome,
  type IncomeInput,
  type IncomeOwner,
} from './api'

export const incomesQueryKey = (profileId: number, year: number) =>
  ['incomes', profileId, year] as const

export const householdIncomesQueryKey = (householdId: number, year: number) =>
  ['householdIncomes', householdId, year] as const

/** The active profile's year: its incomes, household shares and totals. */
export function useProfileIncomes(year: number) {
  const { activeProfileId } = useActiveProfile()
  return useQuery({
    queryKey: incomesQueryKey(activeProfileId ?? 0, year),
    queryFn: () => getProfileIncomes(activeProfileId ?? 0, year),
    enabled: activeProfileId !== null,
  })
}

export function useHouseholdIncomes(householdId: number, year: number) {
  return useQuery({
    queryKey: householdIncomesQueryKey(householdId, year),
    queryFn: () => listHouseholdIncomes(householdId, year),
    select: (data) => data.member,
  })
}

/**
 * Every income write refreshes the profile's years (totals, shares) and the
 * household lists — individual and household rows share the same CRUD.
 */
function useIncomeMutation<TVariables, TResult>(
  mutationFn: (variables: TVariables) => Promise<TResult>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['incomes'] }),
        queryClient.invalidateQueries({ queryKey: ['householdIncomes'] }),
      ]),
  })
}

export function useCreateIncome() {
  return useIncomeMutation(
    ({
      owner,
      year,
      input,
    }: {
      owner: IncomeOwner
      year: number
      input: IncomeInput
    }) => createIncome(owner, year, input),
  )
}

export function useUpdateIncome() {
  return useIncomeMutation(
    ({ id, input }: { id: number; input: IncomeInput }) =>
      updateIncome(id, input),
  )
}

export function useDeleteIncome() {
  return useIncomeMutation((id: number) => deleteIncome(id))
}
