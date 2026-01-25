'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Analytics, { AnalyticsService } from '@/lib/analytics';

/**
 * AnalyticsProvider - Khởi tạo analytics khi app load
 * Thêm vào Providers component
 */
export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();

  useEffect(() => {
    // Chỉ init một lần khi component mount
    if (typeof window === 'undefined') return;

    const sessionId = AnalyticsService.getOrCreateSessionId();
    const userId = session?.user?.id || null;

    // Get device info
    const device = typeof navigator !== 'undefined' 
      ? `${navigator.userAgent} - ${navigator.platform}`
      : 'unknown';

    // Get referrer
    const referrer = typeof document !== 'undefined' 
      ? document.referrer || undefined
      : undefined;

    Analytics.init({
      sessionId,
      userId,
      device,
      referrer,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy một lần khi mount - session?.user?.id không cần thiết vì init chỉ chạy 1 lần

  // Update userId khi session thay đổi
  useEffect(() => {
    const userId = session?.user?.id || null;
    Analytics.updateUserId(userId);
  }, [session?.user?.id]);

  // Track page view khi route change
  useEffect(() => {
    if (!pathname) return;

    const currentPage = getPageFromPathname(pathname);
    if (!currentPage) return;

    // 1. Gửi page_view ngay khi vào trang (để đảm bảo có event gửi đi, backend có thể đếm session)
    Analytics.track({
      page: currentPage,
      action: 'page_view',
    });

    // 2. Bắt đầu đếm giờ cho trang mới (để track duration khi rời trang)
    const timerKey = `page:${currentPage}`;
    Analytics.startTimer(timerKey);

    return () => {
      // 3. Khi rời trang (unmount hoặc pathname change), gửi page_view_end kèm duration
      const duration = Analytics.endTimer(timerKey);
      
      // Chỉ gửi nếu có thời gian hợp lệ (>= 1s) để track time on page
      if (duration !== null && duration >= 1) {
        Analytics.track({
          page: currentPage,
          action: 'page_view_end',
          value: duration,
        });
      }
    };
  }, [pathname]);

  return <>{children}</>;
}

function getPageFromPathname(pathname: string): string | null {
  const path = pathname.replace(/^\//, '');

  if (path === '' || path === 'home') return 'welcome';
  if (path === 'nhip-song' || path === 'emoji') return 'emoji';
  if (path === 'thu-thach-giu-nhip' || path === 'challenge') return 'challenge';
  if (path === 'nhip-bep') return 'nhip-bep';
  if (path === 'doi-qua' || path === 'rewards') return 'doi-qua';
  if (path === 'profile') return 'profile';

  return path || null;
}

