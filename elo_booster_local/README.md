# Elo Booster - Génération PDF

## Structure

```
├── data_fr/          # 30 fichiers JSON en français
├── data_en/          # 30 fichiers JSON en anglais
├── generate_fr.py    # Script pour générer le PDF français
├── generate_en.py    # Script pour générer le PDF anglais
└── README.md
```

## Prérequis

```bash
pip install reportlab svglib chess pillow
```

## Utilisation

### Générer le PDF français
```bash
python generate_fr.py
# → Crée Elo_Booster_FR.pdf
```

### Générer le PDF anglais
```bash
python generate_en.py
# → Crée Elo_Booster_EN.pdf
```

## Modifier le contenu

Chaque fichier JSON dans `data_fr/` ou `data_en/` représente une ouverture.

### Structure d'un fichier JSON

```json
{
  "name": "Nom de l'ouverture",
  "code": "C50",
  "fen": "position FEN de départ",
  "complexity": "Débutant|Intermédiaire|Avancé",
  "white_win": 54,
  "black_win": 30,
  "draw": 16,
  "main_idea": "L'idée principale de l'ouverture",
  "champions": ["Champion 1", "Champion 2"],
  "white_errors": ["Erreur 1", "Erreur 2", "Erreur 3"],
  "black_errors": ["Erreur 1", "Erreur 2", "Erreur 3"],
  "development_challenges": [
    ["Pièce", "Objectif"],
    ["Fou c1", "Développer vers g5 ou e3"]
  ],
  "traps": [
    {
      "name": "Nom du piège",
      "fen": "position FEN",
      "description": "Description du piège"
    }
  ],
  "variations": [
    {
      "name": "Nom de la variante",
      "moves": "1.e4 e5 2.Cf3...",
      "fen": "position FEN",
      "white_plan": "Plan des blancs",
      "black_plan": "Plan des noirs"
    }
  ]
}
```

## Personnalisation

- Pour changer les couleurs, modifie le dictionnaire `COLORS` en haut du script
- Pour changer les textes (titres de sections), cherche les strings dans le script
