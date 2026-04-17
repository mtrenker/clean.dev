import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Card } from './card';

const meta: Meta<typeof Card> = {
  title: 'Internal/Primitives/Card',
  component: Card,
  parameters: {
    docs: {
      description: {
        component: 'Surface primitive for grouped content in both marketing and backoffice contexts. Compose with headings, badges, tables, and form controls.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => (
    <Card>
      <h3 className="font-serif text-2xl font-bold text-foreground">Card title</h3>
      <p className="mt-2 text-sm text-muted-foreground">Shared spacing and border treatment keeps panel surfaces consistent.</p>
    </Card>
  ),
};
