import type { FixedExpenseLine, FixedExpenseMonthAmount } from './api'

/** The 12 months, 1 to 12. */
export const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1)

/**
 * True when the month is inside the line's active period (same rule as the
 * API): not before `startYear`, not after the end of a deactivated line.
 */
export function coversMonth(
  line: FixedExpenseLine,
  year: number,
  month: number,
): boolean {
  if (year < line.startYear) return false
  if (line.endYear === null || line.endMonth === null) return true
  return year * 12 + month <= line.endYear * 12 + line.endMonth
}

/** The filled month, undefined when the month is empty. */
export function amountOf<T extends FixedExpenseMonthAmount>(
  line: { amounts: T[] },
  month: number,
): T | undefined {
  return line.amounts.find((amount) => amount.month === month)
}
