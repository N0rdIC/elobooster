// Types pour le jeu d'entraînement aux ouvertures

export type PieceColor = 'white' | 'black';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface GameConfig {
  playerColor: PieceColor;
  targetDepth: number;
  difficulty: Difficulty;
  startingMoves?: string[];  // Coups de départ pour une ouverture spécifique
  openingName?: string;      // Nom de l'ouverture sélectionnée
}

export interface OpeningMove {
  san: string;
  uci: string;
  white: number;
  black: number;
  draws: number;
}

export interface OpeningExplorerResponse {
  white: number;
  black: number;
  draws: number;
  moves: OpeningMove[];
  opening?: { eco: string; name: string };
}

export interface MoveScore {
  move: string;
  rank: number;
  totalMoves: number;
  popularityPercent: number;
  score: number;
  isTheory: boolean;
  bestMove?: string; // Meilleur coup alternatif (SAN)
  bestMoveFrom?: string; // Case de départ (e2)
  bestMoveTo?: string; // Case d'arrivée (e4)
  // Données de qualité
  winrate?: number; // Pourcentage de victoires
  totalGames?: number; // Nombre de parties avec ce coup
  quality?: 'excellent' | 'good' | 'playable' | 'dubious' | 'unknown';
  isOpeningChoice?: boolean; // Premier coup = choix libre, pas de suggestion
  // Données Stockfish
  stockfishEval?: number; // Évaluation en centipions
  stockfishEvalText?: string; // "+0.5" ou "M3"
  evalDiff?: number; // Différence avec le meilleur coup
  moveQuality?: 'excellent' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';
  explanation?: {
    title: string;
    text: string;
    suggestion: string;
  };
}

export interface GameMove {
  ply: number;
  playerMove?: MoveScore;
  opponentMove?: string;
  fen: string;
  fenBefore?: string; // Position AVANT le coup (pour la flèche)
}

export interface GameState {
  config: GameConfig;
  moves: GameMove[];
  currentFen: string;
  currentScore: number;
  currentEval?: number; // Current position eval in centipawns
  currentEvalText?: string; // "+0.5" or "M3"
  isPlayerTurn: boolean;
  isGameOver: boolean;
  gameOverReason?: 'depth_reached' | 'out_of_theory' | 'checkmate' | 'stalemate';
  openingName?: string;
  showGameOverModal: boolean;
}

export interface PremiumStatus {
  isPremium: boolean;
  source?: 'subscription';
}

export const FREE_LIMITS = {
  maxDepth: 5,
  canPlayBlack: false,
  dailyGames: 3,
  hasReview: false,
} as const;

export const PREMIUM_FEATURES = {
  maxDepth: 20,
  canPlayBlack: true,
  dailyGames: Infinity,
  hasReview: true,
} as const;
