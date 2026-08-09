interface Props {
  isPlaying: boolean;
  speed: number;
  currentStep: number;
  totalSteps: number;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
}

export default function SimulationControls({ isPlaying, speed, currentStep, totalSteps, onPlay, onPause, onReset, onSpeedChange }: Props) {
  return (
    <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-lg px-4 py-2">
      <button onClick={isPlaying ? onPause : onPlay}
        className="px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-colors">
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <button onClick={onReset}
        className="px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-colors">Reset</button>
      <div className="w-px h-6 bg-slate-700 mx-1" />
      <label className="text-xs text-slate-400">Speed</label>
      <input type="range" min={1} max={10} value={speed} onChange={(e) => onSpeedChange(Number(e.target.value))}
        className="w-24 accent-cyan-500" />
      <span className="text-xs text-slate-400 w-6">{speed}x</span>
      <div className="w-px h-6 bg-slate-700 mx-1" />
      <span className="text-xs text-slate-400">Step {currentStep} / {totalSteps}</span>
    </div>
  );
}
