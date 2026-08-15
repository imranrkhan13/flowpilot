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
    if (!file.type.startsWith('image/')) { setError('Please choose a supported image file.'); setResult(null); return; }
    if (file.size > 10 * 1024 * 1024) { setError('Images must be smaller than 10 MB.'); setResult(null); return; }
    setError(null); setResult(null); setLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const encoded = typeof reader.result === 'string' ? reader.result.split(',')[1] : '';
        if (!encoded) throw new Error('The selected image could not be read.');
        setResult(await estimateOccupancy(encoded, zoneId));
      } catch (cause) { setError(cause instanceof Error ? cause.message : 'Occupancy estimation failed.'); }
      finally { setLoading(false); }
    };
    reader.onerror = () => { setError('The selected image could not be read.'); setLoading(false); };
    reader.readAsDataURL(file);
  };

  const live = result?.mode === 'LIVEMODE';
  return (
    <section className="rounded-2xl border border-[#dfd2c5] bg-[#fffdf9] p-4 shadow-[0_10px_28px_rgba(85,55,37,0.06)]" aria-labelledby="camera-evidence-heading">
      <div className="flex items-start justify-between gap-3">
        <div><div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#a35d3f]">Optional evidence</div><h2 id="camera-evidence-heading" className="mt-1 text-sm font-extrabold text-[#3d281e]">Camera evidence</h2></div>
        <span className="rounded-full bg-[#f1e2d4] px-2 py-1 text-[10px] font-bold text-[#8e5e43]">{scenarioId}</span>
      </div>
      <p className="mt-3 text-xs leading-5 text-[#806957]">Upload a venue image to estimate occupancy for a target zone. Without a Hugging Face token, the app clearly falls back to deterministic demo data.</p>
      <div className="mt-4">
        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.12em] text-[#a58b7a]" htmlFor="target-zone">Target zone</label>
        <input id="target-zone" type="text" value={zoneId} onChange={(event) => setZoneId(event.target.value)} className="w-full rounded-xl border border-[#dfd2c5] bg-[#fffaf4] px-3 py-2 text-sm text-[#4a2e22] outline-none placeholder:text-[#b49b8a] focus:border-[#b97852] focus:ring-2 focus:ring-[#d9b89e]" />
      </div>
      <label className="mt-3 block cursor-pointer rounded-xl border border-dashed border-[#cdb19c] bg-[#fffaf4] p-4 text-center text-xs font-bold text-[#8e5e43] transition hover:border-[#a35d3f] hover:bg-[#f8eee5]" htmlFor="camera-upload">
        {loading ? 'Analyzing image…' : 'Choose a camera image'}
        <span className="mt-1 block text-[10px] font-medium text-[#a58b7a]">JPG, PNG, or WEBP · max 10 MB</span>
        <input id="camera-upload" type="file" accept="image/*" onChange={handleFile} disabled={loading} className="sr-only" />
      </label>
      {error && <p className="mt-3 rounded-xl border border-[#e5b09a] bg-[#fff2ec] px-3 py-2 text-xs font-semibold leading-5 text-[#9b4a31]" role="alert">{error}</p>}
      {result && (
        <div className="mt-4 space-y-3 rounded-xl border border-[#dfd2c5] bg-[#f8f1e9] p-3">
          <div className="flex items-center gap-2"><span className={`rounded-full px-2 py-1 text-[10px] font-extrabold ${live ? 'bg-[#e7f2e7] text-[#3d7147]' : 'bg-[#fff1d6] text-[#936728]'}`}>{live ? 'LIVE MODE' : 'DEMO MODE'}</span><span className="truncate text-[10px] font-semibold text-[#9b7962]">{result.modelName}</span></div>
          <p className="text-xs leading-5 text-[#70594b]">{live ? 'Estimated from the Hugging Face object-detection request.' : 'Deterministic fixture result; no live vision credential was used.'}</p>
          <div className="grid grid-cols-2 gap-2"><div className="rounded-xl bg-[#fffdf9] p-2.5"><div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#a58b7a]">People</div><div className="mt-1 text-lg font-extrabold text-[#4a2e22]">{result.peopleCount}</div></div><div className="rounded-xl bg-[#fffdf9] p-2.5"><div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#a58b7a]">Confidence</div><div className="mt-1 text-lg font-extrabold text-[#4a2e22]">{Math.round(result.confidence * 100)}%</div></div></div>
          {result.timestamp && <div className="text-[10px] font-medium text-[#a58b7a]">Updated {new Date(result.timestamp).toLocaleTimeString()}</div>}
          {result.error && <div className="text-xs font-semibold leading-5 text-[#936728]">{result.error}</div>}
        </div>
      )}
    </section>
  );
}
