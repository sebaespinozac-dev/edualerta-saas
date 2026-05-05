import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { io, type Socket } from 'socket.io-client';
import { getAccessToken } from '@/lib/api';

export interface LiveAlert {
  id: string;
  type: string;
  level: 'info' | 'warning' | 'critical';
  establishment_name?: string;
  message?: string;
  created_at: string;
}

export interface LiveAttendance {
  id: string;
  type: 'check_in' | 'check_out';
  student: { id: string; full_name: string };
  establishment_id: string;
  timestamp: string;
}

interface RealtimeState {
  connected: boolean;
  alerts: LiveAlert[];
  unreadAlerts: number;
  recentAttendance: LiveAttendance[];
  todayCheckIns: number;
  clearUnread: () => void;
}

const Ctx = createContext<RealtimeState>({
  connected: false,
  alerts: [],
  unreadAlerts: 0,
  recentAttendance: [],
  todayCheckIns: 0,
  clearUnread: () => {},
});

export function useRealtime() {
  return useContext(Ctx);
}

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [alerts, setAlerts] = useState<LiveAlert[]>([]);
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [recentAttendance, setRecentAttendance] = useState<LiveAttendance[]>([]);
  const [todayCheckIns, setTodayCheckIns] = useState(0);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) return;

    const socket = io('/realtime', {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('alert', (data: LiveAlert) => {
      setAlerts((prev) => [data, ...prev].slice(0, 50));
      setUnreadAlerts((n) => n + 1);
    });

    socket.on('attendance', (data: LiveAttendance) => {
      setRecentAttendance((prev) => [data, ...prev].slice(0, 30));
      if (data.type === 'check_in') {
        setTodayCheckIns((n) => n + 1);
      }
    });

    socketRef.current = socket;
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const clearUnread = useCallback(() => setUnreadAlerts(0), []);

  return (
    <Ctx.Provider
      value={{ connected, alerts, unreadAlerts, recentAttendance, todayCheckIns, clearUnread }}
    >
      {children}
    </Ctx.Provider>
  );
}
