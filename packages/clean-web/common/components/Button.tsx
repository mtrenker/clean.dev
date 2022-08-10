export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ children, ...props }) => (
  <button
    className="h-10 rounded-md bg-slate-600 px-6 font-semibold text-white"
    type="button"
    {...props}
  >
    {children}
  </button>
);
