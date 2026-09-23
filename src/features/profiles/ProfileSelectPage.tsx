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
import { useActiveProfile } from './ActiveProfileContext'
import { useDeleteProfile, useProfiles } from './queries'
import type { Profile } from './api'

export function ProfileSelectPage() {
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
      notifications.show({ color: 'red', title: 'Erreur', message: 'Impossible de supprimer le profil' })
    }
  }

  return (
    <Container py="xl">
      <Stack gap="lg">
        <Title order={1}>Qui utilise l'app ?</Title>

        {isLoading && <Loader />}

        {isError && (
          <Alert color="red" title="Impossible de charger les profils">
            Vérifie que l'API est bien accessible.
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
                    style={{ cursor: 'pointer', backgroundColor: profile.color ?? undefined, color: '#fff' }}
                    onClick={() => handleSelect(profile)}
                  >
                    {profile.name.slice(0, 2).toUpperCase()}
                  </Avatar>
                  <Text fw={500} style={{ cursor: 'pointer' }} onClick={() => handleSelect(profile)}>
                    {profile.name}
                  </Text>
                  <Group gap="xs">
                    <Button size="xs" variant="subtle" onClick={() => navigate(`/profiles/${profile.id}/edit`)}>
                      Modifier
                    </Button>
                    <Tooltip label="Impossible de supprimer le dernier profil" disabled={canDelete}>
                      <Button
                        size="xs"
                        variant="subtle"
                        color="red"
                        disabled={!canDelete}
                        onClick={() => setProfileToDelete(profile)}
                      >
                        Supprimer
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
                <Text fw={500}>Nouveau profil</Text>
              </Stack>
            </Card>
          </SimpleGrid>
        )}

        <Modal opened={profileToDelete !== null} onClose={() => setProfileToDelete(null)} title="Supprimer le profil">
          <Stack gap="md">
            <Text>Supprimer le profil « {profileToDelete?.name} » ? Cette action est définitive.</Text>
            <Group justify="flex-end">
              <Button variant="default" onClick={() => setProfileToDelete(null)}>
                Annuler
              </Button>
              <Button color="red" loading={deleteProfile.isPending} onClick={handleConfirmDelete}>
                Supprimer
              </Button>
            </Group>
          </Stack>
        </Modal>
      </Stack>
    </Container>
  )
}
