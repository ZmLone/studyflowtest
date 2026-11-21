'use client';

import React, { useState, useMemo } from 'react';
import leaderboardJson from '../data/leaderboard.json';
import { SiteShell } from '../components/SiteShell';
import { Search, ArrowUpDown } from 'lucide-react';

interface BenchModel {
  rank: number;
  id: string;
  name: string;
  provider: string;
  evidence: 'Supported' | 'Estimated';
  score: number;
  interval: string;
  contextWindow: string;
  inputPer1M: number;
  outputPer1M: number;
  cachedInputPer1M: number;
  elo: number;
  license: 'Closed' | 'Open' | 'Pending';
  ag: number;
  co: number;
  re: number;
  mm: number;
  kn: number;
  ml: number;
  if: number;
  ma: number;
  tokPerSec: number;
  reasoning: boolean;
  bestFor: string;
}

const models = leaderboardJson as BenchModel[];

export default function LeaderboardPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [licenseFilter, setLicenseFilter] = useState('All');
  const [evidenceFilter, setEvidenceFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'score' | 'price' | 'elo' | 'tokPerSec'>('score');
  const [sortAsc, setSortAsc] = useState(false);

  const filteredModels = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return models
      .filter((m) => {
        if (q && !m.name.toLowerCase().includes(q) && !m.provider.toLowerCase().includes(q) && !m.bestFor.toLowerCase().includes(q)) {
          return false;
        }
        if (licenseFilter !== 'All' && m.license !== licenseFilter) return false;
        if (evidenceFilter !== 'All' && m.evidence !== evidenceFilter) return false;
        return true;
      })
      .sort((a, b) => {
        let va = 0;
        let vb = 0;
        if (sortBy === 'score') { va = a.score; vb = b.score; }
        else if (sortBy === 'price') { va = (a.inputPer1M + a.outputPer1M) / 2; vb = (b.inputPer1M + b.outputPer1M) / 2; }
        else if (sortBy === 'elo') { va = a.elo; vb = b.elo; }
        else if (sortBy === 'tokPerSec') { va = a.tokPerSec; vb = b.tokPerSec; }
        return sortAsc ? va - vb : vb - va;
      });
  }, [searchQuery, licenseFilter, evidenceFilter, sortBy, sortAsc]);

  const toggleSort = (col: 'score' | 'price' | 'elo' | 'tokPerSec') => {
    if (sortBy === col) setSortAsc(!sortAsc);
    else { setSortBy(col); setSortAsc(col === 'price'); }
  };

  return (
    <SiteShell
      title="LLM Leaderboard Rankings — November 2026"
      subtitle="promptbill.online / · Model Scores, API Pricing & Speed"
    >
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search model or provider..."
              className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-1.5 text-sm text-slate-900"
            />
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <select
              value={evidenceFilter}
              onChange={(e) => setEvidenceFilter(e.target.value)}
              aria-label="Filter by evidence"
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-slate-800"
            >
              <option value="All">All Evidence</option>
              <option value="Supported">Supported</option>
              <option value="Estimated">Estimated</option>
            </select>
            <select
              value={licenseFilter}
              onChange={(e) => setLicenseFilter(e.target.value)}
              aria-label="Filter by license"
              className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-slate-800"
            >
              <option value="All">All Licenses</option>
              <option value="Closed">Closed</option>
              <option value="Open">Open</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[920px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                <th className="py-2.5 px-3">Model</th>
                <th className="py-2.5 px-3">
                  <button type="button" onClick={() => toggleSort('score')} className="inline-flex items-center gap-1 hover:text-slate-900">
                    Score <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3">Context</th>
                <th className="py-2.5 px-3">
                  <button type="button" onClick={() => toggleSort('price')} className="inline-flex items-center gap-1 hover:text-slate-900">
                    Price (In / Out) <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3">
                  <button type="button" onClick={() => toggleSort('elo')} className="inline-flex items-center gap-1 hover:text-slate-900">
                    Elo <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-3 font-mono">AG</th>
                <th className="py-2.5 px-3 font-mono">CO</th>
                <th className="py-2.5 px-3 font-mono">RE</th>
                <th className="py-2.5 px-3 font-mono">MM</th>
                <th className="py-2.5 px-3 font-mono">KN</th>
                <th className="py-2.5 px-3 font-mono">ML</th>
                <th className="py-2.5 px-3 font-mono">IF</th>
                <th className="py-2.5 px-3 font-mono">MA</th>
                <th className="py-2.5 px-3 text-right">
                  <button type="button" onClick={() => toggleSort('tokPerSec')} className="inline-flex items-center gap-1 ml-auto hover:text-slate-900">
                    Tok/s <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredModels.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-400">#{m.rank}</span>
                      <span className="font-semibold text-slate-900">{m.name}</span>
                      <span className="rounded bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800">
                        {m.evidence}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {m.provider} · {m.bestFor}
                    </div>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">{m.score.toFixed(1)}</td>
                  <td className="py-3 px-3 font-mono text-slate-600">{m.contextWindow}</td>
                  <td className="py-3 px-3 font-mono text-slate-800">
                    ${m.inputPer1M.toFixed(2)} / ${m.outputPer1M.toFixed(2)}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-700">{m.elo.toFixed(1)}</td>
                  <td className="py-3 px-3 font-mono text-slate-700">{m.ag}</td>
                  <td className="py-3 px-3 font-mono text-slate-700">{m.co}</td>
                  <td className="py-3 px-3 font-mono text-slate-700">{m.re}</td>
                  <td className="py-3 px-3 font-mono text-slate-700">{m.mm}</td>
                  <td className="py-3 px-3 font-mono text-slate-700">{m.kn}</td>
                  <td className="py-3 px-3 font-mono text-slate-700">{m.ml}</td>
                  <td className="py-3 px-3 font-mono text-slate-700">{m.if}</td>
                  <td className="py-3 px-3 font-mono text-slate-700">{m.ma}</td>
                  <td className="py-3 px-3 text-right font-mono font-semibold text-emerald-700">
                    {m.tokPerSec}
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
