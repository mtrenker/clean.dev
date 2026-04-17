import React from 'react';
import { Label } from './label';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  required,
  error,
  children,
  className,
}) => {
  const errorId = error ? `${htmlFor}-error` : undefined;

  // Inject aria-describedby and aria-invalid into the direct child input/select/textarea
  const childWithAria = errorId
    ? React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<React.HTMLAttributes<HTMLElement>>, {
            'aria-describedby': errorId,
            'aria-invalid': true,
          });
        }
        return child;
      })
    : children;

  return (
    <div className={className}>
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      <div className="mt-1">{childWithAria}</div>
      {error && (
        <p id={errorId} role="alert" aria-live="polite" className="mt-1 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};
