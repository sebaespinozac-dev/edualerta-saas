import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, UserX, X, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Input, Label } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

/* ─── Types ─────────────────────────────────────────────────────── */

interface UserRow {
  id: string;
  email: string;
  full_name: string;
  role: 'super_admin' | 'admin' | 'docente' | 'apoderado';
  status: 'active' | 'inactive';
  last_login_at: string | null;
  created_at: string;
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Administrador',
  docente: 'Docente',
  apoderado: 'Apoderado',
};

const ROLE_TONES: Record<string, 'success' | 'accent' | 'warning' | 'default'> = {
  super_admin: 'success',
  admin: 'success',
  docente: 'accent',
  apoderado: 'default',
};

/* ─── User form ──────────────────────────────────────────────────── */

interface UserFormData {
  full_name: string;
  email: string;
  role: 'admin' | 'docente' | 'apoderado';
  password: string;
}

function UserFormDialog({
  open,
  onClose,
  editing,
}: {
  open: boolean;
  onClose: () => void;
  editing: UserRow | null;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState<UserFormData>({
    full_name: editing?.full_name ?? '',
    email: editing?.email ?? '',
    role: (editing?.role === 'super_admin' ? 'admin' : editing?.role) ?? 'docente',
    password: '',
  });

  const mutation = useMutation({
    mutationFn: async (data: Partial<UserFormData>) => {
      if (editing) {
        return api(`/users/${editing.id}`, { method: 'PATCH', body: JSON.stringify(data) });
      }
      return api('/users', { method: 'POST', body: JSON.stringify(data) });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success(editing ? 'Usuario actualizado' : 'Usuario creado');
      onClose();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload: Partial<UserFormData> = {
      full_name: form.full_name,
      role: form.role,
    };
    if (!editing) {
      payload.email = form.email;
      payload.password = form.password;
    } else if (form.password) {
      payload.password = form.password;
    }
    mutation.mutate(payload);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
          <DialogDescription>
            {editing ? 'Modifica los datos del usuario.' : 'Agrega un nuevo miembro al equipo.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <Field label="Nombre completo">
            <Input
              value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
              required
              disabled={mutation.isPending}
            />
          </Field>
          {!editing && (
            <Field label="Correo electrónico">
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
                disabled={mutation.isPending}
              />
            </Field>
          )}
          <Field label="Rol">
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserFormData['role'] }))}
              className="h-9 w-full rounded-md border border-border bg-surface px-3 text-xs text-text focus:outline-none focus:ring-2 focus:ring-accent/20"
              disabled={mutation.isPending}
            >
              <option value="admin">Administrador</option>
              <option value="docente">Docente</option>
              <option value="apoderado">Apoderado</option>
            </select>
          </Field>
          <Field label={editing ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña'}>
            <Input
              type="password"
              placeholder={editing ? '••••••••' : 'Mínimo 6 caracteres'}
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required={!editing}
              minLength={editing ? 0 : 6}
              disabled={mutation.isPending}
            />
          </Field>
          <DialogFooter className="pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={onClose} disabled={mutation.isPending}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={mutation.isPending}>
              {mutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.75} />
              ) : (
                <Check className="h-3.5 w-3.5" strokeWidth={2} />
              )}
              {editing ? 'Guardar' : 'Crear usuario'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ─── Users tab ──────────────────────────────────────────────────── */

function UsersTab() {
  const { user: me } = useAuth();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [deactivating, setDeactivating] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => api<{ data: UserRow[] }>('/users'),
    select: (res) => res.data,
  });

  const deactivate = useMutation({
    mutationFn: (id: string) => api(`/users/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['users'] });
      toast.success('Usuario desactivado');
      setDeactivating(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  function openNew() { setEditing(null); setDialogOpen(true); }
  function openEdit(u: UserRow) { setEditing(u); setDialogOpen(true); }

  return (
    <>
      <Card>
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <div>
            <span className="text-xs font-semibold text-text">Usuarios del sistema</span>
            {data && <span className="ml-2 text-2xs text-muted">({data.length})</span>}
          </div>
          <Button variant="primary" size="sm" onClick={openNew}>
            <Plus className="h-3.5 w-3.5" strokeWidth={1.75} />
            Nuevo usuario
          </Button>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted" strokeWidth={1.75} />
          </div>
        )}

        {error && (
          <div className="px-4 py-6 text-center text-xs text-muted">
            No se pudo cargar la lista de usuarios.
            <br />
            <span className="text-2xs">(Requiere API activa)</span>
          </div>
        )}

        {data && (
          <ul>
            {data.map((u) => (
              <li
                key={u.id}
                className="flex items-center gap-3 border-b border-border px-4 py-3 last:border-b-0"
              >
                <Avatar name={u.full_name} size={32} className="flex-none" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-text truncate">{u.full_name}</span>
                    {u.status === 'inactive' && (
                      <span className="text-2xs text-muted">(inactivo)</span>
                    )}
                  </div>
                  <div className="text-2xs text-muted truncate">{u.email}</div>
                </div>
                <Badge tone={ROLE_TONES[u.role] ?? 'default'}>
                  {ROLE_LABELS[u.role] ?? u.role}
                </Badge>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(u)}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-bg hover:text-text transition-colors"
                    title="Editar"
                  >
                    <Pencil className="h-3.5 w-3.5" strokeWidth={1.75} />
                  </button>
                  {u.id !== me?.id && u.status === 'active' && (
                    deactivating === u.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => deactivate.mutate(u.id)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-red-500 hover:bg-red-50 transition-colors"
                          title="Confirmar"
                        >
                          <Check className="h-3.5 w-3.5" strokeWidth={2} />
                        </button>
                        <button
                          onClick={() => setDeactivating(null)}
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-bg transition-colors"
                          title="Cancelar"
                        >
                          <X className="h-3.5 w-3.5" strokeWidth={2} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeactivating(u.id)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-red-50 hover:text-red-500 transition-colors"
                        title="Desactivar"
                      >
                        <UserX className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </button>
                    )
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <UserFormDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditing(null); }}
        editing={editing}
      />
    </>
  );
}

/* ─── Main component ─────────────────────────────────────────────── */

export function Configuracion() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-text">Configuración</h1>
        <p className="text-xs text-muted">Cuenta, equipo, integraciones y facturación</p>
      </div>

      <Tabs defaultValue="equipo">
        <TabsList>
          <TabsTrigger value="perfil">Perfil</TabsTrigger>
          <TabsTrigger value="equipo">Usuarios</TabsTrigger>
          <TabsTrigger value="establecimientos">Establecimientos</TabsTrigger>
          <TabsTrigger value="integraciones">Integraciones</TabsTrigger>
          <TabsTrigger value="facturacion">Facturación</TabsTrigger>
        </TabsList>

        <TabsContent value="perfil">
          <Card className="p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Nombre"><Input defaultValue="Sebastián Espinosa" /></Field>
              <Field label="Correo"><Input type="email" defaultValue="admin@edualerta.cl" /></Field>
              <Field label="Teléfono"><Input defaultValue="+56 9 8299 7453" /></Field>
              <Field label="Cargo"><Input defaultValue="Administrador CMDS" /></Field>
            </div>
            <div className="mt-6 flex justify-end">
              <Button variant="primary" size="md">Guardar cambios</Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="equipo" className="mt-4">
          <UsersTab />
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
              ['Twilio', 'SMS y WhatsApp a apoderados', 'Conectar'],
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
