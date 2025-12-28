import { useCallback } from 'react';
import Analytics from '@/lib/analytics';
import { AnalyticsEvent } from '@/types';

/**
 * Hook để sử dụng analytics trong components
 * 
 * Usage:
 * const { track, trackPageView } = useAnalytics();
 * 
 * track({
 *   page: "challenge",
 *   zone: "zoneB2",
 *   component: "button",
 *   action: "click",
 *   metadata: { label: "tham_gia_ngay" }
 * });
 */
export function useAnalytics() {
  /**
   * Track một event
   */
  const track = useCallback((event: Omit<AnalyticsEvent, 'ts'>) => {
    Analytics.track(event);
  }, []);

  /**
   * Track page view
   */
  const trackPageView = useCallback((page: string) => {
    Analytics.track({
      page,
      action: 'page_view',
    });
  }, []);

  /**
   * Track click action
   */
  const trackClick = useCallback(
    (
      page: string,
      options: {
        zone?: string;
        component?: string;
        metadata?: Record<string, unknown>;
      }
    ) => {
      Analytics.track({
        page,
        zone: options.zone,
        component: options.component || 'button',
        action: 'click',
        metadata: options.metadata,
      });
    },
    []
  );

  /**
   * Track funnel step (start, submit, complete)
   */
  const trackFunnelStep = useCallback(
    (
      page: string,
      zone: string,
      component: string,
      action: 'start' | 'submit' | 'complete',
      metadata?: Record<string, unknown>
    ) => {
      Analytics.track({
        page,
        zone,
        component,
        action,
        metadata,
      });
    },
    []
  );

  return {
    track,
    trackPageView,
    trackClick,
    trackFunnelStep,
  };
}

