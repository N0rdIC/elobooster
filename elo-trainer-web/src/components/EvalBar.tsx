import './EvalBar.css';

interface EvalBarProps {
  evaluation: number | null; // Centipawns from White's perspective
}

export function EvalBar({ evaluation }: EvalBarProps) {
  // Convert eval to percentage (50% = equal, 100% = white winning, 0% = black winning)
  const getWhitePercentage = (evalCp: number | null): number => {
    if (evalCp === null) return 50;
    
    // Clamp eval to reasonable range and convert to percentage
    // Using sigmoid-like function for smoother display
    const clampedEval = Math.max(-1000, Math.min(1000, evalCp));
    const percentage = 50 + (clampedEval / 20); // ~10cp = 1%
    return Math.max(5, Math.min(95, percentage));
  };

  const whitePercent = getWhitePercentage(evaluation);
  const blackPercent = 100 - whitePercent;

  const formatEval = (evalCp: number | null): string => {
    if (evalCp === null) return '';
    const absEval = Math.abs(evalCp);
    if (absEval >= 1000) {
      return evalCp > 0 ? '+M' : '-M';
    }
    const pawns = (evalCp / 100).toFixed(1);
    return evalCp > 0 ? `+${pawns}` : pawns;
  };

  const evalText = formatEval(evaluation);
  const showOnWhite = whitePercent > 30;

  return (
    <div className="eval-bar-container">
      <div className={`eval-bar ${evaluation === null ? 'no-eval' : ''}`}>
        <div 
          className="eval-bar-white" 
          style={{ height: `${whitePercent}%` }}
        />
        <div 
          className="eval-bar-black" 
          style={{ height: `${blackPercent}%` }}
        />
        {evalText && (
          <span className={`eval-text ${showOnWhite ? 'on-white' : 'on-black'}`}>
            {evalText}
          </span>
        )}
      </div>
    </div>
  );
}
