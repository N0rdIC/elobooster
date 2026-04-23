// Composant d'affichage du score

import { getScoreColor, getScoreEmoji } from '../services/scoring';
import './ScoreDisplay.css';

interface ScoreDisplayProps {
  currentScore: number;
  lastMoveScore?: number;
  depth: number;
  targetDepth: number;
  openingName?: string;
}

export function ScoreDisplay({
  currentScore,
  lastMoveScore,
  depth,
  targetDepth,
  openingName,
}: ScoreDisplayProps) {
  const progress = Math.min((depth / targetDepth) * 100, 100);

  return (
    <div className="score-display">
      {openingName && <div className="opening-name">{openingName}</div>}

      <div className="score-row">
        <div className="score-main">
          <span className="score-label">Score</span>
          <span className="score-value" style={{ color: getScoreColor(currentScore) }}>
            {currentScore}
          </span>
        </div>

        {lastMoveScore !== undefined && (
          <div className="score-last">
            <span className="score-label">Dernier coup</span>
            <span className="score-last-value">
              {getScoreEmoji(lastMoveScore)}{' '}
              <span style={{ color: getScoreColor(lastMoveScore) }}>{lastMoveScore}</span>
            </span>
          </div>
        )}
      </div>

      <div className="progress-container">
        <span className="progress-label">Profondeur: {depth} / {targetDepth}</span>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${progress}%`,
              backgroundColor: progress >= 100 ? '#4CAF50' : '#D4AF37',
            }}
          />
        </div>
      </div>
    </div>
  );
}
