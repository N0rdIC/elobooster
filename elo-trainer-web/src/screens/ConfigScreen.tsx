// Écran de configuration de partie

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { useAuthStore } from '../store/authStore';
import { useLanguage } from '../hooks/useLanguage';
import { LanguageSwitch } from '../components/LanguageSwitch';
import { GameConfig, PieceColor, Difficulty, FREE_LIMITS } from '../types';
import { E4_OPENINGS, D4_OPENINGS, OTHER_OPENINGS, ALL_OPENINGS } from '../services/openingsData';
import './ConfigScreen.css';

const DEPTH_OPTIONS = [5, 10, 15, 20];

export function ConfigScreen() {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { startGame, premium, setPremium, canStartGame, dailyGamesPlayed, bestScore, gamesPlayed } = useGameStore();
  const { email, isPremium, checkPremium } = useAuthStore();

  const [playerColor, setPlayerColor] = useState<PieceColor>('white');
  const [targetDepth, setTargetDepth] = useState(5);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [selectedOpening, setSelectedOpening] = useState<string>('random');

  // Synchroniser le premium au chargement
  useEffect(() => {
    if (email) {
      checkPremium();
    }
  }, [email, checkPremium]);

  useEffect(() => {
    setPremium({ isPremium, source: isPremium ? 'subscription' : undefined });
  }, [isPremium, setPremium]);

  // Réinitialiser l'ouverture quand la couleur change
  useEffect(() => {
    setSelectedOpening('random');
  }, [playerColor]);

  const handleStart = async () => {
    if (!canStartGame()) {
      alert(t('dailyLimitReached'));
      return;
    }

    // Trouver l'ouverture sélectionnée
    let startingMoves: string[] | undefined;
    let openingName: string | undefined;
    
    if (selectedOpening !== 'random') {
      const opening = ALL_OPENINGS.find(o => o.name === selectedOpening);
      if (opening) {
        startingMoves = opening.moves;
        openingName = opening.name;
      }
    }

    const config: GameConfig = { 
      playerColor, 
      targetDepth, 
      difficulty,
      startingMoves,
      openingName,
    };
    await startGame(config);
    navigate('/openings/play');
  };

  const isDepthLocked = (depth: number) => !premium.isPremium && depth > FREE_LIMITS.maxDepth;
  const isColorLocked = (color: PieceColor) => !premium.isPremium && color === 'black';

  // Get selected opening details for preview
  const selectedOpeningDetails = selectedOpening !== 'random' 
    ? ALL_OPENINGS.find(o => o.name === selectedOpening) 
    : null;

  const difficultyOptions = [
    { value: 'easy' as Difficulty, label: t('easy'), desc: t('easyDesc') },
    { value: 'medium' as Difficulty, label: t('medium'), desc: t('mediumDesc') },
    { value: 'hard' as Difficulty, label: t('hard'), desc: t('hardDesc') },
  ];

  return (
    <div className="config-screen">
      <LanguageSwitch />
      
      {/* Bouton retour */}
      <button className="back-btn" onClick={() => navigate('/')}>
        ← {lang === 'fr' ? 'Accueil' : 'Home'}
      </button>
      
      {/* Afficher l'email si connecté */}
      {email && (
        <div className="user-badge" onClick={() => navigate('/premium')}>
          {isPremium ? '👑' : '👤'} {email}
        </div>
      )}
      
      <div className="config-header">
        <h1>{t('appTitle')}</h1>
        <p className="subtitle">{t('appSubtitle')}</p>
      </div>

      {/* Stats */}
      <div className="stats-bar">
        <div className="stat">
          <span className="stat-value">{gamesPlayed}</span>
          <span className="stat-label">{t('games')}</span>
        </div>
        <div className="stat">
          <span className="stat-value">{bestScore}</span>
          <span className="stat-label">{t('bestScore')}</span>
        </div>
        {!premium.isPremium && (
          <div className="stat remaining">
            <span className="stat-value">{Math.max(0, FREE_LIMITS.dailyGames - dailyGamesPlayed)}</span>
            <span className="stat-label">{t('remaining')}</span>
          </div>
        )}
      </div>

      {/* Couleur */}
      <div className="config-section">
        <h2>{t('playWith')}</h2>
        <div className="color-options">
          <button
            className={`color-btn ${playerColor === 'white' ? 'selected' : ''}`}
            onClick={() => setPlayerColor('white')}
          >
            <span className="piece">♔</span>
            <span>{t('white')}</span>
          </button>
          <button
            className={`color-btn ${playerColor === 'black' ? 'selected' : ''} ${isColorLocked('black') ? 'locked' : ''}`}
            onClick={() => !isColorLocked('black') && setPlayerColor('black')}
          >
            <span className="piece">♚</span>
            <span>{t('black')}</span>
            {isColorLocked('black') && <span className="lock">🔒</span>}
          </button>
        </div>
      </div>

      {/* Sélection d'ouverture */}
      <div className="config-section">
        <h2>{lang === 'fr' ? 'Ouverture' : 'Opening'}</h2>
        <p className="section-desc">
          {lang === 'fr' 
            ? 'Choisissez une ouverture du guide Elo Booster' 
            : 'Choose an opening from the Elo Booster guide'}
        </p>
        <select 
          className="opening-select"
          value={selectedOpening}
          onChange={(e) => setSelectedOpening(e.target.value)}
        >
          <option value="random">
            🎲 {lang === 'fr' ? 'Aléatoire' : 'Random'}
          </option>
          <optgroup label="1.e4">
            {E4_OPENINGS.map(({ name, eco }) => (
              <option key={name} value={name}>
                {name} ({eco})
              </option>
            ))}
          </optgroup>
          <optgroup label="1.d4">
            {D4_OPENINGS.map(({ name, eco }) => (
              <option key={name} value={name}>
                {name} ({eco})
              </option>
            ))}
          </optgroup>
          <optgroup label={lang === 'fr' ? 'Autres (flanc)' : 'Other (flank)'}>
            {OTHER_OPENINGS.map(({ name, eco }) => (
              <option key={name} value={name}>
                {name} ({eco})
              </option>
            ))}
          </optgroup>
        </select>

        {/* Opening Strategy Preview */}
        {selectedOpeningDetails && (
          <div className="opening-preview">
            <div className="opening-preview-header">
              <span className="opening-preview-name">{selectedOpeningDetails.name}</span>
              <span className="opening-preview-eco">{selectedOpeningDetails.eco}</span>
            </div>
            <p className="opening-preview-desc">
              {selectedOpeningDetails.description[lang]}
            </p>
            <div className="opening-preview-strategy">
              <h4>{lang === 'fr' ? '📋 Stratégie' : '📋 Strategy'}</h4>
              <p>{selectedOpeningDetails.strategy[lang]}</p>
            </div>
            <div className="opening-preview-ideas">
              <h4>{lang === 'fr' ? '💡 Idées clés' : '💡 Key Ideas'}</h4>
              <ul>
                {selectedOpeningDetails.keyIdeas[lang].map((idea, i) => (
                  <li key={i}>{idea}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Profondeur */}
      <div className="config-section">
        <h2>{t('targetDepth')}</h2>
        <p className="section-desc">{t('targetDepthDesc')}</p>
        <div className="depth-options">
          {DEPTH_OPTIONS.map(depth => (
            <button
              key={depth}
              className={`depth-btn ${targetDepth === depth ? 'selected' : ''} ${isDepthLocked(depth) ? 'locked' : ''}`}
              onClick={() => !isDepthLocked(depth) && setTargetDepth(depth)}
            >
              {depth}
              {isDepthLocked(depth) && <span className="lock-small">🔒</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Difficulté */}
      <div className="config-section">
        <h2>{t('difficulty')}</h2>
        <div className="difficulty-options">
          {difficultyOptions.map(opt => (
            <button
              key={opt.value}
              className={`difficulty-btn ${difficulty === opt.value ? 'selected' : ''}`}
              onClick={() => setDifficulty(opt.value)}
            >
              <span className="diff-label">{opt.label}</span>
              <span className="diff-desc">{opt.desc}</span>
              {difficulty === opt.value && <span className="check">✓</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Bouton Start */}
      <button className="start-btn" onClick={handleStart}>
        {t('startGame')}
      </button>

      {/* Premium link */}
      {!premium.isPremium && (
        <button className="premium-link" onClick={() => navigate('/premium')}>
          {t('unlockFeatures')}
        </button>
      )}

      {/* Lien vers le guide */}
      <a href="/" className="guide-link">
        {t('discoverGuide')}
      </a>
    </div>
  );
}
