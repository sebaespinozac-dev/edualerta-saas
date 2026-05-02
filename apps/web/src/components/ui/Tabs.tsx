import * as React from 'react';
import * as RTabs from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

export const Tabs = RTabs.Root;

export const TabsList = React.forwardRef<
  React.ElementRef<typeof RTabs.List>,
  React.ComponentPropsWithoutRef<typeof RTabs.List>
>(({ className, ...props }, ref) => (
  <RTabs.List
    ref={ref}
    className={cn(
      'inline-flex h-9 items-center gap-0.5 border-b border-border',
      className,
    )}
    {...props}
  />
));
TabsList.displayName = 'TabsList';

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof RTabs.Trigger>,
  React.ComponentPropsWithoutRef<typeof RTabs.Trigger>
>(({ className, ...props }, ref) => (
  <RTabs.Trigger
    ref={ref}
    className={cn(
      'relative inline-flex items-center h-9 px-3 text-xs font-medium text-muted',
      'hover:text-text transition-colors',
      'data-[state=active]:text-text',
      'data-[state=active]:after:absolute data-[state=active]:after:left-0 data-[state=active]:after:right-0',
      'data-[state=active]:after:-bottom-px data-[state=active]:after:h-px data-[state=active]:after:bg-accent',
      'focus-visible:outline-none',
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = 'TabsTrigger';

export const TabsContent = RTabs.Content;
