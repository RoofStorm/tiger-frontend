// Simple in-memory cache with TTL for daily bonus tracking
// Perfect for short-term projects - no external dependencies needed

type CacheEntry = {
  value: boolean;
  expiresAt: number;
};

class SimpleCache {
  private cache: Map<string, CacheEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Clean up expired entries every 5 minutes
    if (typeof setInterval !== 'undefined') {
      this.cleanupInterval = setInterval(() => {
        this.cleanup();
      }, 5 * 60 * 1000);
    }
  }

  set(key: string, value: boolean, ttlSeconds: number): void {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, { value, expiresAt });
  }

  get(key: string): boolean | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }
}

// Singleton instance - shared across the application
const cache = new SimpleCache();

// Helper function to check if daily bonus was already awarded
export async function checkDailyBonusAwarded(
  userId: string,
  date: string
): Promise<boolean> {
  const cacheKey = `daily_bonus:${userId}:${date}`;
  
  // Check in-memory cache first (fast)
  const cached = cache.get(cacheKey);
  if (cached !== null) {
    return cached;
  }
  
  // Cache miss - return false to trigger database check
  return false;
}

// Helper function to mark daily bonus as awarded
export async function markDailyBonusAwarded(
  userId: string,
  date: string
): Promise<void> {
  const cacheKey = `daily_bonus:${userId}:${date}`;
  
  // Calculate expiration time until end of day + 1 day
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(23, 59, 59, 999); // End of tomorrow
  
  const expirationSeconds = Math.floor(
    (tomorrow.getTime() - today.getTime()) / 1000
  );
  
  // Cache until end of tomorrow
  cache.set(cacheKey, true, expirationSeconds);
}

// Helper function to get today's date string (YYYY-MM-DD)
export function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

