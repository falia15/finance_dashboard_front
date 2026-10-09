import { Container, Stack, Title } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { IncomeTypesSection } from '#/features/incomeTypes/IncomeTypesSection'

export function Settings() {
  const { t } = useTranslation()

  return (
    <Container py="xl">
      <Stack gap="xl">
        <Title order={1}>{t('settings.title')}</Title>

        <Stack gap="md">
          <Title order={2}>{t('incomeTypes.title')}</Title>
          <IncomeTypesSection />
        </Stack>
      </Stack>
    </Container>
  )
}
