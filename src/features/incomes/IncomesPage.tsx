import { Container, Group, Stack, Text, Title } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { HouseholdIncomesSection } from './HouseholdIncomesSection'
import { Money } from './Money'
import { ProfileIncomesSection } from './ProfileIncomesSection'
import { YearSelector } from './YearSelector'
import { mockHouseholdIncomes, mockIncomes, shareOf, sum } from './mockData'

export function IncomesPage() {
  const { t } = useTranslation()
  // TODO (étape 11) : total annuel renvoyé par l'API
  const annualTotal = sum([
    ...mockIncomes.map((income) => income.amount),
    ...mockHouseholdIncomes.map(shareOf),
  ])

  return (
    <Container
      size="lg"
      py="xl"
    >
      <Stack gap="xl">
        <Group justify="space-between">
          <Title order={1}>{t('incomes.title')}</Title>
          {/* TODO (étape 9) : année de l'URL, année courante par défaut */}
          <YearSelector year={2026} />
        </Group>

        <Stack gap="md">
          <Title order={2}>{t('incomes.profile.title')}</Title>
          <ProfileIncomesSection />
        </Stack>

        <Stack gap="md">
          <Title order={2}>{t('incomes.household.title')}</Title>
          <HouseholdIncomesSection />
        </Stack>

        <Text
          ta="right"
          fw={700}
          size="lg"
        >
          {t('incomes.annualTotal')} <Money value={annualTotal} />
        </Text>
      </Stack>
    </Container>
  )
}
