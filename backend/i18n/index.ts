import i18n from 'i18next'
import { LanguageDetector } from 'i18next-http-middleware'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const loadJson = (filePath: string) => {
  const content = fs.readFileSync(filePath, 'utf-8')
  return JSON.parse(content)
}

const i18nConfig = {
  resources: {
    fr: {
      auth: loadJson(path.join(__dirname, 'locales/fr/auth.json')),
      common: loadJson(path.join(__dirname, 'locales/fr/common.json')),
      emails: loadJson(path.join(__dirname, 'locales/fr/emails.json')),
    },
    en: {
      auth: loadJson(path.join(__dirname, 'locales/en/auth.json')),
      common: loadJson(path.join(__dirname, 'locales/en/common.json')),
      emails: loadJson(path.join(__dirname, 'locales/en/emails.json')),
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
  preload: ['en', 'fr'],
  saveMissing: process.env.NODE_ENV === 'development',
}

const initializeI18n = async () => {
  await i18n.use(LanguageDetector).init(i18nConfig)
  return i18n
}

export default initializeI18n()
