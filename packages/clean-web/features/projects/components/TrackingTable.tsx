import { format, setSeconds, differenceInMinutes } from 'date-fns';
import { IconTrash } from '@tabler/icons';

import { Project, Tracking } from '../../../graphql/generated';
import { Button } from '../../../common/components/Button';

export interface TrackingTableProps {
  className?: string;
  project?: Project;
  onRemoveTracking?: (tracking: Tracking) => void;
}

export const TrackingTable: React.FC<TrackingTableProps> = ({ project, onRemoveTracking }) => (
  <table className="w-full">
    <thead>
      <tr>
        <th className="text-start">Date</th>
        <th className="text-start">Description</th>
        <th className="text-end">Hours</th>
        {onRemoveTracking && (
          <th />
        )}
      </tr>
    </thead>
    <tbody>
      {project?.trackings.map(tracking => {
        const hours = differenceInMinutes(
          setSeconds(new Date(tracking.endTime ?? ''), 0),
          setSeconds(new Date(tracking.startTime), 0),
        ) / 60;
        return (
          <tr className="border-b border-black last:border-b-2 dark:border-stone-500 [&_td]:py-1" key={tracking.startTime}>
            <td>{format(new Date(tracking.startTime), 'dd.MM.yyyy')}</td>
            <td>{tracking.summary}</td>
            <td className="text-end">{hours}</td>
            {onRemoveTracking && (
              <td>
                <Button onClick={() => onRemoveTracking(tracking)} type="button">
                  <IconTrash />
                </Button>
              </td>
            )}
          </tr>
        );
      })}
    </tbody>
    <tfoot>
      <tr>
        <td className="text-end font-bold" colSpan={2}>Total</td>
        <td className="text-end font-bold">
          {project?.trackings.reduce((hours, { startTime, endTime }) => {
            const endDate = setSeconds(new Date(endTime ?? ''), 0);
            const startDate = setSeconds(new Date(startTime), 0);
            return hours + differenceInMinutes(endDate, startDate) / 60;
          }, 0)}
        </td>
        {onRemoveTracking && (
          <td />
        )}
      </tr>
    </tfoot>
  </table>
);
