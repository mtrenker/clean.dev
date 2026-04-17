import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Heading } from './heading';

const meta: Meta = {
  title: 'Internal/Primitives/Typography',
  parameters: {
    docs: {
      description: {
        component:
          'Core typography primitives and semantic text styles backed by global design tokens.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const HeadingScale: Story = {
  render: () => (
    <article className="space-y-8">
      <div>
        <p className="text-label mb-3 text-accent">Display</p>
        <Heading as="h1" variant="display" className="text-5xl md:text-7xl">
          Build Deliberately
        </Heading>
      </div>
      <div>
        <p className="text-label mb-3 text-accent">Section</p>
        <Heading as="h2" variant="section">
          Typography Primitives
        </Heading>
      </div>
      <div>
        <p className="text-label mb-3 text-accent">Label</p>
        <Heading as="h3" variant="label">
          Monospace Utility Label
        </Heading>
      </div>
    </article>
  ),
};

export const BodyAndProse: Story = {
  render: () => (
    <article className="prose max-w-3xl">
      <h2>Readable body text</h2>
      <p>
        Body and prose styles inherit semantic tokens, so contrast and rhythm remain stable across both public and
        internal interfaces.
      </p>
      <p>
        <strong>Strong text</strong> and <a href="#">links</a> also flow through the shared token mapping.
      </p>
      <blockquote>Design tokens give us consistency without freezing iteration speed.</blockquote>
    </article>
  ),
};
