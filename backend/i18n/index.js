const i18n = require('i18next')
const Backend = require('i18next-fs-backend')
const middleware = require('i18next-http-middleware')
const path = require('path')

i18n
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    backend: {
      loadPath: path.join(__dirname, './locales/{{lng}}/{{ns}}.json'),
      addPath: path.join(__dirname, './locales/{{lng}}/{{ns}}.missing.json'),
    },
    fallbackLng: false,
    returnNull: false,
    supportedLngs: ['en', 'fr'],
    ns: ['common', 'auth', 'emails'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    saveMissing: process.env.NODE_ENV === 'development',
  })

module.exports = i18n
