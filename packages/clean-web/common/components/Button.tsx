import clsx from 'clsx';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  primary?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ children, primary, ...props }) => (
  <button
    className={clsx({
      'h-10 rounded-md bg-zinc-200 px-6 font-semibold text-white dark:bg-zinc-800': true,
      ' dark:border-zinc-100 dark:bg-zinc-800': primary,
    })}
    type="button"
    {...props}
  >
    {children}
  </button>
);
