import React, { FC } from 'react';
import { lorem } from 'faker';

import { Card } from './Card';

export default { title: 'Components/Layout/Card' };

export const baseComponent: FC = () => (
  <>
    <Card>
      <p>{lorem.paragraph()}</p>
    </Card>
  </>
);
