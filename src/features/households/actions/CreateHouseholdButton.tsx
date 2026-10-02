import { useState } from 'react'
import { Button } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { TextPromptModal } from '../../../components/TextPromptModal'
import { notifyError } from '../../../lib/notifications'
import { useCreateHousehold } from '../queries'

export function CreateHouseholdButton() {
  const { t } = useTranslation()
  const [opened, setOpened] = useState(false)
  const createHousehold = useCreateHousehold()

  return (
    <>
      <Button onClick={() => setOpened(true)}>{t('households.newHousehold')}</Button>
      <TextPromptModal
        opened={opened}
        onClose={() => setOpened(false)}
        title={t('households.newHousehold')}
        label={t('households.name')}
        placeholder={t('households.namePlaceholder')}
        requiredMessage={t('households.nameRequired')}
        submitLabel={t('households.create')}
        loading={createHousehold.isPending}
        onSubmit={(name) => createHousehold.mutateAsync(name, { onError: () => notifyError(t('households.saveError')) })}
      />
    </>
  )
}
