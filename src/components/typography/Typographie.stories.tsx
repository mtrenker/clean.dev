import React, { FC } from 'react';
import { select } from '@storybook/addon-knobs';

import { Heading, HeadingProps } from './Heading';

export default { title: 'Design | Typography' };

export const headings: FC = () => {
  const as: HeadingProps['as'] = select('as', ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'], 'h1');
  return (
    <>
      <Heading as={as}>Test</Heading>
      <hr />
      <Heading as="h1">Test H1</Heading>
      <Heading as="h2">Test H2</Heading>
      <Heading as="h3">Test H3</Heading>
      <Heading as="h4">Test H4</Heading>
      <Heading as="h5">Test H5</Heading>
      <Heading as="h6">Test H6</Heading>
    </>
  );
};
