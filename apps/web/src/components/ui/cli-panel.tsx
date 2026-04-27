import React from 'react';
import clsx from 'clsx';

interface CliPanelProps {
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  title?: string;
  command?: string;
  prompt?: string;
}

/**
 * CliPanel gives content boxes a restrained terminal/shell treatment.
 *
 * Use it for public content panels where the clean.dev technical brand should
 * show through without turning every page into ASCII cosplay.
 */
export const CliPanel: React.FC<CliPanelProps> = ({
  children,
  className,
  bodyClassName,
  title,
  command,
  prompt = '$',
}) => {
  return (
    <div className={clsx('terminal-card overflow-hidden', className)}>
      {(title || command) && (
        <div className="flex min-w-0 items-center justify-between gap-3 border-b border-border/60 bg-background/35 px-4 py-2.5">
          <div className="min-w-0 flex-1 truncate font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground" title={title}>
            {title}
          </div>
          {command ? (
            <div className="hidden max-w-[45%] shrink-0 truncate font-mono text-xs text-accent sm:block" title={`${prompt} ${command}`}>
              <span aria-hidden="true" className="text-muted-foreground">{prompt} </span>
              {command}
            </div>
          ) : null}
        </div>
      )}
      <div className={clsx('p-6', bodyClassName)}>{children}</div>
    </div>
  );
};
