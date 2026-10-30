import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useActiveProfile } from '#/features/profiles/ActiveProfileContext'
import {
  applyToYear,
  createFixedExpense,
  createFixedExpenseAmount,
  deleteFixedExpense,
  deleteFixedExpenseAmount,
  getProfileFixedExpenses,
  updateFixedExpense,
  updateFixedExpenseAmount,
  type FixedExpenseInput,
  type FixedExpenseOwner,
  type FixedExpenseUpdate,
} from './api'

export const fixedExpensesQueryKey = (profileId: number, year: number) =>
  ['fixedExpenses', profileId, year] as const

/** The active profile's year: its lines, its households' grids and the totals. */
export function useProfileFixedExpenses(year: number) {
  const { activeProfileId } = useActiveProfile()
  return useQuery({
    queryKey: fixedExpensesQueryKey(activeProfileId ?? 0, year),
    queryFn: () => getProfileFixedExpenses(activeProfileId ?? 0, year),
    enabled: activeProfileId !== null,
  })
}

/**
 * Every write refreshes the years of the page: a single read model holds the
 * lines, the amounts, the shares and the totals. The mutation only resolves
 * once the refetch is done, so a cell never shows its old value meanwhile.
 */
function useFixedExpenseMutation<TVariables, TResult>(
  mutationFn: (variables: TVariables) => Promise<TResult>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['fixedExpenses'] }),
  })
}

export function useCreateFixedExpense() {
  return useFixedExpenseMutation(
    ({
      owner,
      year,
      input,
    }: {
      owner: FixedExpenseOwner
      year: number
      input: FixedExpenseInput
    }) => createFixedExpense(owner, year, input),
  )
}

export function useUpdateFixedExpense() {
  return useFixedExpenseMutation(
    ({ id, input }: { id: number; input: FixedExpenseUpdate }) =>
      updateFixedExpense(id, input),
  )
}

export function useDeleteFixedExpense() {
  return useFixedExpenseMutation((id: number) => deleteFixedExpense(id))
}

export function useApplyToYear() {
  return useFixedExpenseMutation(
    ({ id, year, month }: { id: number; year: number; month: number }) =>
      applyToYear(id, year, month),
  )
}

/** One cell of the grid: what to do with the month. */
export type MonthChange =
  | {
      kind: 'create'
      fixedExpenseId: number
      year: number
      month: number
      amount: string
    }
  | { kind: 'update'; amountId: number; amount: string }
  | { kind: 'delete'; amountId: number }

export function useSaveMonth() {
  return useFixedExpenseMutation((change: MonthChange) => {
    switch (change.kind) {
      case 'create':
        return createFixedExpenseAmount(
          change.fixedExpenseId,
          change.year,
          change.month,
          change.amount,
        )
      case 'update':
        return updateFixedExpenseAmount(change.amountId, change.amount)
      case 'delete':
        return deleteFixedExpenseAmount(change.amountId)
    }
  })
}
