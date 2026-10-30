import { NumberInput } from '@mantine/core'
import type { NumberInputProps } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { formatMoney, numberSeparators } from '#/lib/money'

/** Displays an API amount (`"2073.00"`) as `2 073,00 €` (in French). */
export function Money({ value }: { value: string }) {
  const { i18n } = useTranslation()
  return <>{formatMoney(value, i18n.language)}</>
}

/** Amount input with the separators of the display language. */
export function MoneyInput(props: NumberInputProps) {
  const { i18n } = useTranslation()

  return (
    <NumberInput
      hideControls
      allowNegative={false}
      decimalScale={2}
      suffix=" €"
      {...numberSeparators(i18n.language)}
      {...props}
    />
  )
}
