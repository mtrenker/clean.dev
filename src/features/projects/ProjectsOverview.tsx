import React, { VFC } from 'react';
import {
  Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { Link } from '../../common/components/Link';
import { useGetProjectsQuery } from '../../graphql/hooks';

export const ProjectsOverview: VFC = () => {
  const { data: projectsData } = useGetProjectsQuery({});

  return (
    <Container>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Project Name</TableCell>
              <TableCell>Track</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projectsData?.getProjects.items.map((project) => (
              <TableRow>
                <TableCell>{project.client}</TableCell>
                <TableCell>
                  <Link to={`${project.id}/track`}>Tracking</Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};
