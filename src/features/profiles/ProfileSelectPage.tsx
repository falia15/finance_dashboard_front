import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Avatar,
  Button,
  Card,
  Container,
  Group,
  Loader,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useTranslation } from 'react-i18next'
import { useActiveProfile } from './ActiveProfileContext'
import { useDeleteProfile, useProfiles } from './queries'
import type { Profile } from './api'

export function ProfileSelectPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { setActiveProfileId } = useActiveProfile()
  const { data, isLoading, isError } = useProfiles()
  const deleteProfile = useDeleteProfile()
  const [profileToDelete, setProfileToDelete] = useState<Profile | null>(null)

  const profiles = data?.member ?? []
  const canDelete = profiles.length > 1

  function handleSelect(profile: Profile) {
    setActiveProfileId(profile.id)
    navigate('/dashboard')
  }

  async function handleConfirmDelete() {
    if (!profileToDelete) return
    try {
      await deleteProfile.mutateAsync(profileToDelete.id)
      setProfileToDelete(null)
    } catch {
      notifications.show({ color: 'red', title: t('common.error'), message: t('profiles.select.deleteError') })
    }
  }

  return (
    <Container py="xl">
      <Stack gap="lg">
        <Title order={1}>{t('profiles.select.title')}</Title>

        {isLoading && <Loader />}

        {isError && (
          <Alert color="red" title={t('profiles.select.loadError')}>
            {t('profiles.select.loadErrorHint')}
          </Alert>
        )}

        {data && (
          <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="md">
            {profiles.map((profile) => (
              <Card key={profile.id} withBorder padding="lg" radius="md">
                <Stack align="center" gap="sm">
                  <Avatar
                    size="lg"
                    radius="xl"
                    variant="filled"
                    color={profile.color ?? undefined}
                    autoContrast
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleSelect(profile)}
                  >
                    {profile.name.slice(0, 2).toUpperCase()}
                  </Avatar>
                  <Text fw={500} style={{ cursor: 'pointer' }} onClick={() => handleSelect(profile)}>
                    {profile.name}
                  </Text>
                  <Group gap="xs">
                    <Button size="xs" variant="subtle" onClick={() => navigate(`/profiles/${profile.id}/edit`)}>
                      {t('common.edit')}
                    </Button>
                    <Tooltip label={t('profiles.select.cannotDeleteLast')} disabled={canDelete}>
                      <Button
                        size="xs"
                        variant="subtle"
                        color="red"
                        disabled={!canDelete}
                        onClick={() => setProfileToDelete(profile)}
                      >
                        {t('common.delete')}
                      </Button>
                    </Tooltip>
                  </Group>
                </Stack>
              </Card>
            ))}

            <Card
              withBorder
              padding="lg"
              radius="md"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/profiles/new')}
            >
              <Stack align="center" justify="center" gap="sm" h="100%">
                <Text size="xl">+</Text>
                <Text fw={500}>{t('profiles.select.newProfile')}</Text>
              </Stack>
            </Card>
          </SimpleGrid>
        )}

        <Modal opened={profileToDelete !== null} onClose={() => setProfileToDelete(null)} title={t('profiles.select.deleteTitle')}>
          <Stack gap="md">
            <Text>{t('profiles.select.deleteConfirm', { name: profileToDelete?.name })}</Text>
            <Group justify="flex-end">
              <Button variant="default" onClick={() => setProfileToDelete(null)}>
                {t('common.cancel')}
              </Button>
              <Button color="red" loading={deleteProfile.isPending} onClick={handleConfirmDelete}>
                {t('common.delete')}
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Stack>
    </Container>
  )
}
