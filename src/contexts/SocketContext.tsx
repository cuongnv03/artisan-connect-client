import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: Set<string>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const { state } = useAuth();

  useEffect(() => {
    if (state.isAuthenticated && state.user) {
      const newSocket = io(
        import.meta.env.VITE_API_URL || 'http://localhost:5000',
        {
          auth: {
            token: localStorage.getItem('accessToken'),
          },
          transports: ['websocket'],
        },
      );

      newSocket.on('connect', () => {
        setIsConnected(true);
        console.log('Socket connected');
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        console.log('Socket disconnected');
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      // Handle user status updates
      newSocket.on(
        'user-status',
        (data: { userId: string; status: 'online' | 'offline' }) => {
          setOnlineUsers((prev) => {
            const newSet = new Set(prev);
            if (data.status === 'online') {
              newSet.add(data.userId);
            } else {
              newSet.delete(data.userId);
            }
            return newSet;
          });
        },
      );

      // Handle online users list
      newSocket.on('online-users', (users: string[]) => {
        setOnlineUsers(new Set(users));
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers(new Set());
      };
    } else {
      // Disconnect when user logs out
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
        setOnlineUsers(new Set());
      }
    }
  }, [state.isAuthenticated, state.user]);

  const value = {
    socket,
    isConnected,
    onlineUsers,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export function useSocketContext() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
}
