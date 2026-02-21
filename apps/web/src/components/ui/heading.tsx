import React from 'react';
import clsx from 'clsx';

interface HeadingProps {
  children: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  variant?: 'display' | 'section' | 'label';
  className?: string;
  animate?: boolean;
}

export const Heading: React.FC<HeadingProps> = ({
  children,
  as: Component = 'h2',
  variant = 'section',
  className,
  animate = false,
}) => {
  const variantClasses = {
    display: 'heading-display text-6xl md:text-7xl lg:text-8xl',
    section: 'heading-section',
    label: 'text-label',
  };

  return (
    <Component
      className={clsx(
        variantClasses[variant],
        animate && 'observe',
        className
      )}
    >
      {children}
    </Component>
  );
};
