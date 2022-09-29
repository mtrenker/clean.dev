---
to: features/<%=feature%>/components/<%=h.capitalize(name)%>.stories.tsx
---
import { Story, Meta } from '@storybook/react';
import { LayoutDecorator } from '../../../.storybook/decorators';

import { <%=h.capitalize(name)%>, <%=h.capitalize(name)%>Props } from './<%=h.capitalize(name)%>';
export default {
  title: '<%=h.capitalize(name)%>',
  component: <%=h.capitalize(name)%>,
  decorators: [LayoutDecorator],
} as Meta<<%=h.capitalize(name)%>Props>;

const Template: Story<<%=h.capitalize(name)%>Props> = (props) => <<%=h.capitalize(name)%> {...props} />;

export const Default = Template.bind({});
