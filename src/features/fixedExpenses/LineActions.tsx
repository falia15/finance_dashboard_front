import { useState } from 'react'
import { ActionIcon, Menu } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { ConfirmModal } from '#/components/ConfirmModal'
import { notifyError } from '#/lib/notifications'
import { ApplyToYearModal } from './actions/ApplyToYearModal'
import { DeactivateModal } from './actions/DeactivateModal'
import { EditLineModal } from './actions/EditLineModal'
import type { SplitOption } from './AddFixedExpenseForm'
import type { GridLine } from './FixedExpenseGrid'
import { useDeleteFixedExpense, useUpdateFixedExpense } from './queries'

type Dialog = 'applyToYear' | 'edit' | 'deactivate' | 'delete'

interface LineActionsProps {
  line: GridLine
  year: number
  splitOptions?: SplitOption[]
}

/** Menu of a grid line; one dialog at a time, mounted only while open. */
export function LineActions({ line, year, splitOptions }: LineActionsProps) {
  const { t } = useTranslation()
  const [dialog, setDialog] = useState<Dialog | null>(null)
  const updateFixedExpense = useUpdateFixedExpense()
  const deleteFixedExpense = useDeleteFixedExpense()
  const close = () => setDialog(null)
  const isDeactivated = line.endYear !== null

  function handleReactivate() {
    updateFixedExpense.mutate(
      { id: line.id, input: { endYear: null, endMonth: null } },
      { onError: () => notifyError(t('fixedExpenses.saveError')) },
    )
  }

  function handleDelete() {
    deleteFixedExpense.mutate(line.id, {
      onSuccess: close,
      onError: () => notifyError(t('fixedExpenses.deleteError')),
    })
  }

  return (
    <>
      <Menu position="bottom-end">
        <Menu.Target>
          <ActionIcon
            variant="subtle"
            aria-label={t('fixedExpenses.actions', { label: line.label })}
          >
            ⋯
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            disabled={line.amounts.length === 0}
            onClick={() => setDialog('applyToYear')}
          >
            {t('fixedExpenses.applyToYear.action')}
          </Menu.Item>
          <Menu.Item onClick={() => setDialog('edit')}>
            {t('fixedExpenses.edit.action')}
          </Menu.Item>
          {isDeactivated ? (
            <Menu.Item onClick={handleReactivate}>
              {t('fixedExpenses.reactivate')}
            </Menu.Item>
          ) : (
            <Menu.Item onClick={() => setDialog('deactivate')}>
              {t('fixedExpenses.deactivate.action')}
            </Menu.Item>
          )}
          <Menu.Divider />
          <Menu.Item
            color="red"
            onClick={() => setDialog('delete')}
          >
            {t('fixedExpenses.delete.action')}
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      {dialog === 'applyToYear' && (
        <ApplyToYearModal
          line={line}
          year={year}
          onClose={close}
        />
      )}
      {dialog === 'edit' && (
        <EditLineModal
          line={line}
          splitOptions={splitOptions}
          onClose={close}
        />
      )}
      {dialog === 'deactivate' && (
        <DeactivateModal
          line={line}
          year={year}
          onClose={close}
        />
      )}
      <ConfirmModal
        opened={dialog === 'delete'}
        onClose={close}
        title={t('fixedExpenses.delete.title')}
        message={t('fixedExpenses.delete.confirm', { label: line.label })}
        confirmLabel={t('common.delete')}
        loading={deleteFixedExpense.isPending}
        onConfirm={handleDelete}
      />
    </>
  )
}
