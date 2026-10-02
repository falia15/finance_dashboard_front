import { Alert, Container, Group, Loader, Stack, Text, Title } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { HouseholdCard } from './HouseholdCard'
import { CreateHouseholdButton } from './actions/CreateHouseholdButton'
import { useHouseholds } from './queries'

export function HouseholdsPage() {
  const { t } = useTranslation()
  const { data: households, isLoading, isError } = useHouseholds()

  return (
    <Container py="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={1}>{t('households.title')}</Title>
          <CreateHouseholdButton />
        </Group>

        {isLoading && <Loader />}

        {isError && (
          <Alert color="red" title={t('households.loadError')}>
            {t('profiles.select.loadErrorHint')}
          </Alert>
        )}

        {households?.length === 0 && <Text c="dimmed">{t('households.empty')}</Text>}

        {households?.map((household) => (
          <HouseholdCard key={household.id} household={household} />
        ))}
      </Stack>
    </Container>
  )
}
