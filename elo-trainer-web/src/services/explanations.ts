// Move explanation service

const explanations: Record<string, Record<string, string>> = {
  fr: {
    development: 'Développez vos pièces vers des cases actives',
    center: 'Contrôlez le centre avec vos pions et pièces',
    castling: 'Mettez votre roi en sécurité en roquant',
    tactics: 'Cherchez des tactiques: fourchettes, clouages, attaques doubles',
    pressure: 'Maintenez la pression sur les faiblesses adverses',
    activity: 'Activez vos pièces vers des cases optimales',
  },
  en: {
    development: 'Develop your pieces to active squares',
    center: 'Control the center with your pawns and pieces',
    castling: 'Castle to put your king in safety',
    tactics: 'Look for tactics: forks, pins, double attacks',
    pressure: 'Maintain pressure on opponent weaknesses',
    activity: 'Activate your pieces to optimal squares',
  },
};

export function getExplanation(
  moveNumber: number,
  score: number,
  lang: 'fr' | 'en' = 'fr'
): string | null {
  // Only show explanations for bad moves
  if (score >= 70) return null;
  
  const tips = explanations[lang];
  
  // Select tip based on move number (opening phase)
  if (moveNumber <= 5) {
    return tips.development;
  } else if (moveNumber <= 8) {
    return tips.center;
  } else if (moveNumber <= 10) {
    return tips.castling;
  } else {
    return tips.activity;
  }
}

export function formatMoveNotation(uci: string): string {
  // Convert UCI to more readable format
  const from = uci.slice(0, 2);
  const to = uci.slice(2, 4);
  const promotion = uci.length > 4 ? `=${uci[4].toUpperCase()}` : '';
  return `${from}-${to}${promotion}`;
}
