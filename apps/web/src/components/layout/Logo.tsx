import { cn } from '@/lib/utils';

export function Logo({ className, showWordmark = true }: { className?: string; showWordmark?: boolean }) {
  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect width="20" height="20" rx="5" fill="#1a2e5a" />
        <circle cx="10" cy="10" r="2.5" fill="#ffffff" />
        <circle cx="10" cy="10" r="6" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="1" />
      </svg>
      {showWordmark && (
        <span className="text-[15px] font-semibold tracking-tight text-text">EduAlerta</span>
      )}
    </div>
  );
}
