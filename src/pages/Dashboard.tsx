import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Container, Stack, Text, Title } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { useActiveProfile } from '../features/profiles/ActiveProfileContext'
import { useCurrentProfile } from '../features/profiles/useCurrentProfile'

export function Dashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { setActiveProfileId } = useActiveProfile()
  const activeProfile = useCurrentProfile()

  // The stored profile has been deleted: pick another one
  useEffect(() => {
    if (activeProfile === null) {
      setActiveProfileId(null)
      navigate('/profiles', { replace: true })
    }
  }, [activeProfile, navigate, setActiveProfileId])

  return (
    <Container py="xl">
      <Stack gap="md">
        <Title order={1}>{t('dashboard.title')}</Title>
        <Text>
          {t('dashboard.activeProfile', { name: activeProfile?.name ?? '...' })}
        </Text>
      </Stack>
    </Container>
  )
}
