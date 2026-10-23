import { Card, Stack, Table, Text } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { formatMonth } from '#/lib/dates'
import { useActiveProfile } from '#/features/profiles/ActiveProfileContext'
import type { ProfileIncomeYear } from './api'
import { IncomeForm } from './IncomeForm'
import { Money } from './Money'
import { RowActions } from './RowActions'
import { useCreateIncome } from './queries'
import { useIncomeTypeName } from './useIncomeTypeName'

interface ProfileIncomesSectionProps {
  year: number
  data: ProfileIncomeYear
}

export function ProfileIncomesSection({
  year,
  data,
}: ProfileIncomesSectionProps) {
  const { t, i18n } = useTranslation()
  const { activeProfileId } = useActiveProfile()
  const typeName = useIncomeTypeName()
  const createIncome = useCreateIncome()

  const rows = data.months.flatMap(({ month, incomes }) =>
    incomes.map((income) => ({ ...income, month })),
  )

  return (
    <Card withBorder>
      <Stack gap="md">
        {rows.length === 0 ? (
          <Text c="dimmed">{t('incomes.profile.empty')}</Text>
        ) : (
          <Table.ScrollContainer minWidth={480}>
            <Table
              striped
              verticalSpacing="xs"
            >
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{t('incomes.form.month')}</Table.Th>
                  <Table.Th>{t('incomes.form.type')}</Table.Th>
                  <Table.Th ta="right">{t('incomes.form.amount')}</Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rows.map((row) => {
                  const monthName = formatMonth(row.month, i18n.language)
                  return (
                    <Table.Tr key={row.id}>
                      <Table.Td tt="capitalize">{monthName}</Table.Td>
                      <Table.Td>{typeName(row.type)}</Table.Td>
                      <Table.Td
                        ta="right"
                        fw={600}
                      >
                        <Money value={row.amount} />
                      </Table.Td>
                      <Table.Td>
                        <RowActions
                          incomeId={row.id}
                          label={`${typeName(row.type)} — ${monthName}`}
                          values={{
                            month: String(row.month),
                            type: row.type,
                            amount: row.amount,
                            householdMember: '',
                          }}
                        />
                      </Table.Td>
                    </Table.Tr>
                  )
                })}
              </Table.Tbody>
              <Table.Tfoot>
                <Table.Tr fw={700}>
                  <Table.Td colSpan={2}>{t('incomes.total')}</Table.Td>
                  <Table.Td ta="right">
                    <Money value={data.totals.individual} />
                  </Table.Td>
                  <Table.Td />
                </Table.Tr>
              </Table.Tfoot>
            </Table>
          </Table.ScrollContainer>
        )}

        <IncomeForm
          submitLabel={t('incomes.form.add')}
          onSubmit={(input) =>
            createIncome.mutateAsync({
              owner: { profile: `/api/profiles/${activeProfileId}` },
              year,
              input,
            })
          }
        />
      </Stack>
    </Card>
  )
}
