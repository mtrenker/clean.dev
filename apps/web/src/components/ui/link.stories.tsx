import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Link } from './link';

const meta: Meta<typeof Link> = {
  title: 'Internal/Primitives/Link',
  component: Link,
  args: {
    href: '#',
    children: 'Learn more',
  },
  parameters: {
    docs: {
      description: {
        component: 'Centralized navigation/content link primitive for marketing and backoffice pages. Use `nav` in headers, `muted` in metadata/footer, and `inline` inside prose.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Variants: Story = {
  render: (args) => (
    <div className="space-y-3">
      <div><Link {...args} variant="default">Default Link</Link></div>
      <div><Link {...args} variant="nav">Nav Link</Link></div>
      <div><Link {...args} variant="muted">Muted Link</Link></div>
      <div><Link {...args} variant="inline">Inline Link</Link></div>
    </div>
  ),
};
