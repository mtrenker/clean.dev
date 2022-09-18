import clsx from 'clsx';
import { forwardRef } from 'react';

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

// eslint-disable-next-line react/display-name
export const TextField: React.FC<TextFieldProps> = forwardRef<HTMLInputElement, TextFieldProps>(({ label, ...props }, ref) => (
  <div>
    {label && (
      <label
        className={clsx([
        'mb-1 block w-full',
      ])}
        htmlFor={props.id}
      >
        {label}
      </label>
  )}
    <input
      {...props}
      className={clsx([
        'h-10 w-full rounded-sm border border-zinc-500 bg-zinc-200 p-1 dark:bg-zinc-800',
        'focus:outline-none focus-visible:outline-zinc-300 dark:focus-visible:outline-zinc-700',
      ])}
      ref={ref}
    />
  </div>
));
