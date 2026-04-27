import type { Meta, StoryObj } from '@storybook/nextjs-vite';

const colorTokens = [
  'background',
  'foreground',
  'muted',
  'muted-foreground',
  'accent',
  'accent-foreground',
  'border',
  'card',
  'card-foreground',
  'success',
  'warning',
  'destructive',
  'info',
] as const;

const typeTokens = [
  'text-sm',
  'text-base',
  'text-lg',
  'text-2xl',
  'text-4xl',
  'text-6xl',
] as const;

const meta: Meta = {
  title: 'Internal/Primitives/Tokens',
  parameters: {
    docs: {
      description: {
        component: 'Visual token preview for color and typography primitives used by the shared UI components.',
      },
    },
  },
};

export default meta;

type Story = StoryObj<typeof meta>;

export const ColorPalette: Story = {
  render: () => (
    <div className="grid gap-4 md:grid-cols-3">
      {colorTokens.map((token) => (
        <div key={token} className="rounded-sm border border-border bg-card p-4 shadow-sm">
          <div className="mb-3 h-16 rounded-sm border border-border" style={{ backgroundColor: `hsl(var(--${token}))` }} />
          <p className="text-label text-xs">--{token}</p>
        </div>
      ))}
    </div>
  ),
};

export const TypographyScale: Story = {
  render: () => (
    <div className="space-y-5 rounded-sm border border-border bg-card p-6">
      {typeTokens.map((token) => (
        <div key={token}>
          <p className="text-label mb-2 text-xs">--{token}</p>
          <p style={{ fontSize: `var(--${token})` }}>The quick brown fox jumps over the lazy dog.</p>
        </div>
      ))}
    </div>
  ),
};
