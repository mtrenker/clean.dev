import clsx from 'clsx';
import { forwardRef } from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  primary?: boolean;
}

// eslint-disable-next-line react/display-name
export const Button: React.FC<ButtonProps> = forwardRef<HTMLButtonElement, ButtonProps>(({ children, primary, ...props }, ref) => (
  <button
    className={clsx({
      'h-10 w-full rounded-md bg-zinc-200 px-6 font-semibold text-white dark:bg-zinc-800': true,
      'dark:border-zinc-100 dark:bg-zinc-900': primary,
    })}
    type="button"
    {...props}
    ref={ref}
  >
    {children}
  </button>
));
