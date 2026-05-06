import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Alumnos } from '@/pages/Alumnos';
import { NuevoAlumno } from '@/pages/NuevoAlumno';
import { Alertas } from '@/pages/Alertas';
import { Mapa } from '@/pages/Mapa';
import { Apoderado } from '@/pages/Apoderado';
import { Reportes } from '@/pages/Reportes';
import { Configuracion } from '@/pages/Configuracion';
import { FichaAlumno } from '@/pages/FichaAlumno';
import { Mensajes } from '@/pages/Mensajes';
import { AppShell } from '@/components/layout/AppShell';

const Scanner = lazy(() => import('@/pages/Scanner').then((m) => ({ default: m.Scanner })));
import { useAuth } from '@/hooks/useAuth';

function Protected({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'apoderado') return <Navigate to="/apoderado" replace />;
  return <AppShell>{children}</AppShell>;
}

function ApoderadoOnly({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
      <Route path="/scanner" element={<Protected><Suspense fallback={null}><Scanner /></Suspense></Protected>} />
      <Route path="/alumnos" element={<Protected><Alumnos /></Protected>} />
      <Route path="/alumnos/nuevo" element={<Protected><NuevoAlumno /></Protected>} />
      <Route path="/alumnos/:id" element={<Protected><FichaAlumno /></Protected>} />
      <Route path="/mensajes" element={<Protected><Mensajes /></Protected>} />
      <Route path="/alertas" element={<Protected><Alertas /></Protected>} />
      <Route path="/mapa" element={<Protected><Mapa /></Protected>} />
      <Route path="/reportes" element={<Protected><Reportes /></Protected>} />
      <Route path="/configuracion" element={<Protected><Configuracion /></Protected>} />
      <Route path="/apoderado" element={<ApoderadoOnly><Apoderado /></ApoderadoOnly>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
