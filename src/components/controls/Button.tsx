import { HTMLProps, FC } from 'react';
import { css } from '@emotion/react';
import { cx } from '@emotion/css';

interface ButtonProps extends HTMLProps<HTMLButtonElement> {
  className?: string;
  type: 'primary' | 'danger'
}

const buttonCss = css`
  height: 48px;
  cursor: pointer;
  &.primary {
    color: var(--text1);
    border: 2px solid var(--text1);
    border-radius: 12px;
    background-color: var(--surface1);
    font-size: 18px;
    font-weight: bold;
    padding: 0 40px;
  }
`;

export const Button: FC<ButtonProps> = ({ children, type }) => {
  const className = cx({
    primary: type === 'primary',
  });
  return (
    <button css={buttonCss} className={className} type="button">{children}</button>
  );
};
