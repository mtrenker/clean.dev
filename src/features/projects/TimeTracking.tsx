import React, { VFC } from 'react';
import { Container } from '@mui/material';
import { useParams } from 'react-router-dom';
import { TimeTracker } from './components/TimeTracker';
import { TimeTable } from './components/TimeTable';

export const TimeTracking: VFC = () => {
  const { projectId = '' } = useParams();

  return (
    <Container>
      <TimeTracker projectId={projectId} />
      <TimeTable projectId={projectId} date="2022-04" />
    </Container>
  );
};
