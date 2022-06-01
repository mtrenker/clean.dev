import { FC } from 'react';
import {
  Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { Link } from '../../common/components/Link';
import { useGetProjectsQuery } from '../../app/api/generated';

export const ProjectsOverview: FC = () => {
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
              <TableRow key={project.id}>
                <TableCell>{project.client}</TableCell>
                <TableCell>
                  <Link to={`${project.id}/track`}>Tracking</Link>
                  -
                  <Link to={`${project.id}/timesheet`}>Timesheet</Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};
