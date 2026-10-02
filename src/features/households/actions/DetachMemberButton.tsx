import { useState } from 'react'
import { Button } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { ConfirmModal } from '#/components/ConfirmModal'
import { todayIsoDate } from '#/lib/dates'
import { notifyError } from '#/lib/notifications'
import type { HouseholdMember } from '#/features/households/api'
import { useDetachMember } from '#/features/households/queries'

/** Detaches the member as of today. */
export function DetachMemberButton({
  member,
  name,
}: {
  member: HouseholdMember
  name: string
}) {
  const { t } = useTranslation()
  const [opened, setOpened] = useState(false)
  const detachMember = useDetachMember()

  function handleConfirm() {
    detachMember.mutate(
      { id: member.id, leftAt: todayIsoDate() },
      {
        onSuccess: () => setOpened(false),
        onError: () => notifyError(t('households.members.detachError')),
      },
    )
  }

  return (
    <>
      <Button
        size="xs"
        variant="subtle"
        color="red"
        onClick={() => setOpened(true)}
      >
        {t('households.members.detach')}
      </Button>
      <ConfirmModal
        opened={opened}
        onClose={() => setOpened(false)}
        title={t('households.members.detachTitle')}
        message={t('households.members.detachConfirm', { name })}
        confirmLabel={t('households.members.detach')}
        loading={detachMember.isPending}
        onConfirm={handleConfirm}
      />
    </>
  )
}
