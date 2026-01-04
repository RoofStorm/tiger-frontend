'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { apiClient } from '@/lib/api';
import { Notification } from '@/types';
import { useVideoOptional } from './VideoContext';
import { usePathname } from 'next/navigation';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  isLoading: boolean;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const videoContext = useVideoOptional();
  const pathname = usePathname();
  const [hasFetched, setHasFetched] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (status !== 'authenticated') return;
    
    setIsLoading(true);
    try {
      const response = await apiClient.getNotifications();
      if (response.success) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [status]);

  const markAsRead = useCallback(async (id: string) => {
    try {
      const response = await apiClient.markNotificationAsRead(id);
      if (response.success) {
        setNotifications(prev => 
          prev.map(n => n.id === id ? { ...n, isRead: true } : n)
        );
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  // Effect to fetch notifications based on conditions
  useEffect(() => {
    if (status === 'authenticated' && !hasFetched) {
      // Check if content is ready (if on pages that have video)
      const isBlockingPage = pathname === '/' || pathname === '/thu-thach-giu-nhip' || pathname === '/video';
      const isContentReady = isBlockingPage ? (videoContext ? videoContext.isContentReady : true) : true;
      
      if (isContentReady) {
        fetchNotifications();
        setHasFetched(true);
      }
    } else if (status === 'unauthenticated') {
      setNotifications([]);
      setHasFetched(false);
    }
  }, [status, videoContext?.isContentReady, pathname, fetchNotifications, hasFetched]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      fetchNotifications, 
      markAsRead,
      isLoading 
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

