'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { DailyLoginModal } from './DailyLoginModal';
import { apiClient } from '@/lib/api';

export function DailyLoginModalProvider() {
  const { data: session, status, update } = useSession();
  const [showModal, setShowModal] = useState(false);
  const sessionCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasCheckedSessionRef = useRef(false);

  // Function to check and show modal based on pointsAwarded
  const checkAndShowModal = (pointsAwarded: boolean) => {
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
  };

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
        // Update tokens in localStorage
        if (sessionData.accessToken) {
          localStorage.setItem('accessToken', sessionData.accessToken);
        }
        if (sessionData.refreshToken) {
          localStorage.setItem('refreshToken', sessionData.refreshToken);
        }
        if (sessionData.user?.id) {
          localStorage.setItem('userId', sessionData.user.id);
        }

        // Trigger NextAuth session update to refresh session data
        // NextAuth will automatically pick up tokens from localStorage via interceptors
        await update();

        // Check pointsAwarded and show modal
        // Always check if pointsAwarded changed (e.g., user got daily bonus while app was open)
        checkAndShowModal(sessionData.pointsAwarded || false);
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
  }, [status, session?.user, update]);

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
        if (sessionPointsAwarded !== undefined) {
          console.log('🔍 Using pointsAwarded from NextAuth session:', sessionPointsAwarded);
          checkAndShowModal(sessionPointsAwarded);
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
  }, [session, status, update, checkBackendSession]);

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
  useEffect(() => {
    const handleFocus = () => {
      if (status === 'authenticated' && session) {
        checkBackendSession();
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

