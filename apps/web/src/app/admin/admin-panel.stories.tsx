import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect, userEvent, within } from 'storybook/test';
import { IntlProvider } from 'react-intl';
import enMessages from '@/messages/en.json';
import { AdminPanel } from './admin-panel';

const meta: Meta<typeof AdminPanel> = {
  title: 'Backoffice/Admin Panel',
  component: AdminPanel,
  decorators: [
    (Story) => (
      <IntlProvider locale="en" messages={enMessages}>
        <div className="max-w-5xl p-8">
          <Story />
        </div>
      </IntlProvider>
    ),
  ],
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const MigrationSuccess: Story = {
  play: async ({ canvasElement }) => {
    const originalConfirm = window.confirm;
    const originalFetch = window.fetch;

    try {
      window.confirm = () => true;
      window.fetch = async () =>
        new Response(JSON.stringify({ message: 'Migration completed' }), {
          status: 200,
          headers: {
            'content-type': 'application/json',
          },
        });

      const canvas = within(canvasElement);
      await userEvent.click(canvas.getByRole('button', { name: 'Run Setup' }));
      await expect(canvas.findByText('Migration completed')).resolves.toBeInTheDocument();
    } finally {
      window.confirm = originalConfirm;
      window.fetch = originalFetch;
    }
  },
};

export const MigrationError: Story = {
  play: async ({ canvasElement }) => {
    const originalConfirm = window.confirm;
    const originalFetch = window.fetch;

    try {
      window.confirm = () => true;
      window.fetch = async () =>
        new Response(JSON.stringify({ error: 'Migration table lock timeout' }), {
          status: 500,
          headers: {
            'content-type': 'application/json',
          },
        });

      const canvas = within(canvasElement);
      await userEvent.click(canvas.getByRole('button', { name: 'Run Setup' }));
      await expect(canvas.findByText('Setup failed')).resolves.toBeInTheDocument();
      await expect(canvas.findByText('Migration table lock timeout')).resolves.toBeInTheDocument();
    } finally {
      window.confirm = originalConfirm;
      window.fetch = originalFetch;
    }
  },
};
