import { useState } from 'react'
import { Button } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { TextPromptModal } from '../../../components/TextPromptModal'
import { notifyError } from '../../../lib/notifications'
import type { Household } from '../api'
import { useRenameHousehold } from '../queries'

export function RenameHouseholdButton({ household }: { household: Household }) {
  const { t } = useTranslation()
  const [opened, setOpened] = useState(false)
  const renameHousehold = useRenameHousehold()

  return (
    <>
      <Button
        size="xs"
        variant="subtle"
        onClick={() => setOpened(true)}
      >
        {t('households.rename')}
      </Button>
      <TextPromptModal
        opened={opened}
        onClose={() => setOpened(false)}
        title={t('households.renameTitle')}
        label={t('households.name')}
        requiredMessage={t('households.nameRequired')}
        submitLabel={t('households.save')}
        initialValue={household.name}
        loading={renameHousehold.isPending}
        onSubmit={(name) =>
          renameHousehold.mutateAsync(
            { id: household.id, name },
            { onError: () => notifyError(t('households.saveError')) },
          )
        }
      />
    </>
  )
}
