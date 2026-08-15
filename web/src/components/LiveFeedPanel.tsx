import { LiveFeedSnapshot } from '../types';

interface Props {
  feed: LiveFeedSnapshot | null;
}

const statusStyles: Record<string, string> = {
  Open: 'bg-[#e7f2e7] text-[#3d7147]',
  Busy: 'bg-[#fff1d6] text-[#936728]',
  Full: 'bg-[#fff0eb] text-[#9b4a31]',
};

export default function LiveFeedPanel({ feed }: Props) {
  return (
    <section className="rounded-2xl border border-[#d9c7b8] bg-[#4a2e22] p-4 text-[#fff8ef] shadow-[0_12px_32px_rgba(74,46,34,0.12)]" aria-labelledby="live-feed-heading">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#f0c89d]"><span className="h-2 w-2 animate-pulse rounded-full bg-[#80c889]" aria-hidden="true" /> Live entry data</div>
          <h2 id="live-feed-heading" className="mt-1 text-sm font-extrabold">Ticket scans + gate counters</h2>
        </div>
        <span className="rounded-full border border-[#b97852]/70 px-2 py-1 text-[10px] font-bold text-[#f0c89d]">{feed?.isDemo ? 'DEMO FEED' : 'LIVE FEED'}</span>
      </div>
      <p className="mt-2 text-xs leading-5 text-[#ead8c9]">{feed?.sourceLabel ?? 'Waiting for entry data…'}</p>
      {feed && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-[#633d2d] p-3"><div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#efc49d]">Scans this minute</div><div className="mt-1 text-xl font-extrabold">{feed.totalScans.toLocaleString()}</div></div>
            <div className="rounded-xl bg-[#633d2d] p-3"><div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#efc49d]">People inside</div><div className="mt-1 text-xl font-extrabold">{feed.peopleInside.toLocaleString()}</div></div>
          </div>
          <div className="mt-3 space-y-2">
            {feed.gates.map((gate) => (
              <div key={gate.gateId} className="flex items-center justify-between gap-3 rounded-xl bg-[#fff8ef] px-3 py-2.5 text-[#4a2e22]">
                <div className="min-w-0"><div className="truncate text-xs font-extrabold">{gate.gateLabel}</div><div className="mt-0.5 text-[10px] text-[#806957]">{gate.scansLastMinute} scans · {gate.peopleInside} inside</div></div>
                <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-extrabold ${statusStyles[gate.status]}`}>{gate.status}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 text-[10px] font-semibold text-[#d9c1ad]">Updated {new Date(feed.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
        </>
      )}
    </section>
  );
}
