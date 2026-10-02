import { useState } from 'react'
import { Button } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { ApiError } from '#/api/client'
import { ConfirmModal } from '#/components/ConfirmModal'
import { notifyError } from '#/lib/notifications'
import type { Household } from '#/features/households/api'
import { useDeleteHousehold } from '#/features/households/queries'

export function DeleteHouseholdButton({ household }: { household: Household }) {
  const { t } = useTranslation()
  const [opened, setOpened] = useState(false)
  const deleteHousehold = useDeleteHousehold()

  function handleConfirm() {
    deleteHousehold.mutate(household.id, {
      onSuccess: () => setOpened(false),
      // 422: incomes/expenses/fixed expenses are still attached to the
      // household
      onError: (error) =>
        notifyError(
          error instanceof ApiError && error.status === 422
            ? t('households.deleteBlocked')
            : t('households.deleteError'),
        ),
    })
  }

  return (
    <>
      <Button
        size="xs"
        variant="subtle"
        color="red"
        onClick={() => setOpened(true)}
      >
        {t('common.delete')}
      </Button>
      <ConfirmModal
        opened={opened}
        onClose={() => setOpened(false)}
        title={t('households.deleteTitle')}
        message={t('households.deleteConfirm', { name: household.name })}
        confirmLabel={t('common.delete')}
        loading={deleteHousehold.isPending}
        onConfirm={handleConfirm}
      />
    </>
  )
}
