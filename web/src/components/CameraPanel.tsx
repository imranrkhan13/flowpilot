import { useState } from 'react';
import { estimateOccupancy } from '../lib/api';
import { VisionResult } from '../types';

interface Props {
  scenarioId: string;
}

export default function CameraPanel({ scenarioId }: Props) {
  const [result, setResult] = useState<VisionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [zoneId, setZoneId] = useState('north_gate');

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const res = await estimateOccupancy(base64, zoneId);
        setResult(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Camera Evidence</h3>
      <div className="mb-3">
        <label className="text-xs text-slate-500 block mb-1">Target Zone</label>
        <input type="text" value={zoneId} onChange={(e) => setZoneId(e.target.value)}
          className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 text-sm text-slate-200" />
      </div>
      <input type="file" accept="image/*" onChange={handleFile}
        className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700" />
      {loading && <div className="mt-2 text-xs text-slate-500">Analyzing...</div>}
      {result && (
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              result.mode === 'LIVEMODE' ? 'bg-emerald-900/40 text-emerald-400' : 'bg-amber-900/40 text-amber-400'
            }`}>{result.mode}</span>
            <span className="text-[10px] text-slate-500">{result.modelName}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-950 rounded p-2">
              <div className="text-xs text-slate-500">People</div>
              <div className="text-sm font-semibold text-slate-200">{result.peopleCount}</div>
            </div>
            <div className="bg-slate-950 rounded p-2">
              <div className="text-xs text-slate-500">Confidence</div>
              <div className="text-sm font-semibold text-slate-200">{Math.round(result.confidence * 100)}%</div>
            </div>
          </div>
          {result.timestamp && <div className="text-[10px] text-slate-500">{new Date(result.timestamp).toLocaleTimeString()}</div>}
          {result.error && <div className="text-xs text-red-400">{result.error}</div>}
        </div>
      )}
    </div>
  );
}
