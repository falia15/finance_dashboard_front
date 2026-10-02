import { Container, Title } from '@mantine/core'
import { useTranslation } from 'react-i18next'

export function IncomesPage() {
  const { t } = useTranslation()

  return (
    <Container py="xl">
      <Title order={1}>{t('incomes.title')}</Title>
    </Container>
  )
}
