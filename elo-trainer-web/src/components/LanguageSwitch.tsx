import { useLanguage } from '../hooks/useLanguage';
import './LanguageSwitch.css';

export function LanguageSwitch() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="language-switch">
      <button
        className={lang === 'fr' ? 'active' : ''}
        onClick={() => setLang('fr')}
      >
        FR
      </button>
      <button
        className={lang === 'en' ? 'active' : ''}
        onClick={() => setLang('en')}
      >
        EN
      </button>
    </div>
  );
}
