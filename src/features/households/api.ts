import { apiFetch } from '../../api/client'

export interface HouseholdMember {
  '@id': string
  id: number
  household: string
  /** IRI of the member's profile, absent for an external member */
  profile?: string | null
  externalLabel?: string | null
  isOwner: boolean
  joinedAt: string
  leftAt?: string | null
}

export interface Household {
  '@id': string
  id: number
  name: string
  members: HouseholdMember[]
}

interface HouseholdCollection {
  member: Household[]
  totalItems: number
}

const mergePatchHeaders = { 'Content-Type': 'application/merge-patch+json' }

/** Households the active profile is an active member of (scoped server-side). */
export function listHouseholds() {
  return apiFetch<HouseholdCollection>('/households')
}

export function createHousehold(name: string) {
  return apiFetch<Household>('/households', {
    method: 'POST',
    body: JSON.stringify({ name }),
  })
}

export function renameHousehold(id: number, name: string) {
  return apiFetch<Household>(`/households/${id}`, {
    method: 'PATCH',
    headers: mergePatchHeaders,
    body: JSON.stringify({ name }),
  })
}

export function deleteHousehold(id: number) {
  return apiFetch<void>(`/households/${id}`, { method: 'DELETE' })
}

export function addExternalMember(householdId: number, externalLabel: string) {
  return apiFetch<HouseholdMember>(`/households/${householdId}/members`, {
    method: 'POST',
    body: JSON.stringify({ externalLabel }),
  })
}

/** `leftAt` as a `YYYY-MM-DD` date */
export function detachMember(id: number, leftAt: string) {
  return apiFetch<HouseholdMember>(`/household_members/${id}`, {
    method: 'PATCH',
    headers: mergePatchHeaders,
    body: JSON.stringify({ leftAt }),
  })
}
