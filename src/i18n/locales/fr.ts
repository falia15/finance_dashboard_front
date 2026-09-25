import type { TranslationResources } from './en'

export const fr: TranslationResources = {
  common: {
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    error: 'Erreur',
  },
  nav: {
    language: 'Langue',
    profileMenu: 'Menu du profil',
    changeProfile: 'Changer de profil',
    settings: 'Paramètres',
  },
  dashboard: {
    title: 'Tableau de bord',
    activeProfile: 'Profil actif : {{name}}',
  },
  settings: {
    title: 'Paramètres',
  },
  profiles: {
    select: {
      title: "Qui utilise l'app ?",
      loadError: 'Impossible de charger les profils',
      loadErrorHint: "Vérifie que l'API est bien accessible.",
      cannotDeleteLast: 'Impossible de supprimer le dernier profil',
      newProfile: 'Nouveau profil',
      deleteTitle: 'Supprimer le profil',
      deleteConfirm: 'Supprimer le profil « {{name}} » ? Cette action est définitive.',
      deleteError: 'Impossible de supprimer le profil',
    },
    form: {
      editTitle: 'Modifier le profil',
      newTitle: 'Nouveau profil',
      name: 'Nom',
      namePlaceholder: 'Ex : Mathilde',
      nameRequired: 'Le nom est requis',
      color: 'Couleur',
      save: 'Enregistrer',
      create: 'Créer',
      saveError: "Impossible d'enregistrer le profil",
      notFound: 'Profil introuvable',
      notFoundHint: "Ce profil n'existe pas ou a été supprimé.",
      backToList: 'Retour aux profils',
    },
  },
}
