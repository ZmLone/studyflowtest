'use client';

import React, { useState } from 'react';
import { SiteShell } from '../../components/SiteShell';

export default function AdvertisePage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <SiteShell
      title="Advertise & Sponsorships"
      subtitle="promptbill.online/advertise · Reach AI Builders"
    >
      <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
        <p className="text-sm text-slate-600">
          Sponsor placements on PromptBill reach developers comparing LLM API token prices, latency, and models.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (email.trim()) setSent(true);
          }}
          className="flex flex-col sm:flex-row gap-3 max-w-xl"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Work email..."
            className="flex-1 rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900"
          />
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            {sent ? 'Request Sent' : 'Request Media Kit'}
          </button>
        </form>
      </section>
    </SiteShell>
  );
}
