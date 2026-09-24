import { useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { schemaResolver, useForm } from '@mantine/form'
import { z } from 'zod'
import { Button, ColorInput, Container, Group, Stack, TextInput, Title } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useTranslation } from 'react-i18next'
import type { TFunction } from 'i18next'
import { useCreateProfile, useProfiles, useUpdateProfile } from './queries'

function createSchema(t: TFunction) {
  return z.object({
    name: z.string().trim().min(1, t('profiles.form.nameRequired')),
    color: z.string().nullable(),
  })
}

const DEFAULT_COLOR = '#8B5CF6'

export function ProfileFormPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const isEditing = id !== undefined
  const navigate = useNavigate()
  const { data } = useProfiles()
  const existingProfile = isEditing ? data?.member.find((profile) => profile.id === Number(id)) : undefined

  const createProfile = useCreateProfile()
  const updateProfile = useUpdateProfile()
  const isPending = createProfile.isPending || updateProfile.isPending

  // Schéma recréé au changement de langue pour que les messages d'erreur suivent
  const schema = useMemo(() => createSchema(t), [t])
  const form = useForm({
    initialValues: { name: '', color: DEFAULT_COLOR as string | null },
    validate: (values) => schemaResolver(schema, { sync: true })(values),
  })

  useEffect(() => {
    if (existingProfile) {
      form.setValues({ name: existingProfile.name, color: existingProfile.color })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingProfile?.id])

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      if (isEditing && existingProfile) {
        await updateProfile.mutateAsync({ id: existingProfile.id, input: values })
      } else {
        await createProfile.mutateAsync(values)
      }
      navigate('/profiles')
    } catch {
      notifications.show({ color: 'red', title: t('common.error'), message: t('profiles.form.saveError') })
    }
  })

  return (
    <Container size="xs" py="xl">
      <Stack gap="lg">
        <Title order={2}>{isEditing ? t('profiles.form.editTitle') : t('profiles.form.newTitle')}</Title>
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              label={t('profiles.form.name')}
              placeholder={t('profiles.form.namePlaceholder')}
              required
              {...form.getInputProps('name')}
            />
            <ColorInput label={t('profiles.form.color')} {...form.getInputProps('color')} />
            <Group justify="flex-end">
              <Button variant="default" onClick={() => navigate('/profiles')}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" loading={isPending}>
                {isEditing ? t('profiles.form.save') : t('profiles.form.create')}
              </Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Container>
  )
}
