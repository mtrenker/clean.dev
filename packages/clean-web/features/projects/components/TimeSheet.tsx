import { format, setSeconds, differenceInMinutes } from 'date-fns';
import { IconTrash } from '@tabler/icons';

import { Project, Tracking } from '../../../graphql/generated';
import { Button } from '../../../common/components/Button';

export interface TimeSheetProps {
  className?: string;
  project?: Project;
  onRemoveTracking: (tracking: Tracking) => void;
}

export const TimeSheet: React.FC<TimeSheetProps> = ({ project, onRemoveTracking }) => (
  <table className="w-full">
    <thead>
      <tr>
        <th>Date</th>
        <th>Description</th>
        <th>Time</th>
      </tr>
    </thead>
    <tbody>
      {project?.trackings.map(tracking => {
        const hours = differenceInMinutes(
          setSeconds(new Date(tracking.endTime ?? ''), 0),
          setSeconds(new Date(tracking.startTime), 0),
        ) / 60;
        return (
          <tr key={tracking.startTime}>
            <td>{format(new Date(tracking.startTime), 'dd.MM.yyyy')}</td>
            <td>{tracking.summary}</td>
            <td>{hours}</td>
            <td>
              <Button onClick={() => onRemoveTracking(tracking)} type="button">
                <IconTrash />
              </Button>
            </td>
          </tr>
        );
      })}
    </tbody>
    <tfoot>
      <tr>
        <td colSpan={2}>Total</td>
        <td>
          {project?.trackings.reduce(
            (hours, { startTime, endTime }) => {
              const endDate = setSeconds(new Date(endTime ?? ''), 0);
              const startDate = setSeconds(new Date(startTime), 0);
              return hours + differenceInMinutes(endDate, startDate) / 60;
            },
            0,
          )}
        </td>
      </tr>
    </tfoot>
  </table>
);
