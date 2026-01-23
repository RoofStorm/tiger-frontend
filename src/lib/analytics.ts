import { AnalyticsEvent, AnalyticsInitOptions } from '@/types';
import { getSession } from 'next-auth/react';
import apiClient from './api';
import { fetchWithCredentials } from './fetch';

// Constants
const ANALYTICS_BATCH_SIZE = 30; // Gửi khi queue >= 30 events
const ANALYTICS_BATCH_DELAY = 15000; // 15 giây
const MIN_ZONE_VIEW_DURATION = 1500; // 1.5 giây minimum để tính là view

// Session ID storage key
const SESSION_ID_KEY = 'analytics_session_id';
const SESSION_TIMESTAMP_KEY = 'analytics_session_timestamp';
const SESSION_TIMEOUT_MS = 5 * 60 * 1000; // 5 phút - session expire sau 5 phút không hoạt động

class AnalyticsService {
  private sessionId: string | null = null;
  private userId: string | null = null;
  private eventQueue: AnalyticsEvent[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private timers: Map<string, number> = new Map(); // key -> startTime
  private isInitialized = false;

  /**
   * Khởi tạo analytics service
   * Gọi khi app load, trước khi render trang đầu tiên
   */
  init(options: AnalyticsInitOptions): void {
    if (this.isInitialized) return;

    this.sessionId = options.sessionId;
    this.userId = options.userId || null;
    this.isInitialized = true;

    // Setup periodic flush
    this.setupPeriodicFlush();

    // Setup beforeunload handler
    this.setupBeforeUnloadHandler();

    // Setup visibility change handler (tab hidden)
    this.setupVisibilityChangeHandler();
  }

  /**
   * Track một event
   * Chỉ push vào queue, chưa gửi API
   */
  track(event: Omit<AnalyticsEvent, 'ts'>): void {
    if (!this.isInitialized) {
      console.warn('Analytics not initialized. Call Analytics.init() first.');
      return;
    }

    const eventWithTimestamp: AnalyticsEvent = {
      ...event,
      ts: Math.floor(Date.now() / 1000), // Unix timestamp in seconds
    };

    this.eventQueue.push(eventWithTimestamp);

    // Gửi ngay nếu đạt batch size
    if (this.eventQueue.length >= ANALYTICS_BATCH_SIZE) {
      this.flush();
    } else {
      // Reset timeout để gửi sau delay
      this.resetBatchTimeout();
    }
  }

  /**
   * Start timer với key
   * Dùng cho zone view hoặc các timer khác
   */
  startTimer(key: string): void {
    if (this.timers.has(key)) return; // Đã start rồi
    this.timers.set(key, Date.now());
  }

  /**
   * End timer và trả về duration (seconds)
   * Nếu duration < MIN_ZONE_VIEW_DURATION thì return null
   */
  endTimer(key: string): number | null {
    const startTime = this.timers.get(key);
    if (!startTime) return null; // Chưa có start

    const durationMs = Date.now() - startTime;
    const durationSec = Math.floor(durationMs / 1000);
    this.timers.delete(key);

    // Chỉ return nếu duration >= threshold
    if (durationMs >= MIN_ZONE_VIEW_DURATION) {
      return durationSec;
    }

    return null;
  }

  /**
   * Gửi batch events lên BE
   */
  async flush(options?: { useBeacon?: boolean }): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    // Clear timeout
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    // API spec: chỉ gửi sessionId và events (không gửi userId)
    const payload = {
      sessionId: this.sessionId!,
      events,
    };

    try {
      if (options?.useBeacon && typeof window !== 'undefined') {
        // Use fetch with keepalive for page unload (supports custom headers unlike sendBeacon)
        const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api'}/analytics/events`;
        
        // Get session to add Authorization header if logged in
        const session = await getSession();
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        
        if (session?.user) {
          // Get accessToken from session
          const accessToken = session.accessToken;
          if (accessToken) {
            headers.Authorization = `Bearer ${accessToken}`;
          } else if (session.user.id) {
            // Fallback to user ID if accessToken not available
            headers.Authorization = `Bearer ${session.user.id}`;
          }
        }
        
        // Use fetch with keepalive (works like sendBeacon but supports headers)
        fetchWithCredentials(apiUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
          keepalive: true, // Ensures request completes even if page is unloading
        }).catch(error => {
          // Silently fail for beacon requests - don't log errors on page unload
          if (process.env.NODE_ENV === 'development') {
            console.warn('Analytics beacon failed:', error);
          }
        });
      } else {
        // Normal API call (will include Authorization header via apiClient interceptor)
        const response = await apiClient.trackAnalyticsEvents(payload);
        // Response: { message: "Events queued", count: number }
        if (process.env.NODE_ENV === 'development') {
          console.log(`Analytics: ${response.message}, ${response.count} events sent`);
        }
      }
    } catch (error: unknown) {
      console.error('Failed to send analytics batch:', error);
      
      // Handle specific error cases
      const errorWithResponse = error as { response?: { status?: number; data?: unknown } };
      if (errorWithResponse?.response?.status === 400) {
        // Bad request - don't retry, log and discard
        console.error('Analytics validation error:', errorWithResponse.response.data);
      } else {
        // Network or server error - put events back to queue for retry
        // Limit to prevent memory issues
        if (this.eventQueue.length < 100) {
          this.eventQueue.unshift(...events);
        }
      }
    }
  }

  /**
   * Setup periodic flush (mỗi 15 giây)
   */
  private setupPeriodicFlush(): void {
    if (typeof window === 'undefined') return;

    setInterval(() => {
      this.flush();
    }, ANALYTICS_BATCH_DELAY);
  }

  /**
   * Setup beforeunload handler để gửi events khi user rời trang
   */
  private setupBeforeUnloadHandler(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('beforeunload', () => {
      this.flush({ useBeacon: true });
    });
  }

  /**
   * Setup visibility change handler để gửi events khi tab hidden
   */
  private setupVisibilityChangeHandler(): void {
    if (typeof document === 'undefined') return;

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Tab hidden - flush events
        this.flush();
      }
    });
  }

  /**
   * Reset batch timeout
   */
  private resetBatchTimeout(): void {
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    this.batchTimeout = setTimeout(() => {
      this.flush();
    }, ANALYTICS_BATCH_DELAY);
  }

  /**
   * Update user ID khi user login/logout
   */
  updateUserId(userId: string | null): void {
    this.userId = userId;
  }

  /**
   * Get or create session ID (UUID format)
   * Session sẽ expire sau 5 phút không hoạt động hoặc khi đóng tab
   * Dùng sessionStorage để mỗi lần mở tab mới = session mới
   */
  static getOrCreateSessionId(): string {
    if (typeof window === 'undefined') {
      // Server-side: generate simple ID
      return `server-${Date.now()}`;
    }

    const now = Date.now();
    const storedSessionId = sessionStorage.getItem(SESSION_ID_KEY);
    const storedTimestamp = sessionStorage.getItem(SESSION_TIMESTAMP_KEY);
    
    // Kiểm tra nếu sessionId tồn tại và chưa expire
    if (storedSessionId && storedTimestamp) {
      const sessionAge = now - parseInt(storedTimestamp, 10);
      
      // Nếu session còn hiệu lực (< 5 phút), dùng lại
      if (sessionAge < SESSION_TIMEOUT_MS) {
        // Cập nhật timestamp mỗi lần truy cập để reset timeout
        sessionStorage.setItem(SESSION_TIMESTAMP_KEY, now.toString());
        return storedSessionId;
      }
      
      // Session đã expire, xóa và tạo mới
      sessionStorage.removeItem(SESSION_ID_KEY);
      sessionStorage.removeItem(SESSION_TIMESTAMP_KEY);
    }

    // Tạo sessionId mới
    let sessionId: string;
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      // Use native crypto.randomUUID if available
      sessionId = crypto.randomUUID();
    } else {
      // Fallback: generate UUID-like string
      sessionId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    }
    
    // Lưu sessionId và timestamp vào sessionStorage
    // sessionStorage tự xóa khi đóng tab → mỗi lần mở tab mới = session mới
    sessionStorage.setItem(SESSION_ID_KEY, sessionId);
    sessionStorage.setItem(SESSION_TIMESTAMP_KEY, now.toString());

    return sessionId;
  }

  /**
   * Clear session ID from sessionStorage and reset in-memory ID
   */
  static clearSessionId(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(SESSION_ID_KEY);
      sessionStorage.removeItem(SESSION_TIMESTAMP_KEY);
    }
  }

  /**
   * Reset session ID to a new one
   */
  resetSession(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(SESSION_ID_KEY);
      sessionStorage.removeItem(SESSION_TIMESTAMP_KEY);
      this.sessionId = AnalyticsService.getOrCreateSessionId();
    }
  }
}

// Export singleton instance
export const Analytics = new AnalyticsService();
export { AnalyticsService };
export default Analytics;

