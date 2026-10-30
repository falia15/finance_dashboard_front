import { useRef, useState, type KeyboardEvent } from 'react'
import { Text, UnstyledButton } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { ApiError } from '#/api/client'
import { fromCents, toCents } from '#/lib/money'
import { notifyError } from '#/lib/notifications'
import { Money, MoneyInput } from '#/features/incomes/Money'

interface AmountCellProps {
  /** Accessible name, e.g. "Loyer — janvier" */
  label: string
  /** API amount of the month, undefined when the month is empty */
  amount?: string
  /** Outside the line's active period: nothing can be entered */
  disabled?: boolean
  /** Saves the month: an API amount, or null to empty it */
  onSave: (amount: string | null) => Promise<unknown>
}

/**
 * One month of the grid. Shows the amount; a click turns it into an input,
 * saved on Enter or when leaving the field, cancelled with Escape. An
 * emptied input empties the month.
 */
export function AmountCell({
  label,
  amount,
  disabled,
  onSave,
}: AmountCellProps) {
  const { t } = useTranslation()
  // null = not editing; otherwise the input's value
  const [draft, setDraft] = useState<string | number | null>(null)
  const [saving, setSaving] = useState(false)
  // Escape blurs the input too: the blur must then not save
  const cancelled = useRef(false)

  if (disabled) {
    return (
      <Text
        c="dimmed"
        ta="center"
        aria-label={label}
      >
        ·
      </Text>
    )
  }

  if (draft === null) {
    return (
      <UnstyledButton
        w="100%"
        ta="right"
        aria-label={label}
        onClick={() => setDraft(amount ?? '')}
      >
        {amount !== undefined ? (
          <Money value={amount} />
        ) : (
          <Text
            component="span"
            c="dimmed"
          >
            —
          </Text>
        )}
      </UnstyledButton>
    )
  }

  async function save() {
    if (cancelled.current) {
      cancelled.current = false
      setDraft(null)
      return
    }

    const cents = draft === '' ? null : toCents(draft ?? '')
    if (cents !== null && (Number.isNaN(cents) || cents < 0)) {
      setDraft(null)
      return
    }

    const next = cents === null ? null : fromCents(cents)
    if (next === (amount ?? null)) {
      setDraft(null)
      return
    }

    setSaving(true)
    try {
      await onSave(next)
    } catch (error) {
      const violation =
        error instanceof ApiError ? error.violations[0] : undefined
      notifyError(violation?.message ?? t('fixedExpenses.saveError'))
    } finally {
      setSaving(false)
      setDraft(null)
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') cancelled.current = true
    if (event.key === 'Enter' || event.key === 'Escape') {
      event.preventDefault()
      event.currentTarget.blur()
    }
  }

  return (
    <MoneyInput
      aria-label={label}
      size="xs"
      miw={90}
      autoFocus
      disabled={saving}
      value={draft}
      onChange={setDraft}
      onBlur={save}
      onKeyDown={handleKeyDown}
    />
  )
}
