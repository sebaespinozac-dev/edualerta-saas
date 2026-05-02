import { cn } from '@/lib/utils';

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center rounded border border-border bg-bg px-1.5 h-5 text-2xs font-medium text-muted tabular',
        className,
      )}
    >
      {children}
    </kbd>
  );
}
