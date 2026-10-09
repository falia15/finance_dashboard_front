import { ActionIcon, Group, Text } from '@mantine/core'
import { useTranslation } from 'react-i18next'

interface YearSelectorProps {
  year: number
  onChange: (year: number) => void
}

export function YearSelector({ year, onChange }: YearSelectorProps) {
  const { t } = useTranslation()

  return (
    <Group gap="xs">
      <ActionIcon
        variant="default"
        aria-label={t('incomes.previousYear')}
        onClick={() => onChange(year - 1)}
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
        onClick={() => onChange(year + 1)}
      >
        ›
      </ActionIcon>
    </Group>
  )
}
