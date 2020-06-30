import React, { FC } from 'react';

import { Row, Table } from '../Table';

export const TimeSheet: FC = () => {
  const name = 'Timesheet';
  return (
    <div>
      <Table>
        <Row>
          <th>{name}</th>
        </Row>
      </Table>
    </div>
  );
};
