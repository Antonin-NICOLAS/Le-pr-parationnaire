import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import CommonEN from './locales/en/common.json'
import CommonFR from './locales/fr/common.json'

i18n.use(LanguageDetector)
    .use(initReactI18next)
    .init({
        debug: true,
        fallbackLng: 'fr',
        interpolation: {
            escapeValue: false,
        },
        detection: {
            order: ['cookie', 'navigator', 'localStorage', 'htmlTag'],
            caches: ['localStorage'],
        },
        defaultNS: 'common',
        nsSeparator: '.',
        ns: ['common', 'header'],
        resources: {
            en: {
                common: CommonEN,
            },
            fr: {
                common: CommonFR,
            },
        },
    })

export default i18n
