import { useState } from 'react';
import { estimateOccupancy } from '../lib/api';
import { VisionResult } from '../types';

interface Props {
  scenarioId: string;
}

export default function CameraPanel({ scenarioId }: Props) {
  const [result, setResult] = useState<VisionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoneId, setZoneId] = useState('north_gate');

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Images must be smaller than 10 MB.');
      return;
    }

    setError(null);
    setResult(null);
    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const encoded = typeof reader.result === 'string' ? reader.result.split(',')[1] : '';
        if (!encoded) throw new Error('The selected image could not be read.');
        setResult(await estimateOccupancy(encoded, zoneId));
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Occupancy estimation failed.');
      } finally {
        setLoading(false);
      }
    };
    reader.onerror = () => {
      setError('The selected image could not be read.');
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-4" aria-labelledby="camera-evidence-heading">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 id="camera-evidence-heading" className="text-sm font-semibold uppercase tracking-wider text-slate-300">Camera Evidence</h3>
          <p className="mt-1 text-[10px] text-slate-600">Scenario: {scenarioId}</p>
        </div>
        <span className="rounded bg-slate-800 px-2 py-1 text-[10px] text-slate-500">Optional</span>
      </div>
      <div className="mb-3">
        <label className="mb-1 block text-xs text-slate-500" htmlFor="target-zone">Target zone</label>
        <input
          id="target-zone"
          type="text"
          value={zoneId}
          onChange={(event) => setZoneId(event.target.value)}
          className="w-full rounded border border-slate-800 bg-slate-950 px-2 py-1.5 text-sm text-slate-200 outline-none transition focus:border-cyan-400/60 focus:ring-1 focus:ring-cyan-400/40"
        />
      </div>
      <label className="block cursor-pointer rounded-lg border border-dashed border-slate-700 p-3 text-center text-xs text-slate-400 transition hover:border-cyan-400/50 hover:text-slate-200" htmlFor="camera-upload">
        {loading ? 'Analyzing image…' : 'Choose a camera image'}
        <input id="camera-upload" type="file" accept="image/*" onChange={handleFile} disabled={loading} className="sr-only" />
      </label>
      {error && <p className="mt-3 text-xs text-red-300" role="alert">{error}</p>}
      {result && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${result.mode === 'LIVEMODE' ? 'bg-emerald-900/40 text-emerald-400' : 'bg-amber-900/40 text-amber-400'}`}>{result.mode}</span>
            <span className="text-[10px] text-slate-500">{result.modelName}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded bg-slate-950 p-2"><div className="text-xs text-slate-500">People</div><div className="text-sm font-semibold text-slate-200">{result.peopleCount}</div></div>
            <div className="rounded bg-slate-950 p-2"><div className="text-xs text-slate-500">Confidence</div><div className="text-sm font-semibold text-slate-200">{Math.round(result.confidence * 100)}%</div></div>
          </div>
          {result.timestamp && <div className="text-[10px] text-slate-500">{new Date(result.timestamp).toLocaleTimeString()}</div>}
          {result.error && <div className="text-xs text-amber-300">{result.error}</div>}
        </div>
      )}
    </section>
  );
}

