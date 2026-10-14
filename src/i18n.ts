import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      nav: { home: 'Home', appearance: 'Appearance', profile: 'Profile', label: 'Main navigation', brand: 'GGAS home' },
      appearance: { preferences: 'PREFERENCES', heading: 'Appearance', palette: 'Theme palette', preview: 'PREVIEW' },
      theme: { light: 'Light', dark: 'Dark', switch: 'Switch to {{mode}} theme', tooltip: '{{mode}} theme' },
      language: { switch: 'Switch to Thai', tooltip: 'ภาษาไทย' },
      profile: {
        role: 'Full Stack Developer', space: 'PERSONAL SPACE', creative: 'CREATIVE!', tagline: 'CODE + CREATIVITY',
        cartoon: 'Cartoon portrait of {{name}}', photo: 'Photograph of {{name}}',
        cartoonUnavailable: 'Cartoon portrait of {{name}} unavailable', photoUnavailable: 'Photograph of {{name}} unavailable',
        showCartoon: 'Show cartoon portrait of {{name}}', showPhoto: 'Show real photo of {{name}}',
        cartoonTooltip: 'Back to my alter ego?', photoTooltip: "Who's behind this face?",
        react: 'React', gaming: 'Gaming', printing: '3D printing',
      },
    },
  },
  th: {
    translation: {
      nav: { home: 'หน้าแรก', appearance: 'การแสดงผล', profile: 'โปรไฟล์', label: 'เมนูหลัก', brand: 'หน้าแรก GGAS' },
      appearance: { preferences: 'การตั้งค่า', heading: 'การแสดงผล', palette: 'ชุดสีธีม', preview: 'ตัวอย่าง' },
      theme: { light: 'สว่าง', dark: 'มืด', switch: 'เปลี่ยนเป็นธีม{{mode}}', tooltip: 'ธีม{{mode}}' },
      language: { switch: 'เปลี่ยนเป็นภาษาอังกฤษ', tooltip: 'English' },
      profile: {
        role: 'นักพัฒนาฟูลสแตก', space: 'พื้นที่ส่วนตัว', creative: 'สร้างสรรค์!', tagline: 'โค้ด + ความคิดสร้างสรรค์',
        cartoon: 'ภาพการ์ตูนของ {{name}}', photo: 'ภาพถ่ายของ {{name}}',
        cartoonUnavailable: 'ไม่สามารถแสดงภาพการ์ตูนของ {{name}}', photoUnavailable: 'ไม่สามารถแสดงภาพถ่ายของ {{name}}',
        showCartoon: 'แสดงภาพการ์ตูนของ {{name}}', showPhoto: 'แสดงภาพถ่ายจริงของ {{name}}',
        cartoonTooltip: 'กลับไปดูร่างการ์ตูนไหม?', photoTooltip: 'ใครอยู่เบื้องหลังใบหน้านี้?',
        react: 'React', gaming: 'เล่นเกม', printing: 'การพิมพ์สามมิติ',
      },
    },
  },
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