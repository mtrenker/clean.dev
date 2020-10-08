import React, { FC } from 'react';
import { Link } from 'react-router-dom';

import { useGetProjectsQuery } from '../../graphql/hooks';
import { Table, Row, Cell } from '../layout/Table';

export const ProjectOverview: FC = () => {
  const { data, loading } = useGetProjectsQuery();
  if (loading) return <p>Loading</p>;
  return (
    <div>
      {data?.getProjects.items.map((project) => (
        <Table>
          <Row>
            <Cell><Link to={`/projects/${project.id}/timesheet`}>{project.name}</Link></Cell>
            <Cell><Link to={`/projects/${project.id}`}>{project.name}</Link></Cell>
          </Row>
        </Table>
      ))}
    </div>
  );
};
