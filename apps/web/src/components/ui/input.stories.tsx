import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Input } from './input';

const meta: Meta<typeof Input> = {
  title: 'Internal/Primitives/Input',
  component: Input,
  args: {
    placeholder: 'name@company.com',
  },
  parameters: {
    docs: {
      description: {
        component: 'Shared text-input primitive. Supports tokenized focus ring, disabled state, and explicit error state with `hasError`.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const States: Story = {
  render: (args) => (
    <div className="max-w-xl space-y-4">
      <Input {...args} />
      <Input {...args} className="border-accent ring-2 ring-accent/20" value="Focused visual capture" readOnly />
      <Input {...args} disabled value="Disabled" />
      <Input {...args} hasError value="Error visual capture" readOnly />
    </div>
  ),
};
