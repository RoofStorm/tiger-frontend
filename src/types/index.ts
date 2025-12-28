// User and Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  points: number;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

// NextAuth Types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      role: 'USER' | 'ADMIN';
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    image?: string;
    role: 'USER' | 'ADMIN';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: 'USER' | 'ADMIN';
  }
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// Corner Types
export interface CornerAnalytics {
  corner: number;
  durationSec: number;
  timestamp: string;
}

// Analytics Event Types
export interface AnalyticsEvent {
  page: string; // welcome, emoji, challenge, nhip-bep, doi-qua, profile
  zone?: string; // overview, zoneA, zoneB, zoneB1, zoneB2
  component?: string; // button, card, image, showcase, upload, form
  action: string; // view, click, submit, start, complete, page_view, zone_view, view_start, view_end
  value?: number; // duration (sec), count, step index
  metadata?: Record<string, unknown>; // productId, challengeId, imageId, etc.
  ts?: number; // timestamp
}

export interface AnalyticsBatchPayload {
  sessionId: string;
  events: AnalyticsEvent[];
}

export interface AnalyticsInitOptions {
  sessionId: string;
  userId?: string | null;
  device?: string;
  referrer?: string;
}

export interface EmojiSelection {
  id: string;
  emoji: string;
  label: string;
  imageUrl?: string;
}

// Mood Card Types
export interface MoodCard {
  id: string;
  emojis: EmojiSelection[];
  whisper: string;
  reminder: string;
  imageUrl?: string;
  createdAt: string;
  userId: string;
}

export interface WhisperData {
  id: string;
  text: string;
  category: string;
}

export interface ReminderData {
  id: string;
  text: string;
  category: string;
}

// Post Types
export interface Post {
  id: string;
  userId: string;
  user: User;
  imageUrl: string;
  caption: string;
  likeCount: number;
  shareCount: number;
  commentCount: number;
  isLiked: boolean;
  isHighlighted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePostData {
  imageUrl: string;
  caption: string;
}

// Reward Types
export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  lifeRequired?: number;
  imageUrl: string;
  isActive: boolean;
  maxPerUser?: number;
  createdAt: string;
}

export interface RedeemRequest {
  id: string;
  userId: string;
  user: User;
  rewardId: string;
  reward: Reward;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  pointsUsed: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRedeemData {
  rewardId: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Upload Types
export interface UploadResponse {
  url: string;
  publicId: string;
}

export interface SignedUrlResponse {
  signedUrl: string;
  publicUrl: string;
  fields: Record<string, string>;
}

// Share Types
export interface ShareData {
  type: 'mood_card' | 'post';
  itemId: string;
  imageUrl: string;
  title: string;
  description: string;
}

// Admin Types
export interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  totalRedeems: number;
  totalPointsAwarded: number;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: string;
  }>;
}
