import { Card } from '@/components/ui/Card';
import { Sparkline } from '@/components/charts/Sparkline';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  label: string;
  value: string;
  delta?: { value: string; positive?: boolean } | null;
  spark?: number[];
  indicator?: 'green' | 'amber' | 'red' | null;
}

export function StatCard({ label, value, delta, spark, indicator }: StatCardProps) {
  return (
    <Card className="p-4">
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
