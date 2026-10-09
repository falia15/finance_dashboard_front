import { NumberFormatter, NumberInput } from '@mantine/core'
import type { NumberInputProps } from '@mantine/core'

const moneyFormat = {
  suffix: ' €',
  thousandSeparator: ' ',
  decimalSeparator: ',',
  decimalScale: 2,
  fixedDecimalScale: true,
} as const

/** Displays an API amount (`"2073.00"`) as `2 073,00 €`. */
export function Money({ value }: { value: string }) {
  return (
    <NumberFormatter
      value={value}
      {...moneyFormat}
    />
  )
}

/** Amount input with the same format as `Money`. */
export function MoneyInput(props: NumberInputProps) {
  return (
    <NumberInput
      hideControls
      allowNegative={false}
      {...moneyFormat}
      {...props}
    />
  )
}
