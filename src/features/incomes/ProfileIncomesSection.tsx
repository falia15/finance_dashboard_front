import { Card, Stack, Table } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { formatMonth } from '#/lib/dates'
import { IncomeForm } from './IncomeForm'
import { Money } from './Money'
import { RowActions } from './RowActions'
import { incomeTypeName, mockIncomes, sum } from './mockData'

export function ProfileIncomesSection() {
  const { t, i18n } = useTranslation()
  // TODO (étape 10) : lignes `months[].incomes` du GET /profiles/{id}/incomes?year=
  const rows = mockIncomes

  return (
    <Card withBorder>
      <Stack gap="md">
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
              {rows.map((row) => (
                <Table.Tr key={row.id}>
                  <Table.Td tt="capitalize">
                    {formatMonth(row.month, i18n.language)}
                  </Table.Td>
                  <Table.Td>{incomeTypeName(row.type)}</Table.Td>
                  <Table.Td
                    ta="right"
                    fw={600}
                  >
                    <Money value={row.amount} />
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
              </Table.Tr>
            </Table.Tfoot>
          </Table>
        </Table.ScrollContainer>

        <IncomeForm />
      </Stack>
    </Card>
  )
}
