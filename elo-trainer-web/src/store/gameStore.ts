// Store global avec Zustand - Clean version

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Chess } from 'chess.js';
import {
  GameConfig, GameState, GameMove, PremiumStatus,
  FREE_LIMITS, PREMIUM_FEATURES,
} from '../types';
import { fetchOpeningMoves, selectOpponentMove, evaluateMove, fetchCloudEval } from '../services/lichessApi';
import { calculateMoveScore, calculateGameScore, enhanceMoveScoreWithEval } from '../services/scoring';

interface GameStore {
  game: GameState | null;
  chess: Chess | null;
  isLoading: boolean;
  error: string | null;
  premium: PremiumStatus;
  dailyGamesPlayed: number;
  lastPlayDate: string;
  bestScore: number;
  gamesPlayed: number;

  startGame: (config: GameConfig) => Promise<void>;
  makeMove: (from: string, to: string, promotion?: string) => Promise<boolean>;
  makeOpponentMove: () => Promise<void>;
  resetGame: () => void;
  showModal: () => void;
  hideModal: () => void;
  setPremium: (status: PremiumStatus) => void;
  canStartGame: () => boolean;
  getFeatures: () => typeof FREE_LIMITS | typeof PREMIUM_FEATURES;
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
      bestScore: 0,
      gamesPlayed: 0,

      startGame: async (config: GameConfig) => {
        const { premium, dailyGamesPlayed, lastPlayDate } = get();
        const today = new Date().toDateString();
        const currentDailyGames = lastPlayDate !== today ? 0 : dailyGamesPlayed;

        if (!premium.isPremium && currentDailyGames >= FREE_LIMITS.dailyGames) {
          set({ error: 'Limite quotidienne atteinte !' });
          return;
        }

        const chess = new Chess();
        const isPlayerWhite = config.playerColor === 'white';

        console.log('Starting game with config:', config);

        // Play starting moves if opening is selected
        const gameMoves: GameMove[] = [];
        if (config.startingMoves && config.startingMoves.length > 0) {
          console.log('Playing starting moves:', config.startingMoves);
          
          for (let i = 0; i < config.startingMoves.length; i++) {
            const san = config.startingMoves[i];
            const fenBefore = chess.fen();
            
            try {
              chess.move(san);
              const fen = chess.fen();
              const isWhiteMove = i % 2 === 0;
              const isPlayerMoveHere = (isWhiteMove && isPlayerWhite) || (!isWhiteMove && !isPlayerWhite);
              
              if (isPlayerMoveHere) {
                // Player's move - create new entry
                gameMoves.push({
                  ply: gameMoves.length + 1,
                  fen,
                  fenBefore,
                  playerMove: { 
                    move: san, 
                    rank: 1, 
                    totalMoves: 1, 
                    popularityPercent: 100, 
                    score: 100, 
                    isTheory: true, 
                    quality: 'excellent',
                  },
                });
              } else {
                // Opponent's move
                if (gameMoves.length > 0 && !gameMoves[gameMoves.length - 1].opponentMove) {
                  // Add to last entry
                  gameMoves[gameMoves.length - 1].opponentMove = san;
                  gameMoves[gameMoves.length - 1].fen = fen;
                } else {
                  // Create new entry (player is black, opponent moves first)
                  gameMoves.push({
                    ply: gameMoves.length + 1,
                    fen,
                    fenBefore,
                    opponentMove: san,
                  });
                }
              }
            } catch (e) {
              console.error('Error playing starting move:', san, e);
              break;
            }
          }
        }

        const initialState: GameState = {
          config,
          moves: gameMoves,
          currentFen: chess.fen(),
          currentScore: 100, // Start with 100 if opening moves played
          isPlayerTurn: chess.turn() === 'w' ? isPlayerWhite : !isPlayerWhite,
          isGameOver: false,
          showGameOverModal: false,
          openingName: config.openingName,
        };

        set({
          game: initialState,
          chess,
          dailyGamesPlayed: currentDailyGames + 1,
          lastPlayDate: today,
          isLoading: false,
          error: null,
        });

        // If not player's turn, make opponent move
        if (!initialState.isPlayerTurn) {
          setTimeout(() => get().makeOpponentMove(), 300);
        }
      },

      makeMove: async (from: string, to: string, promotion?: string) => {
        const { game, chess } = get();
        if (!game || !chess || game.isGameOver || !game.isPlayerTurn) return false;

        const fenBefore = chess.fen();
        
        // Find move in SAN
        const moves = chess.moves({ verbose: true });
        const move = moves.find(m => m.from === from && m.to === to);
        if (!move) return false;

        // Play move immediately
        chess.move({ from, to, promotion });
        const newFen = chess.fen();

        // Update UI immediately
        set({
          game: {
            ...game,
            currentFen: newFen,
            isPlayerTurn: false,
          },
        });

        try {
          // Fetch opening data and Stockfish eval in parallel
          const [openingData, stockfishEval] = await Promise.all([
            fetchOpeningMoves(fenBefore, game.config.difficulty),
            evaluateMove(fenBefore, newFen, `${from}${to}${promotion || ''}`),
          ]);
          
          const san = move.san;
          const currentPly = game.moves.filter(m => m.playerMove).length + 1;
          const isPlayerWhite = game.config.playerColor === 'white';
          
          console.log(`[DEBUG] fenBefore: ${fenBefore}`);
          console.log(`[DEBUG] Lichess returned ${openingData.moves.length} moves:`, openingData.moves.map(m => m.san));
          console.log(`[DEBUG] Stockfish evalBefore:`, stockfishEval.evalBefore);
          console.log(`[DEBUG] Stockfish bestMove:`, stockfishEval.bestMoveUci);
          
          // Calculate score based on Lichess data
          let moveScore = calculateMoveScore(san, openingData.moves, currentPly, isPlayerWhite, fenBefore);
          
          // Always enhance with Stockfish evaluation
          if (stockfishEval.evalBefore) {
            moveScore = enhanceMoveScoreWithEval(
              moveScore,
              stockfishEval.evalDiff,
              stockfishEval.bestMoveUci,
              stockfishEval.evalAfter?.eval || null,
              stockfishEval.evalAfter?.evalText || null,
              fenBefore,
              'fr'
            );
          }

          const gameMove: GameMove = {
            ply: currentPly,
            playerMove: moveScore,
            fen: newFen,
            fenBefore,
          };

          const newMoves = [...game.moves, gameMove];
          const playerMoveCount = newMoves.filter(m => m.playerMove).length;
          const currentScore = calculateGameScore(newMoves, game.config.targetDepth);

          const detectedOpening = openingData.opening?.name || game.openingName;

          console.log(`Move ${playerMoveCount}/${game.config.targetDepth}: ${san}, score: ${moveScore.score}, isTheory: ${moveScore.isTheory}`);

          // Check game end
          let isGameOver = false;
          let gameOverReason: GameState['gameOverReason'];

          if (chess.isCheckmate()) {
            isGameOver = true;
            gameOverReason = 'checkmate';
          } else if (chess.isStalemate() || chess.isDraw()) {
            isGameOver = true;
            gameOverReason = 'stalemate';
          } else if (playerMoveCount >= game.config.targetDepth) {
            isGameOver = true;
            gameOverReason = 'depth_reached';
          }

          set({
            game: {
              ...game,
              moves: newMoves,
              currentFen: newFen,
              currentScore,
              currentEval: stockfishEval.evalAfter?.eval,
              currentEvalText: stockfishEval.evalAfter?.evalText,
              isPlayerTurn: false,
              isGameOver,
              gameOverReason,
              openingName: detectedOpening,
              showGameOverModal: false,
            },
          });

          if (isGameOver) {
            const { bestScore, gamesPlayed } = get();
            set({
              bestScore: Math.max(bestScore, currentScore),
              gamesPlayed: gamesPlayed + 1,
            });
            setTimeout(() => get().showModal(), 2000);
          } else {
            setTimeout(() => get().makeOpponentMove(), 400);
          }

          return true;
        } catch (err) {
          console.error('Error:', err);
          set({ error: 'Erreur lors du coup' });
          return false;
        }
      },

      makeOpponentMove: async () => {
        const { game, chess } = get();
        if (!game || !chess || game.isGameOver) return;

        set({ isLoading: true });

        try {
          const currentFen = chess.fen();
          
          // Try Lichess Opening Explorer first
          const openingData = await fetchOpeningMoves(currentFen, game.config.difficulty);
          
          // Check if we have good theory data (at least 100 games total)
          const totalGames = openingData.moves.reduce((sum, m) => sum + m.white + m.black + m.draws, 0);
          const hasGoodTheory = totalGames >= 100;
          
          let selectedMove = null;
          
          if (hasGoodTheory) {
            // Use theory move
            selectedMove = selectOpponentMove(openingData.moves, game.config.difficulty);
            if (selectedMove) {
              console.log('Opponent plays theory:', selectedMove.san, `(${selectedMove.white + selectedMove.black + selectedMove.draws} games)`);
            }
          }
          
          // If no good theory, use Stockfish
          if (!selectedMove) {
            console.log('Opponent: weak/no theory, asking Stockfish...');
            const cloudEval = await fetchCloudEval(currentFen);
            
            if (cloudEval && cloudEval.bestMove) {
              const legalMoves = chess.moves({ verbose: true });
              const bestMove = legalMoves.find(m => 
                `${m.from}${m.to}${m.promotion || ''}` === cloudEval.bestMove
              );
              
              if (bestMove) {
                chess.move(bestMove.san);
                const newFen = chess.fen();
                console.log('Opponent plays Stockfish best:', bestMove.san);

                const updatedMoves = [...game.moves];
                if (updatedMoves.length > 0 && !updatedMoves[updatedMoves.length - 1].opponentMove) {
                  updatedMoves[updatedMoves.length - 1].opponentMove = bestMove.san;
                  updatedMoves[updatedMoves.length - 1].fen = newFen;
                } else {
                  updatedMoves.push({ ply: updatedMoves.length + 1, opponentMove: bestMove.san, fen: newFen });
                }

                set({
                  game: { ...game, moves: updatedMoves, currentFen: newFen, isPlayerTurn: true },
                  isLoading: false,
                });
                return;
              }
            }
            
            // Ultimate fallback: best looking legal move
            const legalMoves = chess.moves();
            if (legalMoves.length > 0) {
              // Prioritize: castling, captures, central moves
              const prioritized = legalMoves.sort((a, b) => {
                const scoreMove = (m: string) => {
                  if (m.includes('O-O')) return 100;
                  if (m.includes('x')) return 50;
                  if (m.includes('e4') || m.includes('d4') || m.includes('e5') || m.includes('d5')) return 30;
                  if (m.includes('Nf') || m.includes('Nc') || m.includes('Bf') || m.includes('Bc')) return 20;
                  return 0;
                };
                return scoreMove(b) - scoreMove(a);
              });
              const fallbackMove = prioritized[0];
              
              chess.move(fallbackMove);
              const newFen = chess.fen();
              console.log('Opponent plays fallback:', fallbackMove);

              const updatedMoves = [...game.moves];
              if (updatedMoves.length > 0 && !updatedMoves[updatedMoves.length - 1].opponentMove) {
                updatedMoves[updatedMoves.length - 1].opponentMove = fallbackMove;
                updatedMoves[updatedMoves.length - 1].fen = newFen;
              } else {
                updatedMoves.push({ ply: updatedMoves.length + 1, opponentMove: fallbackMove, fen: newFen });
              }

              set({
                game: { ...game, moves: updatedMoves, currentFen: newFen, isPlayerTurn: true },
                isLoading: false,
              });
              return;
            }
          }

          if (!selectedMove) {
            set({ isLoading: false });
            return;
          }

          chess.move(selectedMove.san);
          const newFen = chess.fen();

          console.log('Opponent plays:', selectedMove.san, '(', selectedMove.white + selectedMove.black + selectedMove.draws, 'games)');

          // Get eval of position after opponent move
          let evalAfterOpponent: { eval: number; evalText: string } | null = null;
          try {
            const evalData = await fetchCloudEval(newFen);
            if (evalData) {
              evalAfterOpponent = { eval: evalData.eval, evalText: evalData.evalText };
              console.log('Eval after opponent move:', evalData.evalText);
            } else {
              console.log('No cloud eval for position after opponent move');
            }
          } catch (e) {
            console.log('Could not get eval after opponent move:', e);
          }

          const updatedMoves = [...game.moves];
          if (updatedMoves.length > 0 && !updatedMoves[updatedMoves.length - 1].opponentMove) {
            updatedMoves[updatedMoves.length - 1].opponentMove = selectedMove.san;
            updatedMoves[updatedMoves.length - 1].fen = newFen;
          } else {
            updatedMoves.push({ ply: updatedMoves.length + 1, opponentMove: selectedMove.san, fen: newFen });
          }

          let isGameOver = false;
          let gameOverReason: GameState['gameOverReason'];
          if (chess.isCheckmate()) {
            isGameOver = true;
            gameOverReason = 'checkmate';
          } else if (chess.isStalemate() || chess.isDraw()) {
            isGameOver = true;
            gameOverReason = 'stalemate';
          }

          set({
            game: {
              ...game,
              moves: updatedMoves,
              currentFen: newFen,
              currentEval: evalAfterOpponent?.eval ?? game.currentEval,
              currentEvalText: evalAfterOpponent?.evalText ?? game.currentEvalText,
              isPlayerTurn: true,
              isGameOver,
              gameOverReason,
              openingName: openingData.opening?.name || game.openingName,
              showGameOverModal: false,
            },
            isLoading: false,
          });

          if (isGameOver) {
            setTimeout(() => get().showModal(), 2000);
          }
        } catch (err) {
          console.error('Opponent error:', err);
          set({ isLoading: false });
        }
      },

      showModal: () => {
        const { game } = get();
        if (game && game.isGameOver) {
          set({ game: { ...game, showGameOverModal: true } });
        }
      },

      hideModal: () => {
        const { game } = get();
        if (game) {
          set({ game: { ...game, showGameOverModal: false } });
        }
      },

      resetGame: () => set({ game: null, chess: null, error: null, isLoading: false }),

      setPremium: (status) => set({ premium: status }),

      canStartGame: () => {
        const { premium, dailyGamesPlayed, lastPlayDate } = get();
        if (premium.isPremium) return true;
        const today = new Date().toDateString();
        return (lastPlayDate !== today ? 0 : dailyGamesPlayed) < FREE_LIMITS.dailyGames;
      },

      getFeatures: () => get().premium.isPremium ? PREMIUM_FEATURES : FREE_LIMITS,
    }),
    {
      name: 'elo-trainer-storage',
      partialize: (state) => ({
        premium: state.premium,
        dailyGamesPlayed: state.dailyGamesPlayed,
        lastPlayDate: state.lastPlayDate,
        bestScore: state.bestScore,
        gamesPlayed: state.gamesPlayed,
      }),
    }
  )
);
