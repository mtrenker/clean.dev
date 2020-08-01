import React, { FC } from 'react';
import { Link } from 'react-router-dom';

import { useGetProjectsQuery } from '../../graphql/hooks';

export const ProjectOverview: FC = () => {
  const { data, loading } = useGetProjectsQuery();
  if (loading) return <p>Loading</p>;
  return (
    <div>
      {data?.projects.items.map((project) => (
        <div>
          <Link to={`/projects/${project.id}/timesheet`}>{project.client}</Link>
        </div>
      ))}
    </div>
  );
};
