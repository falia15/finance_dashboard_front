/** "Split between" value standing for an equal split (`householdMember` = null). */
export const EQUAL_SPLIT = 'equal'

export interface IncomeFormValues {
  month: string
  type: string | null
  amount: string | number
  /** `EQUAL_SPLIT` or a member IRI — household rows only */
  householdMember: string
}

export function emptyIncomeValues(): IncomeFormValues {
  return {
    month: String(new Date().getMonth() + 1),
    type: null,
    amount: '',
    householdMember: EQUAL_SPLIT,
  }
}
