import React from 'react';
import clsx from 'clsx';

interface TableProps extends React.TableHTMLAttributes<HTMLTableElement> {}
interface TableSectionProps extends React.HTMLAttributes<HTMLTableSectionElement> {}
interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {}
interface TableHeadProps extends React.ThHTMLAttributes<HTMLTableCellElement> {}
interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, ...props }, ref) => (
    <div className="w-full overflow-x-auto">
      <table
        ref={ref}
        className={clsx('w-full text-sm', className)}
        {...props}
      />
    </div>
  )
);

Table.displayName = 'Table';

export const TableHeader = React.forwardRef<HTMLTableSectionElement, TableSectionProps>(
  ({ className, ...props }, ref) => (
    <thead
      ref={ref}
      className={clsx('border-b border-border bg-muted', className)}
      {...props}
    />
  )
);

TableHeader.displayName = 'TableHeader';

export const TableBody = React.forwardRef<HTMLTableSectionElement, TableSectionProps>(
  ({ className, ...props }, ref) => (
    <tbody
      ref={ref}
      className={clsx('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  )
);

TableBody.displayName = 'TableBody';

export const TableFooter = React.forwardRef<HTMLTableSectionElement, TableSectionProps>(
  ({ className, ...props }, ref) => (
    <tfoot
      ref={ref}
      className={clsx('border-t border-border bg-muted font-medium', className)}
      {...props}
    />
  )
);

TableFooter.displayName = 'TableFooter';

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={clsx('border-b border-border transition-colors hover:bg-muted/50', className)}
      {...props}
    />
  )
);

TableRow.displayName = 'TableRow';

export const TableHead: React.FC<TableHeadProps> = ({ className, scope = 'col', ...props }) => (
  <th scope={scope} className={clsx('p-2 text-left font-medium text-foreground', className)} {...props} />
);

export const TableCell: React.FC<TableCellProps> = ({ className, ...props }) => (
  <td className={clsx('p-2 align-middle', className)} {...props} />
);
