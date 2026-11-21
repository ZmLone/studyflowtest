'use client';

import React, { useState, useMemo } from 'react';
import leaderboardJson from '../../../data/leaderboard.json';
import { SiteShell } from '../../../components/SiteShell';

interface BenchModel {
  id: string;
  name: string;
  provider: string;
  score: number;
  co: number;
  re: number;
  inputPer1M: number;
  outputPer1M: number;
  bestFor: string;
}

const models = leaderboardJson as BenchModel[];

export default function LlmSelectorPage() {
  const [goal, setGoal] = useState<'balanced' | 'cheapest' | 'coding' | 'reasoning'>('balanced');

  const picks = useMemo(() => {
    return [...models]
      .map((m) => {
        const avgRate = (m.inputPer1M + m.outputPer1M) / 2;
        let metric = m.score;
        if (goal === 'cheapest') metric = m.score / Math.max(avgRate, 0.2);
        else if (goal === 'coding') metric = m.co * 1.5;
        else if (goal === 'reasoning') metric = m.re * 1.5 + m.score * 0.5;
        else metric = m.score * 0.65 + (25 / Math.max(avgRate, 0.5)) * 35;
        return { model: m, avgRate, metric };
      })
      .sort((a, b) => b.metric - a.metric)
      .slice(0, 6);
  }, [goal]);

  return (
    <SiteShell
      title="LLM Selector — Find the Right Model for Your Task"
      subtitle="promptbill.online/tools/llm-selector · Workload Model Finder"
    >
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-6">
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['balanced', 'Balanced Score & Price'],
              ['cheapest', 'Lowest Token Rate'],
              ['coding', 'Coding Strength'],
              ['reasoning', 'Reasoning & Score'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setGoal(key)}
              className={`rounded-lg px-3.5 py-2 text-xs font-semibold border ${
                goal === key
                  ? 'border-slate-900 bg-slate-900 text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {picks.map(({ model, avgRate }, idx) => (
            <div key={model.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-emerald-700">PICK #{idx + 1}</span>
                <span className="font-mono text-slate-600">Score {model.score.toFixed(1)}</span>
              </div>
              <div className="text-base font-bold text-slate-900">{model.name}</div>
              <div className="text-xs text-slate-600">{model.bestFor}</div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between font-mono text-xs">
                <span className="text-slate-600">Avg Rate / 1M</span>
                <span className="font-bold text-slate-900">${avgRate.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </SiteShell>
  );
}
