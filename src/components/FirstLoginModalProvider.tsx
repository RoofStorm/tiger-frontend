'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useSession, getSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { useVideoOptional } from '@/contexts/VideoContext';
import { FirstLoginModal } from './FirstLoginModal';

export function FirstLoginModalProvider() {
  const { data: session, status, update } = useSession();
  const pathname = usePathname();
  const videoContext = useVideoOptional();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hasCheckedSessionRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isCheckingRef = useRef(false);
  const pendingFirstLoginRef = useRef<{ isFirstLogin: boolean; userId?: string } | null>(null);

  const checkAndShowModal = useCallback(async (isFirstLogin: boolean, userId: string) => {
    if (!userId) return;

    const hasShownForUser = localStorage.getItem(`firstLoginModalShown_${userId}`) === 'true';

    console.log('[FirstLoginModal] Checking:', {
      isFirstLogin,
      userId,
      hasShownForUser,
      isModalOpen,
    });

    // If flag is already set, don't show modal (even on F5)
    if (hasShownForUser) {
      console.log('[FirstLoginModal] Already shown for this user, skipping');
      return;
    }

    // Check if we're on a blocking page (with video)
    const isBlockingPage = pathname === '/' || pathname === '/thu-thach-giu-nhip' || pathname === '/video';
    const isContentReady = isBlockingPage ? (videoContext ? videoContext.isContentReady : true) : true;
    const isVideoPlaying = isBlockingPage ? (videoContext ? videoContext.isVideoPlaying : false) : false;

    // If video is playing or content is not ready, store pending and return
    if (isVideoPlaying || !isContentReady) {
      if (isFirstLogin === true) {
        pendingFirstLoginRef.current = { isFirstLogin: true, userId };
        console.log('[FirstLoginModal] Video is playing or content not ready, storing pending');
      }
      return;
    }

    // Clear pending since we can show now
    pendingFirstLoginRef.current = null;

    // If isFirstLogin = true and we haven't shown it yet, show modal
    if (isFirstLogin === true && !isModalOpen) {
      console.log('[FirstLoginModal] Will show modal');
      // Use a small delay to ensure UI is ready
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
      checkTimeoutRef.current = setTimeout(() => {
        setIsModalOpen(true);
        // Set flag immediately when showing modal
        localStorage.setItem(`firstLoginModalShown_${userId}`, 'true');
        console.log('[FirstLoginModal] Modal shown and marked as shown');
      }, 500);
    } else if (isFirstLogin === false) {
      // If backend says false, close modal if open and mark as shown
      if (isModalOpen) {
        console.log('[FirstLoginModal] Closing modal because isFirstLogin is false');
        setIsModalOpen(false);
      }
      // Mark as shown to prevent showing again
      localStorage.setItem(`firstLoginModalShown_${userId}`, 'true');
    }
  }, [isModalOpen, pathname, videoContext]);

  const checkBackendSession = useCallback(async () => {
    if (status !== 'authenticated' || !session?.user) {
      return;
    }

    // Prevent multiple simultaneous checks
    if (isCheckingRef.current) {
      console.log('[FirstLoginModal] Already checking, skipping...');
      return;
    }

    isCheckingRef.current = true;

    try {
      const sessionData = await apiClient.getSession();

      if (sessionData) {
        const userId = sessionData.user?.id;
        if (!userId) {
          isCheckingRef.current = false;
          return;
        }

        // Update userId in localStorage
        localStorage.setItem('userId', userId);

        // Update lastUserIdRef
        if (userId !== lastUserIdRef.current) {
          lastUserIdRef.current = userId;
        }

        const isFirstLogin = sessionData.isFirstLogin || false;

        console.log('[FirstLoginModal] Backend session check:', {
          backendIsFirstLogin: isFirstLogin,
          userId,
        });

        // Check and show modal based on backend response (source of truth)
        await checkAndShowModal(isFirstLogin, userId);
      }
    } catch (error) {
      console.error('Error checking backend session for first login:', error);
      const errorStatus = (error as { response?: { status?: number } })?.response?.status;
      if (errorStatus === 401) {
        // Clear flags on unauthorized
        if (lastUserIdRef.current) {
          localStorage.removeItem(`firstLoginModalShown_${lastUserIdRef.current}`);
        }
        lastUserIdRef.current = null;
      }
    } finally {
      isCheckingRef.current = false;
    }
  }, [status, session?.user, checkAndShowModal]);

  useEffect(() => {
    if (status === 'authenticated' && session) {
      const userId = session.user?.id;
      if (!userId) return;

      // Check if this is a new user
      const isNewUser = userId !== lastUserIdRef.current;
      if (isNewUser) {
        lastUserIdRef.current = userId;
        hasCheckedSessionRef.current = false;
        // Don't clear flag here - only clear on logout
      }

      // Check from NextAuth session first (faster)
      const isFirstLoginFromSession = (session as { isFirstLogin?: boolean })?.isFirstLogin;
      const hasShownForUser = localStorage.getItem(`firstLoginModalShown_${userId}`) === 'true';

      // If NextAuth session has isFirstLogin and we haven't shown modal yet, check it
      if (isFirstLoginFromSession !== undefined && !hasCheckedSessionRef.current) {
        console.log('[FirstLoginModal] Session check:', {
          isFirstLoginFromSession,
          hasShownForUser,
          isModalOpen,
          userId,
        });

        // Only show from NextAuth session if flag is not set
        if (isFirstLoginFromSession === true && !hasShownForUser && !isModalOpen) {
          console.log('[FirstLoginModal] Found isFirstLogin from NextAuth session, showing modal');
          checkAndShowModal(true, userId);
        }
      }

      const previousStatus = sessionStorage.getItem('previousAuthStatus');
      const isNewLogin = previousStatus === 'unauthenticated' || previousStatus === null;
      
      // Also check backend session for sync (but won't show if flag is already set)
      if (isNewLogin || !hasCheckedSessionRef.current) {
        hasCheckedSessionRef.current = true;
        
        // Check backend session for fresh data (source of truth)
        checkBackendSession();
      }
      
      sessionStorage.setItem('previousAuthStatus', 'authenticated');
    } else if (status === 'unauthenticated') {
      hasCheckedSessionRef.current = false;
      lastUserIdRef.current = null;
      isCheckingRef.current = false;
      setIsModalOpen(false);
      
      // Clear flag only on logout
      const userId = localStorage.getItem('userId');
      if (userId) {
        localStorage.removeItem(`firstLoginModalShown_${userId}`);
        console.log('[FirstLoginModal] Logged out, cleared flag');
      }
      
      // Also clear all firstLoginModalShown flags (cleanup)
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('firstLoginModalShown_')) {
          localStorage.removeItem(key);
        }
      });
      
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
        checkTimeoutRef.current = null;
      }
      
      sessionStorage.setItem('previousAuthStatus', 'unauthenticated');
    }
  }, [session, status, checkBackendSession, checkAndShowModal]);

  // Periodically check backend session (similar to DailyLoginModalProvider)
  useEffect(() => {
    if (status === 'authenticated' && session) {
      const interval = setInterval(() => {
        checkBackendSession();
      }, 5 * 60 * 1000); // Check every 5 minutes

      return () => {
        clearInterval(interval);
      };
    }
  }, [session, status, checkBackendSession]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, []);

  // Show pending modal when leaving blocking page
  useEffect(() => {
    const isBlockingPage = pathname === '/' || pathname === '/thu-thach-giu-nhip' || pathname === '/video';
    
    if (!isBlockingPage && pendingFirstLoginRef.current) {
      const { isFirstLogin, userId } = pendingFirstLoginRef.current;
      if (userId) {
        checkAndShowModal(isFirstLogin, userId);
        pendingFirstLoginRef.current = null;
      }
    }
  }, [pathname, checkAndShowModal]);

  // Show pending modal when video finishes on blocking page
  useEffect(() => {
    const isBlockingPage = pathname === '/' || pathname === '/thu-thach-giu-nhip' || pathname === '/video';
    if (!isBlockingPage || !pendingFirstLoginRef.current) return;
    
    const isContentReady = videoContext?.isContentReady;
    const isVideoPlaying = videoContext?.isVideoPlaying;
    
    if (isContentReady && !isVideoPlaying) {
      const { isFirstLogin, userId } = pendingFirstLoginRef.current;
      if (isFirstLogin && userId) {
        checkAndShowModal(isFirstLogin, userId);
        pendingFirstLoginRef.current = null;
      }
    }
  }, [videoContext, checkAndShowModal, pathname]);

  const handleClose = () => {
    setIsModalOpen(false);
    // Mark as shown when user closes modal
    if (lastUserIdRef.current) {
      localStorage.setItem(`firstLoginModalShown_${lastUserIdRef.current}`, 'true');
    }
  };

  return <FirstLoginModal isOpen={isModalOpen} onClose={handleClose} />;
}
