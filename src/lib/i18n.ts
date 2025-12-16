import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Translation resources
import en from '@/locales/en.json';
import fr from '@/locales/fr.json';

// Get initial language from localStorage or default to French
const getInitialLanguage = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('language') || 'fr';
  }
  return 'fr';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
    },
    lng: getInitialLanguage(),
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false,
    },
  });

// Save language preference to localStorage whenever it changes
i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', lng);
  }
});

export default i18n;
