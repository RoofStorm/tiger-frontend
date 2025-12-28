'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSession, getSession } from 'next-auth/react';
import { useQueryClient } from '@tanstack/react-query';
import { DailyLoginModal } from './DailyLoginModal';
import { apiClient } from '@/lib/api';
import { useUpdateUserPoints } from '@/hooks/useUpdateUserPoints';

export function DailyLoginModalProvider() {
  const { data: session, status, update } = useSession();
  const queryClient = useQueryClient();
  const { updateUserPoints } = useUpdateUserPoints();
  const [showModal, setShowModal] = useState(false);
  const sessionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasCheckedSessionRef = useRef(false);
  const lastFocusCheckTimeRef = useRef<number>(0);

  // Function to check and show modal based on pointsAwarded
  const checkAndShowModal = useCallback((pointsAwarded: boolean, userId?: string) => {
    const hasShownModal = localStorage.getItem('dailyLoginModalShown');
    const today = new Date().toDateString();
    const lastShownDate = localStorage.getItem('dailyLoginModalShownDate');

    console.log('🔍 Modal check:', {
      pointsAwarded,
      hasShownModal,
      lastShownDate,
      today,
      shouldShow: pointsAwarded === true && (!hasShownModal || lastShownDate !== today),
    });

    // If pointsAwarded is true, update user points immediately
    // This ensures header shows the correct points after bonus is awarded
    if (pointsAwarded === true) {
      console.log('✅ Points awarded - updating user points in UI');
      updateUserPoints(userId);
    }

    // Show modal if:
    // 1. pointsAwarded is true
    // 2. Modal hasn't been shown today
    if (
      pointsAwarded === true &&
      (!hasShownModal || lastShownDate !== today)
    ) {
      console.log('✅ Showing DailyLoginModal');
      // Small delay to ensure UI is ready
      setTimeout(() => {
        setShowModal(true);
        localStorage.setItem('dailyLoginModalShown', 'true');
        localStorage.setItem('dailyLoginModalShownDate', today);
      }, 500);
    } else {
      console.log('❌ Not showing modal:', {
        pointsAwarded,
        hasShownModal,
        lastShownDate,
        today,
      });
    }
  }, [updateUserPoints]);

  // Function to check session from backend (for refresh tokens and latest data)
  const checkBackendSession = useCallback(async () => {
    if (status !== 'authenticated' || !session?.user) {
      return;
    }

    try {
      // Call backend session API to:
      // 1. Refresh tokens (if needed)
      // 2. Get latest user info (points, etc.)
      // 3. Check latest pointsAwarded status
      const sessionData = await apiClient.getSession();

      console.log('🔍 Session data from API:', sessionData);

      if (sessionData) {
        // Store userId for quick access (not sensitive)
        if (sessionData.user?.id) {
          localStorage.setItem('userId', sessionData.user.id);
        }

        // Check if tokens actually changed before updating NextAuth session
        // Get current tokens from session (not localStorage)
        const currentSession = await getSession();
        const currentAccessToken = (currentSession as any)?.accessToken;
        const currentRefreshToken = (currentSession as any)?.refreshToken;
        
        const tokensChanged = 
          (sessionData.accessToken && sessionData.accessToken !== currentAccessToken) ||
          (sessionData.refreshToken && sessionData.refreshToken !== currentRefreshToken);

        // Tokens are stored in NextAuth session (JWT), not localStorage
        // Update NextAuth session to store new tokens in JWT
        if (tokensChanged) {
          console.log('🔄 Tokens changed - updating NextAuth session');
          // Note: We need to update the session with new tokens
          // This will be handled by NextAuth when we call update()
          // But we need to ensure tokens are passed to NextAuth JWT callback
          // For now, just update the session - tokens should be in sessionData
          await update();
        } else {
          console.log('⏭️ Tokens unchanged - skipping NextAuth session update');
        }

        // Check pointsAwarded and show modal
        // Always check if pointsAwarded changed (e.g., user got daily bonus while app was open)
        // This will also update user points in header if pointsAwarded is true
        const pointsAwarded = sessionData.pointsAwarded || false;
        checkAndShowModal(pointsAwarded, sessionData.user?.id);

        // Always invalidate userDetails query to ensure UI is in sync
        // This is a fallback to ensure points are updated even if pointsAwarded is false
        queryClient.invalidateQueries({ queryKey: ['userDetails'] });
      }
    } catch (error) {
      console.error('Error checking backend session:', error);
      
      const errorStatus = (error as { response?: { status?: number } })?.response?.status;
      
      // If session check fails with 401, the interceptor already tried to refresh token
      // If it still fails, it means refresh token is also invalid/expired
      if (errorStatus === 401) {
        // Clear flags on auth error (user is logged out or tokens expired)
        localStorage.removeItem('dailyLoginModalShown');
        localStorage.removeItem('dailyLoginModalShownDate');
        
        // Note: The interceptor in api.ts already handles:
        // 1. Automatic token refresh on 401
        // 2. Retry the request with new token
        // 3. Clear tokens and signout if refresh fails
        // So we just need to handle the final error state here
      }
    }
  }, [status, session?.user, update, queryClient, checkAndShowModal]);

  // Check session when user becomes authenticated
  useEffect(() => {
    if (status === 'authenticated' && session) {
      // Reset check flag when user becomes authenticated (new login or session refresh)
      // This ensures we check session after every login, not just the first time
      const previousStatus = sessionStorage.getItem('previousAuthStatus');
      const isNewLogin = previousStatus === 'unauthenticated' || previousStatus === null;
      
      if (isNewLogin || !hasCheckedSessionRef.current) {
        hasCheckedSessionRef.current = true;
        
        // When user logs in, clear flags to allow modal to show if pointsAwarded is true
        // This ensures modal can show after login even if it was shown earlier today
        const today = new Date().toDateString();
        const lastShownDate = localStorage.getItem('dailyLoginModalShownDate');
        
        // Clear flags if:
        // 1. It's a new day, OR
        // 2. User just logged in (new login session)
        if (isNewLogin || (lastShownDate && lastShownDate !== today)) {
          localStorage.removeItem('dailyLoginModalShown');
          localStorage.removeItem('dailyLoginModalShownDate');
        }
        
        // First, check pointsAwarded from NextAuth session (already available from login)
        // This avoids unnecessary API call if we already have the data
        const sessionPointsAwarded = (session as { pointsAwarded?: boolean }).pointsAwarded;
        const userId = session?.user?.id;
        if (sessionPointsAwarded !== undefined) {
          console.log('🔍 Using pointsAwarded from NextAuth session:', sessionPointsAwarded);
          checkAndShowModal(sessionPointsAwarded, userId);
        }
        
        // Then call backend API to refresh tokens and get latest data
        // This ensures tokens are up-to-date and we have latest user info
        setTimeout(() => {
          checkBackendSession();
        }, 1000);
      }
      
      // Store current status for next comparison
      sessionStorage.setItem('previousAuthStatus', 'authenticated');
    } else if (status === 'unauthenticated') {
      // Clear flags when user logs out
      hasCheckedSessionRef.current = false;
      localStorage.removeItem('dailyLoginModalShown');
      localStorage.removeItem('dailyLoginModalShownDate');
      setShowModal(false);
      
      // Store current status for next comparison
      sessionStorage.setItem('previousAuthStatus', 'unauthenticated');
      
      // Clear interval if exists
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
        sessionCheckIntervalRef.current = null;
      }
    }
  }, [session, status, update, checkBackendSession, checkAndShowModal]);

  // Set up periodic session check (every 5 minutes)
  useEffect(() => {
    if (status === 'authenticated' && session) {
      // Clear any existing interval
      if (sessionCheckIntervalRef.current) {
        clearInterval(sessionCheckIntervalRef.current);
      }

      // Set up periodic check every 5 minutes
      sessionCheckIntervalRef.current = setInterval(() => {
        checkBackendSession();
      }, 5 * 60 * 1000); // 5 minutes

      return () => {
        if (sessionCheckIntervalRef.current) {
          clearInterval(sessionCheckIntervalRef.current);
          sessionCheckIntervalRef.current = null;
        }
      };
    }
  }, [session, status, checkBackendSession]);

  // Check session on window focus (when user returns to app)
  // Throttle to prevent too many API calls (max once per 30 seconds)
  useEffect(() => {
    const THROTTLE_MS = 30 * 1000; // 30 seconds

    const handleFocus = () => {
      if (status === 'authenticated' && session) {
        const now = Date.now();
        // Only check if at least 30 seconds have passed since last check
        // Use ref to persist across re-renders
        if (now - lastFocusCheckTimeRef.current >= THROTTLE_MS) {
          lastFocusCheckTimeRef.current = now;
          console.log('✅ Window focused - checking session');
          checkBackendSession();
        } else {
          const timeRemaining = Math.ceil((THROTTLE_MS - (now - lastFocusCheckTimeRef.current)) / 1000);
          console.log(`⏭️ Skipping session check - throttled (${timeRemaining}s remaining)`);
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [session, status, checkBackendSession]);

  const handleClose = () => {
    setShowModal(false);
  };

  return (
    <DailyLoginModal
      isOpen={showModal}
      onClose={handleClose}
    />
  );
}

