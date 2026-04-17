import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell } from './table';

const meta: Meta = {
  title: 'Internal/Primitives/Table',
  parameters: {
    docs: {
      description: {
        component: 'Composable data-table primitives with consistent spacing, borders, hover, and footer styles. Keep sorting and pagination logic outside this primitive.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const BasicTable: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <tr>
          <TableHead>Client</TableHead>
          <TableHead>Hours</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </tr>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Acme GmbH</TableCell>
          <TableCell>12.5h</TableCell>
          <TableCell className="text-right">€1,250.00</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Orbit AG</TableCell>
          <TableCell>8.0h</TableCell>
          <TableCell className="text-right">€800.00</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <tr>
          <TableCell colSpan={2}>Total</TableCell>
          <TableCell className="text-right">€2,050.00</TableCell>
        </tr>
      </TableFooter>
    </Table>
  ),
};
