// App.tsx - Point d'entrée

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigScreen } from './screens/ConfigScreen';
import { GameScreen } from './screens/GameScreen';
import { PremiumScreen } from './screens/PremiumScreen';
import './App.css';

export default function App() {
  return (
    <BrowserRouter basename="/app">
      <div className="app">
        <Routes>
          <Route path="/" element={<ConfigScreen />} />
          <Route path="/game" element={<GameScreen />} />
          <Route path="/premium" element={<PremiumScreen />} />
          {/* Redirects for old routes */}
          <Route path="/config" element={<Navigate to="/" replace />} />
          <Route path="/openings" element={<Navigate to="/" replace />} />
          <Route path="/openings/play" element={<Navigate to="/game" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
