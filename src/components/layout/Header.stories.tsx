import React, { FC } from 'react';
import { Meta } from '@storybook/react';

import { Header } from './Header';

export default {
  title: 'Components/Header',
  component: Header,
  parameters: { layout: 'fullscreen' },
} as Meta;

export const Component: FC = () => (
  <>
    <Header />
    <h1>Lorem Ipsum</h1>
    <p>
      Lorem ipsum dolor sit amet consectetur, adipisicing elit. Corrupti itaque a quod incidunt dicta iure assumenda,
      aut placeat facere at, unde modi. Molestiae rem officiis labore rerum dignissimos voluptas vitae?
    </p>
    <p>
      Lorem ipsum dolor sit amet consectetur, adipisicing elit. Corrupti itaque a quod incidunt dicta iure assumenda,
      aut placeat facere at, unde modi. Molestiae rem officiis labore rerum dignissimos voluptas vitae?
    </p>
    <img src="https://picsum.photos/400/250?grayscale" alt="Example pic" />
    <p>
      Lorem ipsum dolor sit amet consectetur, adipisicing elit. Corrupti itaque a quod incidunt dicta iure assumenda,
      aut placeat facere at, unde modi. Molestiae rem officiis labore rerum dignissimos voluptas vitae?
    </p>
    <p>
      Lorem ipsum dolor sit amet consectetur, adipisicing elit. Corrupti itaque a quod incidunt dicta iure assumenda,
      aut placeat facere at, unde modi. Molestiae rem officiis labore rerum dignissimos voluptas vitae?
    </p>
    <img src="https://picsum.photos/400/249?grayscale" alt="Example pic" />
    <p>
      Lorem ipsum dolor sit amet consectetur, adipisicing elit. Corrupti itaque a quod incidunt dicta iure assumenda,
      aut placeat facere at, unde modi. Molestiae rem officiis labore rerum dignissimos voluptas vitae?
    </p>
    <p>
      Lorem ipsum dolor sit amet consectetur, adipisicing elit. Corrupti itaque a quod incidunt dicta iure assumenda,
      aut placeat facere at, unde modi. Molestiae rem officiis labore rerum dignissimos voluptas vitae?
    </p>
    <img src="https://picsum.photos/400/248?grayscale" alt="Example pic" />
  </>
);
