import React, { FC } from 'react';

import { Table, Row, Cell } from './Table';

export default { title: 'Components/Table', component: Table, subcomponents: { Row, Cell } };

export const Example: FC = () => (
  <>
    <Table>
      <tbody>
        <Row>
          <Cell>Test</Cell>
        </Row>
      </tbody>
    </Table>
  </>
);
