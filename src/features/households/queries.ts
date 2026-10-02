import { apiFetch, mergePatchHeaders, useApiGet } from '../../api/client'
import { HOUSEHOLD_MEMBERS_ROUTE, HOUSEHOLDS_ROUTE, type Household, type HouseholdCollection, type HouseholdMember } from './api'

/** Households the active profile is an active member of (scoped server-side). */
export function useHouseholds() {
  return useApiGet<HouseholdCollection>(HOUSEHOLDS_ROUTE)
}

export function createHousehold(name: string) {
  return apiFetch<Household>(HOUSEHOLDS_ROUTE, { method: 'POST', body: JSON.stringify({ name }) })
}

export function renameHousehold(id: number, name: string) {
  return apiFetch<Household>(`${HOUSEHOLDS_ROUTE}/${id}`, {
    method: 'PATCH',
    headers: mergePatchHeaders,
    body: JSON.stringify({ name }),
  })
}

export function deleteHousehold(id: number) {
  return apiFetch<void>(`${HOUSEHOLDS_ROUTE}/${id}`, { method: 'DELETE' })
}

export function addExternalMember(householdId: number, externalLabel: string) {
  return apiFetch<HouseholdMember>(`${HOUSEHOLDS_ROUTE}/${householdId}/members`, {
    method: 'POST',
    body: JSON.stringify({ externalLabel }),
  })
}

/** `leftAt` as a `YYYY-MM-DD` date */
export function detachMember(id: number, leftAt: string) {
  return apiFetch<HouseholdMember>(`${HOUSEHOLD_MEMBERS_ROUTE}/${id}`, {
    method: 'PATCH',
    headers: mergePatchHeaders,
    body: JSON.stringify({ leftAt }),
  })
}
