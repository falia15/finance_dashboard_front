import { describe, expect, it } from 'vitest'
import { formatIsoDate, formatMonth, todayIsoDate } from '#/lib/dates'

describe('todayIsoDate', () => {
  it('formats the local date with zero padding', () => {
    expect(todayIsoDate(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05')
  })
})

describe('formatIsoDate', () => {
  it('ignores the time and time zone part', () => {
    expect(formatIsoDate('2026-09-25T00:00:00+00:00', 'en')).toBe(
      formatIsoDate('2026-09-25', 'en'),
    )
    expect(formatIsoDate('2026-09-25', 'en')).toBe('Sep 25, 2026')
  })
})

describe('formatMonth', () => {
  it('formats a 1-based month in the given language', () => {
    expect(formatMonth(1, 'fr')).toBe('janvier')
    expect(formatMonth(12, 'en')).toBe('December')
  })
})
