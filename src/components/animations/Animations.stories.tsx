import { Meta } from '@storybook/react';
import { Process } from './Process';

export default {
  title: 'Animations',
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => <div style={{ height: '100vh' }}><Story /></div>,
  ],
} as Meta;

export const process = (args) => <Process />;
