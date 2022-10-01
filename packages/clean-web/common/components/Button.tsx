import clsx from 'clsx';
import { forwardRef } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  primary?: boolean;
  danger?: boolean;
}

// eslint-disable-next-line react/display-name
export const Button: React.FC<ButtonProps> = forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  const { children, primary, danger, className, ...rest } = props;
  return (
    <button
      className={clsx(
        'inline-flex justify-center rounded-md border border-transparent p-2 text-sm font-medium shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
        {
          'dark:bg-zinc-50 dark:text-black': !primary,
          'dark:bg-zinc-900 dark:text-white': primary,
          'text-white dark:bg-red-500': danger,
        },
        className,
      )}
      type="button"
      {...rest}
      ref={ref}
    >
      {children}
    </button>
  );
});
