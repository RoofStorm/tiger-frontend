import { useEffect, useRef, useCallback } from 'react';
import { CornerAnalytics } from '@/types';
import apiClient from '@/lib/api';

interface CornerTimer {
  corner: number;
  startTime: number;
  isActive: boolean;
}

const ANALYTICS_BATCH_SIZE = 5;
const ANALYTICS_BATCH_DELAY = 10000; // 10 seconds

export function useCornerAnalytics() {
  const timers = useRef<Map<number, CornerTimer>>(new Map());
  const analyticsQueue = useRef<CornerAnalytics[]>([]);
  const batchTimeout = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback((corner: number) => {
    const existingTimer = timers.current.get(corner);
    if (existingTimer?.isActive) return;

    timers.current.set(corner, {
      corner,
      startTime: Date.now(),
      isActive: true,
    });
  }, []);

  const stopTimer = useCallback((corner: number) => {
    const timer = timers.current.get(corner);
    if (!timer || !timer.isActive) return;

    const durationSec = Math.floor((Date.now() - timer.startTime) / 1000);
    
    // Only track if user spent at least 3 seconds in the corner
    if (durationSec >= 3) {
      const analyticsEvent: CornerAnalytics = {
        corner,
        durationSec,
        timestamp: new Date().toISOString(),
      };

      analyticsQueue.current.push(analyticsEvent);
      
      // Send batch if we reach the batch size
      if (analyticsQueue.current.length >= ANALYTICS_BATCH_SIZE) {
        sendAnalyticsBatch();
      } else {
        // Set timeout to send batch after delay
        if (batchTimeout.current) {
          clearTimeout(batchTimeout.current);
        }
        batchTimeout.current = setTimeout(sendAnalyticsBatch, ANALYTICS_BATCH_DELAY);
      }
    }

    timer.isActive = false;
  }, []);

  const sendAnalyticsBatch = useCallback(async () => {
    if (analyticsQueue.current.length === 0) return;

    try {
      await apiClient.trackCornerAnalytics([...analyticsQueue.current]);
      analyticsQueue.current = [];
    } catch (error) {
      console.error('Failed to send analytics:', error);
      // Keep events in queue for retry
    }

    if (batchTimeout.current) {
      clearTimeout(batchTimeout.current);
      batchTimeout.current = null;
    }
  }, []);

  // Send remaining analytics on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (analyticsQueue.current.length > 0) {
        // Use sendBeacon for reliable delivery on page unload
        const data = JSON.stringify({ events: analyticsQueue.current });
        navigator.sendBeacon(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/analytics/corners`,
          data
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (batchTimeout.current) {
        clearTimeout(batchTimeout.current);
      }
    };
  }, []);

  return {
    startTimer,
    stopTimer,
  };
}

