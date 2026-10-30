import { describe, expect, it } from 'vitest'
import {
  formatMoney,
  fromCents,
  numberSeparators,
  sumAmounts,
  toCents,
} from '#/lib/money'

describe('toCents', () => {
  it.each([
    ['2073.00', 207300],
    ['2073.5', 207350],
    ['2073,5', 207350],
    ['2 073,45', 207345],
    ['7', 700],
    ['0.01', 1],
    ['.5', 50],
    ['-10.01', -1001],
    ['', 0],
  ])('reads %j', (value, expected) => {
    expect(toCents(value)).toBe(expected)
  })

  it('reads a number without float error', () => {
    expect(toCents(0.1 + 0.2)).toBe(30)
    expect(toCents(2073.45)).toBe(207345)
  })

  it.each(['abc', '1.234', '1e3', '-'])('rejects %j', (value) => {
    expect(toCents(value)).toBeNaN()
  })
})

describe('fromCents', () => {
  it.each([
    [207300, '2073.00'],
    [5, '0.05'],
    [0, '0.00'],
    [-1, '-0.01'],
  ])('formats %d', (cents, expected) => {
    expect(fromCents(cents)).toBe(expected)
  })
})

describe('sumAmounts', () => {
  it('adds amounts without float error', () => {
    expect(0.1 + 0.2).not.toBe(0.3)
    expect(sumAmounts(['0.10', '0.20'])).toBe('0.30')
    expect(sumAmounts([])).toBe('0.00')
  })
})

describe('formatMoney', () => {
  it('formats in the given language', () => {
    expect(formatMoney('2073.00', 'fr')).toBe('2 073,00 €')
    expect(formatMoney('2073.5', 'en')).toBe('€2,073.50')
  })
})

describe('numberSeparators', () => {
  it('follows the language', () => {
    expect(numberSeparators('en')).toEqual({
      thousandSeparator: ',',
      decimalSeparator: '.',
    })
    expect(numberSeparators('fr').decimalSeparator).toBe(',')
  })
})
