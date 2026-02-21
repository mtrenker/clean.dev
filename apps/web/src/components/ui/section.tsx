import React from 'react';
import clsx from 'clsx';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'inverted' | 'accent';
  noBorder?: boolean;
  noPadding?: boolean;
}

export const Section: React.FC<SectionProps> = ({
  children,
  className,
  variant = 'default',
  noBorder = false,
  noPadding = false,
}) => {
  const variantClasses = {
    default: 'bg-background text-foreground',
    inverted: 'bg-foreground text-background',
    accent: 'bg-accent text-accent-foreground',
  };

  return (
    <section
      className={clsx(
        !noPadding && 'section',
        !noBorder && 'section-border',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </section>
  );
};
