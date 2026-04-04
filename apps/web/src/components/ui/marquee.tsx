import React from 'react';
import clsx from 'clsx';

interface MarqueeProps {
  items: string[];
  speed?: 'slow' | 'normal' | 'fast';
  className?: string;
}

const speedMap = {
  slow: '60s',
  normal: '40s',
  fast: '25s',
};

export const Marquee: React.FC<MarqueeProps> = ({ items, speed = 'normal', className }) => {
  const duration = speedMap[speed];

  return (
    <div
      className={clsx('relative overflow-hidden', className)}
      aria-hidden="true"
    >
      <div
        className="flex w-max animate-[marqueeScroll_var(--marquee-duration)_linear_infinite]"
        style={{ '--marquee-duration': duration } as React.CSSProperties}
      >
        {/* Two identical sets for seamless loop */}
        {[0, 1].map((set) => (
          <ul key={set} className="flex items-center gap-0">
            {items.map((item, i) => (
              <li key={`${set}-${i}`} className="flex items-center">
                <span className="px-6 font-serif text-xl font-bold text-muted-foreground/60 transition-colors duration-300 hover:text-foreground sm:px-10 sm:text-2xl">
                  {item}
                </span>
                <span className="text-base text-accent opacity-40 sm:text-lg" aria-hidden="true">✦</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </div>
  );
};
