import React, { FC, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  getDaysInMonth, differenceInHours, isSunday, isSaturday, format,
} from 'date-fns';
import { de } from 'date-fns/locale';
import { css } from '@emotion/core';

import { useGetTrackingOverviewQuery, useGetProjectQuery, Tracking } from '../../graphql/hooks';
import { DatePicker } from '../DatePicker';

interface TrackingWithHours extends Tracking {
  hours: number;
}

interface Day {
  day: number;
  date: Date;
  trackings: TrackingWithHours[]
}

const sender = {
  name: 'Max Musterman',
  address: 'Musterstr. 123',
  zip: 12345,
  city: 'Musterhausen',
};

const customer = {
  name: 'Max Mustermann',
  city: 'Musterhausen',
};

const reduceTrackings = (subtotal: number, tracking: TrackingWithHours) => subtotal + tracking.hours;
const reduceDays = (total: number, day: Day) => total + day.trackings.reduce(reduceTrackings, 0);

export const TimeSheet: FC = () => {
  const [month, setMonth] = useState(new Date());
  const { projectId } = useParams();
  const { data: projectData } = useGetProjectQuery({
    variables: {
      query: { project: projectId },
    },
  });
  const { data: trackingData } = useGetTrackingOverviewQuery({
    variables: {
      query: { date: format(month, 'u-MM'), project: projectId },
    },
  });

  if (!trackingData || !projectData) return <p>Loading Sheet</p>;
  const { project } = projectData;
  const days = [...new Array(getDaysInMonth(month))].map((_, day): Day => {
    month.setDate(day + 1);
    return {
      day: month.getDate(),
      date: month,
      trackings: [],
    };
  });

  trackingData.trackings.items.forEach((tracking) => {
    const {
      __typename, id, description, startTime, endTime,
    } = tracking;
    const trackingWithHours: TrackingWithHours = {
      __typename,
      id,
      description,
      startTime,
      endTime,
      hours: differenceInHours(new Date(tracking.endTime), new Date(tracking.startTime)),
    };
    days[new Date(tracking.startTime).getDate() - 1].trackings.push(trackingWithHours);
  });

  const pageStyle = css`
    @page {
      margin: 1.5rem;
    }
    display: grid;
    min-height: 100vh;
  `;

  const tableStyle = css`
    width: 100%;
    border-collapse: collapse;
    td {
      border: 1px solid #CDCDCD;
    }
  `;

  const weekendStyle = css`
    height: 5px;
    background-color: #ccc;
    td {
      background-color: #CECECE;
      border-collapse: collapse;
    }
  `;

  const signatureStyles = css`
    display: grid;
    gap: 8px;
    grid-template:
      "dateLeft signatureLeft . dateRight signatureRight"
      / 1fr 2fr 1fr 1fr 2fr;
    font-size: small;
    .date {
      border-top: 1px solid black;
      margin-top: 60px;
    }
    .signature  {
      border-top: 1px solid black;
      margin-top: 60px;
    }
    margin-bottom: 1rem;
  `;

  const headerStyle = css`
    @media print {
      h1 {
        font-size: 26px;
      }
    }
    display: flex;
    h1, address {
      flex: 1;
    }
    address {
      text-align: right;
    }
  `;

  const disclaimerStyle = css`
    font-size: small;
  `;

  const dayStyle = css`
    font-size: small;
    text-align: right;
    width: 10%;
    padding: 0 1rem;
  `;

  const descriptionStyle = css`
    font-size: small;
    padding: 0 1rem;
  `;
  const hoursStyle = css`
    font-size: small;
    width: 5%;
    padding: 4px 15px;
  `;

  const totalRowStyle = css`
  border-top: 1px double #000000;
    td:first-child {
      text-align: right;
      padding: 4px 15px;
    }
    td:last-child {
      padding: 4px 15px;
    }
  `;

  const datePickerStyle = css`
    @media print {
      display: none;
    }
  `;

  return (
    <div>
      <div css={pageStyle}>
        <div css={datePickerStyle}>
          <DatePicker
            selected={month}
            onChange={(newDate) => setMonth(newDate!)}
            dateFormat="MM/yyyy"
            showMonthYearPicker
          />
        </div>
        <div css={headerStyle}>
          <h1>{`${sender.name} ${format(month, 'MMM, u', { locale: de })}`}</h1>
          <address>
            {sender.name}
            <br />
            {sender.address}
            <br />
            {`${sender.zip} ${sender.city}`}
          </address>
        </div>
        <div>
          Kunde:
          {' '}
          {project.client}
          <br />
          {`Monat: ${format(month, 'MM.u')}`}
          <br />
          {`Ort: ${sender.city}`}
        </div>
        <table css={tableStyle}>
          <thead>
            <tr>
              <th>Datum</th>
              <th>Beschreibung</th>
              <th>Stunden</th>
            </tr>
          </thead>
          <tbody>
            {days.map((day, idx) => {
              if (isSaturday(month.setDate(day.day))) {
                return undefined;
              }
              if (
                (
                  isSaturday(month.setDate(day.day))
                || isSunday(month.setDate(day.day))
                )
              && (
                idx >= days.length - 1
                || idx === 0
              )) {
                return undefined;
              }
              if (isSunday(month.setDate(day.day))) {
                return (
                  <tr css={weekendStyle}>
                    <td colSpan={3} />
                  </tr>
                );
              }
              return (
                <tr>
                  <td css={dayStyle}>
                    {format(day.date, 'dd.MM.u')}
                  </td>
                  <td css={descriptionStyle}>
                    {day.trackings.map((tracking) => (
                      <p>{tracking.description}</p>
                    ))}
                  </td>
                  <td css={hoursStyle}>
                    {day.trackings.map((tracking) => (
                      <p>{tracking.hours}</p>
                    ))}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr css={totalRowStyle}>
              <td colSpan={2}>
                Gesamt
              </td>
              <td>
                {days.reduce(reduceDays, 0)}
              </td>
            </tr>
          </tfoot>
        </table>
        <div css={signatureStyles}>
          <div className="date">
            {`${sender.city}, den`}
          </div>
          <div className="signature">
            {`${sender.name} (Auftragnehmer)`}
          </div>
          <br />
          <div className="date">
            {`${customer.city}, den`}
          </div>
          <div className="signature">
            {`${customer.name} (Auftraggeber)`}
          </div>
        </div>
        <div css={disclaimerStyle}>
          <p>
            Unterschriebene Zeiterfassungsbögen sind Urkunden und dokumentieren die
            erfolgreiche Arbeit des Beraters bzw. der Beraterin und damit die
            Akzeptanz des Kunden bzgl. Qualität und Leistung
          </p>
          <p css={{ marginTop: 10 }}>
            Ich bestätige, dass ich ein autorisierter Mitarbeiter des o.g. Kunden bin,
            Ich bestätige, dass die o.g. Angaben korrekt sind.
            Ferner dass die angegebenen Zeiten korrekt sind und die Arbeitsqualität
            einwandfrei ist. Die Rechnung kann gestellt werden.
          </p>
        </div>
      </div>
    </div>
  );
};