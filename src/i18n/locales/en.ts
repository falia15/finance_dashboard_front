export const en = {
  common: {
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    error: 'Error',
  },
  nav: {
    language: 'Language',
    profileMenu: 'Profile menu',
    changeProfile: 'Change profile',
    settings: 'Settings',
  },
  dashboard: {
    title: 'Dashboard',
    activeProfile: 'Active profile: {{name}}',
  },
  settings: {
    title: 'Settings',
  },
  profiles: {
    select: {
      title: 'Who is using the app?',
      loadError: 'Unable to load profiles',
      loadErrorHint: 'Check that the API is reachable.',
      cannotDeleteLast: 'The last profile cannot be deleted',
      newProfile: 'New profile',
      deleteTitle: 'Delete profile',
      deleteConfirm: 'Delete the profile “{{name}}”? This action cannot be undone.',
      deleteError: 'Unable to delete the profile',
    },
    form: {
      editTitle: 'Edit profile',
      newTitle: 'New profile',
      name: 'Name',
      namePlaceholder: 'E.g. Mathilde',
      nameRequired: 'Name is required',
      color: 'Color',
      save: 'Save',
      create: 'Create',
      saveError: 'Unable to save the profile',
    },
  },
}

// Structure de référence : fr.ts (et toute future langue) doit avoir exactement les mêmes clés
type DeepStringRecord<T> = { [K in keyof T]: T[K] extends string ? string : DeepStringRecord<T[K]> }
export type TranslationResources = DeepStringRecord<typeof en>
