import * as React from 'react';
import * as RDialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Dialog = RDialog.Root;
export const DialogTrigger = RDialog.Trigger;

export function DialogContent({
  children,
  className,
  side,
}: {
  children: React.ReactNode;
  className?: string;
  side?: 'right';
}) {
  if (side === 'right') {
    return (
      <RDialog.Portal>
        <RDialog.Overlay className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px] data-[state=open]:animate-fade-in" />
        <RDialog.Content
          className={cn(
            'fixed right-0 top-0 z-50 h-full w-[400px] max-w-[92vw] bg-surface border-l border-border',
            'data-[state=open]:animate-slide-in-right',
            'flex flex-col',
            className,
          )}
        >
          {children}
          <RDialog.Close asChild>
            <button
              aria-label="Cerrar"
              className="absolute right-3 top-3 inline-flex size-7 items-center justify-center rounded text-muted hover:text-text hover:bg-bg"
            >
              <X size={14} strokeWidth={1.5} />
            </button>
          </RDialog.Close>
        </RDialog.Content>
      </RDialog.Portal>
    );
  }

  return (
    <RDialog.Portal>
      <RDialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm data-[state=open]:animate-fade-in" />
      <RDialog.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
          'w-full max-w-md rounded-md border border-border bg-surface shadow-sm',
          'data-[state=open]:animate-fade-in',
          className,
        )}
      >
        {children}
      </RDialog.Content>
    </RDialog.Portal>
  );
}

export const DialogClose = RDialog.Close;

export const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('px-5 pt-4 pb-2', className)} {...props} />
);

export const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('flex items-center justify-end gap-2 border-t border-border px-5 py-3', className)}
    {...props}
  />
);

export const DialogTitle = React.forwardRef<
  React.ElementRef<typeof RDialog.Title>,
  React.ComponentPropsWithoutRef<typeof RDialog.Title>
>(({ className, ...props }, ref) => (
  <RDialog.Title
    ref={ref}
    className={cn('text-sm font-semibold tracking-tight text-text', className)}
    {...props}
  />
));
DialogTitle.displayName = 'DialogTitle';

export const DialogDescription = React.forwardRef<
  React.ElementRef<typeof RDialog.Description>,
  React.ComponentPropsWithoutRef<typeof RDialog.Description>
>(({ className, ...props }, ref) => (
  <RDialog.Description
    ref={ref}
    className={cn('mt-1 text-xs text-muted', className)}
    {...props}
  />
));
DialogDescription.displayName = 'DialogDescription';

export const DialogBody = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('px-5 py-3', className)} {...props} />
);
