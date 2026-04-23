// Écran de jeu principal

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import { Square } from 'chess.js';
import { useGameStore } from '../store/gameStore';
import { useLanguage } from '../hooks/useLanguage';
import { ScoreDisplay } from '../components/ScoreDisplay';
import { EvalBar } from '../components/EvalBar';
import { getScoreEmoji, formatMoveList } from '../services/scoring';
import './GameScreen.css';

type Arrow = [Square, Square, string?];

export function GameScreen() {
  const navigate = useNavigate();
  const { t, lang } = useLanguage();
  const { game, makeMove, resetGame, startGame } = useGameStore();
  const [showArrow, setShowArrow] = useState(false);
  const [arrowData, setArrowData] = useState<{ from: Square; to: Square } | null>(null);

  // Fonction pour fermer le modal
  const closeModal = () => {
    const currentGame = useGameStore.getState().game;
    if (currentGame) {
      useGameStore.setState({ game: { ...currentGame, showGameOverModal: false } });
    }
  };

  // Recommencer avec la même config
  const handleRestart = async () => {
    if (game) {
      await startGame(game.config);
    }
  };

  // Gérer l'affichage de la flèche pour le meilleur coup
  useEffect(() => {
    if (!game) return;
    
    const lastMove = game.moves[game.moves.length - 1];
    if (lastMove?.playerMove?.bestMoveFrom && lastMove?.playerMove?.bestMoveTo) {
      setArrowData({
        from: lastMove.playerMove.bestMoveFrom as Square,
        to: lastMove.playerMove.bestMoveTo as Square
      });
      setShowArrow(true);
      
      const timer = setTimeout(() => {
        setShowArrow(false);
        setArrowData(null);
      }, 2500);
      
      return () => clearTimeout(timer);
    } else {
      setShowArrow(false);
      setArrowData(null);
    }
  }, [game?.moves.length]);

  if (!game) {
    return (
      <div className="game-screen">
        <p className="no-game">{t('noGame')}</p>
        <button className="btn-primary" onClick={() => navigate('/')}>
          {t('newGame')}
        </button>
      </div>
    );
  }

  const handleDrop = (sourceSquare: string, targetSquare: string) => {
    if (!game.isPlayerTurn || game.isGameOver) return false;
    makeMove(sourceSquare, targetSquare);
    return true;
  };

  const handleQuit = () => {
    if (confirm(t('quitConfirm'))) {
      resetGame();
      navigate('/');
    }
  };

  const handleGameOver = () => {
    resetGame();
    navigate('/');
  };

  const lastMove = game.moves[game.moves.length - 1];
  const lastPlayerScore = lastMove?.playerMove?.score;
  const playerMoveCount = game.moves.filter(m => m.playerMove).length;
  
  // Formater la liste des coups
  const moveList = formatMoveList(game.moves, game.config.playerColor);

  // Flèches personnalisées pour le meilleur coup
  const customArrows: Arrow[] = [];
  if (showArrow && arrowData) {
    customArrows.push([arrowData.from, arrowData.to, 'rgba(0, 200, 80, 0.8)']);
  }

  // Obtenir le commentaire localisé basé sur la qualité et Stockfish
  const getLocalizedCommentary = () => {
    if (!lastMove?.playerMove) return '';
    const moveScore = lastMove.playerMove;
    
    // Si c'est un choix d'ouverture, message spécial
    if (moveScore.isOpeningChoice) {
      return lang === 'fr' 
        ? "Bon choix d'ouverture ! Toutes les ouvertures principales sont valables."
        : "Good opening choice! All main openings are valid.";
    }
    
    // Si on a une explication Stockfish, l'utiliser (priorité sur "hors théorie")
    if (moveScore.explanation) {
      return moveScore.explanation.text;
    }
    
    // Si pas de données Lichess ET pas d'évaluation Stockfish
    if (!moveScore.isTheory && moveScore.score === -1 && !moveScore.moveQuality) {
      return t('outOfTheoryComment');
    }
    
    // Sinon, commentaire basé sur la qualité
    const evalText = moveScore.stockfishEvalText ? ` (eval: ${moveScore.stockfishEvalText})` : '';
    
    // Utiliser moveQuality (Stockfish) si disponible, sinon quality (winrate)
    const quality = moveScore.moveQuality || moveScore.quality;
    
    if (quality === 'excellent') {
      return t('excellent').split('.')[0] + '.' + evalText;
    }
    if (quality === 'good') {
      return t('goodTheory') + evalText;
    }
    if (quality === 'inaccuracy' || quality === 'playable') {
      if (moveScore.evalDiff && Math.abs(moveScore.evalDiff) > 0.25) {
        return `${t('acceptable').split('.')[0]} — Perte de ${Math.abs(moveScore.evalDiff).toFixed(1)} pion${evalText}`;
      }
      return t('goodTheory') + evalText;
    }
    if (quality === 'mistake') {
      return `${t('imprecise').split('.')[0]} — Erreur de ${Math.abs(moveScore.evalDiff || 0).toFixed(1)} pion${evalText}`;
    }
    if (quality === 'blunder') {
      return `💥 Gaffe ! Perte de ${Math.abs(moveScore.evalDiff || 0).toFixed(1)} pion${evalText}`;
    }
    if (quality === 'dubious' && moveScore.bestMove) {
      return `${t('imprecise').split('.')[0]}${evalText}`;
    }
    
    return t('goodTheory') + evalText;
  };

  return (
    <div className="game-screen">
      {/* Header */}
      <div className="game-header">
        <button className="quit-btn" onClick={handleQuit}>✕</button>
        <span className="turn-indicator">
          {game.config.playerColor === 'white' ? '♔' : '♚'}{' '}
          {game.isPlayerTurn && !game.isGameOver ? t('yourTurn') : t('waiting')}
        </span>
        <div className="spacer" />
      </div>

      {/* Score */}
      <ScoreDisplay
        currentScore={game.currentScore}
        lastMoveScore={lastPlayerScore}
        depth={playerMoveCount}
        targetDepth={game.config.targetDepth}
        openingName={game.openingName}
      />

      <div className="game-content">
        {/* Evaluation bar + Échiquier */}
        <div className="board-with-eval">
          <EvalBar 
            eval={game.currentEval ?? 0}
            evalText={game.currentEvalText}
            orientation={game.config.playerColor}
          />
          <div className="board-container">
            <Chessboard
              position={game.currentFen}
              onPieceDrop={handleDrop}
              boardOrientation={game.config.playerColor}
              arePiecesDraggable={game.isPlayerTurn && !game.isGameOver}
              customArrows={customArrows}
              customBoardStyle={{
                borderRadius: '8px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              }}
              customDarkSquareStyle={{ backgroundColor: '#B58863' }}
              customLightSquareStyle={{ backgroundColor: '#F0D9B5' }}
            />
          </div>
        </div>

        {/* Panel latéral : Notation + Commentaire */}
        <div className="side-panel">
          {/* Notation des coups */}
          <div className="move-list">
            <h3>{t('playedMoves')}</h3>
            <div className="moves">
              {moveList.length === 0 ? (
                <span className="no-moves">{t('startPlaying')}</span>
              ) : (
                moveList.map((move, i) => (
                  <span key={i} className="move-notation">{move}</span>
                ))
              )}
            </div>
          </div>

          {/* Commentaire du dernier coup */}
          {lastMove?.playerMove && (
            <div className={`commentary ${(!lastMove.playerMove.isTheory && lastMove.playerMove.score === -1 && !lastMove.playerMove.moveQuality && !lastMove.playerMove.explanation) ? 'out-of-theory' : ''} ${(lastMove.playerMove.moveQuality === 'mistake' || lastMove.playerMove.moveQuality === 'blunder') ? 'mistake' : ''} ${lastMove.playerMove.moveQuality === 'inaccuracy' ? 'inaccuracy' : ''}`}>
              <div className="commentary-header">
                <span className="commentary-emoji">{getScoreEmoji(lastMove.playerMove.score, lastMove.playerMove.moveQuality)}</span>
                {(lastMove.playerMove.isTheory || lastMove.playerMove.score >= 0 || lastMove.playerMove.moveQuality || lastMove.playerMove.explanation) ? (
                  <>
                    <span className="commentary-score">{lastMove.playerMove.score >= 0 ? lastMove.playerMove.score : 0}/100</span>
                    {lastMove.playerMove.stockfishEvalText && (
                      <span className="commentary-eval">{lastMove.playerMove.stockfishEvalText}</span>
                    )}
                  </>
                ) : (
                  <span className="commentary-score out-of-theory-label">{t('outOfTheoryLabel')}</span>
                )}
              </div>
              <p className="commentary-text">{getLocalizedCommentary()}</p>
              
              {/* Explication détaillée si erreur/gaffe */}
              {lastMove.playerMove.explanation && (
                <div className="explanation-box">
                  <div className="explanation-title">{lastMove.playerMove.explanation.title}</div>
                  <div className="explanation-suggestion">{lastMove.playerMove.explanation.suggestion}</div>
                </div>
              )}
              
              {/* Meilleur coup alternatif */}
              {lastMove.playerMove.bestMove && lastMove.playerMove.score < 100 && (
                <div className="best-move-hint">
                  <span className="arrow-icon">➜</span>
                  {t('bestMove')} : <strong>{lastMove.playerMove.bestMove}</strong>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Indicateur de tour */}
      {!game.isGameOver && (
        <div className="turn-banner">
          {game.isPlayerTurn ? (
            <span className="your-turn">{t('yourTurnBanner')}</span>
          ) : (
            <span className="waiting">{t('opponentThinking')}</span>
          )}
        </div>
      )}

      {/* Game Over Modal */}
      {game.isGameOver && game.showGameOverModal && (
        <div className="game-over-modal" onClick={closeModal}>
          <div className="game-over-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>✕</button>
            <h2>{t('gameOver')}</h2>
            <p className="game-over-reason">
              {game.gameOverReason === 'depth_reached' && t('depthReached')}
              {game.gameOverReason === 'out_of_theory' && t('outOfTheory')}
              {game.gameOverReason === 'checkmate' && t('checkmate')}
              {game.gameOverReason === 'stalemate' && t('stalemate')}
            </p>
            <div className="final-score">
              <span className="final-score-label">{t('finalScore')}</span>
              <span className="final-score-value">
                {game.currentScore} {getScoreEmoji(game.currentScore)}
              </span>
            </div>
            <div className="final-moves">
              <span className="final-moves-label">{t('playedLine')}</span>
              <div className="final-moves-list">
                {moveList.join(' ')}
              </div>
            </div>
            <div className="modal-buttons">
              <button className="btn-secondary" onClick={closeModal}>
                {t('seePosition')}
              </button>
              <button className="btn-restart" onClick={handleRestart}>
                {t('restart')}
              </button>
              <button className="btn-primary" onClick={handleGameOver}>
                {t('newGame')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
