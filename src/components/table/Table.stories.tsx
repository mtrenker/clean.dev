import React from 'react';

import { SC } from '../../../types';
import { Table, Row, Cell } from './Table';

export default { title: 'Components/Table', component: Table, subcomponents: { Row, Cell } };

export const Component: SC = () => (
  <>
    <Table>
      <Row>
        <Cell>Test</Cell>
      </Row>
    </Table>
  </>
);
