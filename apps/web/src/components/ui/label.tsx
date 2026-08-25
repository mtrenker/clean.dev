import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label: React.FC<LabelProps> = ({
  className,
  children,
  required,
  ...props
}) => {
  return (
    <label
      className={twMerge(clsx(
        'block text-sm font-medium text-foreground',
        className
      ))}
      {...props}
    >
      {children}
      {required && <span className="ml-1 text-red-500" aria-hidden="true">*</span>}
    </label>
  );
};
