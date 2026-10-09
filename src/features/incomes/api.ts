import { apiFetch, mergePatchHeaders } from '#/api/client'

// Montants : chaînes décimales de l'API ("2073.00"), cf. `#/lib/money`.

/** A raw income row (`/incomes` CRUD). */
export interface Income {
  '@id': string
  id: number
  /** Profile IRI, absent on a household row */
  profile?: string | null
  /** Household IRI, absent on an individual row */
  household?: string | null
  /** Member receiving the whole household income, absent/null = equal split */
  member?: string | null
  year: number
  month: number
  /** IncomeType IRI */
  type: string
  amount: string
  appliedDivisor: number
}

/** An individual income of the profile, in `ProfileIncomeMonth.incomes`. */
export interface IncomeLine {
  id: number
  type: string
  amount: string
}

/** A household income row with the profile's share of it. */
export interface HouseholdShare {
  incomeId: number
  household: string
  type: string
  amount: string
  appliedDivisor: number
  member: string | null
  share: string
}

export interface ProfileIncomeMonth {
  month: number
  incomes: IncomeLine[]
  householdShares: HouseholdShare[]
  total: string
}

/** `GET /profiles/{id}/incomes?year=`: always 12 months. */
export interface ProfileIncomeYear {
  profileId: number
  year: number
  months: ProfileIncomeMonth[]
  totals: {
    individual: string
    householdShare: string
    total: string
  }
}

interface Collection<T> {
  member: T[]
  totalItems: number
}

/** Fields sent to create or edit a row. */
export interface IncomeInput {
  month: number
  type: string
  amount: string
  /** Household rows only: member IRI, null = equal split */
  member?: string | null
}

/** Exactly one owner: the profile or a household. */
export type IncomeOwner = { profile: string } | { household: string }

export function getProfileIncomes(profileId: number, year: number) {
  return apiFetch<ProfileIncomeYear>(
    `/profiles/${profileId}/incomes?year=${year}`,
  )
}

export function listHouseholdIncomes(householdId: number, year: number) {
  return apiFetch<Collection<Income>>(
    `/households/${householdId}/incomes?year=${year}`,
  )
}

export function createIncome(
  owner: IncomeOwner,
  year: number,
  input: IncomeInput,
) {
  return apiFetch<Income>('/incomes', {
    method: 'POST',
    body: JSON.stringify({ ...owner, year, ...input }),
  })
}

export function updateIncome(id: number, input: IncomeInput) {
  return apiFetch<Income>(`/incomes/${id}`, {
    method: 'PATCH',
    headers: mergePatchHeaders,
    body: JSON.stringify(input),
  })
}

export function deleteIncome(id: number) {
  return apiFetch<void>(`/incomes/${id}`, { method: 'DELETE' })
}
