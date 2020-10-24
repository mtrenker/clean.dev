import React, { FC } from 'react';
import { Link } from 'react-router-dom';

import { useDeleteProjectMutation, useGetProjectsQuery } from '../../graphql/hooks';
import { Table, Row, Cell } from '../layout/Table';

export const ProjectOverview: FC = () => {
  const { data, loading } = useGetProjectsQuery();
  const [deleteProject] = useDeleteProjectMutation();
  if (loading) return <p>Loading</p>;
  return (
    <div>
      <Link to="/projects/new">Create Project</Link>
      {data?.getProjects.items.map(({ id, client }) => (
        <Table>
          <Row>
            <Cell><Link to={`/projects/${id}`}>{client}</Link></Cell>
            <Cell><Link to={`/projects/${id}/tracking`}>Tracking</Link></Cell>
            <Cell><Link to={`/projects/${id}/timesheet`}>Timesheet</Link></Cell>
            <Cell>
              <button type="button" onClick={() => deleteProject({ variables: { id } })}>
                Delete Project
              </button>
            </Cell>
          </Row>
        </Table>
      ))}
    </div>
  );
};
