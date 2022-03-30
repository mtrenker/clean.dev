import {
  Box,
  IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { DeleteForever as DeleteIcon } from '@mui/icons-material';
import React from 'react';
import { differenceInHours, format } from 'date-fns';
import { useDeleteTrackingMutation } from '../../../app/api/generated';
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
  const [deleteTracking] = useDeleteTrackingMutation();
  return (
    <Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trackingData?.getTrackings.items.map((tracking) => {
              const date = new Date(tracking.startTime);
              const time = differenceInHours(
                new Date(tracking.endTime),
                new Date(tracking.startTime),
              );
              return (
                <TableRow key={tracking.id}>
                  <TableCell>{format(date, 'dd.MM.yyyy')}</TableCell>
                  <TableCell>{tracking.description}</TableCell>
                  <TableCell>{time}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => deleteTracking({ id: tracking.id })}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
