import { useNavigate, useParams } from 'react-router-dom'
import { Alert, Button, Container, Loader, Stack, Title } from '@mantine/core'
import { useTranslation } from 'react-i18next'
import { notifyError } from '../../lib/notifications'
import type { ProfileInput } from './api'
import { ProfileForm } from './ProfileForm'
import { useCreateProfile, useProfile, useUpdateProfile } from './queries'

export function ProfileFormPage() {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const isEditing = id !== undefined
  const navigate = useNavigate()
  const { data: existingProfile, isLoading, isError } = useProfile(isEditing ? Number(id) : null)
  const createProfile = useCreateProfile()
  const updateProfile = useUpdateProfile()

  const goToList = () => navigate('/profiles')
  const mutationOptions = { onSuccess: goToList, onError: () => notifyError(t('profiles.form.saveError')) }

  function handleSubmit(values: ProfileInput) {
    if (isEditing) {
      // Safety net: the form is only rendered once the profile has been found
      if (!existingProfile) return
      updateProfile.mutate({ id: existingProfile.id, input: values }, mutationOptions)
    } else {
      createProfile.mutate(values, mutationOptions)
    }
  }

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
                <Button variant="default" onClick={goToList}>
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
        <ProfileForm
          initialValues={existingProfile ? { name: existingProfile.name, color: existingProfile.color } : undefined}
          submitLabel={isEditing ? t('profiles.form.save') : t('profiles.form.create')}
          loading={createProfile.isPending || updateProfile.isPending}
          onSubmit={handleSubmit}
          onCancel={goToList}
        />
      </Stack>
    </Container>
  )
}
