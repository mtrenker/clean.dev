import type { Metadata } from 'next';
import { DocumentPlayground } from '@/components/docs-demo/document-playground';

export const metadata: Metadata = {
  title: 'Document Editor | clean.dev',
  description:
    'Demo of the reusable @cleandev/docs Plate.js document editor with page mode — reports, proposals, profiles, and blog posts.',
};

export default function DocsEditorPage() {
  return (
    <main id="main-content" className="min-h-screen px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.3em] text-accent">clean.dev lab</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
            Document editor
          </h1>
          <p className="mt-4 max-w-3xl text-muted-foreground">
            A demo of the reusable{' '}
            <code className="rounded bg-muted px-1.5 py-0.5">@cleandev/docs</code>{' '}
            package: a Plate.js writing editor with a paginated page mode and
            generic, PDF-oriented layout elements. The same building blocks
            compose client reports, proposals, CVs/project profiles, and blog
            posts — switch samples below.
          </p>
        </div>
        <DocumentPlayground />
      </div>
    </main>
  );
}
