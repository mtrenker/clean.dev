import React, { FC } from 'react';

export const Table: FC = ({ children }) => (
  <table>
    {children}
  </table>
);

export const Row: FC = ({ children }) => (
  <tr>
    {children}
  </tr>
);

export const Cell: FC = ({ children }) => (
  <td>
    {children}
  </td>
);
