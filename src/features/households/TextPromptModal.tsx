import { useEffect, useMemo } from 'react'
import { Button, Group, Modal, Stack, TextInput } from '@mantine/core'
import { schemaResolver, useForm } from '@mantine/form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

interface TextPromptModalProps {
  opened: boolean
  onClose: () => void
  title: string
  label: string
  placeholder?: string
  requiredMessage: string
  submitLabel: string
  initialValue?: string
  loading?: boolean
  /** Called with the trimmed value; the modal stays open if it throws */
  onSubmit: (value: string) => Promise<void>
}

/** Single text field form in a modal: create/rename a household, add a member. */
export function TextPromptModal({
  opened,
  onClose,
  title,
  label,
  placeholder,
  requiredMessage,
  submitLabel,
  initialValue = '',
  loading,
  onSubmit,
}: TextPromptModalProps) {
  const { t } = useTranslation()
  const schema = useMemo(() => z.object({ value: z.string().trim().min(1, requiredMessage) }), [requiredMessage])
  const form = useForm({
    initialValues: { value: initialValue },
    validate: (values) => schemaResolver(schema, { sync: true })(values),
  })

  // Reset the field every time the modal opens (it is reused across households)
  useEffect(() => {
    if (opened) {
      form.setValues({ value: initialValue })
      form.clearErrors()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, initialValue])

  const handleSubmit = form.onSubmit(async ({ value }) => {
    try {
      await onSubmit(value.trim())
      onClose()
    } catch {
      // The caller reports the error, the modal stays open to retry
    }
  })

  return (
    <Modal opened={opened} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <TextInput label={label} placeholder={placeholder} required data-autofocus {...form.getInputProps('value')} />
          <Group justify="flex-end">
            <Button variant="default" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" loading={loading}>
              {submitLabel}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  )
}
