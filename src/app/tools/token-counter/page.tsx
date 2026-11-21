'use client';

import React, { useState } from 'react';
import { SiteShell } from '../../../components/SiteShell';

export default function TokenCounterPage() {
  const [text, setText] = useState(
    'Paste any prompt or system instruction here to count characters, words, and estimated LLM tokens.'
  );

  const chars = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const estTokens = Math.max(1, Math.ceil(chars / 4));

  return (
    <SiteShell
      title="Token Counter — Estimate Prompt Tokens & Words"
      subtitle="promptbill.online/tools/token-counter · Text & Token Estimator"
    >
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
        <textarea
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3.5 font-mono text-xs sm:text-sm text-slate-900"
        />
        <div className="flex flex-wrap gap-6 font-mono text-sm">
          <span>Characters: <strong>{chars.toLocaleString()}</strong></span>
          <span>Words: <strong>{words.toLocaleString()}</strong></span>
          <span className="text-emerald-700">Est. Tokens: <strong>~{estTokens.toLocaleString()}</strong></span>
        </div>
      </section>
    </SiteShell>
  );
}
