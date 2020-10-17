import React, { FC } from 'react';
import { css } from '@emotion/core';
import DatePicker from 'react-datepicker';
import { Controller, useForm } from 'react-hook-form';

import 'react-datepicker/dist/react-datepicker.css';
import { Select } from '../Select';
import { Option } from '../Option';

export interface TimeTrackerProjects {
  id: string;
  client: string;
}

interface Tracking {
  id: string;
  projectId: string;
  startTime: string;
  endTime: string;
  description: string;
}

export interface TimeTrackerProps {
  tracking?: Tracking,
  projects: TimeTrackerProjects[];
  onChangeProject: (projectId: string) => void;
  onSubmit: (data: TrackingForm) => void;
}

export interface TrackingForm {
  projectId: string;
  startTime: string;
  endTime: string;
  description: string;
}

const formCss = css`
  display: grid;
  grid-template:
    "project project project" max-content
    "labelFrom labelTo quickSelect" max-content
    "datePickerFrom datePickerTo quickSelect" max-content
    "description description quickSelect" max-content
    "actionButtons actionButtons quickSelect" max-content
    "popper popper quickSelect" max-content
    / 1fr 1fr 1fr
  ;
  gap: 10px;

  .project {
    grid-area: project;
  }

  .datePickerFrom {
    grid-area: datePickerFrom;
  }

  .datePickerTo {
    grid-area: datePickerTo;
  }

  .quickSelect {
    grid-area: quickSelect;

    button {
      font-size: smaller;
      display: block;
    }
  }

  .actionButtons {
    grid-area: actionButtons;
    display: flex;
    button {
      flex: 1;
    }
  }
`;

const dateFormat = 'dd.MM.yyyy HH:mm';

export const TimeTracker: FC<TimeTrackerProps> = ({
  onSubmit, tracking, projects, onChangeProject,
}) => {
  const {
    handleSubmit, register, control, setValue,
  } = useForm<TrackingForm>({ defaultValues: tracking });

  if (tracking) {
    setValue('projectId', tracking.projectId);
    setValue('startTime', tracking.startTime);
    setValue('endTime', tracking.endTime);
    setValue('description', tracking.description);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} css={formCss}>
      <label css={{ gridArea: 'labelFrom' }} htmlFor="from">From:</label>
      <div>
        <Select name="projectId" inputRef={register} onChange={(e) => onChangeProject(e.currentTarget.value)}>
          {projects.map((project) => (
            <Option key={project.id} value={project.id}>{project.client}</Option>
          ))}
        </Select>
      </div>
      <label css={{ gridArea: 'labelFrom' }} htmlFor="startTime">From:</label>
      <div className="datePickerFrom">
        <Controller
          control={control}
          name="startTime"
          defaultValue={new Date()}
          render={({ onChange, value }) => (
            <DatePicker
              id="startTime"
              name="startTime"
              required
              selected={new Date(value)}
              showTimeSelect
              onChange={(date: Date) => onChange(date.toISOString())}
              dateFormat={dateFormat}
              showWeekNumbers
            />
          )}
        />
      </div>
      <label css={{ gridArea: 'labelTo' }} htmlFor="endTime">To:</label>
      <div className="datePickerTo">
        <Controller
          control={control}
          name="endTime"
          defaultValue={new Date()}
          render={({ onChange, value }) => (
            <DatePicker
              id="endTime"
              name="endTime"
              required
              selected={new Date(value)}
              showTimeSelect
              onChange={(date: Date) => onChange(date.toISOString())}
              dateFormat={dateFormat}
              showWeekNumbers
            />
          )}
        />
      </div>
      <textarea name="description" css={{ gridArea: 'description' }} ref={register} />
      <div className="quickSelect">
        <fieldset>
          <legend>Quickselect</legend>
          <button value="today-8-16" type="button">Today 8-16</button>
        </fieldset>
      </div>
      <div className="actionButtons">
        <button type="submit">Save</button>
      </div>
    </form>
  );
};
