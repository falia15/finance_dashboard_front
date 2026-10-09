import { ActionIcon, Group, Text } from '@mantine/core'
import { useTranslation } from 'react-i18next'

interface YearSelectorProps {
  year: number
}

// TODO (étape 9) : lire/écrire l'année dans l'URL (useSearchParams)
export function YearSelector({ year }: YearSelectorProps) {
  const { t } = useTranslation()

  return (
    <Group gap="xs">
      <ActionIcon
        variant="default"
        aria-label={t('incomes.previousYear')}
      >
        ‹
      </ActionIcon>
      <Text
        fw={600}
        size="lg"
      >
        {year}
      </Text>
      <ActionIcon
        variant="default"
        aria-label={t('incomes.nextYear')}
      >
        ›
      </ActionIcon>
    </Group>
  )
}
