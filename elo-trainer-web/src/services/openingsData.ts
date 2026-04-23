// Enhanced Opening Database with Strategic Explanations

export interface Opening {
  name: string;
  eco: string;
  moves: string[];
  category: 'e4' | 'd4' | 'other';
  description: {
    fr: string;
    en: string;
  };
  strategy: {
    fr: string;
    en: string;
  };
  keyIdeas: {
    fr: string[];
    en: string[];
  };
}

// ==========================================
// 1.e4 OPENINGS
// ==========================================
export const E4_OPENINGS: Opening[] = [
  // Open games (1.e4 e5)
  {
    name: "Italienne",
    eco: "C50",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bc4"],
    category: 'e4',
    description: {
      fr: "Ouverture classique visant le point faible f7",
      en: "Classical opening targeting the weak f7 square"
    },
    strategy: {
      fr: "Le Fou en c4 vise f7, le point le plus faible de l'échiquier au début de partie (défendu seulement par le Roi). Blanc prépare d3, Nc3, et O-O pour un développement harmonieux. Le plan typique inclut d3, Nc3, et une pression au centre avec c3-d4.",
      en: "The Bishop on c4 targets f7, the weakest point at game start (defended only by the King). White prepares d3, Nc3, and O-O for harmonious development. Typical plan includes d3, Nc3, and central pressure with c3-d4."
    },
    keyIdeas: {
      fr: ["Pression sur f7", "Développement rapide", "Préparation de d3-d4", "Roque rapide côté roi"],
      en: ["Pressure on f7", "Rapid development", "Preparing d3-d4", "Quick kingside castle"]
    }
  },
  {
    name: "Espagnole (Ruy Lopez)",
    eco: "C60",
    moves: ["e4", "e5", "Nf3", "Nc6", "Bb5"],
    category: 'e4',
    description: {
      fr: "L'ouverture la plus profonde des échecs",
      en: "The deepest opening in chess"
    },
    strategy: {
      fr: "Bb5 menace indirectement e5 en attaquant son défenseur (Cc6). Blanc ne capture pas immédiatement mais maintient la pression. Après a3 et Ba4, le fou reste actif tout en préparant b4. Le plan à long terme est d3, c3, Nbd2-f1-g3, et une attaque sur l'aile roi.",
      en: "Bb5 indirectly threatens e5 by attacking its defender (Nc6). White doesn't capture immediately but maintains pressure. After a3 and Ba4, the bishop stays active while preparing b4. Long-term plan is d3, c3, Nbd2-f1-g3, and a kingside attack."
    },
    keyIdeas: {
      fr: ["Pression sur le centre via Cc6", "Manoeuvre Cd2-f1-g3", "Avantage d'espace durable", "Structure Marshall/Chigorine"],
      en: ["Central pressure via Nc6", "Nd2-f1-g3 maneuver", "Lasting space advantage", "Marshall/Chigorin structures"]
    }
  },
  {
    name: "Écossaise",
    eco: "C45",
    moves: ["e4", "e5", "Nf3", "Nc6", "d4"],
    category: 'e4',
    description: {
      fr: "Ouverture dynamique ouvrant le centre immédiatement",
      en: "Dynamic opening that opens the center immediately"
    },
    strategy: {
      fr: "Blanc ouvre le centre tout de suite avec d4. Après exd4, Nxd4 donne une position ouverte avec des pièces actives. Le fou c1 sera développé en c4 ou b5. L'idée est de profiter des colonnes ouvertes et diagonales pour une attaque rapide.",
      en: "White opens the center immediately with d4. After exd4, Nxd4 gives an open position with active pieces. The c1 bishop will develop to c4 or b5. The idea is to use open files and diagonals for a quick attack."
    },
    keyIdeas: {
      fr: ["Centre ouvert = pièces actives", "Développement rapide du fou c1", "Pression sur d5", "Colonnes centrales ouvertes"],
      en: ["Open center = active pieces", "Quick c1 bishop development", "Pressure on d5", "Open central files"]
    }
  },
  {
    name: "Gambit du Roi",
    eco: "C30",
    moves: ["e4", "e5", "f4"],
    category: 'e4',
    description: {
      fr: "Sacrifice agressif pour l'initiative",
      en: "Aggressive sacrifice for initiative"
    },
    strategy: {
      fr: "Blanc sacrifie un pion pour ouvrir la colonne f pour la tour et dégager la diagonale c1-h6 pour le fou. Après exf4, Blanc joue Nf3 puis Bc4 pour une attaque sur f7. Le roque sera souvent retardé pour garder la tour h1 active sur la colonne h ouverte.",
      en: "White sacrifices a pawn to open the f-file for the rook and clear the c1-h6 diagonal for the bishop. After exf4, White plays Nf3 then Bc4 for an attack on f7. Castling is often delayed to keep the h1 rook active on the open h-file."
    },
    keyIdeas: {
      fr: ["Sacrifice de pion pour initiative", "Colonne f ouverte", "Diagonale c1-h6", "Attaque rapide sur le roi noir"],
      en: ["Pawn sacrifice for initiative", "Open f-file", "c1-h6 diagonal", "Quick attack on black king"]
    }
  },
  {
    name: "Défense Petrov",
    eco: "C42",
    moves: ["e4", "e5", "Nf3", "Nf6"],
    category: 'e4',
    description: {
      fr: "Défense solide et symétrique",
      en: "Solid and symmetrical defense"
    },
    strategy: {
      fr: "Noir contre-attaque e4 au lieu de défendre e5. Après Nxe5, Noir ne joue PAS Nxe4? (piège!) mais d6 pour chasser le cavalier. La position reste symétrique et solide. Plan typique: d6, Be7, O-O, Re8, Bf8-g7.",
      en: "Black counter-attacks e4 instead of defending e5. After Nxe5, Black does NOT play Nxe4? (trap!) but d6 to chase the knight. Position stays symmetrical and solid. Typical plan: d6, Be7, O-O, Re8, Bf8-g7."
    },
    keyIdeas: {
      fr: ["Contre-attaque immédiate", "Symétrie = solidité", "Éviter le piège Cxe4", "Finales souvent nulles"],
      en: ["Immediate counter-attack", "Symmetry = solidity", "Avoid Nxe4 trap", "Often drawn endgames"]
    }
  },
  // Sicilian
  {
    name: "Sicilienne",
    eco: "B20",
    moves: ["e4", "c5"],
    category: 'e4',
    description: {
      fr: "La défense la plus agressive contre 1.e4",
      en: "The most aggressive defense against 1.e4"
    },
    strategy: {
      fr: "Noir déséquilibre immédiatement la position. Le pion c combat le centre blanc (d4) sans créer de symétrie. Après d4 cxd4, Noir obtient une majorité au centre. Les plans incluent ...d6, ...Nf6, ...a6, ...b5 pour une attaque à l'aile dame.",
      en: "Black immediately unbalances the position. The c-pawn fights White's center (d4) without creating symmetry. After d4 cxd4, Black gets a central majority. Plans include ...d6, ...Nf6, ...a6, ...b5 for a queenside attack."
    },
    keyIdeas: {
      fr: ["Déséquilibre dès le 1er coup", "Majorité de pions au centre", "Contre-jeu à l'aile dame", "Positions riches tactiquement"],
      en: ["Imbalance from move 1", "Central pawn majority", "Queenside counter-play", "Tactically rich positions"]
    }
  },
  {
    name: "Sicilienne Ouverte",
    eco: "B50",
    moves: ["e4", "c5", "Nf3", "d6", "d4"],
    category: 'e4',
    description: {
      fr: "La ligne principale de la Sicilienne",
      en: "The main line of the Sicilian"
    },
    strategy: {
      fr: "Blanc ouvre le centre avec d4. Après cxd4 Nxd4, la structure est asymétrique: Blanc a une majorité à l'aile roi (e4-f2-g2-h2) et Noir à l'aile dame. Blanc attaque au centre et à l'aile roi, Noir contre-attaque à l'aile dame avec ...a6, ...b5, ...Bb7.",
      en: "White opens center with d4. After cxd4 Nxd4, structure is asymmetric: White has kingside majority (e4-f2-g2-h2), Black has queenside. White attacks center and kingside, Black counter-attacks queenside with ...a6, ...b5, ...Bb7."
    },
    keyIdeas: {
      fr: ["Majorités opposées", "Blanc: attaque roi", "Noir: poussée b5-b4", "Coups thématiques: f4, Be3"],
      en: ["Opposite majorities", "White: king attack", "Black: b5-b4 push", "Thematic moves: f4, Be3"]
    }
  },
  {
    name: "Française",
    eco: "C00",
    moves: ["e4", "e6"],
    category: 'e4',
    description: {
      fr: "Défense solide préparant ...d5",
      en: "Solid defense preparing ...d5"
    },
    strategy: {
      fr: "Noir joue e6 pour soutenir ...d5 au coup suivant. La chaîne de pions e6-d5 est solide mais le fou c8 est enfermé ('mauvais fou'). Plans typiques: ...c5 pour attaquer la chaîne blanche, ...Nc6, ...Qb6 pour pression sur b2/d4.",
      en: "Black plays e6 to support ...d5 next move. The e6-d5 pawn chain is solid but the c8 bishop is locked in ('bad bishop'). Typical plans: ...c5 to attack White's chain, ...Nc6, ...Qb6 for pressure on b2/d4."
    },
    keyIdeas: {
      fr: ["Chaîne de pions solide", "Problème du fou c8", "Poussée ...c5 centrale", "Attaque de la base de la chaîne"],
      en: ["Solid pawn chain", "c8 bishop problem", "Central ...c5 push", "Attack chain base"]
    }
  },
  {
    name: "Caro-Kann",
    eco: "B10",
    moves: ["e4", "c6"],
    category: 'e4',
    description: {
      fr: "Défense solide préparant ...d5 avec fou actif",
      en: "Solid defense preparing ...d5 with active bishop"
    },
    strategy: {
      fr: "Comme la Française mais c6 permet au fou c8 de sortir en f5 ou g4 AVANT de jouer e6. Après d5 exd5 cxd5, Noir a une structure symétrique solide. Le plan typique est ...Bf5, ...e6, ...Nf6, ...Be7, ...O-O.",
      en: "Like the French but c6 allows the c8 bishop out to f5 or g4 BEFORE playing e6. After d5 exd5 cxd5, Black has a solid symmetric structure. Typical plan is ...Bf5, ...e6, ...Nf6, ...Be7, ...O-O."
    },
    keyIdeas: {
      fr: ["Fou c8 sort avant e6", "Structure solide après ...d5", "Moins dynamique mais plus sûr", "Bon en finale"],
      en: ["c8 bishop out before e6", "Solid structure after ...d5", "Less dynamic but safer", "Good in endgame"]
    }
  },
  {
    name: "Scandinave",
    eco: "B01",
    moves: ["e4", "d5"],
    category: 'e4',
    description: {
      fr: "Attaque immédiate du pion e4",
      en: "Immediate attack on the e4 pawn"
    },
    strategy: {
      fr: "Noir attaque e4 immédiatement. Après exd5 Qxd5, la dame sort tôt mais contrôle des cases importantes. Après Nc3, la dame recule en a5 ou d6. Plan moderne: ...Nf6 au lieu de Qxd5, sacrifiant un pion pour le développement.",
      en: "Black attacks e4 immediately. After exd5 Qxd5, queen is out early but controls key squares. After Nc3, queen retreats to a5 or d6. Modern plan: ...Nf6 instead of Qxd5, sacrificing a pawn for development."
    },
    keyIdeas: {
      fr: ["Dame active malgré sortie précoce", "Structure ...c6-e6 solide", "Retard de développement compensé", "Contre-jeu actif"],
      en: ["Active queen despite early development", "Solid ...c6-e6 structure", "Development delay compensated", "Active counter-play"]
    }
  },
  {
    name: "Pirc",
    eco: "B07",
    moves: ["e4", "d6"],
    category: 'e4',
    description: {
      fr: "Défense hypermoderne flexible",
      en: "Flexible hypermodern defense"
    },
    strategy: {
      fr: "Noir laisse Blanc construire un grand centre avec e4-d4, puis l'attaque avec ...Nf6, ...g6, ...Bg7. Le fou fianchetté vise le centre blanc. Plan: ...O-O, ...c6 ou ...c5, ...Qa5 ou ...Qc7, puis ...e5 ou ...b5.",
      en: "Black lets White build a big center with e4-d4, then attacks it with ...Nf6, ...g6, ...Bg7. The fianchettoed bishop targets White's center. Plan: ...O-O, ...c6 or ...c5, ...Qa5 or ...Qc7, then ...e5 or ...b5."
    },
    keyIdeas: {
      fr: ["Hypermoderne: attaque le centre de loin", "Fou g7 puissant", "Flexibilité des plans", "Contre-attaque ...e5 ou ...c5"],
      en: ["Hypermodern: attacks center from afar", "Powerful g7 bishop", "Plan flexibility", "Counter-attack ...e5 or ...c5"]
    }
  },
];

// ==========================================
// 1.d4 OPENINGS
// ==========================================
export const D4_OPENINGS: Opening[] = [
  {
    name: "Gambit Dame",
    eco: "D06",
    moves: ["d4", "d5", "c4"],
    category: 'd4',
    description: {
      fr: "Le gambit le plus solide des échecs",
      en: "The soundest gambit in chess"
    },
    strategy: {
      fr: "Ce n'est pas un vrai gambit - Blanc peut toujours récupérer le pion. c4 attaque d5 et prépare Nc3, e3, et le développement du fou c1. Si dxc4, Blanc joue e3 puis Bxc4. Le plan est de créer une majorité centrale avec e4.",
      en: "Not a true gambit - White can always recover the pawn. c4 attacks d5 and prepares Nc3, e3, and c1 bishop development. If dxc4, White plays e3 then Bxc4. Plan is to create a central majority with e4."
    },
    keyIdeas: {
      fr: ["Faux gambit - pion récupérable", "Minorité attaque (a4-b5)", "Pression sur d5", "Ouverture du fou c1"],
      en: ["False gambit - pawn recoverable", "Minority attack (a4-b5)", "Pressure on d5", "Opening c1 bishop"]
    }
  },
  {
    name: "Système Londres",
    eco: "D00",
    moves: ["d4", "d5", "Bf4"],
    category: 'd4',
    description: {
      fr: "Système universel contre toutes les défenses",
      en: "Universal system against all defenses"
    },
    strategy: {
      fr: "Le fou sort en f4 AVANT e3, évitant de l'enfermer. Plan classique: e3, Nf3, c3, Bd3, Nbd2, O-O. La structure pyramidale (d4-e3-c3) est très solide. Idée: poussée e4 une fois tout développé, ou attaque sur l'aile roi avec Ne5, Qf3, h4.",
      en: "Bishop goes to f4 BEFORE e3, avoiding locking it in. Classic plan: e3, Nf3, c3, Bd3, Nbd2, O-O. The pyramid structure (d4-e3-c3) is very solid. Idea: e4 push once fully developed, or kingside attack with Ne5, Qf3, h4."
    },
    keyIdeas: {
      fr: ["Fou f4 avant e3", "Structure pyramide solide", "Plan universel", "Ne5 + attaque aile roi"],
      en: ["Bf4 before e3", "Solid pyramid structure", "Universal plan", "Ne5 + kingside attack"]
    }
  },
  {
    name: "Slave",
    eco: "D10",
    moves: ["d4", "d5", "c4", "c6"],
    category: 'd4',
    description: {
      fr: "Défense solide du gambit dame",
      en: "Solid Queen's Gambit defense"
    },
    strategy: {
      fr: "c6 soutient d5 et permet ...dxc4 suivi de ...b5 pour garder le pion. Le fou c8 sort par f5 ou g4. Structure après ...e6 très solide. Plans typiques: ...Bf5 (Slave classique), ...dxc4 + ...b5 (Slave tchèque), ou ...a6 + ...b5 agressif.",
      en: "c6 supports d5 and allows ...dxc4 followed by ...b5 to keep the pawn. c8 bishop develops via f5 or g4. Structure after ...e6 very solid. Typical plans: ...Bf5 (Classical Slav), ...dxc4 + ...b5 (Czech Slav), or aggressive ...a6 + ...b5."
    },
    keyIdeas: {
      fr: ["Soutien de d5 par c6", "Fou c8 actif", "Possibilité ...b5", "Structure très solide"],
      en: ["d5 support via c6", "Active c8 bishop", "Possibility of ...b5", "Very solid structure"]
    }
  },
  {
    name: "Nimzo-Indienne",
    eco: "E20",
    moves: ["d4", "Nf6", "c4", "e6", "Nc3", "Bb4"],
    category: 'd4',
    description: {
      fr: "La meilleure défense contre 1.d4",
      en: "The best defense against 1.d4"
    },
    strategy: {
      fr: "Noir cloue le cavalier c3 qui défend e4. Si Blanc joue e4 maintenant, c'est sans protection. Noir planifie ...c5 ou ...d5 selon la réponse blanche. Le Fou b4 peut se retirer en e7 ou être échangé contre le cavalier pour donner des pions doublés.",
      en: "Black pins the c3 knight that defends e4. If White plays e4 now, it's unprotected. Black plans ...c5 or ...d5 depending on White's response. The b4 bishop can retreat to e7 or be exchanged for the knight to give doubled pawns."
    },
    keyIdeas: {
      fr: ["Clouage du Cc3", "Pions doublés après Fxc3", "Contrôle de e4", "Flexibilité ...c5 ou ...d5"],
      en: ["Nc3 pin", "Doubled pawns after Bxc3", "e4 control", "Flexibility ...c5 or ...d5"]
    }
  },
  {
    name: "Est-Indienne",
    eco: "E60",
    moves: ["d4", "Nf6", "c4", "g6"],
    category: 'd4',
    description: {
      fr: "Défense dynamique pour joueurs tactiques",
      en: "Dynamic defense for tactical players"
    },
    strategy: {
      fr: "Noir fianchette le fou g7 et joue ...d6, ...O-O, ...e5 classiquement. Quand Blanc joue d5, l'aile dame se ferme et Noir attaque à l'aile roi avec ...f5, ...Nf6-d7-c5, ...f4-f3. Jeu à sens uniques typique.",
      en: "Black fianchettos g7 bishop and plays ...d6, ...O-O, ...e5 classically. When White plays d5, queenside closes and Black attacks kingside with ...f5, ...Nf6-d7-c5, ...f4-f3. Typical one-way attacks."
    },
    keyIdeas: {
      fr: ["Fianchetto roi", "Attaque ...f5-f4", "Structure de Benoni après d5", "Sacrifices sur h3/h2"],
      en: ["King fianchetto", "...f5-f4 attack", "Benoni structure after d5", "Sacrifices on h3/h2"]
    }
  },
  {
    name: "Grünfeld",
    eco: "D80",
    moves: ["d4", "Nf6", "c4", "g6", "Nc3", "d5"],
    category: 'd4',
    description: {
      fr: "Contre-attaque hypermoderne du centre",
      en: "Hypermodern counter-attack on the center"
    },
    strategy: {
      fr: "Noir provoque e4 puis attaque le centre élargi avec ...c5, ...Bg7, ...Nc6. Le fou g7 tire sur le centre blanc d4-e3. Si cxd5 Nxd5, Noir échange souvent Cxc3 pour affaiblir la structure blanche. Jeu très tactique.",
      en: "Black provokes e4 then attacks the enlarged center with ...c5, ...Bg7, ...Nc6. The g7 bishop fires at White's d4-e3 center. If cxd5 Nxd5, Black often exchanges Nxc3 to weaken White's structure. Very tactical play."
    },
    keyIdeas: {
      fr: ["Provocateur: invite grand centre blanc", "Attaque avec ...c5 et Fg7", "Structure dynamique", "Tactique > positon"],
      en: ["Provocative: invites big White center", "Attack with ...c5 and Bg7", "Dynamic structure", "Tactics > position"]
    }
  },
  {
    name: "Catalane",
    eco: "E00",
    moves: ["d4", "d5", "c4", "e6", "g3"],
    category: 'd4',
    description: {
      fr: "Système positionnel avec fianchetto",
      en: "Positional system with fianchetto"
    },
    strategy: {
      fr: "Le fou g2 sera très puissant sur la grande diagonale, visant le pion d5 et tout le côté dame noir. Même si Noir joue ...dxc4, le fou g2 compense largement. Plan: Nf3, O-O, Qc2, Rd1, et pression lente mais durable.",
      en: "The g2 bishop will be very powerful on the long diagonal, targeting the d5 pawn and Black's entire queenside. Even if Black plays ...dxc4, the g2 bishop fully compensates. Plan: Nf3, O-O, Qc2, Rd1, and slow but lasting pressure."
    },
    keyIdeas: {
      fr: ["Fou g2 dominant", "Pression sur d5 et colonne c", "Avantage positionnel durable", "Récupération naturelle de pion c4"],
      en: ["Dominant g2 bishop", "Pressure on d5 and c-file", "Lasting positional advantage", "Natural c4 pawn recovery"]
    }
  },
];

// ==========================================
// OTHER OPENINGS (1.c4, 1.Nf3, etc.)
// ==========================================
export const OTHER_OPENINGS: Opening[] = [
  {
    name: "Anglaise",
    eco: "A10",
    moves: ["c4"],
    category: 'other',
    description: {
      fr: "Ouverture de flanc flexible",
      en: "Flexible flank opening"
    },
    strategy: {
      fr: "c4 contrôle d5 sans engager le pion e. Blanc peut transposer vers 1.d4 ou jouer un système symétrique avec g3, Bg2, Nc3. Plans variés: Botvinnik (e4 avec fou g2), Hérisson (contrôle de d4), ou transposition vers Sicilienne inversée.",
      en: "c4 controls d5 without committing the e-pawn. White can transpose to 1.d4 or play a symmetric system with g3, Bg2, Nc3. Various plans: Botvinnik (e4 with g2 bishop), Hedgehog (d4 control), or reversed Sicilian transposition."
    },
    keyIdeas: {
      fr: ["Flexibilité maximale", "Fianchetto possible", "Transpositions vers d4", "Structure Hérisson fréquente"],
      en: ["Maximum flexibility", "Fianchetto possible", "d4 transpositions", "Frequent Hedgehog structure"]
    }
  },
  {
    name: "Réti",
    eco: "A09",
    moves: ["Nf3", "d5", "c4"],
    category: 'other',
    description: {
      fr: "Système hypermoderne de Richard Réti",
      en: "Richard Réti's hypermodern system"
    },
    strategy: {
      fr: "Nf3 empêche ...e5 avant même de jouer d4. Blanc attaquera d5 avec c4, souvent suivi de g3-Bg2. Le fou g2 vise le centre comme dans la Catalane. Flexible: peut transposer vers l'Anglaise, la Catalane, ou le Gambit Dame.",
      en: "Nf3 prevents ...e5 even before playing d4. White will attack d5 with c4, often followed by g3-Bg2. The g2 bishop targets the center like in the Catalan. Flexible: can transpose to English, Catalan, or Queen's Gambit."
    },
    keyIdeas: {
      fr: ["Cf3 empêche ...e5", "Attaque c4 sur d5", "Fianchetto g3-Fg2", "Grande flexibilité"],
      en: ["Nf3 prevents ...e5", "c4 attack on d5", "g3-Bg2 fianchetto", "Great flexibility"]
    }
  },
  {
    name: "Larsen (1.b3)",
    eco: "A01",
    moves: ["b3"],
    category: 'other',
    description: {
      fr: "Ouverture créative du GM Bent Larsen",
      en: "Creative opening by GM Bent Larsen"
    },
    strategy: {
      fr: "Le fou b2 va dominer la grande diagonale a1-h8. Blanc joue ensuite Bb2, e3, Nf3, Be2, O-O. Structure flexible car aucun pion central n'est encore joué. Contre les réponses agressives, le fou b2 devient très puissant défensivement.",
      en: "The b2 bishop will dominate the long a1-h8 diagonal. White then plays Bb2, e3, Nf3, Be2, O-O. Flexible structure since no center pawn is committed yet. Against aggressive responses, the b2 bishop becomes very powerful defensively."
    },
    keyIdeas: {
      fr: ["Fou b2 sur grande diagonale", "Flexibilité totale au centre", "Partie d'usure positionnelle", "Contre-jeu hypermoderne"],
      en: ["b2 bishop on long diagonal", "Total center flexibility", "Positional attrition game", "Hypermodern counter-play"]
    }
  },
  {
    name: "Bird (1.f4)",
    eco: "A02",
    moves: ["f4"],
    category: 'other',
    description: {
      fr: "Contrôle de e5 dès le premier coup",
      en: "Control of e5 from move one"
    },
    strategy: {
      fr: "Blanc contrôle e5 immédiatement et prépare Nf3, e3, Be2, O-O (système Stonewall) ou g3, Bg2 (système Leningrad). Le pion f4 soutient une éventuelle poussée e4. Attention au Gambit From (e5!?) qui peut être dangereux.",
      en: "White controls e5 immediately and prepares Nf3, e3, Be2, O-O (Stonewall system) or g3, Bg2 (Leningrad system). The f4 pawn supports an eventual e4 push. Beware the From Gambit (e5!?) which can be dangerous."
    },
    keyIdeas: {
      fr: ["Contrôle de e5", "Système Stonewall ou Leningrad", "Préparation de e4", "Faiblesse e1-h4 à surveiller"],
      en: ["e5 control", "Stonewall or Leningrad system", "e4 preparation", "e1-h4 weakness to watch"]
    }
  },
  {
    name: "Nimzo-Larsen (1.b3 ou 1.Nf3 2.b3)",
    eco: "A06",
    moves: ["Nf3", "d5", "b3"],
    category: 'other',
    description: {
      fr: "Hybride entre Réti et Larsen",
      en: "Hybrid between Réti and Larsen"
    },
    strategy: {
      fr: "Combine le contrôle de e5 (Nf3) avec le fianchetto dame (b3). Le fou b2 et le cavalier f3 travaillent ensemble pour contrôler les cases centrales de loin. Plan: Bb2, g3, Bg2, O-O, c4 ou e3 selon les réponses noires.",
      en: "Combines e5 control (Nf3) with queenside fianchetto (b3). The b2 bishop and f3 knight work together to control central squares from afar. Plan: Bb2, g3, Bg2, O-O, c4 or e3 depending on Black's responses."
    },
    keyIdeas: {
      fr: ["Double fianchetto possible", "Contrôle hypermoderne du centre", "Très flexible", "Contre toutes les structures"],
      en: ["Double fianchetto possible", "Hypermodern center control", "Very flexible", "Against all structures"]
    }
  },
  {
    name: "Attaque Indienne du Roi",
    eco: "A07",
    moves: ["Nf3", "d5", "g3"],
    category: 'other',
    description: {
      fr: "Système universel avec fianchetto roi",
      en: "Universal system with king fianchetto"
    },
    strategy: {
      fr: "Blanc joue Bg2, O-O, d3, Nbd2, e4. C'est une Sicilienne inversée avec un tempo supplémentaire. Le fou g2 soutient la poussée e4. Très efficace contre les structures ...d5-c6 ou ...d5-e6. Fischer l'utilisait souvent.",
      en: "White plays Bg2, O-O, d3, Nbd2, e4. This is a reversed Sicilian with an extra tempo. The g2 bishop supports the e4 push. Very effective against ...d5-c6 or ...d5-e6 structures. Fischer used it often."
    },
    keyIdeas: {
      fr: ["Sicilienne inversée", "Poussée e4 thématique", "Structure très solide", "Universel contre tout"],
      en: ["Reversed Sicilian", "Thematic e4 push", "Very solid structure", "Universal against everything"]
    }
  },
  {
    name: "Sokolsky (1.b4)",
    eco: "A00",
    moves: ["b4"],
    category: 'other',
    description: {
      fr: "L'orangutan - ouverture excentrique mais jouable",
      en: "The Orangutan - eccentric but playable"
    },
    strategy: {
      fr: "Blanc contrôle c5 et prépare Bb2 pour la diagonale. Après a3, le pion b devient très agressif. Plans: Bb2, e3, Nf3, c4. Le fou b2 vise e5 et peut devenir très fort si Noir joue ...e5 prématurément.",
      en: "White controls c5 and prepares Bb2 for the diagonal. After a3, the b-pawn becomes very aggressive. Plans: Bb2, e3, Nf3, c4. The b2 bishop targets e5 and can become very strong if Black plays ...e5 prematurely."
    },
    keyIdeas: {
      fr: ["Contrôle de c5", "Fou b2 actif", "Attaque de flanc inhabituelle", "Effet de surprise"],
      en: ["c5 control", "Active b2 bishop", "Unusual flank attack", "Surprise effect"]
    }
  },
  {
    name: "Grob (1.g4)",
    eco: "A00",
    moves: ["g4"],
    category: 'other',
    description: {
      fr: "Ouverture très agressive mais risquée",
      en: "Very aggressive but risky opening"
    },
    strategy: {
      fr: "Blanc ouvre immédiatement la colonne h et prépare Bg2. Le pion g4 peut avancer à g5 pour chasser un cavalier f6. Cependant, cela affaiblit sérieusement l'aile roi. Plans: Bg2, h3, d3, Nc3, mais attention aux contre-attaques!",
      en: "White immediately opens the h-file and prepares Bg2. The g4 pawn can advance to g5 to chase a knight from f6. However, this seriously weakens the kingside. Plans: Bg2, h3, d3, Nc3, but watch for counter-attacks!"
    },
    keyIdeas: {
      fr: ["Colonne h ouverte", "Fou g2 fianchetté", "Très agressif mais risqué", "Effet de surprise maximal"],
      en: ["Open h-file", "Fianchettoed g2 bishop", "Very aggressive but risky", "Maximum surprise effect"]
    }
  },
];

// Combine all openings
export const ALL_OPENINGS: Opening[] = [
  ...E4_OPENINGS,
  ...D4_OPENINGS,
  ...OTHER_OPENINGS,
];

// Get opening by name
export function getOpeningByName(name: string): Opening | undefined {
  return ALL_OPENINGS.find(o => o.name === name);
}
