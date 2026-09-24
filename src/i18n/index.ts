import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { en } from './locales/en'
import { fr } from './locales/fr'

const STORAGE_KEY = 'language'

export const SUPPORTED_LANGUAGES = ['en', 'fr'] as const
export type Language = (typeof SUPPORTED_LANGUAGES)[number]

function readStoredLanguage(): Language {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return SUPPORTED_LANGUAGES.includes(raw as Language) ? (raw as Language) : 'en'
  } catch {
    return 'en'
  }
}

i18n.on('languageChanged', (language) => {
  document.documentElement.lang = language
  try {
    localStorage.setItem(STORAGE_KEY, language)
  } catch {
    // localStorage indisponible (navigation privée...) — la langue reste active pour la session
  }
})

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fr: { translation: fr },
  },
  lng: readStoredLanguage(),
  fallbackLng: 'en',
  // React échappe déjà les valeurs affichées
  interpolation: { escapeValue: false },
})

export default i18n
