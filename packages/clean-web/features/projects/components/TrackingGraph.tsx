/* eslint-disable react/no-multi-comp */
import { useMemo } from 'react';
import { scaleLinear } from 'd3';

import { Project } from '../../../graphql/generated';
import { useChartDimensions } from '../hooks/useChartDimensions';

export interface TrackingGraphProps {
  className?: string;
  project?: Project
}

export const TrackingGraph: React.FC<TrackingGraphProps> = ({ project }) => {

  const [ref, dms] = useChartDimensions({});

  const xScale = useMemo(() => {
    return scaleLinear().domain([1, 31]).range([1, dms.boundedWidth]);
  }, [dms.boundedWidth]);

  const yScale = useMemo(() => {
    return scaleLinear().domain([160, 1]).range([1, dms.boundedHeight]);
  }, [dms.boundedHeight]);

  const points = useMemo<number[][]>(() => {
    if (!project) return [];
    const hoursPerDay = project.trackings.reduce((acc, { startTime, endTime }) => {
      const day = new Date(startTime).getDate();
      const time = (new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000 / 60 / 60;
      if (acc[day]) {
        acc[day] += time;
      } else {
        acc[day] = time;
      }
      return acc;
    }, {} as Record<number, number>);

    const hours = Object.entries(hoursPerDay).reduce<number[][]>((acc, [day, hours], index) => {
      const total = acc[index - 1]?.[1] || 0;
      acc.push([Number(day), total + hours]);
      return acc;
    }, []);

    return hours.map(([day, hours]) => [xScale(+day), yScale(hours)]);
  }, [project, xScale, yScale]);

  const totalHours = useMemo(() => {
    if (!project) return 0;
    return project.trackings.reduce((acc, { startTime, endTime }) => {
      const time = (new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000 / 60 / 60;
      return acc + time;
    }, 0);
  }, [project]);

  const totalCash = totalHours * (project?.categories[0].rate ?? 0);

  const lastPoint = points[points.length - 1];

  return (
    <div className="h-56" ref={ref}>
      <svg
        height={dms.height}
        width={dms.width}

      >
        <g>
          <polyline
            fill="none"
            points={points.map(([x, y]) => `${x},${y}`).join(' ')}
            stroke="#0074d9"
            strokeWidth="2"
          />
          <text fill="white" x={lastPoint?.[0]} y={lastPoint?.[1]}>
            {Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(totalCash)}
          </text>
        </g>
        <g>
          <HoursAxis
            domain={yScale.range() as [number, number]}
            range={yScale.range() as [number, number]}
          />
        </g>
        <g transform={`translate(10, ${dms.height - 20})`}>
          <DayAxis
            domain={xScale.domain() as [number, number]}
            range={xScale.range() as [number, number]}
          />
        </g>
      </svg>
    </div>
  );
};

export interface AxisProps {
  domain: [number, number];
  range: [number, number];
}

const HoursAxis: React.FC<AxisProps> = ({ domain, range }) => {
  const ticks = useMemo(() => {
    const yScale = scaleLinear().domain(domain).range(range);
    return yScale.ticks(5).map((tick) => ({
      yOffset: yScale(tick),
      value: tick,
    }));

  }, [domain, range]);
  return (
    <svg>
      {ticks.map(({ value, yOffset }) => (
        <g
          key={value}
          transform={`translate(0, ${Math.floor(yOffset)})`}
        >
          <text
            key={value}
            style={{
              fontSize: '10px',
              textAnchor: 'end',
              transform: 'translateX(15px)',
              fill: 'currentColor',
            }}
          >
            {value}
          </text>
        </g>
      ))}
    </svg>
  );
};


const DayAxis: React.FC<AxisProps> = ({ domain, range }) => {
  const ticks = useMemo(() => {
    const xScale = scaleLinear().domain(domain).range(range);
    return xScale.ticks(4).map((tick) => ({
      xOffset: xScale(tick),
      value: tick,
    }));

  }, [domain, range]);
  return (
    <svg>
      <path
        d={[
          'M', range[0], 6,
          'v', -6,
          'H', range[1],
          'v', 6,
        ].join(' ')}
        fill="none"
        stroke="currentColor"
      />
      {ticks.map(({ value, xOffset }) => (
        <g
          key={value}
          transform={`translate(${Math.floor(xOffset)}, 0)`}
        >
          <line
            stroke="currentColor"
            y2="6"
          />
          <text
            key={value}
            style={{
              fontSize: '10px',
              textAnchor: 'middle',
              transform: 'translateY(20px)',
              fill: 'currentColor',
            }}
          >
            {value}
          </text>
        </g>
      ))}
    </svg>
  );
};
