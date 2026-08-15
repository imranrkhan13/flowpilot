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
  const progress = totalSteps > 0 ? ((currentStep + 1) / totalSteps) * 100 : 0;
  return (
    <section className="rounded-2xl border border-[#dfd2c5] bg-[#fffdf9] p-3 shadow-[0_10px_28px_rgba(85,55,37,0.06)]" aria-label="Crowd movement controls">
      <div className="flex flex-wrap items-center gap-2.5">
        <button type="button" onClick={isPlaying ? onPause : onPlay} className="rounded-xl bg-[#4a2e22] px-4 py-2.5 text-sm font-extrabold text-white shadow-sm hover:bg-[#633d2d]">{isPlaying ? 'Pause' : 'Play crowd'}</button>
        <button type="button" onClick={onReset} className="rounded-xl border border-[#d9c7b8] bg-[#fffaf4] px-4 py-2.5 text-sm font-bold text-[#6f4b3b] hover:border-[#b97852] hover:bg-[#f8eee5]">Reset</button>
        <div className="hidden h-8 w-px bg-[#eadfd5] sm:block" />
        <label className="flex items-center gap-2 text-xs font-semibold text-[#806957]">How fast <input aria-label="Crowd movement speed" type="range" min={1} max={10} value={speed} onChange={(event) => onSpeedChange(Number(event.target.value))} className="w-24 accent-[#a35d3f]" /><span className="min-w-7 text-right font-extrabold text-[#4a2e22]">{speed}×</span></label>
        <div className="ml-auto text-right text-xs font-semibold text-[#806957]"><div className="font-extrabold text-[#4a2e22]">Time {Math.min(currentStep + 1, totalSteps)} <span className="font-medium text-[#a58b7a]">/ {totalSteps}</span></div><div className="mt-1 h-1.5 w-28 overflow-hidden rounded-full bg-[#eadfd5]"><div className="h-full rounded-full bg-[#b97852] transition-[width] duration-200" style={{ width: `${progress}%` }} /></div></div>
      </div>
    </section>
  );
}
