import { useMemo, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type SortingState,
  type ColumnDef,
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { School } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { cn, formatNumber, formatPercent } from '@/lib/utils';

export function SchoolTable({ schools }: { schools: School[] }) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<School>[]>(
    () => [
      {
        accessorKey: 'rbd',
        header: 'RBD',
        cell: (i) => <span className="text-2xs text-muted tabular">{i.getValue<number>()}</span>,
      },
      {
        accessorKey: 'name',
        header: 'Establecimiento',
        cell: (i) => <span className="text-xs font-medium text-text">{i.getValue<string>()}</span>,
      },
      {
        accessorKey: 'type',
        header: 'Tipo',
        cell: (i) => <span className="text-2xs text-muted">{i.getValue<string>()}</span>,
      },
      {
        accessorKey: 'students',
        header: () => <span className="text-right">Alumnos</span>,
        cell: (i) => (
          <span className="block text-right text-xs text-text tabular">
            {formatNumber(i.getValue<number>())}
          </span>
        ),
      },
      {
        accessorKey: 'attendance',
        header: () => <span className="text-right">Asistencia</span>,
        cell: (i) => (
          <span className="block text-right text-xs text-text tabular">
            {formatPercent(i.getValue<number>())}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Estado',
        cell: (i) => {
          const v = i.getValue<School['status']>();
          if (v === 'operativo') return <Badge tone="success" dot>Operativo</Badge>;
          if (v === 'alerta') return <Badge tone="danger" dot>Alerta</Badge>;
          return <Badge tone="warning" dot>Mantenimiento</Badge>;
        },
      },
      {
        accessorKey: 'lastActivity',
        header: 'Última actividad',
        cell: (i) => (
          <span className="text-2xs text-muted tabular">
            hace {formatDistanceToNow(new Date(i.getValue<string>()), { locale: es })}
          </span>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: schools,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-border bg-bg/40">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    onClick={h.column.getToggleSortingHandler()}
                    className={cn(
                      'cursor-pointer select-none px-4 py-2.5 text-left text-2xs font-medium uppercase tracking-wider text-muted',
                      'hover:text-text',
                    )}
                  >
                    <span className="inline-flex items-center gap-1">
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {h.column.getIsSorted() === 'asc' ? (
                        <ChevronUp className="h-3 w-3" strokeWidth={1.75} />
                      ) : h.column.getIsSorted() === 'desc' ? (
                        <ChevronDown className="h-3 w-3" strokeWidth={1.75} />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-30" strokeWidth={1.75} />
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((r) => (
              <tr key={r.id} className="border-b border-border last:border-b-0 hover:bg-bg/40">
                {r.getVisibleCells().map((c) => (
                  <td key={c.id} className="px-4 py-3 text-xs">
                    {flexRender(c.column.columnDef.cell, c.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
