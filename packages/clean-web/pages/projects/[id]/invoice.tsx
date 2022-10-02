import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useGetProjectsWithTrackingsQuery } from '../../../graphql/generated';
import { differenceInHours } from 'date-fns';

const InvoicePage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const { data } = useGetProjectsWithTrackingsQuery();
  const project = data?.projects.find(project => project.id === id);

  const categories = project?.trackings.reduce((acc, tracking) => {
    const category = tracking.category ?? 'Sonstiges';
    if (acc[category]) {
      acc[category] += differenceInHours(new Date(tracking.endTime ?? ''), new Date(tracking.startTime));
    } else {
      acc[category] = differenceInHours(new Date(tracking.endTime ?? ''), new Date(tracking.startTime));
    }
    return acc;
  }, {} as Record<string, number>);

  return (
    <main className="container mx-auto">
      Invoice for
      {' '}
      {project?.client}
      <table>
        <thead>
          <tr>
            <th>Pos</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(categories ?? {}).map(([category, hours], index) => {
            const { rate } = project?.categories.find(({ name }) => name === category) ?? {};
            return (
              <tr key={category}>
                <td>{index + 1}</td>
                <td>{category}</td>
                <td>{hours}</td>
                <td>{rate}</td>
                <td>{hours * (rate ?? 0) }</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </main>
  );
};

export default InvoicePage;
