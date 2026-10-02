import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert,
  Card,
  Container,
  Loader,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { ConfirmModal } from '#/components/ConfirmModal'
import { notifyError } from '#/lib/notifications'
import { useActiveProfile } from './ActiveProfileContext'
import { ProfileCard } from './ProfileCard'
import { useDeleteProfile, useProfiles } from './queries'
import type { Profile } from './api'

export function ProfileSelectPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { activeProfileId, setActiveProfileId } = useActiveProfile()
  const { data: profiles, isLoading, isError } = useProfiles()
  const deleteProfile = useDeleteProfile()
  const [profileToDelete, setProfileToDelete] = useState<Profile | null>(null)

  function handleSelect(profile: Profile) {
    setActiveProfileId(profile.id)
    navigate('/dashboard')
  }

  function handleConfirmDelete() {
    if (!profileToDelete) return
    deleteProfile.mutate(profileToDelete.id, {
      onSuccess: () => {
        if (profileToDelete.id === activeProfileId) {
          setActiveProfileId(null)
        }
        setProfileToDelete(null)
      },
      onError: () => notifyError(t('profiles.select.deleteError')),
    })
  }

  return (
    <Container py="xl">
      <Stack gap="lg">
        <Title order={1}>{t('profiles.select.title')}</Title>

        {isLoading && <Loader />}

        {isError && (
          <Alert
            color="red"
            title={t('profiles.select.loadError')}
          >
            {t('profiles.select.loadErrorHint')}
          </Alert>
        )}

        {profiles && (
          <SimpleGrid
            cols={{ base: 2, sm: 3, md: 4 }}
            spacing="md"
          >
            {profiles.map((profile) => (
              <ProfileCard
                key={profile.id}
                profile={profile}
                canDelete={profiles.length > 1}
                onSelect={() => handleSelect(profile)}
                onEdit={() => navigate(`/profiles/${profile.id}/edit`)}
                onDelete={() => setProfileToDelete(profile)}
              />
            ))}

            <Card
              withBorder
              padding="lg"
              radius="md"
              style={{ cursor: 'pointer' }}
              onClick={() => navigate('/profiles/new')}
            >
              <Stack
                align="center"
                justify="center"
                gap="sm"
                h="100%"
              >
                <Text size="xl">+</Text>
                <Text fw={500}>{t('profiles.select.newProfile')}</Text>
              </Stack>
            </Card>
          </SimpleGrid>
        )}

        <ConfirmModal
          opened={profileToDelete !== null}
          onClose={() => setProfileToDelete(null)}
          title={t('profiles.select.deleteTitle')}
          message={t('profiles.select.deleteConfirm', {
            name: profileToDelete?.name,
          })}
          confirmLabel={t('common.delete')}
          loading={deleteProfile.isPending}
          onConfirm={handleConfirmDelete}
        />
      </Stack>
    </Container>
  )
}
