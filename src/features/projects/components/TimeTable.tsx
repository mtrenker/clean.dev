import {
  Box,
  IconButton,
  Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TableRow, Typography,
} from '@mui/material';
import { DeleteForever as DeleteIcon } from '@mui/icons-material';
import React from 'react';
import { format, differenceInMinutes } from 'date-fns';
import { de } from 'date-fns/locale';
import { useDeleteTrackingMutation, useGetProjectQuery, useMeQuery } from '../../../app/api/generated';
import { useGetTrackingsQuery } from '../api';

interface TimeTableProps {
  projectId: string;
  date: string;
}

export const TimeTable: React.VFC<TimeTableProps> = ({ date, projectId }) => {
  const { data: trackingData } = useGetTrackingsQuery({
    projectId,
    date,
  });
  const billableTime = trackingData?.getTrackings.items.reduce((acc, tracking) => {
    const hours = differenceInMinutes(
      new Date(tracking.endTime),
      new Date(tracking.startTime),
    ) / 60;
    return acc + hours;
  }, 0);
  const [deleteTracking] = useDeleteTrackingMutation();
  const { data: meData } = useMeQuery();
  const {
    firstName, lastName, city, street, zip,
  } = meData?.me.contact ?? {};
  const monthOfService = format(new Date(`${date}`), 'MMMM yyyy', { locale: de });
  const { data: projectData } = useGetProjectQuery({ projectId });
  const { contact, client } = projectData?.getProject ?? {};
  return (
    <Box>
      <Box
        display="flex"
        flexWrap="wrap"
        gap={2}
        justifyContent="space-between"
        p={2}
      >
        <Box>
          <Typography variant="h4" flex="0 0 100%">
            Zeiterfassung
          </Typography>
          <Typography variant="h5" flex="0 0 100%">
            {monthOfService}
          </Typography>
        </Box>
        <Box>
          <Box
            component="address"
            sx={{
              fontStyle: 'normal',
            }}
          >
            {`${firstName} ${lastName}`}
            <br />
            {street}
            <br />
            {`${zip} ${city}`}
          </Box>
        </Box>
      </Box>
      <Box display="flex" flexWrap="wrap" marginY={2} p={2}>
        <Typography flex="0 0 20%">Kunde</Typography>
        <Typography flex="0 0 70%">
          {`${client}, ${contact?.street}, ${contact?.city}`}
        </Typography>
        <Typography flex="0 0 20%">Zeitraum</Typography>
        <Typography flex="0 0 80%">{monthOfService}</Typography>
        <Typography flex="0 0 20%">Ort</Typography>
        <Typography flex="0 0 80%">{contact?.city}</Typography>
      </Box>
      <TableContainer sx={{
        '@media print': {
          '& .MuiTableCell-root': {
            color: '#000',
            paddingX: 2,
            paddingY: 0.5,
          },
        },
        '& .MuiTableFooter-root .MuiTableCell-root': {
          fontWeight: 'bold',
        },
      }}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="20%">Datum</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Stunden</TableCell>
              <TableCell sx={{
                '@media print': {
                  display: 'none',
                },
              }}
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trackingData?.getTrackings.items.map((tracking) => {
              const trackingDate = new Date(tracking.startTime);
              const trackingTime = differenceInMinutes(
                new Date(tracking.endTime),
                new Date(tracking.startTime),
              ) / 60;
              return (
                <TableRow key={tracking.id}>
                  <TableCell>{format(trackingDate, 'dd.MM.yyyy')}</TableCell>
                  <TableCell>{tracking.description?.toUpperCase()}</TableCell>
                  <TableCell align="right">{trackingTime}</TableCell>
                  <TableCell sx={{
                    '@media print': {
                      display: 'none',
                    },
                  }}
                  >
                    <IconButton onClick={() => deleteTracking({ id: tracking.id })}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell>Gesamt:</TableCell>
              <TableCell colSpan={2} align="right">{billableTime}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>
    </Box>
  );
};
