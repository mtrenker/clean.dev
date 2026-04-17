import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Button } from './button';
import { EmptyState } from './empty-state';

const meta: Meta<typeof EmptyState> = {
  title: 'Internal/Primitives/EmptyState',
  component: EmptyState,
  parameters: {
    docs: {
      description: {
        component: 'Reusable fallback block for empty lists and first-run screens. Keep copy specific to context and include one clear action when available.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithAction: Story = {
  render: () => (
    <EmptyState
      action={<Button size="sm">Create first entry</Button>}
      description="Start by adding a tracked item so this list can populate."
      title="No entries yet"
    />
  ),
};

export const ReadOnly: Story = {
  render: () => <EmptyState title="No invoices found" description="Try widening the date range." />,
};
