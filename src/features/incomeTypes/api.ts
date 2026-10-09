import { apiFetch, mergePatchHeaders } from '#/api/client'

export interface IncomeType {
  '@id': string
  id: number
  name: string
  color?: string | null
  sortOrder: number
}

export interface IncomeTypeInput {
  name: string
  color: string | null
}

interface IncomeTypeCollection {
  member: IncomeType[]
  totalItems: number
}

/** Income types shared by every profile, sorted by `sortOrder` by the API. */
export function listIncomeTypes() {
  return apiFetch<IncomeTypeCollection>('/income_types')
}

/** The new type is put at the end of the list by the API. */
export function createIncomeType(input: IncomeTypeInput) {
  return apiFetch<IncomeType>('/income_types', {
    method: 'POST',
    body: JSON.stringify(input),
  })
}

export function updateIncomeType(id: number, input: IncomeTypeInput) {
  return apiFetch<IncomeType>(`/income_types/${id}`, {
    method: 'PATCH',
    headers: mergePatchHeaders,
    body: JSON.stringify(input),
  })
}

/** `order`: the IRIs of every type, in the new order. */
export function reorderIncomeTypes(order: string[]) {
  return apiFetch<void>('/income_types/reorder', {
    method: 'PATCH',
    headers: mergePatchHeaders,
    body: JSON.stringify({ order }),
  })
}

/** 422 if an income still uses the type. */
export function deleteIncomeType(id: number) {
  return apiFetch<void>(`/income_types/${id}`, { method: 'DELETE' })
}
