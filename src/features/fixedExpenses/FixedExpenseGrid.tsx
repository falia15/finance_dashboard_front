import { Stack, Table, Text } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { formatMonth } from '#/lib/dates'
import { Money } from '#/features/incomes/Money'
import type { FixedExpenseLine, HouseholdFixedExpenseLine } from './api'
import type { SplitOption } from './AddFixedExpenseForm'
import { AmountCell } from './AmountCell'
import { LineActions } from './LineActions'
import { amountOf, coversMonth, MONTHS } from './lineMonths'
import { useSaveMonth } from './queries'

/** An individual line, or a household one (with its member and share). */
export type GridLine = FixedExpenseLine &
  Partial<Pick<HouseholdFixedExpenseLine, 'householdMember' | 'shareTotal'>>

interface FixedExpenseGridProps {
  year: number
  lines: GridLine[]
  /** Total of the lines per month (12), and of the year */
  monthTotals: string[]
  total: string
  /** Household grids only: the split column and the "My share" row */
  household?: {
    shareMonths: string[]
    shareTotal: string
    splitLabel: (line: GridLine) => string
    splitOptions: (currentMember?: string | null) => SplitOption[]
  }
}

/** Lines × months grid; every month is editable in place (AmountCell). */
export function FixedExpenseGrid({
  year,
  lines,
  monthTotals,
  total,
  household,
}: FixedExpenseGridProps) {
  const { t, i18n } = useTranslation()
  const saveMonth = useSaveMonth()

  /** Create, change or empty the month, depending on what it holds. */
  function saveCell(line: GridLine, month: number, value: string | null) {
    const current = amountOf(line, month)
    if (!current) {
      return saveMonth.mutateAsync({
        kind: 'create',
        fixedExpenseId: line.id,
        year,
        month,
        amount: value ?? '0.00',
      })
    }
    return value === null
      ? saveMonth.mutateAsync({ kind: 'delete', amountId: current.id })
      : saveMonth.mutateAsync({
          kind: 'update',
          amountId: current.id,
          amount: value,
        })
  }

  return (
    <Table.ScrollContainer minWidth={household ? 1300 : 1200}>
      <Table
        striped
        withColumnBorders
        verticalSpacing="xs"
        horizontalSpacing="xs"
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{t('fixedExpenses.label')}</Table.Th>
            {MONTHS.map((month) => (
              <Table.Th
                key={month}
                ta="right"
                tt="capitalize"
              >
                {formatMonth(month, i18n.language, 'short')}
              </Table.Th>
            ))}
            <Table.Th ta="right">{t('fixedExpenses.total')}</Table.Th>
            {household && (
              <Table.Th ta="right">
                {t('fixedExpenses.household.share')}
              </Table.Th>
            )}
            <Table.Th />
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {lines.map((line) => (
            <Table.Tr key={line.id}>
              <Table.Td>
                <Stack gap={0}>
                  <Text
                    size="sm"
                    fw={500}
                  >
                    {line.label}
                  </Text>
                  {household && (
                    <Text
                      size="xs"
                      c="dimmed"
                    >
                      {household.splitLabel(line)}
                    </Text>
                  )}
                  {line.endYear !== null && line.endMonth !== null && (
                    <Text
                      size="xs"
                      c="dimmed"
                    >
                      {t('fixedExpenses.ended', {
                        month: formatMonth(line.endMonth, i18n.language),
                        year: line.endYear,
                      })}
                    </Text>
                  )}
                </Stack>
              </Table.Td>
              {MONTHS.map((month) => (
                <Table.Td key={month}>
                  <AmountCell
                    label={t('fixedExpenses.cell', {
                      label: line.label,
                      month: formatMonth(month, i18n.language),
                    })}
                    amount={amountOf(line, month)?.amount}
                    disabled={!coversMonth(line, year, month)}
                    onSave={(value) => saveCell(line, month, value)}
                  />
                </Table.Td>
              ))}
              <Table.Td
                ta="right"
                fw={600}
              >
                <Money value={line.total} />
              </Table.Td>
              {household && (
                <Table.Td
                  ta="right"
                  fw={600}
                >
                  <Money value={line.shareTotal ?? '0.00'} />
                </Table.Td>
              )}
              <Table.Td>
                <LineActions
                  line={line}
                  year={year}
                  splitOptions={household?.splitOptions(line.householdMember)}
                />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
        <Table.Tfoot>
          <Table.Tr fw={700}>
            <Table.Td>{t('fixedExpenses.total')}</Table.Td>
            {monthTotals.map((value, index) => (
              <Table.Td
                key={MONTHS[index]}
                ta="right"
              >
                <Money value={value} />
              </Table.Td>
            ))}
            <Table.Td ta="right">
              <Money value={total} />
            </Table.Td>
            {household && <Table.Td />}
            <Table.Td />
          </Table.Tr>
          {household && (
            <Table.Tr fw={700}>
              <Table.Td>{t('fixedExpenses.household.share')}</Table.Td>
              {household.shareMonths.map((value, index) => (
                <Table.Td
                  key={MONTHS[index]}
                  ta="right"
                >
                  <Money value={value} />
                </Table.Td>
              ))}
              <Table.Td />
              <Table.Td ta="right">
                <Money value={household.shareTotal} />
              </Table.Td>
              <Table.Td />
            </Table.Tr>
          )}
        </Table.Tfoot>
      </Table>
    </Table.ScrollContainer>
  )
}
