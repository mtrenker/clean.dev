import React from 'react';

import { SC } from '../../types';
import { Table, Row, Cell } from './Table';

export default { title: 'Components/Table', component: Table, subcomponents: { Row, Cell } };

export const Example: SC = () => (
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
