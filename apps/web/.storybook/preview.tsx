import type { Preview } from '@storybook/nextjs-vite';

import '../src/app/globals.css';

const preview: Preview = {
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Global design-system theme',
      defaultValue: 'light',
      toolbar: {
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  parameters: {
    layout: 'fullscreen',
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    viewport: {
      options: {
        mobileSm: {
          name: 'Mobile S (360x640)',
          styles: {
            width: '360px',
            height: '640px',
          },
          type: 'mobile',
        },
        mobileLg: {
          name: 'Mobile L (428x926)',
          styles: {
            width: '428px',
            height: '926px',
          },
          type: 'mobile',
        },
        tablet: {
          name: 'Tablet (768x1024)',
          styles: {
            width: '768px',
            height: '1024px',
          },
          type: 'tablet',
        },
        desktop: {
          name: 'Desktop (1440x900)',
          styles: {
            width: '1440px',
            height: '900px',
          },
          type: 'desktop',
        },
      },
    },
    a11y: {
      // Surface accessibility violations as warnings in the Storybook UI.
      // Upgrade to 'error' once all components pass the a11y audit.
      test: 'warn',
    },
  },
  initialGlobals: {
    viewport: {
      value: 'desktop',
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme ?? 'light';

      return (
        <div className={theme === 'dark' ? 'dark min-h-screen bg-background p-8' : 'min-h-screen bg-background p-8'}>
          <Story />
        </div>
      );
    },
  ],
};

export default preview;
