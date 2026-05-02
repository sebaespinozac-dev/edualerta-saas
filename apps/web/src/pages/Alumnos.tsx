import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { schools, students } from '@/lib/mock-data';
import { useDebounce } from '@/hooks/useDebounce';

const PAGE_SIZE = 12;

export function Alumnos() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const debounced = useDebounce(search, 200);

  const schoolByRbd = useMemo(
    () => Object.fromEntries(schools.map((s) => [s.rbd, s])),
    [],
  );

  const filtered = useMemo(() => {
    const q = debounced.toLowerCase().trim();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.run.toLowerCase().includes(q) ||
        s.guardianName.toLowerCase().includes(q),
    );
  }, [debounced]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const slice = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-text">Alumnos</h1>
          <p className="text-xs text-muted">{filtered.length.toLocaleString('es-CL')} registros activos</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm">
            <Filter className="h-3.5 w-3.5" strokeWidth={1.75} />
            Filtros
          </Button>
          <Link to="/alumnos/nuevo">
            <Button variant="primary" size="sm">
              <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
              Nuevo alumno
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" strokeWidth={1.75} />
        <Input
          placeholder="Buscar por nombre, RUN o apoderado…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="h-9 pl-8"
        />
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-border bg-bg/40">
              <tr>
                {['Alumno', 'RUN', 'Curso', 'Establecimiento', 'Apoderado', 'Estado'].map((h) => (
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
              {slice.map((s) => {
                const school = schoolByRbd[s.schoolRbd];
                return (
                  <tr key={s.id} className="border-b border-border last:border-b-0 hover:bg-bg/40">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={s.name} size={26} />
                        <span className="text-xs font-medium text-text">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-2xs text-muted tabular">{s.run}</td>
                    <td className="px-4 py-2.5 text-xs text-text">{s.grade}</td>
                    <td className="px-4 py-2.5 text-xs text-muted">{school?.name}</td>
                    <td className="px-4 py-2.5 text-xs text-text">{s.guardianName}</td>
                    <td className="px-4 py-2.5">
                      {s.status === 'presente' ? (
                        <Badge tone="success" dot>Presente</Badge>
                      ) : s.status === 'ausente' ? (
                        <Badge tone="warning" dot>Ausente</Badge>
                      ) : (
                        <Badge tone="default" dot>Retirado</Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
              {slice.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-xs text-muted">
                    Sin resultados para «{search}»
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-2xs text-muted">
          <div>
            Página {page} de {totalPages} · {filtered.length} resultados
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="secondary"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
