// Game screen with chessboard

import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import { useLanguage } from '../hooks/useLanguage';
import { useGameStore } from '../store/gameStore';
import { EvalBar } from '../components/EvalBar';
import { ScoreDisplay } from '../components/ScoreDisplay';
import { getScoreEmoji, getScoreClass } from '../services/scoring';
import { getExplanation, formatMoveNotation } from '../services/explanations';
import './GameScreen.css';

export function GameScreen() {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { game, chess, isLoading, makeMove, resetGame, hideModal } = useGameStore();

  // Redirect if no game
  useEffect(() => {
    if (!game || !chess) {
      navigate('/');
    }
  }, [game, chess, navigate]);

  const handleDrop = useCallback((sourceSquare: string, targetSquare: string, piece: string) => {
    if (isLoading || !game || game.isComplete) return false;

    // Check if it's player's turn
    const isWhiteTurn = chess?.turn() === 'w';
    const isPlayerTurn = (game.playerColor === 'white' && isWhiteTurn) ||
                         (game.playerColor === 'black' && !isWhiteTurn);
    
    if (!isPlayerTurn) return false;

    // Check for promotion
    const isPromotion = piece[1].toLowerCase() === 'p' && 
                       (targetSquare[1] === '8' || targetSquare[1] === '1');
    
    makeMove(sourceSquare, targetSquare, isPromotion ? 'q' : undefined);
    return true;
  }, [chess, game, isLoading, makeMove]);

  if (!game || !chess) return null;

  // Get current position info
  const isWhiteTurn = chess.turn() === 'w';
  const isPlayerTurn = (game.playerColor === 'white' && isWhiteTurn) ||
                       (game.playerColor === 'black' && !isWhiteTurn);

  // Get last player move
  const playerMoves = game.moves.filter(m => m.isPlayerMove && !m.isAutoPlay);
  const lastPlayerMove = playerMoves[playerMoves.length - 1];
  const playerMoveCount = playerMoves.length;

  // Arrow for better move suggestion
  const customArrows: [string, string, string][] = [];
  if (lastPlayerMove && lastPlayerMove.score !== undefined && lastPlayerMove.score < 70 && lastPlayerMove.bestMove) {
    const bestFrom = lastPlayerMove.bestMove.slice(0, 2);
    const bestTo = lastPlayerMove.bestMove.slice(2, 4);
    customArrows.push([bestFrom, bestTo, 'rgba(0, 200, 80, 0.7)']);
  }

  return (
    <div className="game-screen">
      <div className="game-header">
        <button className="quit-btn" onClick={() => { resetGame(); navigate('/'); }}>
          ×
        </button>
        <div className="turn-indicator">
          {isPlayerTurn ? t('yourTurn') : t('opponentTurn')}
        </div>
        <div className="spacer" />
      </div>

      <div className="game-content">
        <div className="board-with-eval">
          <EvalBar evaluation={game.currentEval} />
          
          <div className="board-container">
            <Chessboard
              position={chess.fen()}
              onPieceDrop={handleDrop}
              boardOrientation={game.playerColor}
              customArrows={customArrows}
              customBoardStyle={{
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              }}
            />
            
            {isLoading && (
              <div className="loading-overlay">
                <div className="spinner" />
                {!isPlayerTurn && <span>{t('opponentTurn')}</span>}
              </div>
            )}
          </div>
        </div>

        <div className="side-panel">
          <ScoreDisplay
            openingName={game.opening.name}
            currentScore={game.currentScore}
            lastMoveScore={lastPlayerMove?.score}
            moveCount={playerMoveCount}
            targetDepth={game.targetDepth}
          />

          {/* Commentary */}
          {lastPlayerMove && lastPlayerMove.score !== undefined && (
            <div className={`commentary ${getScoreClass(lastPlayerMove.score)}`}>
              <div className="commentary-header">
                <span className="commentary-emoji">{getScoreEmoji(lastPlayerMove.score)}</span>
                <span className="commentary-score">{lastPlayerMove.score}/100</span>
              </div>
              
              {lastPlayerMove.score < 70 && lastPlayerMove.bestMove && (
                <div className="best-move-hint">
                  <span className="arrow-icon">→</span>
                  {t('bestMove')} <strong>{formatMoveNotation(lastPlayerMove.bestMove)}</strong>
                </div>
              )}
              
              {lastPlayerMove.score < 70 && (
                <div className="explanation-box">
                  <div className="explanation-title">💡 Conseil</div>
                  <p className="explanation-suggestion">
                    {getExplanation(playerMoveCount, lastPlayerMove.score, lang)}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Move list */}
          <div className="move-list">
            <h3>{lang === 'fr' ? 'Coups joués' : 'Moves played'}</h3>
            <div className="moves">
              {game.moves.filter(m => !m.isAutoPlay).map((move, i) => (
                <span key={i} className="move-notation">
                  {move.san}
                </span>
              ))}
              {game.moves.filter(m => !m.isAutoPlay).length === 0 && (
                <span className="no-moves">{lang === 'fr' ? 'Aucun coup' : 'No moves yet'}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Game over modal */}
      {game.isModalVisible && (
        <div className="game-over-modal">
          <div className="game-over-content">
            <button className="modal-close" onClick={hideModal}>×</button>
            <h2>{t('gameOver')}</h2>
            <p className="game-over-reason">{t('targetReached')}</p>
            
            <div className="final-score">
              <span className="final-score-label">{t('finalScore')}</span>
              <span className="final-score-value">{game.currentScore}</span>
            </div>
            
            <div className="modal-buttons">
              <button className="btn-primary" onClick={() => { resetGame(); navigate('/'); }}>
                {t('playAgain')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
