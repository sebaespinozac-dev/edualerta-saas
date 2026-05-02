import * as React from 'react';
import { cn } from '@/lib/utils';

type BadgeTone = 'default' | 'success' | 'warning' | 'danger' | 'accent';

const tones: Record<BadgeTone, string> = {
  default: 'border-border text-muted',
  success: 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
  warning: 'border-amber-500/30 text-amber-600 dark:text-amber-400',
  danger: 'border-red-500/30 text-red-600 dark:text-red-400',
  accent: 'border-accent/30 text-accent dark:text-accent/90',
};

export function Badge({
  tone = 'default',
  className,
  children,
  dot,
}: {
  tone?: BadgeTone;
  className?: string;
  children: React.ReactNode;
  dot?: boolean;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded border px-1.5 h-5 text-2xs font-medium tracking-tight bg-transparent',
        tones[tone],
        className,
      )}
    >
      {dot && (
        <span
          className={cn(
            'size-1.5 rounded-full',
            tone === 'success' && 'bg-emerald-500',
            tone === 'warning' && 'bg-amber-500',
            tone === 'danger' && 'bg-red-500',
            tone === 'accent' && 'bg-accent',
            tone === 'default' && 'bg-muted',
          )}
        />
      )}
      {children}
    </span>
  );
}
