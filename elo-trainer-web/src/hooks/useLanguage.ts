// Hook pour la gestion de la langue

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Language, translations, TranslationKey } from '../i18n/translations';

interface LanguageStore {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

// Détecter la langue (URL param > localStorage > navigateur)
function detectLanguage(): Language {
  // 1. Vérifier le paramètre URL ?lang=fr ou ?lang=en
  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get('lang');
  if (urlLang === 'fr' || urlLang === 'en') {
    return urlLang;
  }
  
  // 2. Sinon, langue du navigateur
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('fr')) return 'fr';
  return 'en';
}

export const useLanguage = create<LanguageStore>()(
  persist(
    (set, get) => ({
      lang: detectLanguage(),
      
      setLang: (lang: Language) => set({ lang }),
      
      t: (key: TranslationKey) => {
        const { lang } = get();
        return translations[lang][key] || translations.fr[key] || key;
      },
    }),
    {
      name: 'elo-trainer-lang',
    }
  )
);
