export interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const TextField: React.FC<TextFieldProps> = (props) => (
  <input
    className={`${props.className || ''}
      rounded-sm shadow-sm ring-1
      ring-slate-500 focus:outline-none focus:ring-2
      focus:ring-blue-500`
    }
    {...props}
  />
);
