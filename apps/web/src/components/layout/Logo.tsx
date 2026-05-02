import { cn } from '@/lib/utils';

export function Logo({ className, showWordmark = true, size = 24 }: { className?: string; showWordmark?: boolean; size?: number }) {
  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <img
        src="/logo-programa.jpg"
        alt="EduAlerta"
        style={{ width: size, height: size }}
        className="rounded object-contain"
      />
      {showWordmark && (
        <span className="text-[15px] font-semibold tracking-tight text-text">EduAlerta</span>
      )}
    </div>
  );
}
