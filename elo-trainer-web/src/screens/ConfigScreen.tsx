// Configuration screen

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useGameStore } from '../store/gameStore';
import { useAuthStore } from '../store/authStore';
import { openingsWhite, openingsBlack, getRandomOpening, getOpeningById } from '../services/openingsData';
import type { PlayerColor, Difficulty, Opening } from '../types';
import './ConfigScreen.css';

const DEPTH_OPTIONS = [5, 10, 15];

export function ConfigScreen() {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { startGame, canStartGame, getFeatures, setPremium, gamesPlayed, getAverageScore, dailyGamesPlayed, lastPlayDate } = useGameStore();
  const { email, isPremium, checkPremium, verifyToken } = useAuthStore();

  const [playerColor, setPlayerColor] = useState<PlayerColor>('white');
  const [targetDepth, setTargetDepth] = useState(5);
  const [selectedOpening, setSelectedOpening] = useState<string>('random');
  
  const features = getFeatures();
  const averageScore = getAverageScore();
  const difficulty: Difficulty = 'medium';

  // Verify token on load
  useEffect(() => {
    verifyToken();
  }, []);

  // Sync premium status
  useEffect(() => {
    if (email) {
      checkPremium();
    }
  }, [email, checkPremium]);

  useEffect(() => {
    setPremium({ isPremium, source: isPremium ? 'subscription' : undefined });
  }, [isPremium, setPremium]);

  // Reset opening when color changes
  useEffect(() => {
    setSelectedOpening('random');
  }, [playerColor]);

  const handleStart = async () => {
    if (!canStartGame()) {
      navigate('/premium');
      return;
    }

    let opening: Opening;
    if (selectedOpening === 'random' || !features.canChooseOpening) {
      opening = getRandomOpening(playerColor);
    } else {
      opening = getOpeningById(selectedOpening, playerColor) || getRandomOpening(playerColor);
    }

    await startGame({
      opening,
      playerColor,
      difficulty,
      targetDepth: Math.min(targetDepth, features.maxDepth),
    });

    navigate('/game');
  };

  const openings = playerColor === 'white' ? openingsWhite : openingsBlack;
  
  // Calculate remaining games
  const today = new Date().toDateString();
  const todayGames = lastPlayDate === today ? dailyGamesPlayed : 0;
  const remainingGames = isPremium ? '∞' : Math.max(0, 3 - todayGames);

  return (
    <div className="config-screen">
      {email && (
        <div className="user-badge" onClick={() => navigate('/premium')}>
          {isPremium && '👑 '}{email}
        </div>
      )}

      <div className="config-header">
        <h1>{t('title')}</h1>
        <p className="subtitle">{t('subtitle')}</p>
      </div>

      {/* Stats */}
      <div className="stats-bar">
        <div className="stat">
          <span className="stat-value">{gamesPlayed}</span>
          <span className="stat-label">{t('games')}</span>
        </div>
        <div className="stat">
          <span className="stat-value">{averageScore || '-'}</span>
          <span className="stat-label">{t('average')}</span>
        </div>
        <div className="stat remaining">
          <span className="stat-value">{remainingGames}</span>
          <span className="stat-label">{t('remaining')}</span>
        </div>
      </div>

      {/* Color selection */}
      <div className="config-section">
        <h2>{t('chooseColor')}</h2>
        <div className="color-options">
          <button
            className={`color-btn ${playerColor === 'white' ? 'selected' : ''}`}
            onClick={() => setPlayerColor('white')}
          >
            <span className="piece">♔</span>
            <span>{t('playWhite')}</span>
          </button>
          <button
            className={`color-btn ${playerColor === 'black' ? 'selected' : ''} ${!features.canPlayBlack ? 'locked' : ''}`}
            onClick={() => features.canPlayBlack && setPlayerColor('black')}
          >
            <span className="piece">♚</span>
            <span>{t('playBlack')}</span>
            {!features.canPlayBlack && <span className="lock">🔒</span>}
          </button>
        </div>
      </div>

      {/* Depth selection */}
      <div className="config-section">
        <h2>{t('chooseDepth')}</h2>
        <p className="section-desc">{t('depthMoves')}</p>
        <div className="depth-options">
          {DEPTH_OPTIONS.map(depth => (
            <button
              key={depth}
              className={`depth-btn ${targetDepth === depth ? 'selected' : ''} ${depth > features.maxDepth ? 'locked' : ''}`}
              onClick={() => depth <= features.maxDepth && setTargetDepth(depth)}
            >
              {depth}
              {depth > features.maxDepth && <span className="lock-small">🔒</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Opening selection */}
      <div className="config-section">
        <h2>{t('chooseOpening')}</h2>
        <select
          className="opening-select"
          value={selectedOpening}
          onChange={(e) => setSelectedOpening(e.target.value)}
          disabled={!features.canChooseOpening}
        >
          <option value="random">{t('randomOpening')} {!features.canChooseOpening && '🔒'}</option>
          {features.canChooseOpening && openings.map(op => (
            <option key={op.id} value={op.id}>
              {op.name} ({op.eco})
            </option>
          ))}
        </select>

        {/* Opening preview */}
        {features.canChooseOpening && selectedOpening !== 'random' && (
          <div className="opening-preview">
            {(() => {
              const op = getOpeningById(selectedOpening, playerColor);
              if (!op) return null;
              return (
                <>
                  <div className="opening-preview-header">
                    <span className="opening-preview-name">{op.name}</span>
                    <span className="opening-preview-eco">{op.eco}</span>
                  </div>
                  {op.description && <p className="opening-preview-desc">{op.description}</p>}
                  {op.strategy && (
                    <div className="opening-preview-strategy">
                      <h4>📋 {lang === 'fr' ? 'Stratégie' : 'Strategy'}</h4>
                      <p>{op.strategy}</p>
                    </div>
                  )}
                  {op.keyIdeas && op.keyIdeas.length > 0 && (
                    <div className="opening-preview-ideas">
                      <h4>💡 {lang === 'fr' ? 'Idées clés' : 'Key Ideas'}</h4>
                      <ul>
                        {op.keyIdeas.map((idea, i) => <li key={i}>{idea}</li>)}
                      </ul>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}
      </div>

      {/* Start button */}
      <button className="start-btn" onClick={handleStart}>
        {t('start')} →
      </button>

      {/* Premium link */}
      {!isPremium && (
        <button className="premium-link" onClick={() => navigate('/premium')}>
          👑 {t('goPremium')}
        </button>
      )}
    </div>
  );
}
