import React from 'react';
import clsx from 'clsx';

interface ConsolePanelProps {
  /** Short uppercase title rendered as a terminal header label. */
  title: string;
  /** Optional CLI-style command rendered on the right of the title bar. */
  command?: string;
  /** Optional pill (count, badge etc.) rendered in the header. */
  meta?: React.ReactNode;
  /** Optional caption rendered just above the body. */
  description?: React.ReactNode;
  /** Whether to drop the default body padding (useful when embedding tables). */
  flush?: boolean;
  /** Show traffic-light ornaments in the header bar. */
  trafficLights?: boolean;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}

/**
 * `ConsolePanel` is the dense dashboard analog of the public `CliPanel`.
 *
 * It renders a terminal-style frame (header bar with monospace title, optional
 * `$ command` annotation, traffic-light ornaments) around an arbitrary body.
 * Use it for every section of the cockpit overview so the page reads as a
 * cohesive blueprint console rather than a stack of generic cards.
 */
export const ConsolePanel: React.FC<ConsolePanelProps> = ({
  title,
  command,
  meta,
  description,
  flush = false,
  trafficLights = false,
  className,
  bodyClassName,
  children,
}) => {
  return (
    <section
      className={clsx(
        'terminal-card relative overflow-hidden',
        className,
      )}
      aria-label={title}
    >
      <header className="flex min-w-0 flex-wrap items-center gap-3 border-b border-border/60 bg-background/45 px-4 py-2.5">
        {trafficLights && (
          <div className="flex shrink-0 gap-1.5" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-destructive/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-warning/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-success/80" />
          </div>
        )}
        <h2 className="min-w-0 flex-1 truncate font-mono text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          {title}
        </h2>
        {meta && <div className="shrink-0">{meta}</div>}
        {command && (
          <div
            className="hidden max-w-[60%] shrink-0 truncate font-mono text-xs text-accent sm:block"
            title={`$ ${command}`}
          >
            <span aria-hidden="true" className="text-muted-foreground">$ </span>
            {command}
          </div>
        )}
      </header>
      {description && (
        <div className="border-b border-border/40 bg-background/25 px-4 py-2 text-xs text-muted-foreground">
          {description}
        </div>
      )}
      <div className={clsx(!flush && 'p-4 sm:p-5', bodyClassName)}>
        {children}
      </div>
    </section>
  );
};
