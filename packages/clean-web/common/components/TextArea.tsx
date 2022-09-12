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
        'mb-1 block w-full',
      ])}
        htmlFor={props.id}
      >
        {label}
      </label>
  )}
    <textarea
      className={clsx([
      'w-full rounded-sm border border-zinc-500 bg-zinc-200 p-1 dark:bg-zinc-800',
      'focus:outline-none focus-visible:outline-zinc-300 dark:focus-visible:outline-zinc-700',
    ])}
      {...props}
      ref={ref}
    />
  </span>
));
