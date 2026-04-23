import { useLanguage } from '../hooks/useLanguage';
import './ScoreDisplay.css';

interface ScoreDisplayProps {
  openingName: string;
  currentScore: number;
  lastMoveScore?: number;
  moveCount: number;
  targetDepth: number;
}

export function ScoreDisplay({ 
  openingName, 
  currentScore, 
  lastMoveScore,
  moveCount,
  targetDepth 
}: ScoreDisplayProps) {
  const { t } = useLanguage();
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return '#4caf50';
    if (score >= 70) return '#8bc34a';
    if (score >= 50) return '#ffc107';
    if (score >= 30) return '#ff9800';
    return '#f44336';
  };

  const progress = Math.min(100, (moveCount / targetDepth) * 100);

  return (
    <div className="score-display">
      <div className="opening-name">{openingName}</div>
      
      <div className="score-row">
        <div className="score-main">
          <span className="score-label">{t('score')}</span>
          <span 
            className="score-value" 
            style={{ color: getScoreColor(currentScore) }}
          >
            {currentScore}
          </span>
        </div>
        
        {lastMoveScore !== undefined && (
          <div className="score-last">
            <span className="score-label">{t('lastMove')}</span>
            <span 
              className="score-last-value"
              style={{ color: getScoreColor(lastMoveScore) }}
            >
              {lastMoveScore}
            </span>
          </div>
        )}
      </div>
      
      <div className="progress-container">
        <span className="progress-label">
          {t('moveCount')} {moveCount} / {targetDepth}
        </span>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ 
              width: `${progress}%`,
              background: getScoreColor(currentScore)
            }}
          />
        </div>
      </div>
    </div>
  );
}
