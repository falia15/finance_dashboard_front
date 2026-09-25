import { useEffect, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { schemaResolver, useForm } from '@mantine/form'
import { z } from 'zod'
import { Alert, Button, ColorInput, Container, Group, Loader, Stack, TextInput, Title } from '@mantine/core'
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
  const { data, isLoading, isError } = useProfiles()
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
      if (isEditing) {
        // Garde-fou : le formulaire n'est affiché qu'une fois le profil trouvé
        if (!existingProfile) return
        await updateProfile.mutateAsync({ id: existingProfile.id, input: values })
      } else {
        await createProfile.mutateAsync(values)
      }
      navigate('/profiles')
    } catch {
      notifications.show({ color: 'red', title: t('common.error'), message: t('profiles.form.saveError') })
    }
  })

  const title = <Title order={2}>{isEditing ? t('profiles.form.editTitle') : t('profiles.form.newTitle')}</Title>

  if (isEditing && !existingProfile) {
    return (
      <Container size="xs" py="xl">
        <Stack gap="lg">
          {title}
          {isLoading ? (
            <Loader />
          ) : (
            <Alert color="red" title={isError ? t('profiles.select.loadError') : t('profiles.form.notFound')}>
              <Stack gap="sm" align="flex-start">
                {isError ? t('profiles.select.loadErrorHint') : t('profiles.form.notFoundHint')}
                <Button variant="default" onClick={() => navigate('/profiles')}>
                  {t('profiles.form.backToList')}
                </Button>
              </Stack>
            </Alert>
          )}
        </Stack>
      </Container>
    )
  }

  return (
    <Container size="xs" py="xl">
      <Stack gap="lg">
        {title}
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
