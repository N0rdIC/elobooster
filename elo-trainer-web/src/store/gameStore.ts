// Game state management

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Chess } from 'chess.js';
import type { 
  GameState, 
  GameConfig, 
  GameMove, 
  PremiumStatus,
  Opening,
  Difficulty,
} from '../types';
import { FREE_LIMITS, PREMIUM_FEATURES } from '../types';
import { scoreMove } from '../services/scoring';
import { evaluatePosition, getTopMoves, selectMoveByProbability } from '../services/stockfishLocal';

interface GameStore {
  game: GameState | null;
  chess: Chess | null;
  isLoading: boolean;
  error: string | null;
  premium: PremiumStatus;
  dailyGamesPlayed: number;
  lastPlayDate: string;
  recentScores: number[];
  gamesPlayed: number;

  startGame: (config: GameConfig) => Promise<void>;
  makeMove: (from: string, to: string, promotion?: string) => Promise<boolean>;
  makeOpponentMove: () => Promise<void>;
  resetGame: () => void;
  resetStats: () => void;
  showModal: () => void;
  hideModal: () => void;
  setPremium: (status: PremiumStatus) => void;
  canStartGame: () => boolean;
  getFeatures: () => typeof FREE_LIMITS | typeof PREMIUM_FEATURES;
  getAverageScore: () => number;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      game: null,
      chess: null,
      isLoading: false,
      error: null,
      premium: { isPremium: false },
      dailyGamesPlayed: 0,
      lastPlayDate: '',
      recentScores: [],
      gamesPlayed: 0,

      startGame: async (config: GameConfig) => {
        const chess = new Chess();
        const moves: GameMove[] = [];
        
        // Play opening moves
        for (let i = 0; i < config.opening.moves.length; i++) {
          const move = config.opening.moves[i];
          const result = chess.move(move);
          if (result) {
            const isPlayerMove = (i % 2 === 0 && config.playerColor === 'white') ||
                                 (i % 2 === 1 && config.playerColor === 'black');
            moves.push({
              san: result.san,
              uci: result.from + result.to + (result.promotion || ''),
              fen: chess.fen(),
              isPlayerMove,
              isAutoPlay: true, // Opening setup moves
            });
          }
        }

        // Update daily game count
        const today = new Date().toDateString();
        const { lastPlayDate, dailyGamesPlayed } = get();
        const newDailyCount = lastPlayDate === today ? dailyGamesPlayed + 1 : 1;

        const gameState: GameState = {
          opening: config.opening,
          playerColor: config.playerColor,
          difficulty: config.difficulty,
          targetDepth: config.targetDepth,
          moves,
          currentScore: 0,
          isComplete: false,
          isModalVisible: false,
          currentEval: null,
        };

        set({ 
          game: gameState, 
          chess, 
          error: null,
          dailyGamesPlayed: newDailyCount,
          lastPlayDate: today,
        });

        // Update eval bar
        const evalResult = await evaluatePosition(chess.fen(), 6);
        set(state => ({
          game: state.game ? { ...state.game, currentEval: evalResult.eval } : null,
        }));

        // If player is black and it's white's turn, make opponent move
        if (config.playerColor === 'black' && chess.turn() === 'w') {
          await get().makeOpponentMove();
        }
      },

      makeMove: async (from: string, to: string, promotion?: string) => {
        const { chess, game } = get();
        if (!chess || !game || game.isComplete) return false;

        const fenBefore = chess.fen();
        
        try {
          const result = chess.move({ from, to, promotion });
          if (!result) return false;

          const playedMoveUci = from + to + (promotion || '');
          const fenAfter = chess.fen();

          set({ isLoading: true });

          // Score the move
          const scoreResult = await scoreMove(
            fenBefore,
            fenAfter,
            playedMoveUci,
            game.playerColor === 'white'
          );

          const newMove: GameMove = {
            san: result.san,
            uci: playedMoveUci,
            fen: fenAfter,
            isPlayerMove: true,
            score: scoreResult.score,
            bestMove: scoreResult.bestMove,
            evaluation: scoreResult.playedMoveEval,
          };

          // Count player moves (excluding autoplay)
          const playerMoves = game.moves.filter(m => m.isPlayerMove && !m.isAutoPlay);
          const newPlayerMoveCount = playerMoves.length + 1;

          // Calculate average score
          const allScores = [...playerMoves.map(m => m.score || 0), scoreResult.score];
          const avgScore = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);

          // Check if game is complete
          const isComplete = newPlayerMoveCount >= game.targetDepth || 
                            chess.isGameOver();

          // Update eval
          const evalResult = await evaluatePosition(fenAfter, 6);

          set(state => ({
            game: state.game ? {
              ...state.game,
              moves: [...state.game.moves, newMove],
              currentScore: avgScore,
              isComplete,
              isModalVisible: isComplete,
              currentEval: evalResult.eval,
            } : null,
            isLoading: false,
          }));

          // Record final score
          if (isComplete) {
            set(state => {
              const newScores = [...state.recentScores, avgScore].slice(-10);
              return {
                recentScores: newScores,
                gamesPlayed: state.gamesPlayed + 1,
              };
            });
          }

          // Make opponent move if game continues
          if (!isComplete && !chess.isGameOver()) {
            await get().makeOpponentMove();
          }

          return true;
        } catch (error) {
          console.error('Move error:', error);
          set({ isLoading: false, error: 'Invalid move' });
          return false;
        }
      },

      makeOpponentMove: async () => {
        const { chess, game } = get();
        if (!chess || !game) return;

        set({ isLoading: true });

        try {
          // Get top 5 moves and select with weighted probability
          const topMoves = await getTopMoves(chess.fen(), 5, 8);
          
          let moveUci: string;
          if (topMoves.length > 0) {
            moveUci = selectMoveByProbability(topMoves);
          } else {
            // Fallback to random legal move
            const moves = chess.moves({ verbose: true });
            const randomMove = moves[Math.floor(Math.random() * moves.length)];
            moveUci = randomMove.from + randomMove.to + (randomMove.promotion || '');
          }

          const from = moveUci.slice(0, 2);
          const to = moveUci.slice(2, 4);
          const promotion = moveUci.length > 4 ? moveUci[4] : undefined;

          const result = chess.move({ from, to, promotion });
          if (!result) {
            set({ isLoading: false });
            return;
          }

          const newMove: GameMove = {
            san: result.san,
            uci: moveUci,
            fen: chess.fen(),
            isPlayerMove: false,
          };

          // Update eval
          const evalResult = await evaluatePosition(chess.fen(), 6);

          set(state => ({
            game: state.game ? {
              ...state.game,
              moves: [...state.game.moves, newMove],
              currentEval: evalResult.eval,
            } : null,
            isLoading: false,
          }));
        } catch (error) {
          console.error('Opponent move error:', error);
          set({ isLoading: false });
        }
      },

      resetGame: () => set({ game: null, chess: null, error: null, isLoading: false }),
      
      resetStats: () => set({ 
        recentScores: [], 
        gamesPlayed: 0, 
        dailyGamesPlayed: 0,
        premium: { isPremium: false },
      }),

      showModal: () => set(state => ({
        game: state.game ? { ...state.game, isModalVisible: true } : null,
      })),

      hideModal: () => set(state => ({
        game: state.game ? { ...state.game, isModalVisible: false } : null,
      })),

      setPremium: (status: PremiumStatus) => set({ premium: status }),

      canStartGame: () => {
        const { premium, dailyGamesPlayed, lastPlayDate } = get();
        if (premium.isPremium) return true;
        
        const today = new Date().toDateString();
        const todayCount = lastPlayDate === today ? dailyGamesPlayed : 0;
        return todayCount < FREE_LIMITS.dailyGames;
      },

      getFeatures: () => {
        const { premium } = get();
        return premium.isPremium ? PREMIUM_FEATURES : FREE_LIMITS;
      },

      getAverageScore: () => {
        const { recentScores } = get();
        if (recentScores.length === 0) return 0;
        return Math.round(recentScores.reduce((a, b) => a + b, 0) / recentScores.length);
      },
    }),
    {
      name: 'elo-trainer-game',
      partialize: (state) => ({
        premium: state.premium,
        dailyGamesPlayed: state.dailyGamesPlayed,
        lastPlayDate: state.lastPlayDate,
        recentScores: state.recentScores,
        gamesPlayed: state.gamesPlayed,
      }),
    }
  )
);
