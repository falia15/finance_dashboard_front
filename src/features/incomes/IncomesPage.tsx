import {
  Alert,
  Container,
  Group,
  Loader,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router-dom'
import { HouseholdIncomesSection } from './HouseholdIncomesSection'
import { Money } from './Money'
import { ProfileIncomesSection } from './ProfileIncomesSection'
import { YearSelector } from './YearSelector'
import { useProfileIncomes } from './queries'

/** `?year=` of the URL (kept on reload and history), current year by default. */
function useYearParam() {
  const [searchParams, setSearchParams] = useSearchParams()
  const param = Number(searchParams.get('year'))
  const year =
    Number.isInteger(param) && param >= 2000 && param <= 2100
      ? param
      : new Date().getFullYear()

  function setYear(value: number) {
    setSearchParams((params) => {
      params.set('year', String(value))
      return params
    })
  }

  return [year, setYear] as const
}

export function IncomesPage() {
  const { t } = useTranslation()
  const [year, setYear] = useYearParam()
  const { data, isLoading, isError } = useProfileIncomes(year)

  return (
    <Container
      size="lg"
      py="xl"
    >
      <Stack gap="xl">
        <Group justify="space-between">
          <Title order={1}>{t('incomes.title')}</Title>
          <YearSelector
            year={year}
            onChange={setYear}
          />
        </Group>

        {isLoading && <Loader />}

        {isError && (
          <Alert
            color="red"
            title={t('incomes.loadError')}
          >
            {t('profiles.select.loadErrorHint')}
          </Alert>
        )}

        {data && (
          <>
            <Stack gap="md">
              <Title order={2}>{t('incomes.profile.title')}</Title>
              <ProfileIncomesSection
                year={year}
                data={data}
              />
            </Stack>

            <Stack gap="md">
              <Title order={2}>{t('incomes.household.title')}</Title>
              <HouseholdIncomesSection
                year={year}
                shares={data.months.flatMap((month) => month.householdShares)}
              />
            </Stack>

            <Text
              ta="right"
              fw={700}
              size="lg"
            >
              {t('incomes.annualTotal')} <Money value={data.totals.total} />
            </Text>
          </>
        )}
      </Stack>
    </Container>
  )
}
