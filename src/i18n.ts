import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import th from './locales/th.json'

const resources = {
  en: { translation: en },
  th: { translation: th },
}

const storageKey = 'ggas-language'
let language = 'en'

try {
  if (localStorage.getItem(storageKey) === 'th') language = 'th'
} catch {
  language = 'en'
}

i18n.on('languageChanged', (nextLanguage) => {
  document.documentElement.lang = nextLanguage
  try {
    localStorage.setItem(storageKey, nextLanguage)
  } catch {
    return
  }
})

void i18n.use(initReactI18next).init({
  resources,
  lng: language,
  fallbackLng: 'en',
  supportedLngs: ['en', 'th'],
  initAsync: false,
  interpolation: { escapeValue: false },
})

export default i18n
