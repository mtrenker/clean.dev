import { Story, Meta } from '@storybook/react';
import { LayoutDecorator } from '../../../.storybook/decorators';

import { Invoice, InvoiceProps } from './Invoice';
export default {
  title: 'Invoice',
  component: Invoice,
  decorators: [LayoutDecorator],
} as Meta<InvoiceProps>;

const Template: Story<InvoiceProps> = (props) => <Invoice {...props} />;

export const Default = Template.bind({});
