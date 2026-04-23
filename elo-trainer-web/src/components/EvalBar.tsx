// Evaluation bar component - shows white/black advantage

import './EvalBar.css';

interface EvalBarProps {
  eval: number | null | undefined;  // Centipawns, positive = white advantage, null = unknown
  evalText?: string;  // "+0.5" or "M3" - used to detect mate
  orientation?: 'white' | 'black';
}

export function EvalBar({ eval: evalCp, evalText, orientation = 'white' }: EvalBarProps) {
  // Handle no eval case
  const hasEval = evalCp !== null && evalCp !== undefined && !isNaN(evalCp);
  
  if (!hasEval) {
    return (
      <div className="eval-bar-container">
        <div className="eval-bar no-eval">
          <div className="eval-bar-white" style={{ height: '50%' }} />
          <div className="eval-bar-black" style={{ height: '50%' }} />
          <span className="eval-text on-white">?</span>
        </div>
      </div>
    );
  }
  
  // Check for mate from evalText
  const mateMatch = evalText?.match(/M(-?\d+)/i);
  const mateIn = mateMatch ? parseInt(mateMatch[1]) : undefined;
  
  // Convert centipawns to percentage (capped at ±10 pawns)
  let whitePercent: number;
  let displayText: string;
  
  if (mateIn !== undefined) {
    // Mate - check if it's mate for white (positive eval) or black (negative eval)
    const mateForWhite = evalCp > 0 || (evalCp === 0 && !evalText?.includes('-'));
    whitePercent = mateForWhite ? 100 : 0;
    displayText = evalText || `M${Math.abs(mateIn)}`;
  } else {
    // Centipawns - use sigmoid-like function for smooth scaling
    // At ±3 pawns (300cp), bar is ~85% filled
    // At ±10 pawns (1000cp), bar is ~99% filled
    const sigmoidEval = 50 + 50 * (2 / (1 + Math.exp(-evalCp / 200)) - 1);
    whitePercent = Math.max(0, Math.min(100, sigmoidEval));
    
    // Format eval text
    const evalPawns = evalCp / 100;
    if (Math.abs(evalCp) < 10) {
      displayText = '0.0';
    } else {
      displayText = (evalPawns > 0 ? '+' : '') + evalPawns.toFixed(1);
    }
  }
  
  // Flip for black's perspective
  const displayPercent = orientation === 'white' ? whitePercent : 100 - whitePercent;
  
  // Determine which side has advantage for text color
  const whiteAdvantage = mateIn !== undefined ? (evalCp >= 0) : evalCp > 0;
  const showOnWhiteSide = whiteAdvantage ? (orientation === 'white') : (orientation === 'black');
  
  return (
    <div className="eval-bar-container">
      <div className="eval-bar">
        <div 
          className="eval-bar-white" 
          style={{ height: `${displayPercent}%` }}
        />
        <div 
          className="eval-bar-black" 
          style={{ height: `${100 - displayPercent}%` }}
        />
        <span className={`eval-text ${showOnWhiteSide ? 'on-white' : 'on-black'}`}>
          {displayText}
        </span>
      </div>
    </div>
  );
}
