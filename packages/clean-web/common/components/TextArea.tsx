import clsx from 'clsx';
import { forwardRef } from 'react';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

// eslint-disable-next-line react/display-name
export const TextArea: React.FC<TextAreaProps> = forwardRef<HTMLTextAreaElement, TextAreaProps>(({ label, ...props }, ref) => (
  <span>
    {label && (
      <label
        className={clsx([
        'block w-full',
      ])}
        htmlFor={props.id}
      >
        {label}
      </label>
  )}
    <textarea
      className={clsx([
        'mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm',
        'dark:bg-zinc-50',
    ])}
      {...props}
      ref={ref}
    />
  </span>
));
