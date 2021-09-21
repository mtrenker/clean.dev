import { Meta } from '@storybook/react';
import { Agile } from './Agile';
import { Process } from './Process';

export default {
  title: 'Animations',
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => <div style={{ height: '100vh' }}><Story /></div>,
  ],
} as Meta;

export const process = (args) => <Process />;
export const agile = (args) => <Agile />;
