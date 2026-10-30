import { Anchor, Card, Loader, Stack, Table, Text, Title } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { formatMonth } from '#/lib/dates'
import { sumAmounts } from '#/lib/money'
import type { Household } from '#/features/households/api'
import { useHouseholds } from '#/features/households/queries'
import { useMemberName } from '#/features/households/useMemberName'
import type { HouseholdShare, Income } from './api'
import { IncomeForm } from './IncomeForm'
import { EQUAL_SPLIT } from './incomeFormValues'
import { Money } from './Money'
import { RowActions } from './RowActions'
import { useCreateIncome, useHouseholdIncomes } from './queries'
import { useIncomeTypeName } from './useIncomeTypeName'

interface HouseholdIncomesSectionProps {
  year: number
  /** The profile's shares of the year, from `GET /profiles/{id}/incomes` */
  shares: HouseholdShare[]
}

/** One table per household of the active profile. */
export function HouseholdIncomesSection({
  year,
  shares,
}: HouseholdIncomesSectionProps) {
  const { t } = useTranslation()
  const { data: households, isLoading, isError } = useHouseholds()

  if (isLoading) return <Loader />
  if (isError) return <Text c="red">{t('households.loadError')}</Text>

  if (households?.length === 0) {
    return (
      <Text c="dimmed">
        {t('incomes.household.noHousehold')}{' '}
        <Anchor
          component={Link}
          to="/households"
        >
          {t('nav.households')}
        </Anchor>
      </Text>
    )
  }

  return households?.map((household) => (
    <HouseholdIncomesCard
      key={household.id}
      household={household}
      year={year}
      shares={shares}
    />
  ))
}

interface HouseholdIncomesCardProps {
  household: Household
  year: number
  shares: HouseholdShare[]
}

function HouseholdIncomesCard({
  household,
  year,
  shares,
}: HouseholdIncomesCardProps) {
  const { t, i18n } = useTranslation()
  const memberName = useMemberName()
  const typeName = useIncomeTypeName()
  const createIncome = useCreateIncome()
  const { data: rows = [], isError } = useHouseholdIncomes(household.id, year)

  // Part calculée par l'API (arrondi au centime, reste au propriétaire)
  const shareOf = (income: Income) =>
    shares.find((share) => share.incomeId === income.id)?.share ?? '0.00'

  const nameOf = (iri: string) => {
    const member = household.members.find((member) => member['@id'] === iri)
    return member ? memberName(member) : ''
  }

  /** Equal split + active members, and the row's own member even if gone. */
  function splitOptions(currentMember?: string | null) {
    return [
      { value: EQUAL_SPLIT, label: t('incomes.household.splitEqually') },
      ...household.members
        .filter((member) => !member.leftAt || member['@id'] === currentMember)
        .map((member) => ({ value: member['@id'], label: memberName(member) })),
    ]
  }

  return (
    <Card withBorder>
      <Stack gap="md">
        <Title order={3}>{household.name}</Title>

        {isError && <Text c="red">{t('incomes.loadError')}</Text>}

        {rows.length === 0 ? (
          <Text c="dimmed">{t('incomes.household.empty')}</Text>
        ) : (
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
                {rows.map((row) => {
                  const monthName = formatMonth(row.month, i18n.language)
                  return (
                    <Table.Tr key={row.id}>
                      <Table.Td tt="capitalize">{monthName}</Table.Td>
                      <Table.Td>{typeName(row.type)}</Table.Td>
                      <Table.Td ta="right">
                        <Money value={row.amount} />
                      </Table.Td>
                      <Table.Td>
                        {row.householdMember
                          ? nameOf(row.householdMember)
                          : t('incomes.household.splitEquallyBetween', {
                              divisor: row.appliedDivisor,
                            })}
                      </Table.Td>
                      <Table.Td
                        ta="right"
                        fw={600}
                      >
                        <Money value={shareOf(row)} />
                      </Table.Td>
                      <Table.Td>
                        <RowActions
                          incomeId={row.id}
                          label={`${typeName(row.type)} — ${monthName}`}
                          splitOptions={splitOptions(row.householdMember)}
                          values={{
                            month: String(row.month),
                            type: row.type,
                            amount: row.amount,
                            householdMember: row.householdMember ?? EQUAL_SPLIT,
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
                    <Money value={sumAmounts(rows.map((row) => row.amount))} />
                  </Table.Td>
                  <Table.Td />
                  <Table.Td ta="right">
                    <Money value={sumAmounts(rows.map(shareOf))} />
                  </Table.Td>
                  <Table.Td />
                </Table.Tr>
              </Table.Tfoot>
            </Table>
          </Table.ScrollContainer>
        )}

        <IncomeForm
          submitLabel={t('incomes.form.add')}
          splitOptions={splitOptions()}
          onSubmit={(input) =>
            createIncome.mutateAsync({
              owner: { household: household['@id'] },
              year,
              input,
            })
          }
        />
      </Stack>
    </Card>
  )
}
