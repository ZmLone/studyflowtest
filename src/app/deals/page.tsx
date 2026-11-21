'use client';

import React from 'react';
import Link from 'next/link';
import dealsJson from '../../data/deals.json';
import { SiteShell } from '../../components/SiteShell';

interface DealItem {
  id: string;
  badge: string;
  title: string;
  provider: string;
  savings: string;
  description: string;
  ctaLabel: string;
  useEnvCheckout?: boolean;
  targetPath?: string;
}

const deals = dealsJson as DealItem[];

export default function DealsPage() {
  const checkoutUrl = process.env.NEXT_PUBLIC_DODO_CHECKOUT_URL || '';

  return (
    <SiteShell
      title="Deals & API Cost Reduction Offers"
      subtitle="promptbill.online/deals · Batch Discounts, Caching & Pro Pass"
    >
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {deals.map((deal) => (
          <div key={deal.id} className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="rounded bg-emerald-100 px-2 py-0.5 font-mono font-semibold text-emerald-900">
                  {deal.badge}
                </span>
                <span className="text-slate-500">{deal.provider}</span>
              </div>
              <h2 className="text-lg font-bold text-slate-900">{deal.title}</h2>
              <p className="text-xs text-slate-600 leading-relaxed">{deal.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-slate-800">{deal.savings}</span>
              {deal.useEnvCheckout && checkoutUrl ? (
                <a
                  href={checkoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  {deal.ctaLabel}
                </a>
              ) : (
                <Link
                  href={deal.targetPath || '/pricing'}
                  className="rounded-lg bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  {deal.ctaLabel}
                </Link>
              )}
            </div>
          </div>
        ))}
      </section>
    </SiteShell>
  );
}
