import { useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

type Language = 'fr' | 'en';

export function useLanguage() {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('elo-trainer-lang');
    if (saved === 'en' || saved === 'fr') return saved;
    return navigator.language.startsWith('fr') ? 'fr' : 'en';
  });

  useEffect(() => {
    localStorage.setItem('elo-trainer-lang', lang);
  }, [lang]);

  const t = (key: keyof typeof translations.fr): string => {
    return translations[lang][key] || key;
  };

  return { lang, setLang, t };
}
