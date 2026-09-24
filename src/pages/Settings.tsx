import { Container, Title } from '@mantine/core'
import { useTranslation } from 'react-i18next'

export function Settings() {
  const { t } = useTranslation()

  return (
    <Container py="xl">
      <Title order={1}>{t('settings.title')}</Title>
    </Container>
  )
}
