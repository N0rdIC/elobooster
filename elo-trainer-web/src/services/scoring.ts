// Système de scoring avec évaluation Stockfish et explications

import { OpeningMove, MoveScore, GameMove } from '../types';
import { explanationPatterns, detectPattern, MoveQuality } from './explanations';

export interface EnhancedMoveScore extends MoveScore {
  stockfishEval?: number;      // Évaluation en centipions
  stockfishEvalText?: string;  // "+0.5" ou "M3"
  evalDiff?: number;           // Différence avec le meilleur coup
  moveQuality?: MoveQuality;   // excellent/good/inaccuracy/mistake/blunder
  explanation?: {
    title: string;
    text: string;
    suggestion: string;
  };
  isOpeningChoice?: boolean;   // Premier coup = choix libre
}

// Coups de départ "libres" - tous équivalents, pas de suggestion d'alternative
const OPENING_MOVES_WHITE = ['e4', 'd4', 'Nf3', 'c4', 'g3', 'b3', 'f4', 'Nc3', 'e3', 'b4'];
const OPENING_MOVES_BLACK_VS_E4 = ['e5', 'c5', 'e6', 'c6', 'd6', 'd5', 'Nf6', 'g6', 'Nc6', 'a6'];
const OPENING_MOVES_BLACK_VS_D4 = ['d5', 'Nf6', 'e6', 'f5', 'g6', 'c5', 'd6', 'c6'];
const OPENING_MOVES_BLACK_VS_NF3 = ['d5', 'Nf6', 'c5', 'g6', 'e6'];
const OPENING_MOVES_BLACK_VS_C4 = ['e5', 'c5', 'Nf6', 'e6', 'c6', 'g6'];

function isOpeningChoiceMove(move: string, ply: number, isWhite: boolean, fen: string): boolean {
  // Coup 1 des blancs = toujours choix libre
  if (ply === 1 && isWhite) {
    return OPENING_MOVES_WHITE.includes(move);
  }
  
  // Coup 1 des noirs = réponse libre selon l'ouverture blanche
  if (ply === 1 && !isWhite) {
    // Détecter ce que les blancs ont joué
    if (fen.includes('e4') || fen.includes('e2e4')) {
      return OPENING_MOVES_BLACK_VS_E4.includes(move);
    }
    if (fen.includes('d4') || fen.includes('d2d4')) {
      return OPENING_MOVES_BLACK_VS_D4.includes(move);
    }
    if (fen.includes('Nf3') || fen.includes('g1f3')) {
      return OPENING_MOVES_BLACK_VS_NF3.includes(move);
    }
    if (fen.includes('c4') || fen.includes('c2c4')) {
      return OPENING_MOVES_BLACK_VS_C4.includes(move);
    }
    // Par défaut, accepter les coups standards
    return [...OPENING_MOVES_BLACK_VS_E4, ...OPENING_MOVES_BLACK_VS_D4].includes(move);
  }
  
  return false;
}

export function calculateMoveScore(
  playedMove: string,
  availableMoves: OpeningMove[],
  ply: number = 1,
  isWhite: boolean = true,
  fen: string = ''
): MoveScore {
  
  const sortedMoves = [...availableMoves]
    .map(m => ({ ...m, total: m.white + m.black + m.draws }))
    .sort((a, b) => b.total - a.total);

  const playedMoveData = sortedMoves.find(m => m.san === playedMove || m.uci === playedMove);
  const playedIndex = sortedMoves.findIndex(m => m.san === playedMove || m.uci === playedMove);
  const isTheory = playedIndex !== -1;
  const rank = isTheory ? playedIndex + 1 : sortedMoves.length + 1;
  
  // Vérifier si c'est un choix d'ouverture libre
  const isOpeningChoice = isOpeningChoiceMove(playedMove, ply, isWhite, fen);

  // Calculer le winrate du coup joué
  let winrate = 50;
  let totalGames = 0;
  if (playedMoveData) {
    totalGames = playedMoveData.white + playedMoveData.black + playedMoveData.draws;
    if (totalGames > 0) {
      winrate = ((playedMoveData.white + playedMoveData.draws * 0.5) / totalGames) * 100;
    }
  }

  // Score basé sur la qualité
  let score: number;
  let quality: 'excellent' | 'good' | 'playable' | 'dubious' | 'unknown';
  
  // Si c'est un choix d'ouverture libre (premiers coups), c'est excellent même sans données Lichess
  if (isOpeningChoice) {
    score = 100;
    quality = 'excellent';
    // Return early - no need for Lichess data for opening choices
    return {
      move: playedMove,
      rank: 1,
      totalMoves: sortedMoves.length || 1,
      popularityPercent: 100,
      score,
      isTheory: true,
      quality,
      winrate: 50,
      totalGames: 0,
    };
  } else if (!isTheory) {
    score = -1;
    quality = 'unknown';
  } else if (totalGames >= 100) {
    if (winrate >= 48) {
      score = 100;
      quality = 'excellent';
    } else if (winrate >= 45) {
      score = 85;
      quality = 'good';
    } else if (winrate >= 40) {
      score = 70;
      quality = 'playable';
    } else {
      score = 50;
      quality = 'dubious';
    }
  } else if (totalGames >= 20) {
    if (winrate >= 45) {
      score = 90;
      quality = 'excellent';
    } else if (winrate >= 40) {
      score = 75;
      quality = 'good';
    } else {
      score = 60;
      quality = 'playable';
    }
  } else {
    score = 70;
    quality = 'playable';
  }

  // Trouver le coup le plus populaire (meilleur coup alternatif)
  const mostPopular = sortedMoves[0];
  let bestMove: string | undefined;
  let bestMoveFrom: string | undefined;
  let bestMoveTo: string | undefined;
  
  // Montrer le meilleur coup SEULEMENT si:
  // 1. Ce n'est pas un choix d'ouverture libre
  // 2. Le coup joué n'est pas le plus populaire
  // 3. Le coup joué n'est pas excellent
  if (!isOpeningChoice && mostPopular && mostPopular.san !== playedMove && quality !== 'excellent') {
    bestMove = mostPopular.san;
    if (mostPopular.uci && mostPopular.uci.length >= 4) {
      bestMoveFrom = mostPopular.uci.slice(0, 2);
      bestMoveTo = mostPopular.uci.slice(2, 4);
    }
  }

  const totalAllGames = sortedMoves.reduce((sum, m) => sum + m.total, 0);
  const popularityPercent = totalAllGames > 0 && playedMoveData 
    ? (totalGames / totalAllGames) * 100 
    : 0;

  return {
    move: playedMove,
    rank,
    totalMoves: sortedMoves.length,
    popularityPercent: Math.round(popularityPercent * 10) / 10,
    score: score === -1 ? -1 : Math.max(0, Math.min(100, Math.round(score))),
    isTheory,
    bestMove,
    bestMoveFrom,
    bestMoveTo,
    winrate: Math.round(winrate * 10) / 10,
    totalGames,
    quality,
    isOpeningChoice,
  };
}

// Améliorer le score avec l'évaluation Stockfish
export function enhanceMoveScoreWithEval(
  moveScore: MoveScore,
  evalDiff: number,
  bestMoveUci: string | null,
  stockfishEval: number | null,
  stockfishEvalText: string | null,
  fen: string,
  lang: 'fr' | 'en' = 'fr'
): EnhancedMoveScore {
  const enhanced: EnhancedMoveScore = { ...moveScore };
  
  if (stockfishEval !== null) {
    enhanced.stockfishEval = stockfishEval;
    enhanced.stockfishEvalText = stockfishEvalText || undefined;
  }
  
  // Use Stockfish bestMove if available
  if (bestMoveUci && bestMoveUci.length >= 4) {
    enhanced.bestMoveFrom = bestMoveUci.slice(0, 2);
    enhanced.bestMoveTo = bestMoveUci.slice(2, 4);
    enhanced.bestMove = `${bestMoveUci.slice(0, 2)}-${bestMoveUci.slice(2, 4)}`;
  }
  
  if (evalDiff !== undefined && evalDiff !== null) {
    enhanced.evalDiff = evalDiff;
    const absEvalDiff = Math.abs(evalDiff);
    
    // Classification Stockfish plus stricte
    // < 0.1 pion = excellent (le meilleur coup ou équivalent)
    // 0.1-0.3 = bon coup
    // 0.3-0.6 = imprécision légère
    // 0.6-1.2 = imprécision
    // 1.2-2.0 = erreur
    // > 2.0 = gaffe
    
    if (absEvalDiff < 0.1) {
      enhanced.moveQuality = 'excellent';
      enhanced.score = 100;
      enhanced.quality = 'excellent';
      enhanced.isTheory = true;
      // Best move - no suggestion needed
      enhanced.bestMove = undefined;
      enhanced.bestMoveFrom = undefined;
      enhanced.bestMoveTo = undefined;
    } else if (absEvalDiff < 0.3) {
      enhanced.moveQuality = 'good';
      enhanced.score = 85;
      enhanced.quality = 'good';
      enhanced.isTheory = true;
      // Good move - no suggestion needed
      enhanced.bestMove = undefined;
      enhanced.bestMoveFrom = undefined;
      enhanced.bestMoveTo = undefined;
    } else if (absEvalDiff < 0.6) {
      enhanced.moveQuality = 'inaccuracy';
      enhanced.score = 65;
      enhanced.quality = 'playable';
      enhanced.isTheory = true;
    } else if (absEvalDiff < 1.2) {
      enhanced.moveQuality = 'inaccuracy';
      enhanced.score = 45;
      enhanced.quality = 'dubious';
      enhanced.isTheory = true;
    } else if (absEvalDiff < 2.0) {
      enhanced.moveQuality = 'mistake';
      enhanced.score = 25;
      enhanced.quality = 'dubious';
      enhanced.isTheory = true;
    } else {
      enhanced.moveQuality = 'blunder';
      enhanced.score = 10;
      enhanced.quality = 'dubious';
      enhanced.isTheory = true;
    }
    
    // Ajouter une explication si le coup perd du matériel (> 0.3 pion)
    if (absEvalDiff >= 0.3) {
      const patternKey = detectPattern(
        moveScore.move,
        enhanced.bestMove || '',
        fen,
        absEvalDiff
      );
      
      if (patternKey && explanationPatterns[patternKey]) {
        const pattern = explanationPatterns[patternKey];
        enhanced.explanation = {
          title: pattern.title[lang],
          text: pattern.explanation[lang],
          suggestion: pattern.betterBecause[lang]
        };
      } else {
        // Explication générique basée sur la perte
        const lossText = absEvalDiff >= 2 
          ? (lang === 'fr' ? 'Gaffe importante !' : 'Major blunder!')
          : absEvalDiff >= 1.2 
          ? (lang === 'fr' ? 'Erreur significative.' : 'Significant error.')
          : (lang === 'fr' ? 'Coup imprécis.' : 'Imprecise move.');
          
        const suggestionText = lang === 'fr' 
          ? `Le coup suggéré améliore votre position de ${absEvalDiff.toFixed(1)} pion${absEvalDiff >= 2 ? 's' : ''}.`
          : `The suggested move improves your position by ${absEvalDiff.toFixed(1)} pawn${absEvalDiff >= 2 ? 's' : ''}.`;
          
        enhanced.explanation = {
          title: lossText,
          text: lang === 'fr' 
            ? `Perte d'environ ${absEvalDiff.toFixed(1)} pion${absEvalDiff >= 2 ? 's' : ''} d'avantage.`
            : `Loss of approximately ${absEvalDiff.toFixed(1)} pawn${absEvalDiff >= 2 ? 's' : ''} in advantage.`,
          suggestion: suggestionText
        };
      }
    }
  }
  
  return enhanced;
}

export function calculateGameScore(moves: GameMove[], targetDepth: number): number {
  const playerMoves = moves.filter(m => m.playerMove);
  if (playerMoves.length === 0) return 0;

  const scoredMoves = playerMoves.filter(m => m.playerMove && m.playerMove.score >= 0);
  if (scoredMoves.length === 0) return 0;

  const avgScore = scoredMoves.reduce((sum, m) => sum + (m.playerMove?.score || 0), 0) / scoredMoves.length;
  const depth = playerMoves.length;
  const multiplier = depth >= 20 ? 1.3 : depth >= 15 ? 1.2 : depth >= 10 ? 1.1 : 1.0;
  const bonus = depth >= targetDepth ? 10 : 0;

  return Math.min(100, Math.round(avgScore * multiplier + bonus));
}

export function getScoreEmoji(score: number, moveQuality?: MoveQuality): string {
  if (moveQuality) {
    switch (moveQuality) {
      case 'excellent': return '🌟';
      case 'good': return '✅';
      case 'inaccuracy': return '⚠️';
      case 'mistake': return '❌';
      case 'blunder': return '💥';
    }
  }
  if (score === -1) return '❓';
  if (score >= 90) return '🌟';
  if (score >= 75) return '✅';
  if (score >= 60) return '👍';
  if (score >= 40) return '😐';
  return '⚠️';
}

export function getScoreColor(score: number): string {
  if (score === -1) return '#888';
  if (score >= 90) return '#4CAF50';
  if (score >= 75) return '#8BC34A';
  if (score >= 60) return '#FFC107';
  if (score >= 40) return '#FF9800';
  return '#FF5722';
}

export function getMoveCommentary(moveScore: MoveScore | EnhancedMoveScore): string {
  const enhanced = moveScore as EnhancedMoveScore;
  const { score, isTheory, winrate, totalGames, quality } = moveScore;
  
  // Si on a une explication Stockfish, l'utiliser
  if (enhanced.explanation) {
    return enhanced.explanation.text;
  }
  
  // Si pas de données Lichess ET pas de validation Stockfish
  if (!isTheory && score === -1) {
    return "Hors théorie — Pas assez de données pour évaluer ce coup.";
  }
  
  // Sinon, commentaire basé sur la qualité
  if (quality === 'excellent') {
    if (winrate && totalGames && totalGames >= 50) {
      return `Excellent ! Coup de théorie solide. (${Math.round(winrate)}% winrate)`;
    }
    return `Excellent coup !`;
  }
  
  if (quality === 'good') {
    if (winrate && totalGames) {
      return `Très bon coup. (${Math.round(winrate)}% winrate)`;
    }
    return `Très bon coup.`;
  }
  
  if (quality === 'playable') {
    if (totalGames && totalGames < 50) {
      return `Coup jouable, mais peu de données. (${totalGames} parties)`;
    }
    if (winrate) {
      return `Coup acceptable. (${Math.round(winrate)}% winrate)`;
    }
    return `Coup acceptable.`;
  }
  
  if (quality === 'dubious') {
    if (winrate) {
      return `Coup douteux avec ${Math.round(winrate)}% de winrate.`;
    }
    return `Coup douteux.`;
  }
  
  return "Coup de théorie.";
}

// Formater la notation des coups
export function formatMoveList(moves: GameMove[], playerColor: 'white' | 'black'): string[] {
  const result: string[] = [];
  let moveNumber = 1;
  
  for (let i = 0; i < moves.length; i++) {
    const move = moves[i];
    
    if (playerColor === 'white') {
      if (move.playerMove) {
        const notation = `${moveNumber}. ${move.playerMove.move}`;
        if (move.opponentMove) {
          result.push(`${notation} ${move.opponentMove}`);
        } else {
          result.push(notation);
        }
        moveNumber++;
      } else if (move.opponentMove) {
        result.push(`${moveNumber}... ${move.opponentMove}`);
      }
    } else {
      if (move.opponentMove && !move.playerMove) {
        result.push(`${moveNumber}. ${move.opponentMove}`);
      } else if (move.opponentMove && move.playerMove) {
        result.push(`${moveNumber}. ${move.opponentMove} ${move.playerMove.move}`);
        moveNumber++;
      } else if (move.playerMove) {
        result.push(`${moveNumber}... ${move.playerMove.move}`);
        moveNumber++;
      }
    }
  }
  
  return result;
}
