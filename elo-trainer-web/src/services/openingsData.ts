// Opening database

import type { Opening } from '../types';

export const openingsWhite: Opening[] = [
  {
    id: 'italian',
    name: 'Partie Italienne',
    eco: 'C50',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'],
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
    description: 'Une ouverture classique visant le point f7',
    strategy: 'Développez rapidement, préparez le petit roque, visez f7',
    keyIdeas: ['Bc4 vise f7', 'Petit roque rapide', 'Centre fort avec d3'],
  },
  {
    id: 'london',
    name: 'Système de Londres',
    eco: 'D00',
    moves: ['d4', 'd5', 'Bf4'],
    fen: 'rnbqkbnr/ppp1pppp/8/3p4/3P1B2/8/PPP1PPPP/RN1QKBNR b KQkq - 1 2',
    description: 'Un système solide et flexible',
    strategy: 'Structure pyramidale avec e3, c3, Nf3, Nbd2',
    keyIdeas: ['Fou actif en f4', 'Structure solide', 'Flexible contre tout'],
  },
  {
    id: 'queens-gambit',
    name: 'Gambit Dame',
    eco: 'D06',
    moves: ['d4', 'd5', 'c4'],
    fen: 'rnbqkbnr/ppp1pppp/8/3p4/2PP4/8/PP2PPPP/RNBQKBNR b KQkq c3 0 2',
    description: 'Attaque le centre noir avec c4',
    strategy: 'Gagnez le contrôle du centre, développez harmonieusement',
    keyIdeas: ['Pression sur d5', 'e4 si possible', 'Développement naturel'],
  },
  {
    id: 'ruy-lopez',
    name: 'Partie Espagnole',
    eco: 'C60',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'],
    fen: 'r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3',
    description: 'L\'ouverture des champions',
    strategy: 'Pression à long terme sur le centre et l\'aile roi',
    keyIdeas: ['Pression sur e5 via Cc6', 'Centre avec d3/d4', 'Attaque sur l\'aile roi'],
  },
  {
    id: 'scotch',
    name: 'Partie Écossaise',
    eco: 'C45',
    moves: ['e4', 'e5', 'Nf3', 'Nc6', 'd4'],
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R b KQkq d3 0 3',
    description: 'Ouverture directe et agressive',
    strategy: 'Ouvrir le centre rapidement, développement actif',
    keyIdeas: ['Centre ouvert', 'Pièces actives', 'Initiative rapide'],
  },
  {
    id: 'catalan',
    name: 'Catalane',
    eco: 'E00',
    moves: ['d4', 'Nf6', 'c4', 'e6', 'g3'],
    fen: 'rnbqkb1r/pppp1ppp/4pn2/8/2PP4/6P1/PP2PP1P/RNBQKBNR b KQkq - 0 3',
    description: 'Système positionnel moderne',
    strategy: 'Fianchetto roi, pression sur la grande diagonale',
    keyIdeas: ['Fg2 contrôle la diagonale', 'Pression sur d5/c6', 'Jeu positionnel'],
  },
];

export const openingsBlack: Opening[] = [
  {
    id: 'sicilian',
    name: 'Défense Sicilienne',
    eco: 'B20',
    moves: ['e4', 'c5'],
    fen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/8/PPPP1PPP/RNBQKBNR w KQkq c6 0 2',
    description: 'La défense la plus combative contre e4',
    strategy: 'Contre-attaque sur l\'aile dame, structure asymétrique',
    keyIdeas: ['Pression colonne c', 'Contre-attaque ...d5', 'Structure asymétrique'],
  },
  {
    id: 'french',
    name: 'Défense Française',
    eco: 'C00',
    moves: ['e4', 'e6'],
    fen: 'rnbqkbnr/pppp1ppp/4p3/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
    description: 'Défense solide avec contre-jeu',
    strategy: 'Structure solide, contre-attaque au centre avec ...d5, ...c5',
    keyIdeas: ['...d5 attaque le centre', '...c5 sape la chaîne', 'Jeu sur l\'aile dame'],
  },
  {
    id: 'caro-kann',
    name: 'Défense Caro-Kann',
    eco: 'B10',
    moves: ['e4', 'c6'],
    fen: 'rnbqkbnr/pp1ppppp/2p5/8/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2',
    description: 'Défense solide préparant ...d5',
    strategy: 'Structure de pions saine, développement harmonieux',
    keyIdeas: ['...d5 avec support c6', 'Fou c8 actif', 'Solidité positionnelle'],
  },
  {
    id: 'kings-indian',
    name: 'Défense Est-Indienne',
    eco: 'E60',
    moves: ['d4', 'Nf6', 'c4', 'g6'],
    fen: 'rnbqkb1r/pppppp1p/5np1/8/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3',
    description: 'Défense hypermoderne dynamique',
    strategy: 'Fianchetto roi, contre-attaque au centre avec ...e5 ou ...c5',
    keyIdeas: ['...e5 contre-attaque', '...d6 + ...e5', 'Attaque sur l\'aile roi'],
  },
  {
    id: 'slav',
    name: 'Défense Slave',
    eco: 'D10',
    moves: ['d4', 'd5', 'c4', 'c6'],
    fen: 'rnbqkbnr/pp2pppp/2p5/3p4/2PP4/8/PP2PPPP/RNBQKBNR w KQkq - 0 3',
    description: 'Défense solide contre le Gambit Dame',
    strategy: 'Soutenir d5, développer le fou c8 activement',
    keyIdeas: ['c6 soutient d5', 'Fou c8 reste actif', 'Structure solide'],
  },
  {
    id: 'grunfeld',
    name: 'Défense Grünfeld',
    eco: 'D80',
    moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'd5'],
    fen: 'rnbqkb1r/ppp1pp1p/5np1/3p4/2PP4/2N5/PP2PPPP/R1BQKBNR w KQkq d6 0 4',
    description: 'Défense hypermoderne agressive',
    strategy: 'Abandonner le centre pour mieux le contester avec les pièces',
    keyIdeas: ['...d5 frappe le centre', 'Fg7 sur grande diagonale', 'Pression sur d4'],
  },
];

export function getRandomOpening(color: 'white' | 'black'): Opening {
  const openings = color === 'white' ? openingsWhite : openingsBlack;
  return openings[Math.floor(Math.random() * openings.length)];
}

export function getOpeningById(id: string, color: 'white' | 'black'): Opening | undefined {
  const openings = color === 'white' ? openingsWhite : openingsBlack;
  return openings.find(o => o.id === id);
}
