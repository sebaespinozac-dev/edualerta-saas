import { cn, initials } from '@/lib/utils';

export function Avatar({
  name,
  size = 28,
  className,
  src,
}: {
  name: string;
  size?: number;
  className?: string;
  src?: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn(
          'inline-block rounded-full border border-border object-cover',
          className,
        )}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full border border-border bg-bg text-text text-xs font-medium select-none',
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials(name)}
    </span>
  );
}
