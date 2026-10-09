import { Button, Group, Select } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useTranslation } from 'react-i18next'
import { ApiError } from '#/api/client'
import { formatMonth } from '#/lib/dates'
import { fromCents, toCents } from '#/lib/money'
import { notifyError } from '#/lib/notifications'
import type { IncomeInput } from './api'
import {
  EQUAL_SPLIT,
  emptyIncomeValues,
  type IncomeFormValues,
} from './incomeFormValues'
import { MoneyInput } from './Money'
import { useIncomeTypes } from './queries'

const FORM_FIELDS = ['month', 'type', 'amount', 'member']

interface IncomeFormProps {
  initialValues?: IncomeFormValues
  /** Options of the "Split between" select, shown on household rows only */
  splitOptions?: { value: string; label: string }[]
  submitLabel: string
  /** Rejects with the ApiError on failure; the form is reset on success */
  onSubmit: (input: IncomeInput) => Promise<unknown>
  onCancel?: () => void
}

/**
 * Income row form (month, type, amount, and the split on household rows),
 * used to add a row under a table and to edit one in a modal.
 */
export function IncomeForm({
  initialValues = emptyIncomeValues(),
  splitOptions,
  submitLabel,
  onSubmit,
  onCancel,
}: IncomeFormProps) {
  const { t, i18n } = useTranslation()
  const { data: incomeTypes = [] } = useIncomeTypes()
  const form = useForm<IncomeFormValues>({
    initialValues,
    validate: {
      type: (value) => (value ? null : t('incomes.form.typeRequired')),
      amount: (value) => {
        const cents = toCents(value)
        return value === '' || Number.isNaN(cents) || cents < 0
          ? t('incomes.form.amountInvalid')
          : null
      },
    },
  })

  const monthOptions = Array.from({ length: 12 }, (_, index) => ({
    value: String(index + 1),
    label: formatMonth(index + 1, i18n.language),
  }))
  const typeOptions = incomeTypes.map((type) => ({
    value: type['@id'],
    label: type.name,
  }))

  async function handleSubmit(values: IncomeFormValues) {
    const input: IncomeInput = {
      month: Number(values.month),
      type: values.type ?? '',
      amount: fromCents(toCents(values.amount)),
      ...(splitOptions && {
        member: values.member === EQUAL_SPLIT ? null : values.member,
      }),
    }

    try {
      await onSubmit(input)
      // Ready for the next row of the same month
      form.setValues({ ...initialValues, month: values.month })
    } catch (error) {
      const violations = error instanceof ApiError ? error.violations : []
      const fieldViolations = violations.filter((violation) =>
        FORM_FIELDS.includes(violation.propertyPath),
      )
      if (fieldViolations.length === 0) {
        notifyError(t('incomes.saveError'))
        return
      }
      for (const violation of fieldViolations) {
        // A type error is the uniqueness one: this month already has this type
        form.setFieldError(
          violation.propertyPath,
          violation.propertyPath === 'type'
            ? t('incomes.form.duplicate')
            : violation.message,
        )
      }
    }
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Group
        align="flex-start"
        gap="sm"
      >
        <Select
          label={t('incomes.form.month')}
          data={monthOptions}
          allowDeselect={false}
          w={150}
          {...form.getInputProps('month')}
        />
        <Select
          label={t('incomes.form.type')}
          data={typeOptions}
          flex={1}
          miw={180}
          {...form.getInputProps('type')}
        />
        <MoneyInput
          label={t('incomes.form.amount')}
          w={140}
          {...form.getInputProps('amount')}
        />
        {splitOptions && (
          <Select
            label={t('incomes.household.splitBetween')}
            data={splitOptions}
            allowDeselect={false}
            w={180}
            {...form.getInputProps('member')}
          />
        )}
        <Group
          gap="xs"
          mt={25}
        >
          {onCancel && (
            <Button
              variant="default"
              onClick={onCancel}
            >
              {t('common.cancel')}
            </Button>
          )}
          <Button
            type="submit"
            loading={form.submitting}
          >
            {submitLabel}
          </Button>
        </Group>
      </Group>
    </form>
  )
}
