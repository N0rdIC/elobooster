# Elo Booster - Chess Opening Trainer

## Project Overview
Chess opening trainer web app deployed on Vercel at https://elo-booster.com
API backend at https://elo-booster-api.vercel.app

## Architecture

### Frontend (this repo)
- Built with React + TypeScript + Vite
- Source code in `/src` (not versioned - only built files in `/app`)
- Deployed files in `/app` folder (auto-deploys to Vercel on push)

### Key Directories
- `/app` - Production build (deployed to Vercel)
- `/app/assets` - Compiled JS/CSS bundles
- `/elo_booster_local` - PDF guides and data files

## Development Workflow

### Source Code Location
The React source code is maintained in a separate local folder `elo-trainer-web` (not in this repo).
Only the built `/app` folder is versioned and deployed.

### Build & Deploy
```bash
# From elo-trainer-web folder:
npm run build

# Copy to this repo:
rm -rf ../elobooster/app/*
cp -r dist/* ../elobooster/app/

# Deploy:
cd ../elobooster
git add -A && git commit -m "vXX - description" && git push origin main
```

### Quick CSS Fixes
For CSS-only changes, edit `/app/assets/*.css` directly and push.

## Current Version: v72

### Features
- Opening training with Stockfish WASM (local, no server)
- Eval bar showing position evaluation
- Move scoring (100 = best move)
- Free tier: 5 moves, white only, 3 games/day
- Premium tier: 15 moves, both colors, unlimited games

### Authentication
- Email + 6-digit verification code
- 30-day session tokens stored in Redis
- API endpoints: /api/send-code, /api/verify-code, /api/verify-token

## API Endpoints (elo-booster-api)
- POST /api/send-code - Send verification email
- POST /api/verify-code - Verify code, return session token
- POST /api/verify-token - Validate existing token
- GET /api/check-premium - Check premium status
- POST /api/create-checkout-session - Stripe checkout
- POST /api/create-portal-session - Stripe customer portal

## Tech Stack
- React 18 + TypeScript
- Zustand (state management)
- chess.js (chess logic)
- react-chessboard (UI)
- Stockfish WASM (local engine)
- Stripe (payments)
- Redis (sessions/codes)
- Vercel (hosting)

# Elo Booster - Chess Opening Trainer

## Project Overview
Chess opening trainer at https://elo-booster.com
API: https://elo-booster-api.vercel.app

## Structure
elobooster/
├── app/                 # Build (auto-deploys to Vercel)
├── elo-trainer-web/     # React source code
│   ├── src/
│   │   ├── components/  # EvalBar, ScoreDisplay, LanguageSwitch
│   │   ├── screens/     # ConfigScreen, GameScreen, PremiumScreen
│   │   ├── store/       # gameStore, authStore (Zustand)
│   │   ├── services/    # stockfishLocal, scoring, explanations
│   │   ├── i18n/        # translations
│   │   └── types/       # TypeScript types
│   └── public/          # stockfish.js, stockfish.wasm
└── elo_booster_local/   # PDF guides

## Build & Deploy
```bash
cd elo-trainer-web && npm run build
cd .. && rm -rf app/* && cp -r elo-trainer-web/dist/* app/
git add -A && git commit -m "vXX - description" && git push
```

## Current Version: v73

## Key Features
- Stockfish WASM local (no server)
- Eval bar: white at bottom
- Move scoring: 100 = best move
- Free: 5 moves, white only, 3 games/day
- Premium: 15 moves, both colors, unlimited

## Auth Flow
1. Email → /api/send-code → 6-digit code
2. Code → /api/verify-code → 30-day token
3. Token stored in localStorage (Zustand persist)