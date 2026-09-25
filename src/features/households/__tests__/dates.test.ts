import { describe, expect, it } from 'vitest'
import { formatIsoDate, todayIsoDate } from '../dates'

describe('todayIsoDate', () => {
  it('formats the local date with zero padding', () => {
    expect(todayIsoDate(new Date(2026, 0, 5, 23, 30))).toBe('2026-01-05')
  })
})

describe('formatIsoDate', () => {
  it('ignores the time and time zone part', () => {
    expect(formatIsoDate('2026-09-25T00:00:00+00:00', 'en')).toBe(formatIsoDate('2026-09-25', 'en'))
    expect(formatIsoDate('2026-09-25', 'en')).toBe('Sep 25, 2026')
  })
})
