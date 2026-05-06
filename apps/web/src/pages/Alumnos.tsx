import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { schools, students } from '@/lib/mock-data';
import { useDebounce } from '@/hooks/useDebounce';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 12;

const GRADES = [
  '1° Básico', '2° Básico', '3° Básico', '4° Básico',
  '5° Básico', '6° Básico', '7° Básico', '8° Básico',
  '1° Medio', '2° Medio', '3° Medio', '4° Medio',
];

type RiskFilter = 'todos' | 'bajo' | 'medio' | 'alto';
type StatusFilter = 'todos' | 'presente' | 'ausente' | 'retirado';

interface Filters {
  schoolRbd: number | 'todos';
  grade: string | 'todos';
  status: StatusFilter;
  risk: RiskFilter;
}

const DEFAULT_FILTERS: Filters = {
  schoolRbd: 'todos',
  grade: 'todos',
  status: 'todos',
  risk: 'todos',
};

function riskLevel(score: number): RiskFilter {
  if (score >= 70) return 'alto';
  if (score >= 40) return 'medio';
  return 'bajo';
}

function riskBadge(score: number) {
  const level = riskLevel(score);
  if (level === 'alto')
    return <Badge tone="danger">Riesgo alto</Badge>;
  if (level === 'medio')
    return <Badge tone="warning">Riesgo medio</Badge>;
  return null;
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 appearance-none rounded-md border border-border bg-surface pl-3 pr-7 text-xs text-text focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20"
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted" strokeWidth={2} />
    </div>
  );
}

export function Alumnos() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const debounced = useDebounce(search, 200);

  const schoolByRbd = useMemo(
    () => Object.fromEntries(schools.map((s) => [s.rbd, s])),
    [],
  );

  const activeFilterCount = useMemo(
    () => Object.entries(filters).filter(([, v]) => v !== 'todos').length,
    [filters],
  );

  const filtered = useMemo(() => {
    const q = debounced.toLowerCase().trim();
    return students.filter((s) => {
      if (q && !s.name.toLowerCase().includes(q) && !s.run.toLowerCase().includes(q) && !s.guardianName.toLowerCase().includes(q))
        return false;
      if (filters.schoolRbd !== 'todos' && s.schoolRbd !== filters.schoolRbd) return false;
      if (filters.grade !== 'todos' && s.grade !== filters.grade) return false;
      if (filters.status !== 'todos' && s.status !== filters.status) return false;
      // risk score: mock students don't have it, use index as proxy
      const idx = students.indexOf(s);
      const mockScore = (idx * 7) % 100;
      if (filters.risk !== 'todos' && riskLevel(mockScore) !== filters.risk) return false;
      return true;
    });
  }, [debounced, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function setFilter<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }

  function clearFilters() {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text">Alumnos</h1>
          <p className="text-xs text-muted">{filtered.length.toLocaleString('es-CL')} registros activos</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className={cn(
              'relative inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors',
              filtersOpen || activeFilterCount > 0
                ? 'border-accent/40 bg-accent/5 text-accent'
                : 'border-border text-muted hover:border-border/60 hover:text-text',
            )}
          >
            Filtros
            {activeFilterCount > 0 && (
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
          <Link to="/alumnos/nuevo">
            <Button variant="primary" size="sm">
              <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
              Nuevo alumno
            </Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" strokeWidth={1.75} />
        <Input
          placeholder="Buscar por nombre, RUN o apoderado..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="h-9 pl-8"
        />
      </div>

      {/* Filter panel */}
      {filtersOpen && (
        <Card className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <p className="text-2xs font-medium text-muted">Establecimiento</p>
              <Select
                value={String(filters.schoolRbd)}
                onChange={(v) => setFilter('schoolRbd', v === 'todos' ? 'todos' : Number(v))}
              >
                <option value="todos">Todos</option>
                {schools.map((s) => (
                  <option key={s.rbd} value={s.rbd}>
                    {s.name.length > 35 ? s.name.slice(0, 35) + '…' : s.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-1">
              <p className="text-2xs font-medium text-muted">Curso</p>
              <Select value={filters.grade} onChange={(v) => setFilter('grade', v)}>
                <option value="todos">Todos</option>
                {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
              </Select>
            </div>

            <div className="space-y-1">
              <p className="text-2xs font-medium text-muted">Estado</p>
              <Select value={filters.status} onChange={(v) => setFilter('status', v as StatusFilter)}>
                <option value="todos">Todos</option>
                <option value="presente">Presente</option>
                <option value="ausente">Ausente</option>
                <option value="retirado">Retirado</option>
              </Select>
            </div>

            <div className="space-y-1">
              <p className="text-2xs font-medium text-muted">Riesgo</p>
              <Select value={filters.risk} onChange={(v) => setFilter('risk', v as RiskFilter)}>
                <option value="todos">Todos</option>
                <option value="alto">Alto (≥70)</option>
                <option value="medio">Medio (40-69)</option>
                <option value="bajo">Bajo (&lt;40)</option>
              </Select>
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs text-muted hover:text-text transition-colors"
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.75} />
                Limpiar filtros
              </button>
            )}
          </div>
        </Card>
      )}

      {/* Active filter chips */}
      {activeFilterCount > 0 && !filtersOpen && (
        <div className="flex flex-wrap items-center gap-2">
          {filters.schoolRbd !== 'todos' && (
            <Chip label={schoolByRbd[filters.schoolRbd as number]?.name ?? String(filters.schoolRbd)} onRemove={() => setFilter('schoolRbd', 'todos')} />
          )}
          {filters.grade !== 'todos' && (
            <Chip label={filters.grade} onRemove={() => setFilter('grade', 'todos')} />
          )}
          {filters.status !== 'todos' && (
            <Chip label={filters.status} onRemove={() => setFilter('status', 'todos')} />
          )}
          {filters.risk !== 'todos' && (
            <Chip label={`Riesgo ${filters.risk}`} onRemove={() => setFilter('risk', 'todos')} />
          )}
          <button onClick={clearFilters} className="text-2xs text-muted hover:text-text">
            Limpiar todos
          </button>
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-bg/40">
              <tr>
                {['Alumno', 'RUN', 'Curso', 'Establecimiento', 'Apoderado', 'Estado', 'Riesgo'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left text-2xs font-medium uppercase tracking-wider text-muted"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {slice.map((s, idx) => {
                const school = schoolByRbd[s.schoolRbd];
                const globalIdx = (page - 1) * PAGE_SIZE + idx;
                const mockScore = (globalIdx * 7) % 100;
                return (
                  <tr key={s.id} className="border-b border-border last:border-b-0 hover:bg-bg/40 transition-colors">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={s.name} src={s.photoUrl} size={36} className="flex-none" />
                        <Link to={`/alumnos/${s.id}`} className="text-xs font-medium text-text hover:text-accent transition-colors hover:underline">
                          {s.name}
                        </Link>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-2xs text-muted tabular">{s.run}</td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/10 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20">
                        {s.grade}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted max-w-[180px] truncate">{school?.name}</td>
                    <td className="px-4 py-2.5 text-xs text-text">{s.guardianName}</td>
                    <td className="px-4 py-2.5">
                      {s.status === 'presente' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-2xs font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                          <span className="size-1.5 rounded-full bg-emerald-500" />
                          Presente
                        </span>
                      ) : s.status === 'ausente' ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-0.5 text-2xs font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-400">
                          <span className="size-1.5 rounded-full bg-red-500" />
                          Ausente
                        </span>
                      ) : (
                        <Badge tone="default" dot>Retirado</Badge>
                      )}
                    </td>
                    <td className="px-4 py-2.5">{riskBadge(mockScore)}</td>
                  </tr>
                );
              })}
              {slice.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-xs text-muted">
                    {search || activeFilterCount > 0
                      ? 'Sin resultados para los filtros aplicados'
                      : 'No hay alumnos registrados'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-2xs text-muted">
          <div>Página {page} de {totalPages} — {filtered.length} resultados</div>
          <div className="flex items-center gap-1.5">
            <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Anterior
            </Button>
            <Button variant="secondary" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
              Siguiente
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border bg-bg px-2.5 py-0.5 text-2xs text-text">
      {label}
      <button onClick={onRemove} className="ml-0.5 text-muted hover:text-text">
        <X className="h-2.5 w-2.5" strokeWidth={2} />
      </button>
    </span>
  );
}
