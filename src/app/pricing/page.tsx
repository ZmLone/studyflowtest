'use client';

import React, { useState, useMemo } from 'react';
import leaderboardJson from '../../data/leaderboard.json';
import { SiteShell } from '../../components/SiteShell';

interface BenchModel {
  id: string;
  name: string;
  provider: string;
  score: number;
  inputPer1M: number;
  outputPer1M: number;
  cachedInputPer1M: number;
}

const models = leaderboardJson as BenchModel[];

export default function PricingPage() {
  const [inputTokensPerCall, setInputTokensPerCall] = useState(6500);
  const [outputTokensPerCall, setOutputTokensPerCall] = useState(650);
  const [callsPerDay, setCallsPerDay] = useState(2500);
  const [cacheHitPct, setCacheHitPct] = useState(50);
  const [batchSharePct, setBatchSharePct] = useState(0);

  const rows = useMemo(() => {
    const monthlyCalls = Math.max(0, callsPerDay) * 30;
    const cacheFrac = Math.min(0.95, Math.max(0, cacheHitPct / 100));
    const batchMult = 1 - Math.min(1, Math.max(0, batchSharePct / 100)) * 0.5;

    return [...models]
      .map((m) => {
        const blendedIn = ((1 - cacheFrac) * m.inputPer1M + cacheFrac * m.cachedInputPer1M) * batchMult;
        const blendedOut = m.outputPer1M * batchMult;
        const monthlyCost =
          (monthlyCalls * inputTokensPerCall * blendedIn) / 1_000_000 +
          (monthlyCalls * outputTokensPerCall * blendedOut) / 1_000_000;
        const costPer1k = monthlyCalls > 0 ? (monthlyCost / monthlyCalls) * 1000 : 0;
        return { model: m, monthlyCost, costPer1k };
      })
      .sort((a, b) => a.monthlyCost - b.monthlyCost);
  }, [inputTokensPerCall, outputTokensPerCall, callsPerDay, cacheHitPct, batchSharePct]);

  return (
    <SiteShell
      title="AI API Token Pricing & 30-Day Cost Calculator"
      subtitle="promptbill.online/pricing · Token Rates & Spend Estimator"
    >
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs border-b border-slate-100 pb-5">
          <label className="space-y-1">
            <span className="text-slate-600 font-medium">Input tokens / call</span>
            <input
              type="number"
              min={0}
              value={inputTokensPerCall}
              onChange={(e) => setInputTokensPerCall(Math.max(0, Number(e.target.value)))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-slate-900"
            />
          </label>
          <label className="space-y-1">
            <span className="text-slate-600 font-medium">Output tokens / call</span>
            <input
              type="number"
              min={0}
              value={outputTokensPerCall}
              onChange={(e) => setOutputTokensPerCall(Math.max(0, Number(e.target.value)))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-slate-900"
            />
          </label>
          <label className="space-y-1">
            <span className="text-slate-600 font-medium">Calls / day</span>
            <input
              type="number"
              min={0}
              value={callsPerDay}
              onChange={(e) => setCallsPerDay(Math.max(0, Number(e.target.value)))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-slate-900"
            />
          </label>
          <label className="space-y-1">
            <span className="text-slate-600 font-medium">Prompt cache hit %</span>
            <input
              type="number"
              min={0}
              max={95}
              value={cacheHitPct}
              onChange={(e) => setCacheHitPct(Math.min(95, Math.max(0, Number(e.target.value))))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-slate-900"
            />
          </label>
          <label className="space-y-1">
            <span className="text-slate-600 font-medium">Batch API % (50% off)</span>
            <input
              type="number"
              min={0}
              max={100}
              value={batchSharePct}
              onChange={(e) => setBatchSharePct(Math.min(100, Math.max(0, Number(e.target.value))))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-slate-900"
            />
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-600">
                <th className="py-2.5 px-3">Model</th>
                <th className="py-2.5 px-3">Input / Cached / Output ($/1M)</th>
                <th className="py-2.5 px-3">Score</th>
                <th className="py-2.5 px-3">Cost / 1K Calls</th>
                <th className="py-2.5 px-3 text-right">Est. 30-Day Spend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {rows.map(({ model, monthlyCost, costPer1k }) => (
                <tr key={model.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-900">{model.name}</div>
                    <div className="text-xs text-slate-500">{model.provider}</div>
                  </td>
                  <td className="py-3 px-3 font-mono text-xs text-slate-700">
                    ${model.inputPer1M.toFixed(2)} / ${model.cachedInputPer1M.toFixed(2)} / ${model.outputPer1M.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 font-mono text-xs text-slate-700">{model.score.toFixed(1)}</td>
                  <td className="py-3 px-3 font-mono text-xs text-slate-700">${costPer1k.toFixed(2)}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">
                    ${monthlyCost.toFixed(2)}/mo
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </SiteShell>
  );
}
