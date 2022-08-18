import clsx from 'clsx';
import { forwardRef } from 'react';

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

// eslint-disable-next-line react/display-name
export const TextField: React.FC<TextFieldProps> = forwardRef<HTMLInputElement, TextFieldProps>((props, ref) => (
  <input
    className={clsx([
      'rounded-sm p-1 shadow-sm',
      'focus:outline-none focus:ring-2 focus:ring-blue-500',
      'border-slate-900 bg-slate-500 ',
    ])}
    {...props}
    ref={ref}
  />
));
