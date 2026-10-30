import { Button, Group, Modal, Select, Stack, TextInput } from '@mantine/core'
import { useForm } from '@mantine/form'
import { useTranslation } from 'react-i18next'
import { notifyError } from '#/lib/notifications'
import { EQUAL_SPLIT } from '#/features/incomes/incomeFormValues'
import type { FixedExpenseUpdate } from '../api'
import type { SplitOption } from '../AddFixedExpenseForm'
import type { GridLine } from '../FixedExpenseGrid'
import { useUpdateFixedExpense } from '../queries'

interface EditLineModalProps {
  line: GridLine
  /** "Split between" options, household lines only */
  splitOptions?: SplitOption[]
  onClose: () => void
}

/** Renames a line and, on a household line, changes who pays it. */
export function EditLineModal({
  line,
  splitOptions,
  onClose,
}: EditLineModalProps) {
  const { t } = useTranslation()
  const updateFixedExpense = useUpdateFixedExpense()
  const form = useForm({
    initialValues: {
      label: line.label,
      householdMember: line.householdMember ?? EQUAL_SPLIT,
    },
    validate: {
      label: (value) =>
        value.trim() ? null : t('fixedExpenses.form.labelRequired'),
    },
  })

  async function handleSubmit(values: typeof form.values) {
    const input: FixedExpenseUpdate = {
      label: values.label.trim(),
      ...(splitOptions && {
        householdMember:
          values.householdMember === EQUAL_SPLIT
            ? null
            : values.householdMember,
      }),
    }

    try {
      await updateFixedExpense.mutateAsync({ id: line.id, input })
      onClose()
    } catch {
      notifyError(t('fixedExpenses.saveError'))
    }
  }

  return (
    <Modal
      opened
      onClose={onClose}
      title={t('fixedExpenses.edit.title')}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label={t('fixedExpenses.form.label')}
            data-autofocus
            {...form.getInputProps('label')}
          />
          {splitOptions && (
            <Select
              label={t('fixedExpenses.household.splitBetween')}
              data={splitOptions}
              allowDeselect={false}
              {...form.getInputProps('householdMember')}
            />
          )}
          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={onClose}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              loading={form.submitting}
            >
              {t('fixedExpenses.form.save')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}
