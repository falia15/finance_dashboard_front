import { useState } from 'react'
import { Alert, Button, Group, Modal, Select, Stack } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { formatMonth } from '#/lib/dates'
import { notifyError } from '#/lib/notifications'
import type { FixedExpenseLine } from '../api'
import { MONTHS } from '../lineMonths'
import { useUpdateFixedExpense } from '../queries'

interface DeactivateModalProps {
  line: FixedExpenseLine
  year: number
  onClose: () => void
}

/** The current month for the current year, December for another one. */
function defaultLastMonth(year: number) {
  const now = new Date()
  return year === now.getFullYear() ? now.getMonth() + 1 : 12
}

/** Picks the last month paid of the displayed year, then deactivates the line. */
export function DeactivateModal({
  line,
  year,
  onClose,
}: DeactivateModalProps) {
  const { t, i18n } = useTranslation()
  const updateFixedExpense = useUpdateFixedExpense()
  const [month, setMonth] = useState(String(defaultLastMonth(year)))

  function handleConfirm() {
    updateFixedExpense.mutate(
      { id: line.id, input: { endYear: year, endMonth: Number(month) } },
      {
        onSuccess: onClose,
        onError: () => notifyError(t('fixedExpenses.saveError')),
      },
    )
  }

  return (
    <Modal
      opened
      onClose={onClose}
      title={`${t('fixedExpenses.deactivate.title')} — ${line.label}`}
    >
      <Stack gap="md">
        <Select
          label={`${t('fixedExpenses.deactivate.lastMonth')} (${year})`}
          data={MONTHS.map((value) => ({
            value: String(value),
            label: formatMonth(value, i18n.language),
          }))}
          allowDeselect={false}
          value={month}
          onChange={(value) => value && setMonth(value)}
        />
        <Alert color="yellow">{t('fixedExpenses.deactivate.warning')}</Alert>
        <Group justify="flex-end">
          <Button
            variant="default"
            onClick={onClose}
          >
            {t('common.cancel')}
          </Button>
          <Button
            color="red"
            loading={updateFixedExpense.isPending}
            onClick={handleConfirm}
          >
            {t('fixedExpenses.deactivate.confirm')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
