import { useMemo } from 'react'
import { schemaResolver, useForm } from '@mantine/form'
import { z } from 'zod'
import { Button, ColorInput, Group, Stack, TextInput } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import type { ProfileInput } from './api'

function createSchema(t: TFunction) {
  return z.object({
    name: z.string().trim().min(1, t('profiles.form.nameRequired')),
    color: z.string().nullable(),
  })
}

const DEFAULT_VALUES: ProfileInput = { name: '', color: '#8B5CF6' }

interface ProfileFormProps {
  /** Values of the edited profile; empty form with the default color otherwise */
  initialValues?: ProfileInput
  submitLabel: string
  loading: boolean
  onSubmit: (values: ProfileInput) => void
  onCancel: () => void
}

export function ProfileForm({ initialValues = DEFAULT_VALUES, submitLabel, loading, onSubmit, onCancel }: ProfileFormProps) {
  const { t } = useTranslation()
  // Schéma recréé au changement de langue pour que les messages d'erreur suivent
  const schema = useMemo(() => createSchema(t), [t])
  const form = useForm({
    initialValues,
    validate: (values) => schemaResolver(schema, { sync: true })(values),
  })

  return (
    <form onSubmit={form.onSubmit(onSubmit)}>
      <Stack gap="md">
        <TextInput
          label={t('profiles.form.name')}
          placeholder={t('profiles.form.namePlaceholder')}
          required
          {...form.getInputProps('name')}
        />
        <ColorInput label={t('profiles.form.color')} {...form.getInputProps('color')} />
        <Group justify="flex-end">
          <Button variant="default" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={loading}>
            {submitLabel}
          </Button>
        </Group>
      </Stack>
    </form>
  )
}
