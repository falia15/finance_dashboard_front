/** "Split between" value standing for an equal split (`member` = null). */
export const EQUAL_SPLIT = 'equal'

export interface IncomeFormValues {
  month: string
  type: string | null
  amount: string | number
  /** `EQUAL_SPLIT` or a member IRI — household rows only */
  member: string
}

export function emptyIncomeValues(): IncomeFormValues {
  return {
    month: String(new Date().getMonth() + 1),
    type: null,
    amount: '',
    member: EQUAL_SPLIT,
  }
}
