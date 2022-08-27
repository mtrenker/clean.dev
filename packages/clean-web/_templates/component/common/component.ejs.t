---
to: common/components/<%=h.capitalize(name)%>.tsx
---
export interface <%=h.capitalize(name)%>Props {
  className?: string;
}

export const <%=h.capitalize(name)%>: React.FC<<%=h.capitalize(name)%>Props> = () => (
  <div><%=h.capitalize(name)%> component</div>
);
