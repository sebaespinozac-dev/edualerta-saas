import { useEffect, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import { getAccessToken } from '@/lib/api';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

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

    socketRef.current = socket;
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return { socket: socketRef.current, connected };
}

export function useAlertSocket(onAlert: (alert: Record<string, unknown>) => void) {
  const { socket, connected } = useSocket();

  useEffect(() => {
    if (!socket) return;
    socket.on('alert', onAlert);
    return () => { socket.off('alert', onAlert); };
  }, [socket, onAlert]);

  return { connected };
}
