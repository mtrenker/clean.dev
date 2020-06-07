import React, { FC } from 'react';

import {
  getDaysInMonth, differenceInHours, isSunday, isSaturday, format,
} from 'date-fns';
import { css } from '@emotion/core';
import { useGetTrackingsQuery, Tracking } from '../graphql/hooks';

interface TrackingWithHours extends Tracking {
  hours: number;
}

interface Day {
  day: number;
  date: Date;
  trackings: TrackingWithHours[]
}

const reduceTrackings = (subtotal: number, tracking: TrackingWithHours) => subtotal + tracking.hours;
const reduceDays = (total: number, day: Day) => total + day.trackings.reduce(reduceTrackings, 0);

export const TimeSheet: FC = () => {
  const { data } = useGetTrackingsQuery({
    variables: {
      query: { date: '2020', project: '123' },
    },
  });

  if (!data) return <p>Loading Sheet</p>;
  const days = [...new Array(getDaysInMonth(new Date()))].map((_, day): Day => {
    const date = new Date();
    date.setDate(day + 1);
    return {
      day: day + 1,
      date,
      trackings: [],
    };
  });

  // eslint-disable-next-line no-unused-expressions
  data.trackings?.forEach((tracking) => {
    const {
      __typename, id, description, startTime, endTime,
    } = tracking!;
    const trackingWithHours: TrackingWithHours = {
      __typename,
      id,
      description,
      startTime,
      endTime,
      hours: differenceInHours(new Date(tracking!.endTime), new Date(tracking!.startTime)),
    };
    days[new Date(tracking!.startTime).getDate() - 1].trackings.push(trackingWithHours);
  });

  console.log(days);


  const pageStyle = css`
    display: grid;
    height: 100vh;
    padding: 2rem;
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

  return (
    <div css={pageStyle}>
      <div css={headerStyle}>
        <h1>TimeSheet</h1>
        <address>
          Martin Trenker
          <br />
          Philipp-Loewenfeld-Str. 63
          <br />
          80339 München
        </address>
      </div>
      <div>
        Kunde: Interhyp AG
        <br />
        {`Monat: ${format(new Date(), 'MM.u')}`}
        <br />
        Ort: München
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
            if (isSaturday(new Date().setDate(day.day))) {
              return undefined;
            }
            if (
              (
                isSaturday(new Date().setDate(day.day))
                || isSunday(new Date().setDate(day.day))
              )
              && (
                idx >= days.length - 1
                || idx === 0
              )) {
              return undefined;
            }
            if (isSunday(new Date().setDate(day.day))) {
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
          München, den
        </div>
        <div className="signature">
          Martin Trenker
          <br />
          (Auftragnehmer)
        </div>
        <br />
        <div className="date">
          München, den
        </div>
        <div className="signature">
          <br />
          (Auftraggeber)
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
  );
};
