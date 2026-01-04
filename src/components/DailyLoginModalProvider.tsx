'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useSession, getSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { useUpdateUserPoints } from '@/hooks/useUpdateUserPoints';
import { useVideoOptional } from '@/contexts/VideoContext';
import { usePopup } from '@/contexts/PopupContext';

export function DailyLoginModalProvider() {
  const { data: session, status, update } = useSession();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { updateUserPoints } = useUpdateUserPoints();
  const { enqueue } = usePopup();
  const sessionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasCheckedSessionRef = useRef(false);
  const lastFocusCheckTimeRef = useRef<number>(0);
  const videoContext = useVideoOptional(); 
  const pendingPointsAwardedRef = useRef<{ pointsAwarded: boolean; userId?: string } | null>(null);

  const checkAndEnqueueModal = useCallback((pointsAwarded: boolean, userId?: string) => {
    const today = new Date().toDateString();
    const lastShownDate = localStorage.getItem('dailyLoginModalShownDate');

    if (pointsAwarded === true) {
      updateUserPoints(userId);
    }

    const isBlockingPage = pathname === '/' || pathname === '/thu-thach-giu-nhip' || pathname === '/video';
    const isContentReady = isBlockingPage ? (videoContext ? videoContext.isContentReady : true) : true;
    const isVideoPlaying = isBlockingPage ? (videoContext ? videoContext.isVideoPlaying : false) : false;
    
    if (isVideoPlaying || !isContentReady) {
      if (pointsAwarded === true) {
        pendingPointsAwardedRef.current = { pointsAwarded: true, userId };
      }
      return;
    }
    
    pendingPointsAwardedRef.current = null;

    if (pointsAwarded === true && lastShownDate !== today) {
      enqueue({
        type: 'DAILY_LOGIN',
        priority: 1,
        payload: { points: 10 }
      });
      localStorage.setItem('dailyLoginModalShownDate', today);
    }
  }, [updateUserPoints, videoContext, pathname, enqueue]);

  const checkBackendSession = useCallback(async () => {
    if (status !== 'authenticated' || !session?.user) {
      return;
    }

    try {
      const sessionData = await apiClient.getSession();

      if (sessionData) {
        if (sessionData.user?.id) {
          localStorage.setItem('userId', sessionData.user.id);
        }

        const currentSession = await getSession();
        const currentAccessToken = currentSession?.accessToken;
        const currentRefreshToken = currentSession?.refreshToken;
        
        const tokensChanged = 
          (sessionData.accessToken && sessionData.accessToken !== currentAccessToken) ||
          (sessionData.refreshToken && sessionData.refreshToken !== currentRefreshToken);

        if (tokensChanged) {
          await update();
        }

        const pointsAwarded = sessionData.pointsAwarded || false;
        checkAndEnqueueModal(pointsAwarded, sessionData.user?.id);

        queryClient.invalidateQueries({ queryKey: ['userDetails'] });
      }
    } catch (error) {
      console.error('Error checking backend session:', error);
      const errorStatus = (error as { response?: { status?: number } })?.response?.status;
      if (errorStatus === 401) {
        localStorage.removeItem('dailyLoginModalShownDate');
      }
    }
  }, [status, session?.user, update, queryClient, checkAndEnqueueModal]);

  useEffect(() => {
    if (status === 'authenticated' && session) {
      const previousStatus = sessionStorage.getItem('previousAuthStatus');
      const isNewLogin = previousStatus === 'unauthenticated' || previousStatus === null;
      
      if (isNewLogin || !hasCheckedSessionRef.current) {
        hasCheckedSessionRef.current = true;
        
        const today = new Date().toDateString();
        const lastShownDate = localStorage.getItem('dailyLoginModalShownDate');
        
        if (isNewLogin || (lastShownDate && lastShownDate !== today)) {
          localStorage.removeItem('dailyLoginModalShownDate');
        }
        
        const sessionPointsAwarded = session.pointsAwarded;
        const userId = session?.user?.id;
        if (sessionPointsAwarded !== undefined) {
          checkAndEnqueueModal(sessionPointsAwarded, userId);
        }
        
        setTimeout(() => {
          checkBackendSession();
        }, 1000);
      }
      
      sessionStorage.setItem('previousAuthStatus', 'authenticated');
    } else if (status === 'unauthenticated') {
      hasCheckedSessionRef.current = false;
      localStorage.removeItem('dailyLoginModalShownDate');
      
      sessionStorage.setItem('previousAuthStatus', 'unauthenticated');
      
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
        sessionCheckIntervalRef.current = null;
      }
    }
  }, [session, status, update, checkBackendSession, checkAndEnqueueModal]);

  useEffect(() => {
    if (status === 'authenticated' && session) {
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
      }

      sessionCheckIntervalRef.current = setInterval(() => {
        checkBackendSession();
      }, 5 * 60 * 1000);

      return () => {
        if (sessionCheckIntervalRef.current) {
          clearInterval(sessionCheckIntervalRef.current);
          sessionCheckIntervalRef.current = null;
        }
      };
    }
  }, [session, status, checkBackendSession]);

  useEffect(() => {
    const THROTTLE_MS = 30 * 1000;

    const handleFocus = () => {
      if (status === 'authenticated' && session) {
        const now = Date.now();
        if (now - lastFocusCheckTimeRef.current >= THROTTLE_MS) {
          lastFocusCheckTimeRef.current = now;
          checkBackendSession();
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [session, status, checkBackendSession]);

  useEffect(() => {
    const isBlockingPage = pathname === '/' || pathname === '/thu-thach-giu-nhip' || pathname === '/video';
    
    if (!isBlockingPage && pendingPointsAwardedRef.current) {
      const { pointsAwarded, userId } = pendingPointsAwardedRef.current;
      checkAndEnqueueModal(pointsAwarded, userId);
      pendingPointsAwardedRef.current = null;
    }
  }, [pathname, checkAndEnqueueModal]);

  useEffect(() => {
    const isBlockingPage = pathname === '/' || pathname === '/thu-thach-giu-nhip' || pathname === '/video';
    if (!isBlockingPage || !pendingPointsAwardedRef.current) return;
    
    const isContentReady = videoContext?.isContentReady;
    const isVideoPlaying = videoContext?.isVideoPlaying;
    
    if (isContentReady && !isVideoPlaying) {
      const { pointsAwarded, userId } = pendingPointsAwardedRef.current;
      if (pointsAwarded) {
        checkAndEnqueueModal(pointsAwarded, userId);
        pendingPointsAwardedRef.current = null;
      }
    }
  }, [videoContext, checkAndEnqueueModal, pathname]);

  return null;
}

