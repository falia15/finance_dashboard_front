import 'i18next'
import type { en } from './locales/en'

// Typage des clés : t('dashboard.title') est vérifié à la compilation
declare module 'i18next' {
  interface CustomTypeOptions {
    resources: {
      translation: typeof en
    }
  }
}
