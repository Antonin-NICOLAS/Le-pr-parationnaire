import i18n from 'i18next'
import Backend from 'i18next-fs-backend'
import { LanguageDetector } from 'i18next-http-middleware'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const i18nConfig = {
  backend: {
    loadPath: path.join(__dirname, 'locales/{{lng}}/{{ns}}.json'),
    addPath: path.join(__dirname, 'locales/{{lng}}/{{ns}}.missing.json'),
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
  i18n.on('initialized', () => {
    console.log('i18next initialized with config:', i18nConfig)
    // try a simple translation to verify
    console.log(i18n.t('auth:success.logged_in'))
  })
  return i18n
}

export default initializeI18n()
