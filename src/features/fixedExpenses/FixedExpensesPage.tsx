import {
  Alert,
  Card,
  Container,
  Group,
  Loader,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { useYearParam } from '#/lib/useYearParam'
import { useActiveProfile } from '#/features/profiles/ActiveProfileContext'
import { Money } from '#/features/incomes/Money'
import { YearSelector } from '#/features/incomes/YearSelector'
import { AddFixedExpenseForm } from './AddFixedExpenseForm'
import { FixedExpenseGrid } from './FixedExpenseGrid'
import { HouseholdFixedExpensesSection } from './HouseholdFixedExpensesSection'
import { useCreateFixedExpense, useProfileFixedExpenses } from './queries'

export function FixedExpensesPage() {
  const { t } = useTranslation()
  const [year, setYear] = useYearParam()
  const { activeProfileId } = useActiveProfile()
  const { data, isLoading, isError } = useProfileFixedExpenses(year)
  const createFixedExpense = useCreateFixedExpense()

  return (
    <Container
      size="xl"
      py="xl"
    >
      <Stack gap="xl">
        <Group justify="space-between">
          <Title order={1}>{t('fixedExpenses.title')}</Title>
          <YearSelector
            year={year}
            onChange={setYear}
          />
        </Group>

        {isLoading && <Loader />}

        {isError && (
          <Alert
            color="red"
            title={t('fixedExpenses.loadError')}
          >
            {t('profiles.select.loadErrorHint')}
          </Alert>
        )}

        {data && (
          <>
            <Stack gap="md">
              <Title order={2}>{t('fixedExpenses.profile.title')}</Title>
              <Card withBorder>
                <Stack gap="md">
                  {data.lines.length === 0 ? (
                    <Text c="dimmed">{t('fixedExpenses.empty')}</Text>
                  ) : (
                    <FixedExpenseGrid
                      year={year}
                      lines={data.lines}
                      monthTotals={data.months.map((month) => month.individual)}
                      total={data.totals.individual}
                    />
                  )}
                  <AddFixedExpenseForm
                    year={year}
                    onSubmit={(input) =>
                      createFixedExpense.mutateAsync({
                        owner: { profile: `/api/profiles/${activeProfileId}` },
                        year,
                        input,
                      })
                    }
                  />
                </Stack>
              </Card>
            </Stack>

            <Stack gap="md">
              <Title order={2}>{t('fixedExpenses.household.title')}</Title>
              <HouseholdFixedExpensesSection
                year={year}
                grids={data.households}
              />
            </Stack>

            <Text
              ta="right"
              fw={700}
              size="lg"
            >
              {t('fixedExpenses.annualTotal')}{' '}
              <Money value={data.totals.total} />
            </Text>
          </>
        )}
      </Stack>
    </Container>
  )
}
