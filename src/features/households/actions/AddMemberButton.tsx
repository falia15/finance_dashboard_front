import { useState } from 'react'
import { Button } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { TextPromptModal } from '../../../components/TextPromptModal'
import { notifyError } from '../../../lib/notifications'
import type { Household } from '../api'
import { useAddExternalMember } from '../queries'

export function AddMemberButton({ household }: { household: Household }) {
  const { t } = useTranslation()
  const [opened, setOpened] = useState(false)
  const addMember = useAddExternalMember()

  return (
    <>
      <Button
        size="xs"
        variant="light"
        onClick={() => setOpened(true)}
      >
        {t('households.members.add')}
      </Button>
      <TextPromptModal
        opened={opened}
        onClose={() => setOpened(false)}
        title={t('households.members.addTitle')}
        label={t('households.members.label')}
        placeholder={t('households.members.labelPlaceholder')}
        requiredMessage={t('households.members.labelRequired')}
        submitLabel={t('households.members.addSubmit')}
        loading={addMember.isPending}
        onSubmit={(externalLabel) =>
          addMember.mutateAsync(
            { householdId: household.id, externalLabel },
            { onError: () => notifyError(t('households.members.addError')) },
          )
        }
      />
    </>
  )
}
