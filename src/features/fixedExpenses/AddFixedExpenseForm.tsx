import {
  Button,
  Group,
  SegmentedControl,
  Select,
  Stack,
  Text,
  TextInput,
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useTranslation } from 'react-i18next'
import { ApiError } from '#/api/client'
import { formatMonth } from '#/lib/dates'
import { fromCents, toCents } from '#/lib/money'
import { notifyError } from '#/lib/notifications'
import { EQUAL_SPLIT } from '#/features/incomes/incomeFormValues'
import { MoneyInput } from '#/features/incomes/Money'
import type { FixedExpenseInput } from './api'
import { MONTHS } from './lineMonths'

export interface SplitOption {
  value: string
  label: string
}

interface FormValues {
  label: string
  amount: string | number
  /** The 12 months, or the one in `month` */
  period: 'year' | 'month'
  month: string
  /** `EQUAL_SPLIT` or a member IRI — household lines only */
  householdMember: string
}

interface AddFixedExpenseFormProps {
  year: number
  /** Options of the "Split between" select, household lines only */
  splitOptions?: SplitOption[]
  /** Rejects with the ApiError on failure; the form is reset on success */
  onSubmit: (input: FixedExpenseInput) => Promise<unknown>
}

function emptyValues(): FormValues {
  return {
    label: '',
    amount: '',
    period: 'year',
    month: String(new Date().getMonth() + 1),
    householdMember: EQUAL_SPLIT,
  }
}

/**
 * New line under a grid: a label and, optionally, a first amount for the
 * whole year or for one month (the other months are filled in the grid).
 */
export function AddFixedExpenseForm({
  year,
  splitOptions,
  onSubmit,
}: AddFixedExpenseFormProps) {
  const { t, i18n } = useTranslation()
  const form = useForm<FormValues>({
    initialValues: emptyValues(),
    validate: {
      label: (value) =>
        value.trim() ? null : t('fixedExpenses.form.labelRequired'),
      amount: (value) => {
        if (value === '') return null
        const cents = toCents(value)
        return Number.isNaN(cents) || cents < 0
          ? t('fixedExpenses.form.amountInvalid')
          : null
      },
    },
  })

  async function handleSubmit(values: FormValues) {
    const input: FixedExpenseInput = {
      label: values.label.trim(),
      ...(splitOptions && {
        householdMember:
          values.householdMember === EQUAL_SPLIT
            ? null
            : values.householdMember,
      }),
      ...(values.amount !== '' && {
        initialAmount: {
          year,
          month: values.period === 'year' ? null : Number(values.month),
          amount: fromCents(toCents(values.amount)),
        },
      }),
    }

    try {
      await onSubmit(input)
      form.reset()
    } catch (error) {
      const violation =
        error instanceof ApiError
          ? error.violations.find((item) => item.propertyPath === 'label')
          : undefined
      if (violation) {
        form.setFieldError('label', violation.message)
        return
      }
      notifyError(t('fixedExpenses.saveError'))
    }
  }

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Group
        align="flex-start"
        gap="sm"
      >
        <TextInput
          label={t('fixedExpenses.form.label')}
          miw={200}
          flex={1}
          {...form.getInputProps('label')}
        />
        <MoneyInput
          label={t('fixedExpenses.form.amount')}
          w={150}
          {...form.getInputProps('amount')}
        />
        <Stack gap={4}>
          <Text
            size="sm"
            fw={500}
          >
            {t('fixedExpenses.form.period')}
          </Text>
          <SegmentedControl
            data={[
              { value: 'year', label: t('fixedExpenses.form.wholeYear') },
              { value: 'month', label: t('fixedExpenses.form.oneMonth') },
            ]}
            {...form.getInputProps('period')}
          />
        </Stack>
        {form.values.period === 'month' && (
          <Select
            label={t('fixedExpenses.form.month')}
            data={MONTHS.map((month) => ({
              value: String(month),
              label: formatMonth(month, i18n.language),
            }))}
            allowDeselect={false}
            w={150}
            {...form.getInputProps('month')}
          />
        )}
        {splitOptions && (
          <Select
            label={t('fixedExpenses.household.splitBetween')}
            data={splitOptions}
            allowDeselect={false}
            w={180}
            {...form.getInputProps('householdMember')}
          />
        )}
        <Button
          type="submit"
          mt={25}
          loading={form.submitting}
        >
          {t('fixedExpenses.form.add')}
        </Button>
      </Group>
    </form>
  )
}
