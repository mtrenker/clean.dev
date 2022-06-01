import { Container } from '@mui/material';
import { format } from 'date-fns';
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { TimeTable } from './components/TimeTable';

export const Timesheet: React.FC = () => {
  const [date, setDate] = useState(format(new Date().setMonth(4), 'yyyy-MM'));
  const { projectId = '' } = useParams();
  return (
    <Container>
      <TimeTable date={date} projectId={projectId} />
    </Container>
  );
};
