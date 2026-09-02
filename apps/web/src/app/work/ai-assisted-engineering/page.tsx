import React from 'react';
import type { Metadata } from 'next';
import { headers, cookies } from 'next/headers';
import { getLocale } from '@/lib/locale';
import { buildRouteMetadata } from '@/lib/site-metadata';
import { PracticeBriefView } from './practice-brief-view';
import { PracticeBriefPrint } from './practice-brief-print';

export const generateMetadata = async (): Promise<Metadata> => {
  const locale = getLocale(await headers(), await cookies());
  return buildRouteMetadata('aiPractice', locale);
};

/**
 * Both compositions must stay direct children of `<body>`: the `@media print`
 * rule in `globals.css` hides every body-level region that is neither the print
 * document nor its ancestor. `IntlProviderWrapper` renders no element, so a
 * fragment here keeps that contract. Wrapping these in a `<div>` breaks
 * printing for this route.
 */
const AiAssistedEngineeringPage: React.FC = () => (
  <>
    <PracticeBriefView />
    <PracticeBriefPrint />
  </>
);

export default AiAssistedEngineeringPage;
