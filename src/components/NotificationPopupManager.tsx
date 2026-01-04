'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useNotifications } from '@/contexts/NotificationContext';
import { usePopup, MonthlyRankWinPayload } from '@/contexts/PopupContext';
import { useVideoOptional } from '@/contexts/VideoContext';
import { usePathname } from 'next/navigation';

export function NotificationPopupManager() {
  const { status } = useSession();
  const { notifications } = useNotifications();
  const { enqueue } = usePopup();
  const videoContext = useVideoOptional();
  const pathname = usePathname();
  
  // Keep track of which notifications have been enqueued to avoid re-enqueueing
  const enqueuedNotificationsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (status !== 'authenticated') {
      enqueuedNotificationsRef.current.clear();
      return;
    }

    // Only enqueue when content is ready
    const isBlockingPage = pathname === '/' || pathname === '/thu-thach-giu-nhip' || pathname === '/video';
    const isContentReady = isBlockingPage ? (videoContext ? videoContext.isContentReady : true) : true;
    const isVideoPlaying = isBlockingPage ? (videoContext ? videoContext.isVideoPlaying : false) : false;

    if (!isContentReady || isVideoPlaying) return;

    // 1. Handle Notifications (MONTHLY_RANK_WIN & DAILY_LOGIN)
    notifications.forEach(notification => {
      if (
        !notification.isRead && 
        !enqueuedNotificationsRef.current.has(notification.id)
      ) {
        if (notification.type === 'MONTHLY_RANK_WIN') {
          enqueue({
            type: 'MONTHLY_RANK_WIN',
            priority: 2,
            payload: notification as MonthlyRankWinPayload
          });
          enqueuedNotificationsRef.current.add(notification.id);
        } else if (notification.type === 'DAILY_LOGIN') {
          // Check if modal was already shown today to avoid duplicates
          const today = new Date().toDateString();
          const lastShownDate = localStorage.getItem('dailyLoginModalShownDate');
          
          if (lastShownDate !== today) {
            enqueue({
              type: 'DAILY_LOGIN',
              priority: 1,
              payload: { 
                points: 10,
                notificationId: notification.id
              }
            });
            enqueuedNotificationsRef.current.add(notification.id);
            // We don't set localStorage here yet, it's done in handleClose or when enqueued?
            // DailyLoginModalProvider sets it when enqueued.
            localStorage.setItem('dailyLoginModalShownDate', today);
          }
        }
      }
    });
  }, [status, notifications, enqueue, videoContext?.isContentReady, videoContext?.isVideoPlaying, pathname]);

  return null;
}


