import { Anchor, Card, Loader, Stack, Text, Title } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import type { Household } from '#/features/households/api'
import { useHouseholds } from '#/features/households/queries'
import { useMemberName } from '#/features/households/useMemberName'
import { EQUAL_SPLIT } from '#/features/incomes/incomeFormValues'
import type { HouseholdFixedExpenseGrid } from './api'
import { AddFixedExpenseForm } from './AddFixedExpenseForm'
import { FixedExpenseGrid, type GridLine } from './FixedExpenseGrid'
import { useCreateFixedExpense } from './queries'

interface HouseholdFixedExpensesSectionProps {
  year: number
  /** From `GET /profiles/{id}/fixed_expenses`: one grid per household */
  grids: HouseholdFixedExpenseGrid[]
}

/** One card per household of the active profile. */
export function HouseholdFixedExpensesSection({
  year,
  grids,
}: HouseholdFixedExpensesSectionProps) {
  const { t } = useTranslation()
  const { data: households, isLoading, isError } = useHouseholds()

  if (isLoading) return <Loader />
  if (isError) return <Text c="red">{t('households.loadError')}</Text>

  if (households?.length === 0) {
    return (
      <Text c="dimmed">
        {t('fixedExpenses.household.noHousehold')}{' '}
        <Anchor
          component={Link}
          to="/households"
        >
          {t('nav.households')}
        </Anchor>
      </Text>
    )
  }

  // Names and members come from the households list, figures from the grids
  return households?.map((household) => {
    const grid = grids.find((item) => item.household === household['@id'])
    return grid ? (
      <HouseholdFixedExpensesCard
        key={household.id}
        household={household}
        grid={grid}
        year={year}
      />
    ) : null
  })
}

interface HouseholdFixedExpensesCardProps {
  household: Household
  grid: HouseholdFixedExpenseGrid
  year: number
}

function HouseholdFixedExpensesCard({
  household,
  grid,
  year,
}: HouseholdFixedExpensesCardProps) {
  const { t } = useTranslation()
  const memberName = useMemberName()
  const createFixedExpense = useCreateFixedExpense()

  function splitLabel(line: GridLine) {
    if (!line.householdMember) return t('fixedExpenses.household.splitEqually')
    const member = household.members.find(
      (item) => item['@id'] === line.householdMember,
    )
    return member ? memberName(member) : ''
  }

  /** Equal split + active members, and the line's own member even if gone. */
  function splitOptions(currentMember?: string | null) {
    return [
      { value: EQUAL_SPLIT, label: t('fixedExpenses.household.splitEqually') },
      ...household.members
        .filter((member) => !member.leftAt || member['@id'] === currentMember)
        .map((member) => ({ value: member['@id'], label: memberName(member) })),
    ]
  }

  return (
    <Card withBorder>
      <Stack gap="md">
        <Title order={3}>{household.name}</Title>

        {grid.lines.length === 0 ? (
          <Text c="dimmed">{t('fixedExpenses.empty')}</Text>
        ) : (
          <FixedExpenseGrid
            year={year}
            lines={grid.lines}
            monthTotals={grid.months.map((month) => month.total)}
            total={grid.totals.total}
            household={{
              shareMonths: grid.months.map((month) => month.share),
              shareTotal: grid.totals.share,
              splitLabel,
              splitOptions,
            }}
          />
        )}

        <AddFixedExpenseForm
          year={year}
          splitOptions={splitOptions()}
          onSubmit={(input) =>
            createFixedExpense.mutateAsync({
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
