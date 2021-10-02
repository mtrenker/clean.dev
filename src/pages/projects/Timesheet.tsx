import { VFC } from 'react';
import { css } from '@emotion/react';
import { differenceInMinutes, format } from 'date-fns';
import { useParams } from 'react-router-dom';
import { useGetProjectQuery, useGetTrackingsQuery } from '../../graphql/hooks';

interface Tracking {
  startTime: Date;
  endTime: Date;
  description: string;
}

const developer = {
  firstName: 'Max',
  lastName: 'Mustermann',
  address: 'Muster Str 123',
  city: 'Musterhausen',
  zip: '12345',
};

const timeSheetCss = css`
  @page {
    margin: 0;
  }
  display: grid;
  height: 100vh;
  padding: 40px;
  grid-template:
    "title address" max-content
    "subtitle address" max-content
    "customer customer" max-content
    "table table" max-content
    "footer footer" max-content
    / 3fr 2fr
  ;

  h1 {
    grid-area: title;
  }
  h2 {
    grid-area: subtitle;
  }
  address.developer {
    grid-area: address;
  }
  dl.customer {
    grid-area: customer;
    align-self: center;
    display: grid;
    grid-template-columns: 80px 1fr;
    dt {
      font-weight: bold;
    }
  }
  table {
    grid-area: table;
    border-collapse: collapse;
    td {
      border: 1px solid #333;
      padding: 0 4px;
    }
    tr:nth-of-type(2n) td {
      /* background-color: #dfdede; */
    }
    tfoot tr:last-of-type td {
      border-top: 2px solid black;
      /* background-color: #dfdede; */
      font-weight: bold;
    }
    .date {
      text-align: right;
      width: 20%;
    }
    .description {}
    .hours {
      text-align: right;
      width: 10%;
    }
  }
  footer {
    grid-area: footer;
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: flex-end;
    div {
      margin-top: 100px;
      border-top: 2px solid black;
      width: 90%;
      &:last-of-type {
        justify-self: end;
      }
    }
  }
`;

export const Timesheet: VFC = () => {
  const { projectId } = useParams<{projectId: string}>();

  const { data: trackingData } = useGetTrackingsQuery({
    variables: {
      projectId,
      date: '2021-09',
    },
  });

  const { data: projectData } = useGetProjectQuery({
    variables: {
      projectId,
    },
  });
  const project = projectData?.getProject;
  return (
    <div css={timeSheetCss}>
      <h1>Zeitnachweis</h1>
      <h2>September 2021</h2>

      <address className="developer">
        {`${developer.firstName} ${developer.lastName}`}
        <br />
        {developer.address}
        <br />
        {`${developer.zip} ${developer.city}`}
      </address>

      <dl className="customer">
        <dt>Kunde:</dt>
        <dd>{`${project?.client}, ${project?.contact.street}, ${project?.contact.zip} ${project?.contact.city}`}</dd>
        <dt>Monat:</dt>
        <dd>09.2021</dd>
        <dt>Ort:</dt>
        <dd>{project?.contact.city}</dd>
      </dl>

      <table>
        <thead>
          <tr>
            <th>Datum</th>
            <th>Beschreibung</th>
            <th>Stunden</th>
          </tr>
        </thead>
        <tbody>
          {trackingData?.getTrackings.items.map((data) => {
            const hours = differenceInMinutes(new Date(data.endTime), new Date(data.startTime)) / 60;
            return (
              <tr>
                <td className="date">{format(new Date(data.startTime), 'dd.MM.yyyy')}</td>
                <td className="description">{data.description}</td>
                <td className="hours">{hours}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={2}>Stunden Gesamt</td>
            <td className="hours">
              {trackingData?.getTrackings.items.reduce((hours, { startTime, endTime }) => hours + differenceInMinutes(new Date(endTime), new Date(startTime)) / 60, 0)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};
