import React, { FC } from 'react';

export interface CellProps {
  justify?: 'left' | 'center' | 'right'
}

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

export const Cell: FC<CellProps> = ({ children, justify = 'left' }) => (
  <td className={justify}>
    {children}
  </td>
);
