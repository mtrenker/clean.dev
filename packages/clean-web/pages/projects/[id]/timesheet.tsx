import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { format, lastDayOfMonth } from 'date-fns';
import { TrackingTable } from '../../../features/projects/components/TrackingTable';
import { de } from 'date-fns/locale';
import { useGetProjectsWithTrackingsQuery } from '../../../graphql/generated';

const TimeSheetPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data } = useGetProjectsWithTrackingsQuery();
  const project = data?.projects.find(project => project.id === id);
  if (!project) {
    return null;
  }
  const firstDate = new Date(project?.trackings[0]?.startTime ?? '');

  return (
    <main className="container mx-auto flex flex-col gap-6 py-10">
      <div className="flex justify-between">
        <div>
          <h2 className="text-4xl">Zeiterfassung</h2>
          <h3 className="text-2xl">{format(firstDate, 'MMMM', { locale: de })}</h3>
        </div>
        <address>
          Martin Trenker
          <br />
          Philipp-Loewenfeld-str. 63
          <br />
          80339 München
        </address>
      </div>
      <dl className="grid grid-cols-[max-content_1fr] gap-x-10 text-lg">
        <dt>Projekt</dt>
        <dd>
          {`${project?.contact?.company}, ${project?.contact?.street}, ${project?.contact?.city}`}
        </dd>
        <dt>Zeitraum</dt>
        <dd>{`${format(firstDate, 'dd.MM.yyyy')} - ${format(lastDayOfMonth(firstDate), 'dd.MM.yyyy')}`}</dd>
        <dt>Ort</dt>
        <dd>{project?.location}</dd>
      </dl>
      <TrackingTable project={project} />
    </main>
  );
};

export default TimeSheetPage;
