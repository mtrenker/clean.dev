import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Card } from './card';
import { Container } from './container';
import { Section } from './section';

const meta: Meta = {
  title: 'Internal/Primitives/Layout',
  parameters: {
    docs: {
      description: {
        component:
          'Baseline layout primitives used across public and internal surfaces. This remains internal-only while the component system stabilizes.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const SectionAndContainer: Story = {
  render: () => (
    <main className="-m-8">
      <Section noBorder>
        <Container>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <h3 className="mb-2 font-serif text-xl font-bold">Default Section</h3>
              <p className="text-muted-foreground">Standard background and foreground token pairing.</p>
            </Card>
            <Card>
              <h3 className="mb-2 font-serif text-xl font-bold">Shared Spacing</h3>
              <p className="text-muted-foreground">Section padding and container width stay consistent everywhere.</p>
            </Card>
            <Card>
              <h3 className="mb-2 font-serif text-xl font-bold">Composable</h3>
              <p className="text-muted-foreground">Components can be mixed in dashboards and marketing pages.</p>
            </Card>
          </div>
        </Container>
      </Section>
      <Section variant="inverted" noBorder>
        <Container>
          <p className="text-label mb-3">Inverted Variant</p>
          <p className="max-w-2xl text-lg">
            Inverted sections keep semantic colors while maintaining readable typography and spacing rhythm.
          </p>
        </Container>
      </Section>
      <Section variant="accent" noBorder>
        <Container size="narrow">
          <p className="text-label mb-3">Accent Variant</p>
          <p className="text-lg">
            Accent sections support high-emphasis callouts without redefining layout primitives.
          </p>
        </Container>
      </Section>
    </main>
  ),
};

export const ContainerSizes: Story = {
  render: () => (
    <div className="space-y-6">
      <Container size="narrow" className="rounded border border-border p-4">
        <p className="text-label">Narrow (forms/articles)</p>
      </Container>
      <Container className="rounded border border-border p-4">
        <p className="text-label">Default (content sections)</p>
      </Container>
      <Container size="wide" className="rounded border border-border p-4">
        <p className="text-label">Wide (dashboards/data-dense pages)</p>
      </Container>
    </div>
  ),
};
