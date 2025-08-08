import i18n from 'i18next'
import Backend from 'i18next-fs-backend'
import { LanguageDetector } from 'i18next-http-middleware'
import frAuth from './locales/fr/auth.json'
import enAuth from './locales/en/auth.json'
import frCommon from './locales/fr/common.json'
import enCommon from './locales/en/common.json'
import frEmails from './locales/fr/emails.json'
import enEmails from './locales/en/emails.json'

const i18nConfig = {
  resources: {
    en: {
      auth: enAuth,
      common: enCommon,
      emails: enEmails,
    },
    fr: {
      auth: frAuth,
      common: frCommon,
      emails: frEmails,
    },
  },
  fallbackLng: 'fr',
  returnNull: false,
  returnEmptyString: false,
  supportedLngs: ['en', 'fr'],
  ns: ['common', 'auth', 'emails'],
  defaultNS: 'common',
  interpolation: {
    escapeValue: false,
  },
  preload: ['en', 'fr'], // Précharger les langues
  saveMissing: process.env.NODE_ENV === 'development',
}

// Créer une instance promisifiée
const initializeI18n = async () => {
  await i18n.use(Backend).use(LanguageDetector).init(i18nConfig)
  return i18n
}

export default initializeI18n()
