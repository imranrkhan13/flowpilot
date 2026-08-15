import { FormEvent, useState } from 'react';
import { askCrowdQuestion } from '../lib/api';
import { LiveFeedSnapshot, RerouteRecommendation, SimulationState } from '../types';

interface Props {
  scenarioId: string;
  liveFeed: LiveFeedSnapshot | null;
  currentState: SimulationState | null;
  recommendation: RerouteRecommendation | null;
}

const quickQuestions = ['Which gate is busy?', 'Why is there a crowd?', 'What route should I use?', 'Kaunsa route easy hai?', 'Kahan bheed hai?'];

export default function CrowdAdvisor({ scenarioId, liveFeed, currentState, recommendation }: Props) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<{ text: string; mode: 'live-ai' | 'demo'; provider?: string } | null>(null);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ask = async (event?: FormEvent) => {
    event?.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || asking) return;
    setAsking(true);
    setError(null);
    try {
      const result = await askCrowdQuestion({ question: trimmed, scenarioId, liveFeed, currentState, recommendation });
      setAnswer({ text: result.answer, mode: result.mode, provider: result.provider });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'We could not answer that question.');
    } finally {
      setAsking(false);
    }
  };

  return (
    <section className="rounded-2xl border border-[#d9c7b8] bg-[#fffdf9] p-4 shadow-[0_12px_32px_rgba(85,55,37,0.08)]" aria-labelledby="crowd-advisor-heading">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#a35d3f]"><span className="h-2 w-2 rounded-full bg-[#b97852]" aria-hidden="true" /> Crowd helper</div>
          <h2 id="crowd-advisor-heading" className="mt-1 text-base font-extrabold text-[#4a2e22]">Ask about the crowd</h2>
        </div>
        <span className="rounded-full border border-[#dfd2c5] bg-[#fff7ef] px-2 py-1 text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#806957]">{answer?.mode === 'live-ai' ? 'Live AI' : 'Ready'}</span>
      </div>
      <p className="mt-2 text-xs leading-5 text-[#806957]">Ask in easy English, Hindi, or Hinglish. For example: “kaunsa route easy hai?” I will use the latest gate counts and crowd movement on this page.</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {quickQuestions.map((item) => <button key={item} type="button" onClick={() => setQuestion(item)} className="rounded-full border border-[#dfd2c5] bg-[#fffaf4] px-2.5 py-1.5 text-[10px] font-bold text-[#6f4b3b] hover:border-[#b97852]">{item}</button>)}
      </div>

      <form onSubmit={ask} className="mt-3 flex gap-2">
        <label className="sr-only" htmlFor="crowd-question">Ask about the crowd</label>
        <input id="crowd-question" value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={500} placeholder="Example: Kaunsa gate avoid karun?" className="min-w-0 flex-1 rounded-xl border border-[#d9c7b8] bg-[#fffaf4] px-3 py-2.5 text-xs text-[#4a2e22] outline-none placeholder:text-[#a58b7a] focus:border-[#a35d3f] focus:ring-2 focus:ring-[#e4b79b]" />
        <button type="submit" disabled={!question.trim() || asking} className="rounded-xl bg-[#a35d3f] px-3 py-2.5 text-xs font-extrabold text-white transition hover:bg-[#87472f] disabled:cursor-not-allowed disabled:opacity-50">{asking ? 'Thinking…' : 'Ask'}</button>
      </form>

      {error && <div className="mt-3 rounded-xl border border-[#e5b09a] bg-[#fff2ec] px-3 py-2 text-xs font-semibold leading-5 text-[#9b4a31]" role="alert">{error}</div>}
      {answer && <div className="mt-3 rounded-xl border border-[#d9c7b8] bg-[#4a2e22] px-3 py-3 text-xs leading-5 text-[#fff8ef]"><div className="mb-1 flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#efc49d]"><span>{answer.mode === 'live-ai' ? `Live answer${answer.provider ? ` · ${answer.provider}` : ''}` : 'Demo answer'}</span><span>{liveFeed?.isDemo ? 'Using sample feed' : 'Using live feed'}</span></div><p>{answer.text}</p></div>}
    </section>
  );
}
