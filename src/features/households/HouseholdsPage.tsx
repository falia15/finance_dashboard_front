import { useState } from 'react'
import { Alert, Button, Container, Group, Loader, Stack, Text, Title } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useTranslation } from 'react-i18next'
import { useActiveProfile } from '../profiles/ActiveProfileContext'
import { useProfiles } from '../profiles/queries'
import { HouseholdCard } from './HouseholdCard'
import { useCreateHousehold, useHouseholds } from './queries'
import { TextPromptModal } from './TextPromptModal'

export function HouseholdsPage() {
  const { t } = useTranslation()
  const { activeProfileId } = useActiveProfile()
  const { data, isLoading, isError } = useHouseholds()
  const { data: profilesData } = useProfiles()
  const createHousehold = useCreateHousehold()
  const [createOpened, setCreateOpened] = useState(false)

  const households = data?.member ?? []
  const profiles = profilesData?.member ?? []
  const activeProfileIri = profiles.find((profile) => profile.id === activeProfileId)?.['@id'] ?? ''

  async function handleCreate(name: string) {
    try {
      await createHousehold.mutateAsync(name)
    } catch (error) {
      notifications.show({ color: 'red', title: t('common.error'), message: t('households.saveError') })
      throw error
    }
  }

  return (
    <Container py="xl">
      <Stack gap="lg">
        <Group justify="space-between">
          <Title order={1}>{t('households.title')}</Title>
          <Button onClick={() => setCreateOpened(true)}>{t('households.newHousehold')}</Button>
        </Group>

        {isLoading && <Loader />}

        {isError && (
          <Alert color="red" title={t('households.loadError')}>
            {t('profiles.select.loadErrorHint')}
          </Alert>
        )}

        {data && households.length === 0 && <Text c="dimmed">{t('households.empty')}</Text>}

        {households.map((household) => (
          <HouseholdCard key={household.id} household={household} activeProfileIri={activeProfileIri} profiles={profiles} />
        ))}
      </Stack>

      <TextPromptModal
        opened={createOpened}
        onClose={() => setCreateOpened(false)}
        title={t('households.newHousehold')}
        label={t('households.name')}
        placeholder={t('households.namePlaceholder')}
        requiredMessage={t('households.nameRequired')}
        submitLabel={t('households.create')}
        loading={createHousehold.isPending}
        onSubmit={handleCreate}
      />
    </Container>
  )
}
