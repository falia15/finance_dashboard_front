import { Button, Group } from '@mantine/core'
import { useTranslation } from 'react-i18next'

// TODO (étape 10) : édition en modale, suppression avec confirmation
export function RowActions() {
  const { t } = useTranslation()

  return (
    <Group
      gap="xs"
      justify="flex-end"
      wrap="nowrap"
    >
      <Button
        variant="subtle"
        size="compact-xs"
      >
        {t('common.edit')}
      </Button>
      <Button
        variant="subtle"
        color="red"
        size="compact-xs"
      >
        {t('common.delete')}
      </Button>
    </Group>
  )
}
