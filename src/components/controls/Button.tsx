import { HTMLProps, FC } from 'react';
import { css } from '@emotion/react';
import { cx } from '@emotion/css';

interface ButtonProps extends HTMLProps<HTMLButtonElement> {
  className?: string;
  type: 'primary' | 'danger'
}

const buttonCss = css`
  height: 64px;
  &.primary {
    color: #A9BF5A;
    border: 2px solid #A9BF5A;
    border-radius: 12px;
    background-color: hsla(73, 53%, 75%, .05);
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
