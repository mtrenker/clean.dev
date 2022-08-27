---
to: features/<%=feature%>/components/<%=h.capitalize(name)%>.stories.tsx
---
import { Story, Meta } from '@storybook/react';

import { <%=h.capitalize(name)%>, <%=h.capitalize(name)%>Props } from './<%=h.capitalize(name)%>';
export default {
  title: '<%=h.capitalize(name)%>',
  component: <%=h.capitalize(name)%>,
} as Meta<<%=h.capitalize(name)%>Props>;

const Template: Story<<%=h.capitalize(name)%>Props> = (props) => <<%=h.capitalize(name)%> />;

export const Default = Template.bind({});
