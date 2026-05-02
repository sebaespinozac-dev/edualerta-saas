import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-9 w-full rounded-md border border-border bg-surface px-3 py-1 text-sm text-text',
        'placeholder:text-muted',
        'focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'transition-[box-shadow,border-color] duration-150',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn('text-xs font-medium text-text', className)}
    {...props}
  />
));
Label.displayName = 'Label';

export const FieldError = ({ children }: { children?: React.ReactNode }) =>
  children ? <p className="text-2xs text-danger mt-1">{children}</p> : null;
