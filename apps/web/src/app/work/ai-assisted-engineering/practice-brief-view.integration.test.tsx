import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { practiceBrief } from './practice-brief';
import { PracticeBriefView } from './practice-brief-view';

// The view takes no props and reads no intl catalog: the brief is English-only
// in this delivery and its content module is the single factual source.
const renderView = () => render(<PracticeBriefView />);

describe('practice brief screen composition', () => {
  it('leads with the title, subtitle, and every section heading', () => {
    renderView();

    expect(screen.getByRole('heading', { level: 1, name: practiceBrief.title })).toBeTruthy();
    expect(screen.getByText(practiceBrief.subtitle)).toBeTruthy();

    for (const heading of [
      practiceBrief.principle.heading,
      practiceBrief.workflow.heading,
      practiceBrief.client.heading,
      practiceBrief.practice.heading,
      practiceBrief.tools.heading,
      practiceBrief.lessons.heading,
      practiceBrief.limits.heading,
    ]) {
      expect(screen.getByRole('heading', { level: 2, name: heading })).toBeTruthy();
    }
  });

  it('declares English so a German visitor is not read the brief with German phonetics', () => {
    const { container } = renderView();

    expect(container.querySelector('main')?.getAttribute('lang')).toBe('en');
  });

  it('renders the workflow as ordered text, with the rework loop written out', () => {
    renderView();

    for (const stage of practiceBrief.workflow.stages) {
      expect(screen.getByRole('heading', { level: 3, name: stage.label })).toBeTruthy();
      expect(screen.getByText(stage.caption)).toBeTruthy();
    }
    expect(screen.getByText(practiceBrief.workflow.loopNote)).toBeTruthy();
  });

  it('shows every client claim with a visible maturity label and its full sentences', () => {
    renderView();

    for (const claim of practiceBrief.client.claims) {
      const entry = screen.getByRole('heading', { level: 3, name: claim.label }).closest('li');
      expect(entry).not.toBeNull();

      const maturity = practiceBrief.client.maturities.find((item) => item.id === claim.maturity);
      expect(within(entry as HTMLElement).getByText(maturity?.label as string)).toBeTruthy();
      for (const sentence of claim.sentences) {
        expect(within(entry as HTMLElement).getByText(sentence)).toBeTruthy();
      }
    }
  });

  it('names all six tools and links the public harness evidence', () => {
    renderView();

    for (const entry of practiceBrief.tools.entries) {
      expect(screen.getByText(entry.name)).toBeTruthy();
      expect(screen.getByText(entry.sentences.join(' '))).toBeTruthy();
    }

    const evidence = screen.getByRole('link', {
      name: `${practiceBrief.tools.evidenceLink.label} (opens in a new tab)`,
    });
    expect(evidence.getAttribute('href')).toBe(practiceBrief.tools.evidenceLink.href);
  });

  it('offers the print action and states the unlisted boundary honestly', () => {
    renderView();

    expect(screen.getByRole('button', { name: practiceBrief.print.action })).toBeTruthy();
    expect(screen.getByText(practiceBrief.colophon)).toBeTruthy();
  });

  it('keeps the print document out of the screen composition', () => {
    const { container } = renderView();

    expect(container.querySelector('[data-print-document]')).toBeNull();
  });
});
