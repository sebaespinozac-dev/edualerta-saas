import { FileText, Download, Sheet } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { reportTemplates } from '@/lib/mock-data';

export function Reportes() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-text">Reportes</h1>
        <p className="text-xs text-muted">Plantillas listas para auditoría y cumplimiento</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {reportTemplates.map((r) => (
          <Card key={r.id} className="flex flex-col p-4">
            <div className="flex items-start gap-3">
              <div className="flex size-9 flex-none items-center justify-center rounded-md border border-border bg-bg text-muted">
                <FileText className="h-4 w-4" strokeWidth={1.5} />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-text">{r.title}</h3>
                <p className="mt-1 text-2xs text-muted">{r.description}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-1.5">
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={() => toast.success(`Generando "${r.title}" en PDF…`)}
              >
                <Download className="h-3 w-3" strokeWidth={1.75} />
                PDF
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                onClick={() => toast.success(`Generando "${r.title}" en Excel…`)}
              >
                <Sheet className="h-3 w-3" strokeWidth={1.75} />
                Excel
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
