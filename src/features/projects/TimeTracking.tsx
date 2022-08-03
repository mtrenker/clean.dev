import { Container } from '@mui/material';
import { useParams } from 'react-router-dom';
import React, { useState } from 'react';
import { TimeTracker } from './components/TimeTracker';
import { TimeTable } from './components/TimeTable';

export const TimeTracking: React.FC = () => {
  const { projectId = '' } = useParams();
  const [date, setDate] = useState('2022-07');

  return (
    <Container>
      <TimeTracker projectId={projectId} date={date} />
      <TimeTable projectId={projectId} date={date} />
    </Container>
  );
};
