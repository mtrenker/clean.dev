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
      {data?.getProjects.edges.map((project) => (
        <Table>
          <Row>
            <Cell><Link to={`/projects/${project.id}/timesheet`}>{project.client}</Link></Cell>
            <Cell><Link to={`/projects/${project.id}`}>{project.client}</Link></Cell>
            <Cell>
              <button type="button" onClick={() => deleteProject({ variables: { input: { projectId: project.id } } })}>
                Delete Project
              </button>
            </Cell>
          </Row>
        </Table>
      ))}
    </div>
  );
};
