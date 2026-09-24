import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Container, Group, Stack, Text, Title } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { useActiveProfile } from '../features/profiles/ActiveProfileContext'
import { useProfiles } from '../features/profiles/queries'

export function Dashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { activeProfileId, setActiveProfileId } = useActiveProfile()
  const { data, isLoading } = useProfiles()
  const activeProfile = data?.member.find((profile) => profile.id === activeProfileId)

  useEffect(() => {
    if (!isLoading && data && !activeProfile) {
      setActiveProfileId(null)
      navigate('/profiles', { replace: true })
    }
  }, [isLoading, data, activeProfile, navigate, setActiveProfileId])

  function handleChangeProfile() {
    setActiveProfileId(null)
    navigate('/profiles')
  }

  return (
    <Container py="xl">
      <Stack gap="md">
        <Title order={1}>{t('dashboard.title')}</Title>
        <Text>{t('dashboard.activeProfile', { name: activeProfile?.name ?? '...' })}</Text>
        <Group>
          <Button variant="default" onClick={handleChangeProfile}>
            {t('dashboard.changeProfile')}
          </Button>
        </Group>
      </Stack>
    </Container>
  )
}
