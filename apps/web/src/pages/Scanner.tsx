import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { CheckCircle, XCircle, Camera, CameraOff, RefreshCw, LogIn, LogOut } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

type ScanMode = 'check_in' | 'check_out';

interface ScanResult {
  ok: boolean;
  studentName: string;
  course?: string;
  establishmentName?: string;
  type: ScanMode;
  timestamp: string;
  message?: string;
}

const READER_ID = 'qr-reader';
const FEEDBACK_MS = 3000;

export function Scanner() {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [active, setActive] = useState(false);
  const [mode, setMode] = useState<ScanMode>('check_in');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearFeedback = useCallback(() => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    feedbackTimer.current = setTimeout(() => setResult(null), FEEDBACK_MS);
  }, []);

  const handleScan = useCallback(
    async (qrCode: string) => {
      if (loading) return;
      setLoading(true);
      try {
        const data = await api<{
          student: { full_name: string };
          establishment_name?: string;
          course?: string;
        }>('/attendance/check-in', {
          method: 'POST',
          body: JSON.stringify({ qr_code: qrCode, type: mode, method: 'qr' }),
        });
        setResult({
          ok: true,
          studentName: data.student.full_name,
          course: data.course,
          establishmentName: data.establishment_name,
          type: mode,
          timestamp: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
        });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error al registrar';
        setResult({
          ok: false,
          studentName: '—',
          type: mode,
          timestamp: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
          message: msg,
        });
      } finally {
        setLoading(false);
        clearFeedback();
      }
    },
    [loading, mode, clearFeedback],
  );

  const startScanner = useCallback(async () => {
    setError(null);
    try {
      const scanner = new Html5Qrcode(READER_ID, {
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        verbose: false,
      });
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decodedText) => handleScan(decodedText),
        () => { /* scan failure, ignore */ },
      );
      setActive(true);
    } catch {
      setError('No se pudo acceder a la cámara. Verifica los permisos.');
    }
  }, [handleScan]);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch { /* ignore */ }
      scannerRef.current = null;
    }
    setActive(false);
  }, []);

  useEffect(() => {
    return () => {
      stopScanner();
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current);
    };
  }, [stopScanner]);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-text">Escáner QR · Portería</h1>
        <p className="text-xs text-muted">Escanea el código QR del alumno para registrar su acceso</p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode('check_in')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium transition-all',
            mode === 'check_in'
              ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
              : 'border-border text-muted hover:border-border/60 hover:text-text',
          )}
        >
          <LogIn className="h-4 w-4" strokeWidth={2} />
          Entrada
        </button>
        <button
          onClick={() => setMode('check_out')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-lg border py-3 text-sm font-medium transition-all',
            mode === 'check_out'
              ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
              : 'border-border text-muted hover:border-border/60 hover:text-text',
          )}
        >
          <LogOut className="h-4 w-4" strokeWidth={2} />
          Salida
        </button>
      </div>

      {/* Camera */}
      <Card className="overflow-hidden">
        <div className="relative bg-black" style={{ aspectRatio: '1 / 1' }}>
          {/* QR reader div — html5-qrcode mounts here */}
          <div
            id={READER_ID}
            className="h-full w-full"
            style={{ minHeight: 280 }}
          />

          {/* Overlay when inactive */}
          {!active && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80">
              <CameraOff className="h-12 w-12 text-white/40" strokeWidth={1.25} />
              <p className="text-xs text-white/60">Cámara inactiva</p>
            </div>
          )}

          {/* Scanning indicator */}
          {active && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div
                className={cn(
                  'h-[240px] w-[240px] rounded-2xl border-2 transition-colors duration-300',
                  result?.ok === true
                    ? 'border-emerald-400'
                    : result?.ok === false
                    ? 'border-red-400'
                    : 'border-white/60',
                )}
              />
            </div>
          )}

          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <RefreshCw className="h-8 w-8 animate-spin text-white" strokeWidth={1.75} />
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between gap-3 p-4">
          <span className="text-xs text-muted">
            {active ? 'Apunta la cámara al código QR del alumno' : 'Inicia la cámara para escanear'}
          </span>
          {active ? (
            <Button variant="secondary" size="sm" onClick={stopScanner}>
              <CameraOff className="h-3.5 w-3.5" strokeWidth={1.75} />
              Detener
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={startScanner}>
              <Camera className="h-3.5 w-3.5" strokeWidth={1.75} />
              Iniciar cámara
            </Button>
          )}
        </div>

        {error && (
          <div className="border-t border-border px-4 pb-4">
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
      </Card>

      {/* Feedback card */}
      {result && (
        <div
          className={cn(
            'flex items-start gap-4 rounded-xl border p-4 transition-all',
            result.ok
              ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/5'
              : 'border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/5',
          )}
        >
          {result.ok ? (
            <CheckCircle className="mt-0.5 h-8 w-8 flex-none text-emerald-500" strokeWidth={1.5} />
          ) : (
            <XCircle className="mt-0.5 h-8 w-8 flex-none text-red-500" strokeWidth={1.5} />
          )}

          <div className="min-w-0 flex-1">
            {result.ok ? (
              <>
                <div className="flex items-center gap-2">
                  <Avatar name={result.studentName} size={32} />
                  <div>
                    <p className="text-sm font-semibold text-text">{result.studentName}</p>
                    {result.course && (
                      <p className="text-2xs text-muted">{result.course}</p>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted">
                  {result.type === 'check_in' ? '✓ Entrada registrada' : '✓ Salida registrada'}
                  {' · '}{result.timestamp}
                </p>
                {result.establishmentName && (
                  <p className="text-2xs text-muted">{result.establishmentName}</p>
                )}
              </>
            ) : (
              <>
                <p className="text-sm font-semibold text-red-700 dark:text-red-400">
                  No se pudo registrar
                </p>
                <p className="mt-0.5 text-xs text-red-600/80 dark:text-red-400/70">
                  {result.message ?? 'QR no reconocido o alumno inactivo'}
                </p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Demo note */}
      <p className="text-center text-2xs text-muted">
        En producción, el QR de cada alumno se genera en{' '}
        <span className="font-medium">Ficha → descargar QR</span>
      </p>
    </div>
  );
}
