import { useEffect, useState } from 'react';
import { useSocketContext } from '../contexts/SocketContext';

export function useSocket() {
  const { socket } = useSocketContext();
  return socket;
}

export function useSocketEvent<T = any>(
  event: string,
  handler: (data: T) => void,
  deps: any[] = [],
) {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on(event, handler);

    return () => {
      socket.off(event, handler);
    };
  }, [socket, event, ...deps]);
}

export function useSocketConnection() {
  const { socket, isConnected } = useSocketContext();
  const [connectionState, setConnectionState] = useState({
    isConnected,
    error: null as string | null,
    reconnectAttempts: 0,
  });

  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      setConnectionState((prev) => ({
        ...prev,
        isConnected: true,
        error: null,
        reconnectAttempts: 0,
      }));
    };

    const handleDisconnect = () => {
      setConnectionState((prev) => ({
        ...prev,
        isConnected: false,
      }));
    };

    const handleConnectError = (error: Error) => {
      setConnectionState((prev) => ({
        ...prev,
        isConnected: false,
        error: error.message,
      }));
    };

    const handleReconnectAttempt = (attemptNumber: number) => {
      setConnectionState((prev) => ({
        ...prev,
        reconnectAttempts: attemptNumber,
      }));
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.on('reconnect_attempt', handleReconnectAttempt);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.off('reconnect_attempt', handleReconnectAttempt);
    };
  }, [socket]);

  return connectionState;
}
