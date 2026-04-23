# Elo Trainer - Web App

Application web d'entraînement aux ouvertures d'échecs.

## 🚀 Installation

```bash
npm install
npm run dev
```

L'app sera accessible sur `http://localhost:5173/app/`

## 📦 Build pour production

```bash
npm run build
```

Les fichiers seront dans `dist/`. À copier dans le dossier `app/` de ton site elo-booster.

## 🌐 Déploiement sur elo-booster.com

1. Build : `npm run build`
2. Copier le contenu de `dist/` vers le repo du site dans un dossier `app/`
3. L'app sera accessible sur `https://elo-booster.com/app/`

## Structure

```
src/
├── App.tsx              # Routing principal
├── App.css              # Styles globaux
├── main.tsx             # Point d'entrée
├── components/
│   └── ScoreDisplay.tsx # Affichage du score
├── screens/
│   ├── ConfigScreen.tsx # Configuration
│   ├── GameScreen.tsx   # Jeu
│   └── PremiumScreen.tsx# Premium
├── services/
│   ├── lichessApi.ts    # API Lichess
│   └── scoring.ts       # Calcul des scores
├── store/
│   └── gameStore.ts     # État global
└── types/
    └── index.ts         # Types TypeScript
```

## API utilisée

[Lichess Opening Explorer](https://lichess.org/api#tag/Opening-Explorer) - Gratuit, pas d'auth requise.
