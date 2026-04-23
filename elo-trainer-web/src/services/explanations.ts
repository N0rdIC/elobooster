// Base de données d'explications pour les erreurs d'ouverture courantes
// Organisé par thème/pattern plutôt que par position exacte

export interface MoveExplanation {
  pattern: string;
  title: {
    fr: string;
    en: string;
  };
  explanation: {
    fr: string;
    en: string;
  };
  betterBecause: {
    fr: string;
    en: string;
  };
}

// Patterns détectables par l'évaluation
export const explanationPatterns: Record<string, MoveExplanation> = {
  // === ERREURS DE DÉVELOPPEMENT ===
  'early_queen': {
    pattern: 'Sortie de dame prématurée',
    title: { fr: 'Dame trop tôt', en: 'Early queen' },
    explanation: {
      fr: 'Sortir la dame trop tôt la rend vulnérable aux attaques des pièces mineures adverses, vous faisant perdre des temps.',
      en: 'Bringing the queen out early makes it vulnerable to attacks from minor pieces, losing tempo.'
    },
    betterBecause: {
      fr: 'Développez d\'abord les cavaliers et fous avant la dame.',
      en: 'Develop knights and bishops before the queen.'
    }
  },
  
  'knight_rim': {
    pattern: 'Cavalier au bord',
    title: { fr: 'Cavalier au bord', en: 'Knight on rim' },
    explanation: {
      fr: 'Un cavalier au bord de l\'échiquier contrôle moins de cases (4 au lieu de 8 au centre).',
      en: 'A knight on the rim controls fewer squares (4 instead of 8 in the center).'
    },
    betterBecause: {
      fr: 'Les cavaliers sont plus forts au centre où ils contrôlent plus de cases.',
      en: 'Knights are stronger in the center where they control more squares.'
    }
  },

  'undeveloped_pieces': {
    pattern: 'Pièces non développées',
    title: { fr: 'Retard de développement', en: 'Development delay' },
    explanation: {
      fr: 'Vous bougez plusieurs fois la même pièce au lieu de développer les autres.',
      en: 'You\'re moving the same piece multiple times instead of developing others.'
    },
    betterBecause: {
      fr: 'Chaque coup devrait contribuer au développement d\'une nouvelle pièce.',
      en: 'Each move should contribute to developing a new piece.'
    }
  },

  // === ERREURS DE CENTRE ===
  'center_control': {
    pattern: 'Contrôle du centre',
    title: { fr: 'Centre négligé', en: 'Center neglected' },
    explanation: {
      fr: 'Vous laissez l\'adversaire dominer le centre (e4, d4, e5, d5), ce qui lui donne plus d\'espace.',
      en: 'You\'re letting your opponent dominate the center (e4, d4, e5, d5), giving them more space.'
    },
    betterBecause: {
      fr: 'Contestez le centre avec des pions ou des pièces.',
      en: 'Contest the center with pawns or pieces.'
    }
  },

  'pawn_center_release': {
    pattern: 'Libération du centre',
    title: { fr: 'Tension relâchée', en: 'Tension released' },
    explanation: {
      fr: 'Vous échangez au centre trop tôt, libérant la tension et donnant des options à l\'adversaire.',
      en: 'You\'re exchanging in the center too early, releasing tension and giving options to your opponent.'
    },
    betterBecause: {
      fr: 'Maintenez la tension au centre aussi longtemps que possible.',
      en: 'Maintain tension in the center as long as possible.'
    }
  },

  // === ERREURS DE SÉCURITÉ DU ROI ===
  'king_safety': {
    pattern: 'Sécurité du roi',
    title: { fr: 'Roi exposé', en: 'King exposed' },
    explanation: {
      fr: 'Votre roi reste au centre trop longtemps, ce qui le rend vulnérable aux attaques.',
      en: 'Your king stays in the center too long, making it vulnerable to attacks.'
    },
    betterBecause: {
      fr: 'Roquez rapidement pour mettre votre roi en sécurité.',
      en: 'Castle quickly to bring your king to safety.'
    }
  },

  'delayed_castling': {
    pattern: 'Roque retardé',
    title: { fr: 'Roque tardif', en: 'Delayed castling' },
    explanation: {
      fr: 'Vous retardez le roque alors que les conditions sont réunies.',
      en: 'You\'re delaying castling when conditions are right.'
    },
    betterBecause: {
      fr: 'Le roque connecte aussi vos tours et les active.',
      en: 'Castling also connects your rooks and activates them.'
    }
  },

  'weakened_king': {
    pattern: 'Pions du roque affaiblis',
    title: { fr: 'Structure de roque affaiblie', en: 'Weakened castling structure' },
    explanation: {
      fr: 'Avancer les pions devant votre roi crée des faiblesses permanentes.',
      en: 'Pushing pawns in front of your king creates permanent weaknesses.'
    },
    betterBecause: {
      fr: 'Gardez vos pions de roque intacts sauf si nécessaire.',
      en: 'Keep your castling pawns intact unless necessary.'
    }
  },

  // === ERREURS DE STRUCTURE DE PIONS ===
  'doubled_pawns': {
    pattern: 'Pions doublés',
    title: { fr: 'Pions doublés', en: 'Doubled pawns' },
    explanation: {
      fr: 'Vous créez des pions doublés sans compensation suffisante.',
      en: 'You\'re creating doubled pawns without sufficient compensation.'
    },
    betterBecause: {
      fr: 'Évitez de créer des faiblesses structurelles permanentes.',
      en: 'Avoid creating permanent structural weaknesses.'
    }
  },

  'isolated_pawn': {
    pattern: 'Pion isolé',
    title: { fr: 'Pion isolé', en: 'Isolated pawn' },
    explanation: {
      fr: 'Un pion isolé devient une cible car il ne peut pas être défendu par d\'autres pions.',
      en: 'An isolated pawn becomes a target as it cannot be defended by other pawns.'
    },
    betterBecause: {
      fr: 'Préservez une structure de pions connectés.',
      en: 'Preserve a connected pawn structure.'
    }
  },

  'backward_pawn': {
    pattern: 'Pion arriéré',
    title: { fr: 'Pion arriéré', en: 'Backward pawn' },
    explanation: {
      fr: 'Un pion arriéré est faible car il ne peut plus avancer en sécurité.',
      en: 'A backward pawn is weak as it can no longer advance safely.'
    },
    betterBecause: {
      fr: 'Avancez vos pions de manière coordonnée.',
      en: 'Advance your pawns in a coordinated manner.'
    }
  },

  // === ERREURS TACTIQUES ===
  'hanging_piece': {
    pattern: 'Pièce en prise',
    title: { fr: 'Pièce non défendue', en: 'Hanging piece' },
    explanation: {
      fr: 'Vous laissez une pièce sans défense ou insuffisamment protégée.',
      en: 'You\'re leaving a piece undefended or insufficiently protected.'
    },
    betterBecause: {
      fr: 'Assurez-vous que chaque pièce est protégée.',
      en: 'Make sure every piece is protected.'
    }
  },

  'missed_tactic': {
    pattern: 'Tactique manquée',
    title: { fr: 'Opportunité manquée', en: 'Missed opportunity' },
    explanation: {
      fr: 'Il y avait une meilleure continuation tactique dans cette position.',
      en: 'There was a better tactical continuation in this position.'
    },
    betterBecause: {
      fr: 'Le coup suggéré gagne du matériel ou crée une menace forte.',
      en: 'The suggested move wins material or creates a strong threat.'
    }
  },

  // === ERREURS POSITIONNELLES ===
  'passive_piece': {
    pattern: 'Pièce passive',
    title: { fr: 'Pièce passive', en: 'Passive piece' },
    explanation: {
      fr: 'Votre pièce est mal placée et n\'a pas d\'activité.',
      en: 'Your piece is poorly placed and has no activity.'
    },
    betterBecause: {
      fr: 'Placez vos pièces sur des cases actives où elles contrôlent plus d\'espace.',
      en: 'Place your pieces on active squares where they control more space.'
    }
  },

  'bad_bishop': {
    pattern: 'Mauvais fou',
    title: { fr: 'Mauvais fou', en: 'Bad bishop' },
    explanation: {
      fr: 'Votre fou est bloqué par vos propres pions sur sa couleur.',
      en: 'Your bishop is blocked by your own pawns on its color.'
    },
    betterBecause: {
      fr: 'Placez vos pions sur la couleur opposée à votre fou.',
      en: 'Place your pawns on the opposite color of your bishop.'
    }
  },

  'lost_tempo': {
    pattern: 'Perte de tempo',
    title: { fr: 'Perte de temps', en: 'Lost tempo' },
    explanation: {
      fr: 'Ce coup ne contribue pas à votre développement ou votre plan.',
      en: 'This move doesn\'t contribute to your development or plan.'
    },
    betterBecause: {
      fr: 'Chaque coup en ouverture devrait avoir un but précis.',
      en: 'Every opening move should have a clear purpose.'
    }
  },

  // === ERREURS D'OUVERTURE SPÉCIFIQUES ===
  'premature_attack': {
    pattern: 'Attaque prématurée',
    title: { fr: 'Attaque prématurée', en: 'Premature attack' },
    explanation: {
      fr: 'Vous attaquez avant d\'avoir terminé votre développement.',
      en: 'You\'re attacking before completing your development.'
    },
    betterBecause: {
      fr: 'Finissez votre développement avant de lancer une attaque.',
      en: 'Complete your development before launching an attack.'
    }
  },

  'theory_deviation': {
    pattern: 'Déviation de la théorie',
    title: { fr: 'Sortie de théorie', en: 'Theory deviation' },
    explanation: {
      fr: 'Ce coup n\'est pas la suite principale mais peut être jouable.',
      en: 'This move is not the main line but may be playable.'
    },
    betterBecause: {
      fr: 'La suite principale a été testée et prouvée par des milliers de parties.',
      en: 'The main line has been tested and proven in thousands of games.'
    }
  },

  // === DÉFAUT (si aucun pattern ne correspond) ===
  'generic_inaccuracy': {
    pattern: 'Imprécision générale',
    title: { fr: 'Coup imprécis', en: 'Inaccurate move' },
    explanation: {
      fr: 'Ce coup n\'est pas optimal dans cette position.',
      en: 'This move is not optimal in this position.'
    },
    betterBecause: {
      fr: 'Le coup suggéré améliore votre position.',
      en: 'The suggested move improves your position.'
    }
  }
};

// Seuils d'évaluation pour classifier les coups
export const evalThresholds = {
  excellent: 0.1,    // Perte < 0.1 pion
  good: 0.25,        // Perte < 0.25 pion  
  inaccuracy: 0.5,   // Perte < 0.5 pion
  mistake: 1.0,      // Perte < 1 pion
  blunder: 2.0       // Perte >= 2 pions
};

export type MoveQuality = 'excellent' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';

export function classifyMove(evalDiff: number): MoveQuality {
  const diff = Math.abs(evalDiff);
  if (diff < evalThresholds.excellent) return 'excellent';
  if (diff < evalThresholds.good) return 'good';
  if (diff < evalThresholds.inaccuracy) return 'inaccuracy';
  if (diff < evalThresholds.mistake) return 'mistake';
  return 'blunder';
}

// Déterminer le pattern le plus probable basé sur le contexte
export function detectPattern(
  playedMove: string,
  bestMove: string,
  fen: string,
  evalDiff: number
): string {
  // Analyse basique du FEN pour détecter des patterns
  const parts = fen.split(' ');
  const position = parts[0];
  const moveNum = Math.floor(parseInt(parts[5] || '1') / 2) + 1;
  const isWhiteToMove = parts[1] === 'w';
  
  // Compter les pièces développées
  const whiteMinorsDeveloped = (position.match(/[BN]/g) || []).length - 
    (position.split('/')[7]?.match(/[BN]/g) || []).length;
  const blackMinorsDeveloped = (position.match(/[bn]/g) || []).length - 
    (position.split('/')[0]?.match(/[bn]/g) || []).length;
  
  // Dame sortie trop tôt (avant coup 6, avec peu de pièces développées)
  if (moveNum <= 6 && (playedMove.startsWith('Q') || playedMove.startsWith('D'))) {
    const minorsDeveloped = isWhiteToMove ? whiteMinorsDeveloped : blackMinorsDeveloped;
    if (minorsDeveloped < 2) {
      return 'early_queen';
    }
  }
  
  // Cavalier au bord (Na3, Nh3, Na6, Nh6)
  if (playedMove.startsWith('N')) {
    const destSquare = playedMove.replace(/[+#x]/g, '').slice(-2);
    if (destSquare && (destSquare[0] === 'a' || destSquare[0] === 'h')) {
      // Vérifier que ce n'est pas un coup tactique (prise ou échec)
      if (!playedMove.includes('x') && !playedMove.includes('+')) {
        return 'knight_rim';
      }
    }
  }
  
  // Roque recommandé mais non joué
  if ((bestMove === 'O-O' || bestMove === 'O-O-O') && playedMove !== bestMove) {
    // Vérifier si le roi est encore au centre
    const kingPos = isWhiteToMove ? position.indexOf('K') : position.indexOf('k');
    if (kingPos !== -1) {
      return 'delayed_castling';
    }
  }
  
  // Coup de pion qui affaiblit le roque (h3, g4, a3 etc. sans raison claire)
  if (moveNum <= 10 && /^[a-h][34]$/.test(playedMove.replace(/[+#]/g, ''))) {
    const pawnMove = playedMove.replace(/[+#]/g, '');
    if (['g4', 'h4', 'g3', 'h3', 'a3', 'a4', 'b4'].includes(pawnMove)) {
      if (evalDiff > 0.15) {
        return 'weakened_king';
      }
    }
  }
  
  // Échange prématuré au centre
  if (playedMove.includes('x') && moveNum <= 8) {
    if (playedMove.includes('d') || playedMove.includes('e')) {
      if (evalDiff > 0.2) {
        return 'pawn_center_release';
      }
    }
  }
  
  // Coup passif (fou ou cavalier qui recule)
  if ((playedMove.startsWith('B') || playedMove.startsWith('N')) && !playedMove.includes('x')) {
    const destRank = playedMove.slice(-1);
    if (isWhiteToMove && ['1', '2'].includes(destRank)) {
      return 'passive_piece';
    }
    if (!isWhiteToMove && ['7', '8'].includes(destRank)) {
      return 'passive_piece';
    }
  }
  
  // Tactique manquée si grosse différence avec prise disponible
  if (evalDiff > 1.0) {
    if (bestMove.includes('x')) {
      return 'missed_tactic';
    }
    return 'missed_tactic';
  }
  
  // Perte de tempo (petit diff)
  if (evalDiff > 0.2 && evalDiff < 0.5) {
    return 'lost_tempo';
  }
  
  // Défaut pour imprécision
  if (evalDiff > 0.25) {
    return 'generic_inaccuracy';
  }
  
  return '';
}
