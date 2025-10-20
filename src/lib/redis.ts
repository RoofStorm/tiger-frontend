import { createClient } from 'redis';

// Redis client singleton
let redisClient: ReturnType<typeof createClient> | null = null;

export async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    redisClient.on('error', err => {
      console.error('Redis Client Error:', err);
    });

    await redisClient.connect();
  }

  return redisClient;
}

// Helper function to check if daily bonus was already awarded
export async function checkDailyBonusAwarded(
  userId: string,
  date: string
): Promise<boolean> {
  try {
    const client = await getRedisClient();
    const cacheKey = `daily_bonus:${userId}:${date}`;
    const result = await client.get(cacheKey);
    return result === '1';
  } catch (error) {
    console.error('Error checking daily bonus cache:', error);
    return false; // Fallback to database check if Redis fails
  }
}

// Helper function to mark daily bonus as awarded
export async function markDailyBonusAwarded(
  userId: string,
  date: string
): Promise<void> {
  try {
    const client = await getRedisClient();
    const cacheKey = `daily_bonus:${userId}:${date}`;

    // Calculate expiration time until end of day + 1 day
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999); // End of tomorrow

    const expirationSeconds = Math.floor(
      (tomorrow.getTime() - today.getTime()) / 1000
    );

    // Set with expiration until end of tomorrow
    await client.setEx(cacheKey, expirationSeconds, '1');

    console.log(
      `📅 Daily bonus cache set for ${userId} on ${date}, expires in ${Math.floor(expirationSeconds / 3600)} hours`
    );
  } catch (error) {
    console.error('Error marking daily bonus cache:', error);
    // Don't throw error, just log it
  }
}

// Helper function to get today's date string (YYYY-MM-DD)
export function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}
