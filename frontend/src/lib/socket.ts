import { io, Socket } from 'socket.io-client';
import { useEffect, useState } from 'react';

// Get the backend URL from environment variables
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

let socket: Socket | null = null;

/**
 * Initialize the socket connection
 */
export const initializeSocket = (token: string): Socket => {
  if (!socket) {
    socket = io(BACKEND_URL, {
      auth: {
        token,
      },
      autoConnect: true,
    });
  }
  return socket;
};

/**
 * Get the current socket instance
 */
export const getSocket = (): Socket | null => socket;

/**
 * Disconnect the socket
 */
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Hook to manage socket connection
 */
export const useSocket = (token: string | null) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token) return;

    const socketInstance = initializeSocket(token);

    const onConnect = () => {
      setIsConnected(true);
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    socketInstance.on('connect', onConnect);
    socketInstance.on('disconnect', onDisconnect);

    return () => {
      socketInstance.off('connect', onConnect);
      socketInstance.off('disconnect', onDisconnect);
    };
  }, [token]);

  return { socket: getSocket(), isConnected };
};