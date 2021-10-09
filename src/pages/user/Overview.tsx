import { VFC } from 'react';
import { useMeQuery } from '../../graphql/hooks';

export const UserOverview: VFC = () => {
  const { data, loading } = useMeQuery();
  if (!data || loading) return <p>Loading</p>;
  const { contact } = data.me;
  return (
    <div>
      {`Hi, ${contact?.firstName}`}

      <h2>Projects</h2>
    </div>
  );
};
