import { Card } from '@/components/ui/Card';
import { Sparkline } from '@/components/charts/Sparkline';
import { cn } from '@/lib/utils';

export type StatCardTint = 'blue' | 'green' | 'amber' | 'red' | 'purple' | null;

export interface StatCardProps {
  label: string;
  value: string;
  delta?: { value: string; positive?: boolean } | null;
  spark?: number[];
  indicator?: 'green' | 'amber' | 'red' | null;
  tint?: StatCardTint;
}

const tintClasses: Record<NonNullable<StatCardTint>, string> = {
  blue: 'bg-blue-50/60 border-blue-200/40 dark:bg-blue-500/5 dark:border-blue-500/15',
  green: 'bg-emerald-50/60 border-emerald-200/40 dark:bg-emerald-500/5 dark:border-emerald-500/15',
  amber: 'bg-amber-50/60 border-amber-200/40 dark:bg-amber-500/5 dark:border-amber-500/15',
  red: 'bg-red-50/60 border-red-200/40 dark:bg-red-500/5 dark:border-red-500/15',
  purple: 'bg-purple-50/60 border-purple-200/40 dark:bg-purple-500/5 dark:border-purple-500/15',
};

export function StatCard({ label, value, delta, spark, indicator, tint }: StatCardProps) {
  return (
    <Card className={cn('p-4', tint && tintClasses[tint])}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted">{label}</span>
        {indicator && (
          <span
            className={cn(
              'inline-block size-1.5 rounded-full',
              indicator === 'green' && 'bg-emerald-500',
              indicator === 'amber' && 'bg-amber-500',
              indicator === 'red' && 'bg-red-500',
            )}
          />
        )}
      </div>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div>
          <div className="text-[26px] font-semibold leading-none tracking-tight tabular text-text">
            {value}
          </div>
          {delta && (
            <div
              className={cn(
                'mt-1.5 text-2xs tabular',
                delta.positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted',
              )}
            >
              {delta.value}
            </div>
          )}
        </div>
        {spark && <Sparkline data={spark} />}
      </div>
    </Card>
  );
}
