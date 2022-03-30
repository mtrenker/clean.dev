import {
  Box,
  IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
} from '@mui/material';
import { DeleteForever as DeleteIcon } from '@mui/icons-material';
import React from 'react';
import { useDeleteTrackingMutation, useGetTrackingsQuery } from '../../../graphql/hooks';

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
              <TableCell>Start</TableCell>
              <TableCell>End</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trackingData?.getTrackings.items.map((tracking) => (
              <TableRow>
                <TableCell>{tracking.startTime}</TableCell>
                <TableCell>{tracking.endTime}</TableCell>
                <TableCell>{tracking.description}</TableCell>
                <TableCell>
                  <IconButton onClick={() => deleteTracking({ id: tracking.id })}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
