// Move scoring service

import { evaluatePosition } from './stockfishLocal';

interface ScoreResult {
  score: number;
  bestMove: string;
  playedMoveEval: number;
  bestMoveEval: number;
  explanation?: string;
}

export async function scoreMove(
  fenBefore: string,
  fenAfter: string,
  playedMoveUci: string,
  playerIsWhite: boolean
): Promise<ScoreResult> {
  // Get evaluation before and after the move
  const [evalBefore, evalAfter] = await Promise.all([
    evaluatePosition(fenBefore, 8),
    evaluatePosition(fenAfter, 8),
  ]);

  // If played move is the best move, score = 100
  if (playedMoveUci === evalBefore.bestMove) {
    return {
      score: 100,
      bestMove: evalBefore.bestMove,
      playedMoveEval: evalAfter.eval,
      bestMoveEval: evalBefore.eval,
    };
  }

  // Calculate eval difference from player's perspective
  // evalBefore.eval is from side-to-move perspective (player)
  // evalAfter.eval is from opponent's perspective (need to negate)
  const evalBeforeWhite = playerIsWhite ? evalBefore.eval : -evalBefore.eval;
  const evalAfterWhite = playerIsWhite ? -evalAfter.eval : evalAfter.eval;
  
  // Positive evalDiff = player improved position, negative = player worsened
  const evalDiff = (evalAfterWhite - evalBeforeWhite) / 100; // Convert to pawns

  // Score based on eval loss
  let score: number;
  const loss = Math.abs(Math.min(0, evalDiff)); // Only penalize losses
  
  if (loss < 0.1) {
    score = 100;
  } else if (loss < 0.3) {
    score = 85;
  } else if (loss < 0.6) {
    score = 65;
  } else if (loss < 1.2) {
    score = 45;
  } else if (loss < 2.0) {
    score = 25;
  } else {
    score = 10;
  }

  return {
    score,
    bestMove: evalBefore.bestMove,
    playedMoveEval: -evalAfter.eval, // From player's perspective
    bestMoveEval: evalBefore.eval,
  };
}

export function getScoreEmoji(score: number): string {
  if (score >= 90) return '🎯';
  if (score >= 70) return '👍';
  if (score >= 50) return '🤔';
  if (score >= 30) return '😬';
  return '❌';
}

export function getScoreClass(score: number): string {
  if (score >= 90) return '';
  if (score >= 70) return 'dubious';
  if (score >= 50) return 'inaccuracy';
  return 'mistake';
}
