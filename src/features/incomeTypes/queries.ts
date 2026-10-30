import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createIncomeType,
  deleteIncomeType,
  listIncomeTypes,
  reorderIncomeTypes,
  updateIncomeType,
  type IncomeTypeInput,
} from './api'

export const incomeTypesQueryKey = ['incomeTypes'] as const

export function useIncomeTypes() {
  return useQuery({
    queryKey: incomeTypesQueryKey,
    queryFn: listIncomeTypes,
    select: (data) => data.member,
  })
}

/** Every income type mutation refreshes the list. */
function useIncomeTypeMutation<TVariables, TResult>(
  mutationFn: (variables: TVariables) => Promise<TResult>,
) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: incomeTypesQueryKey }),
  })
}

export function useCreateIncomeType() {
  return useIncomeTypeMutation((input: IncomeTypeInput) =>
    createIncomeType(input),
  )
}

export function useUpdateIncomeType() {
  return useIncomeTypeMutation(
    ({ id, input }: { id: number; input: IncomeTypeInput }) =>
      updateIncomeType(id, input),
  )
}

export function useReorderIncomeTypes() {
  return useIncomeTypeMutation((order: string[]) => reorderIncomeTypes(order))
}

export function useDeleteIncomeType() {
  return useIncomeTypeMutation((id: number) => deleteIncomeType(id))
}
