import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { format, lastDayOfMonth } from 'date-fns';
import { de } from 'date-fns/locale';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { useGetProjectWithTrackingsQuery, useMeQuery } from '../../../graphql/generated';
import { TrackingTable } from '../../../features/projects/components/TrackingTable';
import { useState } from 'react';


const TimeSheetPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM'));
  const { data } = useGetProjectWithTrackingsQuery({
    variables: {
      id: id as string,
      date,
    },
  });
  const { data: userData } = useMeQuery();
  const project = data?.project;

  if (!project) {
    return null;
  }

  const firstDate = new Date(project?.trackings[0]?.startTime ?? 'now');
  const contact = userData?.me?.contact;

  return (
    <main className="container mx-auto flex flex-col gap-6">
      <div className="print:hidden">
        <ReactDatePicker
          dateFormat="yyyy-MM"
          onChange={(date: Date) => setDate(format(date, 'yyyy-MM'))}
          selected={new Date(date)}
          showMonthYearPicker
        />
      </div>
      <div className="flex justify-between py-10">
        <div className="flex-1">
          <h2 className="text-3xl">Timesheet</h2>
          <h3 className="text-2xl">
            {format(firstDate, 'MMMM yyyy', { locale: de })}
          </h3>
        </div>
        <address className="flex-1 text-end">
          {`${contact?.firstName} ${contact?.lastName}`}
          <br />
          {contact?.street}
          <br />
          {`${contact?.zip} ${contact?.city}`}
          <br />
          <a href="#">{contact?.email}</a>
        </address>
      </div>
      <dl className="grid grid-cols-[max-content_1fr] gap-x-10 text-lg">
        <dt>Project</dt>
        <dd>{project?.client}</dd>
        <dt>Period</dt>
        <dd>{`${format(firstDate, 'dd.MM.yyyy')} - ${format(lastDayOfMonth(firstDate), 'dd.MM.yyyy')}`}</dd>
        <dt>Location</dt>
        <dd>{project?.location}</dd>
      </dl>
      <TrackingTable project={project} />
    </main>
  );
};

export default TimeSheetPage;
