import { useState } from 'react'
import { Alert, Button, Container, Group, Loader, Stack, Text, Title } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useTranslation } from 'react-i18next'
import { useActiveProfile } from '../profiles/ActiveProfileContext'
import { useProfiles } from '../profiles/queries'
import { HouseholdCard } from './HouseholdCard'
import { createHousehold, useHouseholds } from './queries'
import { TextPromptModal } from './TextPromptModal'

export function HouseholdsPage() {
  const { t } = useTranslation()
  const { activeProfileId } = useActiveProfile()
  const { data, isLoading, isError, reload } = useHouseholds()
  const { data: profilesData } = useProfiles()
  const [createOpened, setCreateOpened] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const households = data?.member ?? []
  const profiles = profilesData?.member ?? []
  const activeProfileIri = profiles.find((profile) => profile.id === activeProfileId)?.['@id'] ?? ''

  async function handleCreate(name: string) {
    setIsCreating(true)
    try {
      await createHousehold(name)
      await reload()
    } catch (error) {
      notifications.show({ color: 'red', title: t('common.error'), message: t('households.saveError') })
      throw error
    } finally {
      setIsCreating(false)
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
          <HouseholdCard
            key={household.id}
            household={household}
            activeProfileIri={activeProfileIri}
            profiles={profiles}
            onChanged={reload}
          />
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
        loading={isCreating}
        onSubmit={handleCreate}
      />
    </Container>
  )
}
