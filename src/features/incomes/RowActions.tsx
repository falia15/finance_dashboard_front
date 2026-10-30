import { useState } from 'react'
import { Button, Group, Modal } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { ConfirmModal } from '#/components/ConfirmModal'
import { notifyError } from '#/lib/notifications'
import { IncomeForm } from './IncomeForm'
import type { IncomeFormValues } from './incomeFormValues'
import { useDeleteIncome, useUpdateIncome } from './queries'

interface RowActionsProps {
  incomeId: number
  /** Current values of the row, to prefill the edit form */
  values: IncomeFormValues
  /** Row label in the delete confirmation, e.g. "Salaire — janvier" */
  label: string
  /** "Split between" options, household rows only */
  splitOptions?: { value: string; label: string }[]
}

/** Edit (form in a modal) and delete (after confirmation) an income row. */
export function RowActions({
  incomeId,
  values,
  label,
  splitOptions,
}: RowActionsProps) {
  const { t } = useTranslation()
  const [editing, setEditing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const updateIncome = useUpdateIncome()
  const deleteIncome = useDeleteIncome()

  function handleDelete() {
    deleteIncome.mutate(incomeId, {
      onSuccess: () => setDeleting(false),
      onError: () => notifyError(t('incomes.deleteError')),
    })
  }

  return (
    <>
      <Group
        gap="xs"
        justify="flex-end"
        wrap="nowrap"
      >
        <Button
          variant="subtle"
          size="compact-xs"
          aria-label={`${t('common.edit')} ${label}`}
          onClick={() => setEditing(true)}
        >
          {t('common.edit')}
        </Button>
        <Button
          variant="subtle"
          color="red"
          size="compact-xs"
          aria-label={`${t('common.delete')} ${label}`}
          onClick={() => setDeleting(true)}
        >
          {t('common.delete')}
        </Button>
      </Group>

      <Modal
        opened={editing}
        onClose={() => setEditing(false)}
        title={t('incomes.editTitle')}
        size="auto"
      >
        <IncomeForm
          initialValues={values}
          splitOptions={splitOptions}
          submitLabel={t('incomes.form.save')}
          onCancel={() => setEditing(false)}
          onSubmit={async (input) => {
            await updateIncome.mutateAsync({ id: incomeId, input })
            setEditing(false)
          }}
        />
      </Modal>

      <ConfirmModal
        opened={deleting}
        onClose={() => setDeleting(false)}
        title={t('incomes.deleteTitle')}
        message={t('incomes.deleteConfirm', { label })}
        confirmLabel={t('common.delete')}
        loading={deleteIncome.isPending}
        onConfirm={handleDelete}
      />
    </>
  )
}
