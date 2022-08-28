import clsx from 'clsx';
import { forwardRef } from 'react';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

// eslint-disable-next-line react/display-name
export const TextArea: React.FC<TextAreaProps> = forwardRef<HTMLTextAreaElement, TextAreaProps>(({ label, ...props }, ref) => (
  <>
    {label && (
      <label
        className={clsx([
        'mb-1 block',
      ])}
        htmlFor={props.id}
      >
        {label}
      </label>
  )}
    <textarea
      className={clsx([
      'rounded-sm bg-zinc-200 p-1 dark:bg-zinc-800',
      'focus:outline-none focus-visible:outline-zinc-300 dark:focus-visible:outline-zinc-700',
    ])}
      {...props}
      ref={ref}
    />
  </>
));
