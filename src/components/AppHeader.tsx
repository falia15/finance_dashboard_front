import { Group, SegmentedControl } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import type { Language } from '../i18n'

export function AppHeader() {
  const { t, i18n } = useTranslation()

  return (
    <Group h="100%" px="md" justify="flex-end">
      <SegmentedControl
        size="xs"
        aria-label={t('nav.language')}
        value={i18n.resolvedLanguage ?? 'en'}
        onChange={(language) => void i18n.changeLanguage(language as Language)}
        data={[
          { value: 'en', label: 'EN' },
          { value: 'fr', label: 'FR' },
        ]}
      />
    </Group>
  )
}
