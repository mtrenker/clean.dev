import clsx from 'clsx';
import { forwardRef } from 'react';

export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  value?: string;
}

// eslint-disable-next-line react/display-name
export const TextField: React.FC<TextFieldProps> = forwardRef<HTMLInputElement, TextFieldProps>((props, ref) => {
  const { id, label, type = 'text', className, ...rest } = props;
  return (
    <>
      {label && (
        <label
          className="block font-medium text-black dark:text-white  sm:text-sm"
          htmlFor={id}
        >
          {label}
        </label>
      )}
      <input
        className={clsx([
          'block w-full appearance-none rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm',
          'dark:bg-zinc-50 dark:text-black',
          {
            'mt-1': label,
          },
          className,
        ])}
        id={id}
        ref={ref}
        type={type}
        {...rest}
      />
    </>
  );
});
