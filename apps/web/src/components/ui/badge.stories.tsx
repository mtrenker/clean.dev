import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Badge } from './badge';

const meta: Meta<typeof Badge> = {
  title: 'Internal/Primitives/Badge',
  component: Badge,
  parameters: {
    docs: {
      description: {
        component: 'Compact status and metadata primitive. Keep labels short and map `variant` to semantic meaning from tokens.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Statuses: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="muted">Draft</Badge>
      <Badge variant="accent">Sent</Badge>
      <Badge variant="success">Active</Badge>
      <Badge variant="warning">Pending</Badge>
      <Badge variant="destructive">Error</Badge>
      <Badge variant="info">Info</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};
