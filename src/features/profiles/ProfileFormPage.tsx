import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { schemaResolver, useForm } from '@mantine/form'
import { z } from 'zod'
import { Button, ColorInput, Container, Group, Stack, TextInput, Title } from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { useCreateProfile, useProfiles, useUpdateProfile } from './queries'

const schema = z.object({
  name: z.string().trim().min(1, 'Le nom est requis'),
  color: z.string().nullable(),
})

const DEFAULT_COLOR = '#8B5CF6'

export function ProfileFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEditing = id !== undefined
  const navigate = useNavigate()
  const { data } = useProfiles()
  const existingProfile = isEditing ? data?.member.find((profile) => profile.id === Number(id)) : undefined

  const createProfile = useCreateProfile()
  const updateProfile = useUpdateProfile()
  const isPending = createProfile.isPending || updateProfile.isPending

  const form = useForm({
    initialValues: { name: '', color: DEFAULT_COLOR as string | null },
    validate: schemaResolver(schema, { sync: true }),
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
      notifications.show({ color: 'red', title: 'Erreur', message: "Impossible d'enregistrer le profil" })
    }
  })

  return (
    <Container size="xs" py="xl">
      <Stack gap="lg">
        <Title order={2}>{isEditing ? 'Modifier le profil' : 'Nouveau profil'}</Title>
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput label="Nom" placeholder="Ex: Mathilde" required {...form.getInputProps('name')} />
            <ColorInput label="Couleur" {...form.getInputProps('color')} />
            <Group justify="flex-end">
              <Button variant="default" onClick={() => navigate('/profiles')}>
                Annuler
              </Button>
              <Button type="submit" loading={isPending}>
                {isEditing ? 'Enregistrer' : 'Créer'}
              </Button>
            </Group>
          </Stack>
        </form>
      </Stack>
    </Container>
  )
}
