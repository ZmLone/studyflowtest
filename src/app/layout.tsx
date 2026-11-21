import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' });

export const metadata: Metadata = {
  metadataBase: new URL('https://promptbill.online'),
  title: 'PromptBill — LLM Leaderboard, AI API Pricing & Cost Calculator',
  description:
    'Compare LLM rankings, API token pricing, 30-day cost estimates, prompt caching and batch savings, token counts, and API deals on promptbill.online.',
  alternates: {
    canonical: 'https://promptbill.online/',
  },
  verification: {
    google: 'i9trpcokzTtM4Y2evn9hZYidXlKhAEyrPraQWuj3FA8',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-[#f8fafc] text-slate-900 font-sans antialiased">{children}</body>
    </html>
  );
}
