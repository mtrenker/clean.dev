import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { AppFooter } from './footer';
import { Link } from './link';
import { AppNavigation } from './navigation';

const meta: Meta = {
  title: 'Internal/Primitives/Navigation & Footer',
  parameters: {
    docs: {
      description: {
        component: 'Shared shell primitives for top-level app chrome. Use these components in both marketing and backoffice pages to avoid duplicated nav/footer markup.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const ShellExample: Story = {
  render: () => (
    <div className="-m-8 min-h-screen bg-background">
      <AppNavigation
        brand={<Link href="/" className="font-serif text-2xl font-bold">clean.dev</Link>}
        items={[
          { href: '/work', label: 'Portfolio' },
          { href: '/blog', label: 'Blog' },
        ]}
        rightSlot={<span className="text-label text-xs text-muted-foreground">EN</span>}
      />
      <main className="mx-auto max-w-7xl px-6 py-16 md:px-12 lg:px-24">
        <h1 className="heading-section">Page Content</h1>
      </main>
      <AppFooter
        actionSlot={<span className="text-label text-xs text-muted-foreground">Login</span>}
        copyright="© 2026 clean.dev"
        links={[
          { href: '/contact', label: 'Contact' },
          { href: '/imprint', label: 'Legal' },
          { href: '/privacy', label: 'Privacy Policy' },
        ]}
      />
    </div>
  ),
};

export const ShellWithSocialLinks: Story = {
  render: () => (
    <div className="-m-8 min-h-screen bg-background">
      <AppNavigation
        brand={<Link href="/" className="font-serif text-2xl font-bold">clean.dev</Link>}
        items={[
          { href: '/work', label: 'Portfolio' },
          { href: '/blog', label: 'Blog' },
          { href: '/contact', label: 'Contact' },
        ]}
        socialItems={[
          { key: 'linkedin', href: 'https://www.linkedin.com/in/martin-trenker', label: 'LinkedIn', ariaLabel: 'Visit LinkedIn profile' },
          { key: 'github', href: 'https://github.com/martin-trenker', label: 'GitHub', ariaLabel: 'Visit GitHub profile' },
        ]}
      />
      <main className="mx-auto max-w-7xl px-6 py-16 md:px-12 lg:px-24">
        <h1 className="heading-section">Public Navigation and Socials</h1>
      </main>
      <AppFooter
        copyright="© 2026 clean.dev"
        links={[
          { href: '/contact', label: 'Contact' },
          { href: '/imprint', label: 'Legal' },
          { href: '/privacy', label: 'Privacy Policy' },
        ]}
        socialLinks={[
          { key: 'xing', href: 'https://www.xing.com/search?type=users&keywords=Martin%20Trenker', label: 'XING', ariaLabel: 'Visit XING profile' },
          { key: 'linkedin', href: 'https://www.linkedin.com/in/martin-trenker', label: 'LinkedIn', ariaLabel: 'Visit LinkedIn profile' },
          { key: 'github', href: 'https://github.com/martin-trenker', label: 'GitHub', ariaLabel: 'Visit GitHub profile' },
        ]}
      />
    </div>
  ),
};
