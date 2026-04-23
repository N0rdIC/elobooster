export type PlayerColor = 'white' | 'black';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Opening {
  id: string;
  name: string;
  eco: string;
  moves: string[];
  fen: string;
  description?: string;
  strategy?: string;
  keyIdeas?: string[];
}

export interface GameMove {
  san: string;
  uci: string;
  fen: string;
  isPlayerMove: boolean;
  score?: number;
  bestMove?: string;
  evaluation?: number;
  isAutoPlay?: boolean; // Opening setup moves
}

export interface GameState {
  opening: Opening;
  playerColor: PlayerColor;
  difficulty: Difficulty;
  targetDepth: number;
  moves: GameMove[];
  currentScore: number;
  isComplete: boolean;
  isModalVisible: boolean;
  currentEval: number | null;
}

export interface GameConfig {
  opening: Opening;
  playerColor: PlayerColor;
  difficulty: Difficulty;
  targetDepth: number;
}

export interface PremiumStatus {
  isPremium: boolean;
  source?: 'subscription' | 'lifetime';
}

export interface StockfishResult {
  bestMove: string;
  eval: number; // Centipawns from side to move perspective
  depth: number;
}

export interface TopMove {
  move: string;
  eval: number;
  rank: number;
}

// Feature limits
export const FREE_LIMITS = {
  maxDepth: 5,
  canPlayBlack: false,
  canChooseOpening: false,
  dailyGames: 3,
  hasReview: false,
};

export const PREMIUM_FEATURES = {
  maxDepth: 15,
  canPlayBlack: true,
  canChooseOpening: true,
  dailyGames: Infinity,
  hasReview: true,
};
