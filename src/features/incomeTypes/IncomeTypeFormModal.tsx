import { useEffect, useMemo } from 'react'
import {
  Button,
  ColorInput,
  Group,
  Modal,
  Stack,
  TextInput,
} from '@mantine/core'
import { schemaResolver, useForm } from '@mantine/form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import type { IncomeTypeInput } from './api'

const EMPTY: IncomeTypeInput = { name: '', color: null }

interface IncomeTypeFormModalProps {
  opened: boolean
  onClose: () => void
  title: string
  submitLabel: string
  /** Values of the edited type; empty form otherwise */
  initialValues?: IncomeTypeInput
  loading?: boolean
  /** Called with the trimmed name; the modal stays open if it throws */
  onSubmit: (input: IncomeTypeInput) => Promise<unknown>
}

/** Name and optional color of an income type, to create or edit one. */
export function IncomeTypeFormModal({
  opened,
  onClose,
  title,
  submitLabel,
  initialValues = EMPTY,
  loading,
  onSubmit,
}: IncomeTypeFormModalProps) {
  const { t } = useTranslation()
  const schema = useMemo(
    () =>
      z.object({
        name: z.string().trim().min(1, t('incomeTypes.nameRequired')),
        color: z.string().nullable(),
      }),
    [t],
  )
  const form = useForm<IncomeTypeInput>({
    initialValues,
    validate: (values) => schemaResolver(schema, { sync: true })(values),
  })

  // Reset the form every time the modal opens (reused for several types)
  useEffect(() => {
    if (opened) {
      form.setValues(initialValues)
      form.clearErrors()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, initialValues.name, initialValues.color])

  const handleSubmit = form.onSubmit(async ({ name, color }) => {
    try {
      await onSubmit({ name: name.trim(), color: color || null })
      onClose()
    } catch {
      // The caller reports the error, the modal stays open to retry
    }
  })

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput
            label={t('incomeTypes.name')}
            required
            data-autofocus
            {...form.getInputProps('name')}
          />
          <ColorInput
            label={t('incomeTypes.color')}
            {...form.getInputProps('color')}
            value={form.values.color ?? ''}
          />
          <Group justify="flex-end">
            <Button
              variant="default"
              onClick={onClose}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              loading={loading}
            >
              {submitLabel}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}
