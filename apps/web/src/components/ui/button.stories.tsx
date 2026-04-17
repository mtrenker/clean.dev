import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'Internal/Primitives/Button',
  component: Button,
  parameters: {
    docs: {
      description: {
        component: 'Token-driven action primitive. Use `variant` for intent and `size` for density. States below include hover/focus visual capture, disabled, and destructive intent.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-3">
      <Button>Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div className="grid gap-3 md:grid-cols-2">
      <Button>Default</Button>
      <Button className="bg-accent">Hover (visual capture)</Button>
      <Button className="ring-2 ring-ring ring-offset-2 ring-offset-background">Focus (visual capture)</Button>
      <Button disabled>Disabled</Button>
    </div>
  ),
};
