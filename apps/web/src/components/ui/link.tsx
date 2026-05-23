import React from 'react';
import NextLink from 'next/link';
import clsx from 'clsx';

interface LinkProps {
  children: React.ReactNode;
  href: string;
  className?: string;
  style?: React.CSSProperties;
  variant?: 'default' | 'muted' | 'nav' | 'inline' | 'unstyled';
  external?: boolean;
  ariaLabel?: string;
  ariaCurrent?: React.AriaAttributes['aria-current'];
}

export const Link: React.FC<LinkProps> = ({
  children,
  href,
  className,
  style,
  variant = 'default',
  external = false,
  ariaLabel,
  ariaCurrent,
}) => {
  const variantClasses = {
    default: 'text-foreground hover:text-accent',
    muted: 'text-muted-foreground hover:text-accent',
    nav: 'text-label text-foreground hover:text-accent',
    inline: 'font-medium text-accent underline-offset-4 hover:underline',
    unstyled: '',
  };

  const isButtonLike = className?.split(/\s+/).some((token) => token.startsWith('btn')) ?? false;

  return (
    <NextLink
      className={clsx(
        'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        !isButtonLike && variantClasses[variant],
        className
      )}
      href={href}
      style={style}
      aria-label={ariaLabel}
      aria-current={ariaCurrent}
      rel={external ? 'noreferrer noopener' : undefined}
      target={external ? '_blank' : undefined}
    >
      {children}
    </NextLink>
  );
};
