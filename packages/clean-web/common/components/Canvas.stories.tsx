import { Story, Meta } from '@storybook/react';

import { Canvas, CanvasProps } from './Canvas';
export default {
  title: 'Canvas',
  component: Canvas,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta<CanvasProps>;

const Template: Story<CanvasProps> = (props) => <div className="h-96"><Canvas {...props} /></div>;

export const Default = Template.bind({});
