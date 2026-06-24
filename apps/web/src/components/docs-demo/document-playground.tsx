'use client';

/**
 * Demo integration for the reusable @cleandev/docs package.
 *
 * This file is intentionally thin — it only wires the package's public API to
 * some UI controls and the package's sample content. No document logic lives
 * here; it all comes from @cleandev/docs.
 */
import { useMemo, useState } from 'react';
import {
  DocumentEditor,
  samples,
  type DocumentMode,
  type DocumentValue,
  type PageSizeName,
} from '@cleandev/docs';
import '@cleandev/docs/styles.css';

const SAMPLE_OPTIONS: { key: keyof typeof samples; label: string }[] = [
  { key: 'report', label: 'Client report' },
  { key: 'proposal', label: 'Proposal / offer' },
  { key: 'profile', label: 'CV / project profile' },
  { key: 'blogPost', label: 'Blog post' },
];

const PAGE_SIZES: PageSizeName[] = ['A4', 'Letter', 'A5', 'Legal'];

export function DocumentPlayground() {
  const [sampleKey, setSampleKey] = useState<keyof typeof samples>('report');
  const [mode, setMode] = useState<DocumentMode>('page');
  const [size, setSize] = useState<PageSizeName>('A4');
  const [readOnly, setReadOnly] = useState(false);
  const [floatingToolbar, setFloatingToolbar] = useState(true);
  const [, setValue] = useState<DocumentValue | null>(null);

  // Re-mount the editor when the sample changes so the initial value resets.
  const editorKey = useMemo(() => `${sampleKey}`, [sampleKey]);

  return (
    <div className="flex flex-col gap-4">
      {/* The package's default theme uses these webfonts; React 19 hoists the
          link into <head>. They are optional — the editor degrades gracefully. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap"
        rel="stylesheet"
      />

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card/60 p-3 text-sm">
        <label className="flex items-center gap-2">
          <span className="text-muted-foreground">Sample</span>
          <select
            className="rounded-md border border-input bg-background px-2 py-1"
            value={sampleKey}
            onChange={(event) => {
              setSampleKey(event.target.value as keyof typeof samples);
            }}
          >
            {SAMPLE_OPTIONS.map((option) => (
              <option key={option.key} value={option.key}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2">
          <span className="text-muted-foreground">Mode</span>
          <select
            className="rounded-md border border-input bg-background px-2 py-1"
            value={mode}
            onChange={(event) => {
              setMode(event.target.value as DocumentMode);
            }}
          >
            <option value="page">Page</option>
            <option value="flow">Flow</option>
          </select>
        </label>

        <label className="flex items-center gap-2">
          <span className="text-muted-foreground">Size</span>
          <select
            className="rounded-md border border-input bg-background px-2 py-1"
            value={size}
            onChange={(event) => {
              setSize(event.target.value as PageSizeName);
            }}
          >
            {PAGE_SIZES.map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={readOnly}
            onChange={(event) => {
              setReadOnly(event.target.checked);
            }}
          />
          <span className="text-muted-foreground">Preview (read-only)</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={floatingToolbar}
            onChange={(event) => {
              setFloatingToolbar(event.target.checked);
            }}
          />
          <span className="text-muted-foreground">Floating toolbar</span>
        </label>

        <button
          type="button"
          className="ml-auto rounded-md border border-input bg-background px-3 py-1 hover:border-accent"
          onClick={() => {
            window.print();
          }}
        >
          Print / Save as PDF
        </button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <DocumentEditor
          key={editorKey}
          value={samples[sampleKey]}
          mode={mode}
          page={{ size }}
          readOnly={readOnly}
          floatingToolbar={floatingToolbar}
          onChange={setValue}
        />
      </div>
    </div>
  );
}
