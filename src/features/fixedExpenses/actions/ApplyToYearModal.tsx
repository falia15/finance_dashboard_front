import { useState } from 'react'
import { Alert, Button, Group, Modal, Select, Stack } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { formatMonth } from '#/lib/dates'
import { formatMoney } from '#/lib/money'
import { notifyError } from '#/lib/notifications'
import type { FixedExpenseLine } from '../api'
import { amountOf } from '../lineMonths'
import { useApplyToYear } from '../queries'

interface ApplyToYearModalProps {
  line: FixedExpenseLine
  year: number
  onClose: () => void
}

/**
 * Picks the month whose amount goes to the whole year. Mounted only while
 * open, so the picked month starts again from the first filled one.
 */
export function ApplyToYearModal({
  line,
  year,
  onClose,
}: ApplyToYearModalProps) {
  const { t, i18n } = useTranslation()
  const applyToYear = useApplyToYear()
  const [month, setMonth] = useState(String(line.amounts[0]?.month ?? 1))

  // Computed at each render from the state: no extra state to keep in sync
  const source = amountOf(line, Number(month))
  const overwrites = line.amounts.some(
    (amount) =>
      amount.month !== Number(month) && amount.amount !== source?.amount,
  )

  function handleConfirm() {
    applyToYear.mutate(
      { id: line.id, year, month: Number(month) },
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
      title={`${t('fixedExpenses.applyToYear.title')} — ${line.label}`}
    >
      <Stack gap="md">
        <Select
          label={t('fixedExpenses.applyToYear.month')}
          data={line.amounts.map((amount) => ({
            value: String(amount.month),
            label: `${formatMonth(amount.month, i18n.language)} — ${formatMoney(amount.amount, i18n.language)}`,
          }))}
          allowDeselect={false}
          value={month}
          onChange={(value) => value && setMonth(value)}
        />
        {overwrites && (
          <Alert color="yellow">
            {t('fixedExpenses.applyToYear.overwrite')}
          </Alert>
        )}
        <Group justify="flex-end">
          <Button
            variant="default"
            onClick={onClose}
          >
            {t('common.cancel')}
          </Button>
          <Button
            loading={applyToYear.isPending}
            onClick={handleConfirm}
          >
            {t('fixedExpenses.applyToYear.confirm')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
