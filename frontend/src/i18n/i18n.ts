import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslations from './en.json';
import esTranslations from './es.json';

i18n.use(initReactI18next).init({
  resources: {
    en: enTranslations,
    es: esTranslations,
  },
  lng: navigator.language.startsWith('es') ? 'es' : 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;