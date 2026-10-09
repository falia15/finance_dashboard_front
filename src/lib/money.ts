// Montants de l'API : chaînes décimales à 2 chiffres ("2073.00", type
// DECIMAL côté base). Les calculs se font en centimes entiers pour éviter les
// erreurs de flottant (0.1 + 0.2 !== 0.3).

/**
 * Amount in integer cents: `'2073.5'` → 207350. Accepts the French comma
 * (`'2073,5'`), spaces and a number (e.g. a NumberInput value); `NaN` if the
 * value isn't an amount, `0` if it is empty.
 */
export function toCents(value: string | number): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? Math.round(value * 100) : Number.NaN
  }

  const normalized = value.replace(/\s/g, '').replace(',', '.')
  if (normalized === '') return 0

  const match = /^(-)?(\d*)(?:\.(\d{0,2}))?$/.exec(normalized)
  if (!match || (match[2] === '' && !match[3])) return Number.NaN

  const cents =
    Number(match[2] || '0') * 100 + Number((match[3] ?? '').padEnd(2, '0'))
  return match[1] ? -cents : cents
}

/** API format of an amount in cents: 207350 → `'2073.50'`. */
export function fromCents(cents: number): string {
  const sign = cents < 0 ? '-' : ''
  const absolute = Math.abs(cents)
  return `${sign}${Math.floor(absolute / 100)}.${String(absolute % 100).padStart(2, '0')}`
}

/** Sum of API amounts, computed in cents. */
export function sumAmounts(amounts: string[]): string {
  return fromCents(
    amounts.reduce((total, amount) => total + toCents(amount), 0),
  )
}

/** `formatMoney('2073.00', 'fr')` → "2 073,00 €" (narrow no-break spaces). */
export function formatMoney(amount: string, language: string): string {
  return new Intl.NumberFormat(language, {
    style: 'currency',
    currency: 'EUR',
  }).format(toCents(amount) / 100)
}

/** Thousand and decimal separators of a language, for number inputs. */
export function numberSeparators(language: string) {
  const parts = new Intl.NumberFormat(language).formatToParts(1234.5)
  return {
    thousandSeparator:
      parts.find((part) => part.type === 'group')?.value ?? ' ',
    decimalSeparator:
      parts.find((part) => part.type === 'decimal')?.value ?? ',',
  }
}
