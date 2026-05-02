import { Card } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Input, Label } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export function Configuracion() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-text">Configuración</h1>
        <p className="text-xs text-muted">Cuenta, equipo, integraciones y facturación</p>
      </div>

      <Tabs defaultValue="perfil">
        <TabsList>
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="equipo">Equipo</TabsTrigger>
          <TabsTrigger value="establecimientos">Establecimientos</TabsTrigger>
          <TabsTrigger value="integraciones">Integraciones</TabsTrigger>
          <TabsTrigger value="facturacion">Facturación</TabsTrigger>
        </TabsList>

        <TabsContent value="perfil">
          <Card className="p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Nombre">
                <Input defaultValue="Sebastián Espinosa" />
              </Field>
              <Field label="Correo">
                <Input type="email" defaultValue="sebastian.espinosa@ecoaves.cl" />
              </Field>
              <Field label="Teléfono">
                <Input defaultValue="+56 9 8299 7453" />
              </Field>
              <Field label="Cargo">
                <Input defaultValue="Director de Operaciones" />
              </Field>
            </div>
            <div className="mt-6 flex justify-end">
              <Button variant="primary" size="md">
                Guardar cambios
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="equipo">
          <Card>
            <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
              <div className="text-xs font-semibold text-text">Miembros del equipo</div>
              <Button variant="primary" size="sm">Invitar miembro</Button>
            </div>
            <ul>
              {[
                ['Sebastián Espinosa', 'sebastian.espinosa@ecoaves.cl', 'Admin', 'success'],
                ['Romina Tobar', 'rtobar@cmds.cl', 'Directora Educación', 'accent'],
                ['Patricia Rojas', 'apoderado@cmds.cl', 'Apoderada', 'default'],
              ].map(([name, email, role, tone]) => (
                <li
                  key={String(email)}
                  className="flex items-center justify-between border-b border-border px-4 py-3 last:border-b-0"
                >
                  <div>
                    <div className="text-xs font-medium text-text">{name}</div>
                    <div className="text-2xs text-muted">{email}</div>
                  </div>
                  <Badge tone={tone as 'success' | 'accent' | 'default'}>{role}</Badge>
                </li>
              ))}
            </ul>
          </Card>
        </TabsContent>

        <TabsContent value="establecimientos">
          <Card className="p-6 text-center text-xs text-muted">
            Gestión de establecimientos y RBDs · próximamente.
          </Card>
        </TabsContent>

        <TabsContent value="integraciones">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              ['Google Maps', 'Mapas y geofencing', 'Configurar'],
              ['MINEDUC API', 'Sincronización de RBD', 'Conectar'],
              ['Stripe', 'Suscripciones SaaS', 'Conectar'],
              ['Slack', 'Alertas en canal', 'Conectar'],
            ].map(([name, desc, cta]) => (
              <Card key={name} className="flex items-center justify-between p-4">
                <div>
                  <div className="text-xs font-semibold text-text">{name}</div>
                  <div className="text-2xs text-muted">{desc}</div>
                </div>
                <Button variant="secondary" size="sm">{cta}</Button>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="facturacion">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-muted">Plan actual</div>
                <div className="mt-1 text-lg font-semibold text-text">Enterprise</div>
                <div className="text-2xs text-muted">15 establecimientos · 8.420 alumnos</div>
              </div>
              <Button variant="secondary" size="md">Ver historial</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
