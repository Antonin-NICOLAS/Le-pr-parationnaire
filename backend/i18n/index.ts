import i18n from 'i18next'
import Backend from 'i18next-fs-backend'
import { LanguageDetector } from 'i18next-http-middleware'
import path from 'path'
import { fileURLToPath } from 'url'

// Obtention du chemin du répertoire actuel
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const i18nConfig = {
  fallbackLng: 'fr',
  returnNull: false,
  returnEmptyString: false,
  supportedLngs: ['en', 'fr'],
  ns: ['common', 'auth', 'emails'],
  defaultNS: 'common',
  interpolation: {
    escapeValue: false,
  },
  preload: ['en', 'fr'],
  saveMissing: process.env.NODE_ENV === 'development',
  // Configuration du backend pour charger les fichiers
  backend: {
    loadPath: path.join(__dirname, 'locales', '{{lng}}', '{{ns}}.json'),
    addPath: path.join(__dirname, 'locales', '{{lng}}', '{{ns}}.missing.json'),
  },
}

// Créer une instance promisifiée
const initializeI18n = async () => {
  await i18n.use(Backend).use(LanguageDetector).init(i18nConfig)
  return i18n
}

export default initializeI18n()
