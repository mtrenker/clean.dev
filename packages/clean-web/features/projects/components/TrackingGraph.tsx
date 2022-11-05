/* eslint-disable react/no-multi-comp */
import { useMemo, useRef } from 'react';
import { scaleLinear } from 'd3';
import { getDaysInMonth } from 'date-fns';

import { Project } from '../../../graphql/generated';

export interface TrackingGraphProps {
  className?: string;
  project?: Project
}

export const TrackingGraph: React.FC<TrackingGraphProps> = ({ project }) => {
  const svgRef = useRef(null);

  const [width, height] = [320, 200];

  const [xOffset, yOffset] = [20, 10];

  const xScale = scaleLinear().domain([1, 31]).range([1, width - 1]);
  const yScale = scaleLinear().domain([160, 1]).range([1, height - 1]);

  const points = useMemo<number[][]>(() => {
    const daysInMonth = getDaysInMonth(new Date(project?.trackings[0]?.startTime || ''));
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    console.log(days);

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
      const foo = acc[index - 1]?.[1] || 0;
      acc.push([Number(day), foo + hours]);
      return acc;
    }, []);

    return hours.map(([day, hours]) => [xScale(+day) - xOffset, yScale(hours) - yOffset]);
  }, [project, xOffset, xScale, yOffset, yScale]);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
    >
      <g>
        <polyline
          fill="none"
          points={points.map(([x, y]) => `${x},${y}`).join(' ')}
          stroke="#0074d9"
          strokeWidth="2"
        />
      </g>
      <g>
        <HoursAxis domain={[160, 1]} range={[1, height - 1]} />
      </g>
      <g transform={`translate(10 ${height - 20})`}>
        <DayAxis domain={[1, 31]} range={[1, width - 1]} />
      </g>
    </svg>
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
            { value }
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
            { value }
          </text>
        </g>
      ))}
    </svg>
  );
};
