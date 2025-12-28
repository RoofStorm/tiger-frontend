import { useEffect, useRef, RefObject } from 'react';
import Analytics from '@/lib/analytics';

interface UseZoneViewOptions {
  page: string;
  zone: string;
  enabled?: boolean;
  threshold?: number; // IntersectionObserver threshold (0-1)
  rootMargin?: string; // IntersectionObserver rootMargin
  minViewDuration?: number; // Minimum duration in ms to count as view (default: 1500ms)
}

/**
 * Hook để track zone view time sử dụng IntersectionObserver
 * 
 * Flow:
 * Zone enter → startTimer(key)
 * Zone leave → endTimer(key) → track zone_view với duration
 * 
 * Usage:
 * const zoneRef = useRef<HTMLDivElement>(null);
 * useZoneView(zoneRef, {
 *   page: "challenge",
 *   zone: "zoneB2"
 * });
 * 
 * <div ref={zoneRef}>Zone content</div>
 */
export function useZoneView<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T | null>,
  options: UseZoneViewOptions
): void {
  const {
    page,
    zone,
    enabled = true,
    threshold = 0.5, // 50% visible
    rootMargin = '0px',
    minViewDuration = 1500, // 1.5 seconds
  } = options;

  const timerKey = `${page}:${zone}`;
  const hasStartedRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled || !ref.current) return;

    const element = ref.current;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const isIntersecting = entry.isIntersecting && entry.intersectionRatio >= threshold;

          if (isIntersecting && !hasStartedRef.current) {
            // Zone entered viewport - start timer sau khi đủ thời gian
            hasStartedRef.current = true;
            
            timeoutRef.current = setTimeout(() => {
              // Chỉ start timer nếu vẫn còn trong viewport
              if (hasStartedRef.current) {
                Analytics.startTimer(timerKey);
              }
            }, minViewDuration);
          } else if (!isIntersecting && hasStartedRef.current) {
            // Zone left viewport - end timer và track
            hasStartedRef.current = false;

            // Clear pending start timeout
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }

            // End timer và track zone_view với duration
            const duration = Analytics.endTimer(timerKey);
            if (duration !== null) {
              Analytics.track({
                page,
                zone,
                action: 'zone_view',
                value: duration,
              });
            }
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();

      // Clear timeout nếu có
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Track zone_view khi component unmount nếu đang trong view
      if (hasStartedRef.current) {
        const duration = Analytics.endTimer(timerKey);
        if (duration !== null) {
          Analytics.track({
            page,
            zone,
            action: 'zone_view',
            value: duration,
          });
        }
        hasStartedRef.current = false;
      }
    };
  }, [ref, page, zone, enabled, threshold, rootMargin, minViewDuration, timerKey]);
}

