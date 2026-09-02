'use client';

import React from 'react';

/**
 * Progressive enhancement only. Without JavaScript the browser's own print
 * command still produces the correct one-page output, because the print
 * composition is server-rendered HTML and CSS.
 */
export const PrintAction = ({ label, hint }: { label: string; hint: string }) => (
  <div className="flex flex-wrap items-center gap-3 print:hidden">
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center justify-center rounded-[3px] border border-[var(--site-rule)] px-5 py-3 font-mono text-sm font-bold uppercase tracking-[0.12em] text-[var(--site-ink)] transition hover:border-[var(--site-rust)] hover:text-[var(--site-rust)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--site-rust)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--site-bg)]"
    >
      {label}
    </button>
    <span className="font-mono text-xs uppercase tracking-[0.16em] text-[var(--site-ink-sec)]">{hint}</span>
  </div>
);
