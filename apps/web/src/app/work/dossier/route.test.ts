import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import { GET } from './route';

describe('work dossier download', () => {
  it('returns a directly downloadable UTF-8 Markdown file for the requested locale', async () => {
    const response = await GET(new NextRequest('http://localhost/work/dossier?locale=de'));
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('text/markdown; charset=utf-8');
    expect(response.headers.get('cache-control')).toBe('no-store');
    expect(response.headers.get('content-language')).toBe('de');
    expect(response.headers.get('content-disposition')).toContain('attachment;');
    expect(response.headers.get('content-disposition')).toContain('martin-trenker-project-dossier-de.md');
    expect(response.headers.get('x-content-type-options')).toBe('nosniff');
    expect(body).toContain('# Projektdossier: Martin Trenker');
    expect(body).toContain('München und remote im DACH-Raum');
  });

  it('falls back to the English dossier for an unsupported locale', async () => {
    const response = await GET(new NextRequest('http://localhost/work/dossier?locale=fr'));

    expect(response.headers.get('content-language')).toBe('en');
    expect(await response.text()).toContain('# Project dossier: Martin Trenker');
  });
});
