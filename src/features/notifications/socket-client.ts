'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAppStore } from '@/core/store';

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const { user, isAuthenticated, addNotification } = useAppStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || window.location.origin;
    
    // Connect to WebSocket server
    const socket = io(wsUrl, {
      autoConnect: true,
      reconnection: true,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to real-time notification engine.');
      
      // Join targeted user room
      socket.emit('join_user_room', user.id);
      
      // Join role based group
      socket.emit('join_role_room', user.role);
    });

    // Listen to real-time notifications
    socket.on('notification', (data) => {
      addNotification({
        id: data.id || Math.random().toString(),
        title: data.title || 'System Notification',
        message: data.message || '',
        type: data.type || 'SYSTEM',
        priority: data.priority || 'NORMAL',
        createdAt: data.createdAt || new Date().toISOString(),
        isRead: false,
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, isAuthenticated, addNotification]);

  return socketRef.current;
}
