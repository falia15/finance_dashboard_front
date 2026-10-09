import { Card, Select, Stack, Table, Title } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { formatMonth } from '#/lib/dates'
import { IncomeForm } from './IncomeForm'
import { Money } from './Money'
import { RowActions } from './RowActions'
import {
  incomeTypeName,
  memberName,
  mockHousehold,
  mockHouseholdIncomes,
  shareOf,
  sum,
} from './mockData'

/** Select value standing for "split equally" (`member` = null). */
const EQUAL_SPLIT = 'equal'

export function HouseholdIncomesSection() {
  const { t, i18n } = useTranslation()
  // TODO (étape 12) : un bloc par foyer (useHouseholds) et ses lignes
  // (GET /households/{id}/incomes?year=)
  const household = mockHousehold
  const rows = mockHouseholdIncomes

  // TODO (étape 12) : membres actifs du foyer uniquement
  const splitOptions = [
    { value: EQUAL_SPLIT, label: t('incomes.household.splitEqually') },
    ...household.members.map((member) => ({
      value: member['@id'],
      label: member.name,
    })),
  ]

  return (
    <Card withBorder>
      <Stack gap="md">
        <Title order={3}>{household.name}</Title>

        <Table.ScrollContainer minWidth={640}>
          <Table
            striped
            verticalSpacing="xs"
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{t('incomes.form.month')}</Table.Th>
                <Table.Th>{t('incomes.form.type')}</Table.Th>
                <Table.Th ta="right">{t('incomes.form.amount')}</Table.Th>
                <Table.Th>{t('incomes.household.split')}</Table.Th>
                <Table.Th ta="right">{t('incomes.household.share')}</Table.Th>
                <Table.Th />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((row) => (
                <Table.Tr key={row.id}>
                  <Table.Td tt="capitalize">
                    {formatMonth(row.month, i18n.language)}
                  </Table.Td>
                  <Table.Td>{incomeTypeName(row.type)}</Table.Td>
                  <Table.Td ta="right">
                    <Money value={row.amount} />
                  </Table.Td>
                  <Table.Td>
                    {row.member === null
                      ? t('incomes.household.splitEquallyBetween', {
                          divisor: row.appliedDivisor,
                        })
                      : memberName(row.member)}
                  </Table.Td>
                  <Table.Td
                    ta="right"
                    fw={600}
                  >
                    <Money value={shareOf(row)} />
                  </Table.Td>
                  <Table.Td>
                    <RowActions />
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
            <Table.Tfoot>
              <Table.Tr fw={700}>
                <Table.Td colSpan={2}>{t('incomes.total')}</Table.Td>
                <Table.Td ta="right">
                  <Money value={sum(rows.map((row) => row.amount))} />
                </Table.Td>
                <Table.Td />
                <Table.Td ta="right">
                  <Money value={sum(rows.map(shareOf))} />
                </Table.Td>
                <Table.Td />
              </Table.Tr>
            </Table.Tfoot>
          </Table>
        </Table.ScrollContainer>

        <IncomeForm>
          <Select
            label={t('incomes.household.splitBetween')}
            data={splitOptions}
            defaultValue={EQUAL_SPLIT}
            allowDeselect={false}
            w={180}
          />
        </IncomeForm>
      </Stack>
    </Card>
  )
}
