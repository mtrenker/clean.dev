import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { format, lastDayOfMonth } from 'date-fns';
import { TrackingTable } from '../../../features/projects/components/TrackingTable';
import { de } from 'date-fns/locale';
import { useGetProjectsWithTrackingsQuery, useMeQuery } from '../../../graphql/generated';

const TimeSheetPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data } = useGetProjectsWithTrackingsQuery();
  const { data: userData } = useMeQuery();
  const project = data?.projects.find(project => project.id === id);

  if (!project) {
    return null;
  }
  const firstDate = new Date(project?.trackings[0]?.startTime ?? '');
  const contact = userData?.me?.contact;

  return (
    <main className="container mx-auto flex flex-col gap-6 py-10">
      <div className="flex justify-between">
        <div>
          <h2 className="text-3xl">Timesheet</h2>
          <h3 className="text-2xl">
            {format(firstDate, 'MMMM yyyy', { locale: de })}
          </h3>
        </div>
        <address className="flex-1">
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
