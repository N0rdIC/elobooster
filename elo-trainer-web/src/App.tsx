import { Routes, Route } from 'react-router-dom'
import { LanguageSwitch } from './components/LanguageSwitch'
import { ConfigScreen } from './screens/ConfigScreen'
import { GameScreen } from './screens/GameScreen'
import { PremiumScreen } from './screens/PremiumScreen'

function App() {
  return (
    <div className="app">
      <LanguageSwitch />
      <Routes>
        <Route path="/" element={<ConfigScreen />} />
        <Route path="/game" element={<GameScreen />} />
        <Route path="/premium" element={<PremiumScreen />} />
      </Routes>
    </div>
  )
}

export default App
