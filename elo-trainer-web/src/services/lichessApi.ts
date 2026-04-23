// Service pour l'API Lichess Opening Explorer
// Combine les bases Lichess (parties amateurs) et Masters (parties de maîtres)

import { OpeningExplorerResponse, OpeningMove, Difficulty } from '../types';

const LICHESS_API = 'https://explorer.lichess.ovh/lichess';
const MASTERS_API = 'https://explorer.lichess.ovh/masters';
const CLOUD_EVAL_API = 'https://lichess.org/api/cloud-eval';
const TABLEBASE_API = 'https://tablebase.lichess.ovh/standard';

// Stockfish analysis configuration
const STOCKFISH_DEPTH = 18; // Depth 18 = approximately level 7-8 strength
const STOCKFISH_MULTI_PV = 3; // Analyze top 3 moves

// === OPENING EXPLORER ===

export async function fetchOpeningMoves(
  fen: string,
  difficulty: Difficulty = 'medium'
): Promise<OpeningExplorerResponse> {
  const ratings = difficulty === 'easy' ? '1600,1800' : 
                  difficulty === 'hard' ? '2200,2500' : '1800,2000,2200';
  
  const lichessParams = new URLSearchParams({
    fen,
    ratings,
    speeds: 'rapid,classical,correspondence',
    moves: '15',
  });

  try {
    // Requête parallèle sur les deux bases pour plus de profondeur
    const [lichessResponse, mastersResponse] = await Promise.all([
      fetch(`${LICHESS_API}?${lichessParams}`)
        .then(r => r.ok ? r.json() : null)
        .catch(() => null),
      fetch(`${MASTERS_API}?fen=${encodeURIComponent(fen)}&moves=15`)
        .then(r => r.ok ? r.json() : null)
        .catch(() => null),
    ]);

    // Combiner les résultats
    return combineOpeningData(lichessResponse, mastersResponse);
  } catch {
    return { white: 0, black: 0, draws: 0, moves: [] };
  }
}

function combineOpeningData(
  lichess: OpeningExplorerResponse | null,
  masters: OpeningExplorerResponse | null
): OpeningExplorerResponse {
  // Si aucune source disponible
  if (!lichess && !masters) {
    return { white: 0, black: 0, draws: 0, moves: [] };
  }
  
  // Si une seule source
  if (!lichess) return masters!;
  if (!masters) return lichess;

  // Combiner les deux sources
  const moveMap = new Map<string, OpeningMove>();

  // Ajouter les coups Lichess
  for (const move of lichess.moves) {
    moveMap.set(move.san, { ...move });
  }

  // Ajouter/fusionner les coups Masters (poids x5 car plus fiable et plus profond)
  for (const move of masters.moves) {
    const existing = moveMap.get(move.san);
    if (existing) {
      existing.white += move.white * 5;
      existing.black += move.black * 5;
      existing.draws += move.draws * 5;
      // Garder l'UCI si disponible
      if (move.uci && !existing.uci) {
        existing.uci = move.uci;
      }
    } else {
      moveMap.set(move.san, {
        ...move,
        white: move.white * 5,
        black: move.black * 5,
        draws: move.draws * 5,
      });
    }
  }

  // Trier par popularité
  const combinedMoves = Array.from(moveMap.values())
    .sort((a, b) => (b.white + b.black + b.draws) - (a.white + a.black + a.draws));

  return {
    white: lichess.white + (masters.white * 5),
    black: lichess.black + (masters.black * 5),
    draws: lichess.draws + (masters.draws * 5),
    moves: combinedMoves,
    // Préférer le nom d'ouverture de Masters (plus précis)
    opening: masters.opening || lichess.opening,
  };
}

// === CLOUD EVAL (STOCKFISH) ===

export interface CloudEvalResult {
  fen: string;
  knodes: number;
  depth: number;
  pvs: {
    moves: string;  // UCI format: "e2e4 e7e5 g1f3"
    cp?: number;    // Centipawns evaluation
    mate?: number;  // Mate in X moves
  }[];
}

export interface EvalData {
  eval: number;           // En centipions (+ = avantage blancs)
  evalText: string;       // "+0.5" ou "M3"
  bestMove: string;       // UCI format
  bestMoveSan?: string;   // SAN format (si on peut le convertir)
  depth: number;
  isMate: boolean;
  mateIn?: number;
}

export async function fetchCloudEval(fen: string): Promise<EvalData | null> {
  try {
    // Request analysis with configured depth and multiPv
    const params = new URLSearchParams({
      fen,
      multiPv: STOCKFISH_MULTI_PV.toString(),
    });
    
    const response = await fetch(`${CLOUD_EVAL_API}?${params}`);
    
    if (!response.ok) {
      // 404 = position not in cloud database
      return null;
    }
    
    const data: CloudEvalResult = await response.json();
    
    // Check if analysis depth meets our minimum requirement
    if (!data.pvs || data.pvs.length === 0) {
      return null;
    }
    
    // Log depth for debugging
    console.log(`Cloud eval depth: ${data.depth} (min required: ${STOCKFISH_DEPTH})`);
    
    const bestLine = data.pvs[0];
    const isMate = bestLine.mate !== undefined;
    
    let evalValue: number;
    let evalText: string;
    
    if (isMate) {
      evalValue = bestLine.mate! > 0 ? 10000 : -10000;
      evalText = `M${Math.abs(bestLine.mate!)}`;
    } else {
      evalValue = bestLine.cp || 0;
      evalText = (evalValue >= 0 ? '+' : '') + (evalValue / 100).toFixed(1);
    }
    
    // Extract best move (first move of PV)
    const bestMoveUci = bestLine.moves.split(' ')[0];
    
    return {
      eval: evalValue,
      evalText,
      bestMove: bestMoveUci,
      depth: data.depth,
      isMate,
      mateIn: bestLine.mate,
    };
  } catch (error) {
    console.error('Cloud eval error:', error);
    return null;
  }
}

// Comparer l'évaluation avant/après un coup
export async function evaluateMove(
  fenBefore: string,
  fenAfter: string,
  playedMoveUci: string
): Promise<{
  evalBefore: EvalData | null;
  evalAfter: EvalData | null;
  evalDiff: number;  // Différence en centipions (négatif = perte)
  bestMoveUci: string | null;
  wasBestMove: boolean;
}> {
  const [evalBefore, evalAfter] = await Promise.all([
    fetchCloudEval(fenBefore),
    fetchCloudEval(fenAfter)
  ]);
  
  let evalDiff = 0;
  let wasBestMove = false;
  
  if (evalBefore && evalAfter) {
    // Calculer la différence (du point de vue du joueur qui vient de jouer)
    // Si c'était aux blancs de jouer, une évaluation plus basse après = perte
    const isWhiteToMove = fenBefore.includes(' w ');
    
    if (isWhiteToMove) {
      evalDiff = (evalAfter.eval - evalBefore.eval) / 100; // Négatif = perte pour les blancs
    } else {
      evalDiff = (evalBefore.eval - evalAfter.eval) / 100; // Négatif = perte pour les noirs
    }
  }
  
  if (evalBefore) {
    wasBestMove = evalBefore.bestMove === playedMoveUci;
  }
  
  return {
    evalBefore,
    evalAfter,
    evalDiff,
    bestMoveUci: evalBefore?.bestMove || null,
    wasBestMove
  };
}

// === HELPERS ===

export function selectOpponentMove(
  moves: OpeningMove[],
  difficulty: Difficulty
): OpeningMove | null {
  if (moves.length === 0) return null;

  const movesWithTotal = moves.map(m => ({
    ...m,
    total: m.white + m.black + m.draws,
  }));

  // En facile: top 3 coups, en difficile: tous les coups
  const pool = difficulty === 'easy' 
    ? movesWithTotal.slice(0, 3) 
    : difficulty === 'hard'
    ? movesWithTotal
    : movesWithTotal.slice(0, 5);
    
  const totalGames = pool.reduce((sum, m) => sum + m.total, 0);
  
  if (totalGames === 0) return pool[0];

  // Sélection pondérée
  let random = Math.random() * totalGames;
  for (const move of pool) {
    random -= move.total;
    if (random <= 0) return move;
  }
  return pool[0];
}

export function isInTheory(data: OpeningExplorerResponse, minGames = 5): boolean {
  const total = data.white + data.black + data.draws;
  return total >= minGames && data.moves.length > 0;
}

// === TABLEBASE (PERFECT ENDGAME PLAY) ===

export interface TablebaseMove {
  uci: string;
  san: string;
  dtz: number | null;  // Distance to zeroing (capture or pawn move)
  dtm: number | null;  // Distance to mate
  category: 'win' | 'draw' | 'loss' | 'unknown';
  zeroing: boolean;
  checkmate: boolean;
  stalemate: boolean;
}

export interface TablebaseResult {
  dtz: number | null;
  dtm: number | null;
  category: 'win' | 'maybe-win' | 'cursed-win' | 'draw' | 'blessed-loss' | 'maybe-loss' | 'loss' | 'unknown';
  moves: TablebaseMove[];
  checkmate: boolean;
  stalemate: boolean;
}

// Get tablebase data for a position (up to 7 pieces)
export async function fetchTablebase(fen: string): Promise<TablebaseResult | null> {
  try {
    const response = await fetch(`${TABLEBASE_API}?fen=${encodeURIComponent(fen)}`);
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    // Parse moves with their evaluations
    const moves: TablebaseMove[] = (data.moves || []).map((m: any) => ({
      uci: m.uci,
      san: m.san,
      dtz: m.dtz,
      dtm: m.dtm,
      category: m.category || 'unknown',
      zeroing: m.zeroing || false,
      checkmate: m.checkmate || false,
      stalemate: m.stalemate || false,
    }));
    
    return {
      dtz: data.dtz,
      dtm: data.dtm,
      category: data.category || 'unknown',
      moves,
      checkmate: data.checkmate || false,
      stalemate: data.stalemate || false,
    };
  } catch (error) {
    console.error('Tablebase error:', error);
    return null;
  }
}

// Get the best move from tablebase (perfect play)
export function getBestTablebaseMove(result: TablebaseResult, isMaximizing: boolean): TablebaseMove | null {
  if (!result.moves || result.moves.length === 0) return null;
  
  // Sort moves by quality
  const sortedMoves = [...result.moves].sort((a, b) => {
    // First priority: category (win > draw > loss)
    const categoryOrder: Record<string, number> = {
      'win': 3, 'maybe-win': 2.5, 'cursed-win': 2,
      'draw': 1,
      'blessed-loss': 0, 'maybe-loss': -0.5, 'loss': -1, 'unknown': 0.5
    };
    const catDiff = (categoryOrder[b.category] || 0) - (categoryOrder[a.category] || 0);
    if (catDiff !== 0) return isMaximizing ? catDiff : -catDiff;
    
    // Second: prefer shorter distance to mate (when winning)
    if (a.dtm !== null && b.dtm !== null) {
      if (isMaximizing) {
        // Winning: prefer faster mate (smaller positive dtm)
        if (a.dtm > 0 && b.dtm > 0) return a.dtm - b.dtm;
        // Losing: prefer longer defense (larger negative dtm)
        if (a.dtm < 0 && b.dtm < 0) return a.dtm - b.dtm;
      } else {
        // Opposite for minimizing
        if (a.dtm > 0 && b.dtm > 0) return b.dtm - a.dtm;
        if (a.dtm < 0 && b.dtm < 0) return b.dtm - a.dtm;
      }
    }
    
    // Third: use dtz as tiebreaker
    if (a.dtz !== null && b.dtz !== null) {
      return isMaximizing ? (a.dtz - b.dtz) : (b.dtz - a.dtz);
    }
    
    return 0;
  });
  
  return sortedMoves[0];
}

// Count pieces in FEN to check if tablebase is applicable
export function countPieces(fen: string): number {
  const board = fen.split(' ')[0];
  return board.replace(/[0-8/]/g, '').length;
}
