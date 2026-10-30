import { apiFetch, mergePatchHeaders } from '#/api/client'

// Montants : chaînes décimales de l'API ("560.00"), cf. `#/lib/money`.
// Un mois vide n'a pas de montant (absent de `amounts`), différent de "0.00".

/** A filled month of a line. */
export interface FixedExpenseMonthAmount {
  /** FixedExpenseAmount id */
  id: number
  month: number
  amount: string
}

/** A filled month of a household line, with the profile's share of it. */
export interface FixedExpenseMonthShare extends FixedExpenseMonthAmount {
  appliedDivisor: number
  share: string
}

/** A fixed expense line of the yearly grid. */
export interface FixedExpenseLine {
  /** FixedExpense id */
  id: number
  label: string
  sortOrder: number
  startYear: number
  /** Last month covered once deactivated, null while active */
  endYear: number | null
  endMonth: number | null
  /** Filled months only */
  amounts: FixedExpenseMonthAmount[]
  total: string
}

export interface HouseholdFixedExpenseLine extends FixedExpenseLine {
  /** Member paying the whole line, null = equal split */
  householdMember: string | null
  amounts: FixedExpenseMonthShare[]
  /** The profile's shares of the year */
  shareTotal: string
}

/** One household of the profile, in `ProfileFixedExpenseYear.households`. */
export interface HouseholdFixedExpenseGrid {
  /** Household IRI */
  household: string
  lines: HouseholdFixedExpenseLine[]
  /** Always 12: the household's full amounts and the profile's share */
  months: { month: number; total: string; share: string }[]
  totals: { total: string; share: string }
}

/** `GET /profiles/{id}/fixed_expenses?year=`: the whole page of a year. */
export interface ProfileFixedExpenseYear {
  profileId: number
  year: number
  lines: FixedExpenseLine[]
  households: HouseholdFixedExpenseGrid[]
  /** Always 12 */
  months: {
    month: number
    individual: string
    householdShare: string
    total: string
  }[]
  totals: {
    individual: string
    householdShare: string
    total: string
  }
}

/** Exactly one owner: the profile or a household. */
export type FixedExpenseOwner = { profile: string } | { household: string }

export interface FixedExpenseInput {
  label: string
  /** Household lines only: member IRI, null = equal split */
  householdMember?: string | null
  /** First amount(s): one month, or the 12 months when `month` is null */
  initialAmount?: { year: number; month: number | null; amount: string }
}

/** Fields of `PATCH /fixed_expenses/{id}`: edit, deactivate, reactivate. */
export interface FixedExpenseUpdate {
  label?: string
  householdMember?: string | null
  endYear?: number | null
  endMonth?: number | null
}

export function getProfileFixedExpenses(profileId: number, year: number) {
  return apiFetch<ProfileFixedExpenseYear>(
    `/profiles/${profileId}/fixed_expenses?year=${year}`,
  )
}

/** The line starts the given year (`startYear`). */
export function createFixedExpense(
  owner: FixedExpenseOwner,
  year: number,
  input: FixedExpenseInput,
) {
  return apiFetch<unknown>('/fixed_expenses', {
    method: 'POST',
    body: JSON.stringify({ ...owner, startYear: year, ...input }),
  })
}

export function updateFixedExpense(id: number, input: FixedExpenseUpdate) {
  return apiFetch<unknown>(`/fixed_expenses/${id}`, {
    method: 'PATCH',
    headers: mergePatchHeaders,
    body: JSON.stringify(input),
  })
}

/** Deletes the line and all its amounts, every year included. */
export function deleteFixedExpense(id: number) {
  return apiFetch<void>(`/fixed_expenses/${id}`, { method: 'DELETE' })
}

/** Copies the amount of `month` to every active month of `year`. */
export function applyToYear(id: number, year: number, month: number) {
  return apiFetch<unknown>(`/fixed_expenses/${id}/apply_to_year`, {
    method: 'POST',
    body: JSON.stringify({ year, month }),
  })
}

export function createFixedExpenseAmount(
  fixedExpenseId: number,
  year: number,
  month: number,
  amount: string,
) {
  return apiFetch<unknown>('/fixed_expense_amounts', {
    method: 'POST',
    body: JSON.stringify({
      fixedExpense: `/api/fixed_expenses/${fixedExpenseId}`,
      year,
      month,
      amount,
    }),
  })
}

export function updateFixedExpenseAmount(id: number, amount: string) {
  return apiFetch<unknown>(`/fixed_expense_amounts/${id}`, {
    method: 'PATCH',
    headers: mergePatchHeaders,
    body: JSON.stringify({ amount }),
  })
}

/** Empties the month. */
export function deleteFixedExpenseAmount(id: number) {
  return apiFetch<void>(`/fixed_expense_amounts/${id}`, { method: 'DELETE' })
}
