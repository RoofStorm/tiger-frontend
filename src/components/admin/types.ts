export type TabType =
  | 'overview'
  | 'users'
  | 'rewards'
  | 'posts'
  | 'redeems'
  | 'wishes'
  | 'analytics'
  | 'settings';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  points: number;
  loginMethod: string;
}

export interface Post {
  id: string;
  caption: string;
  type: string;
  likeCount: number;
  shareCount: number;
  commentCount: number;
  isHighlighted: boolean;
  user?: {
    name: string;
  };
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  imageUrl?: string;
  isActive: boolean;
}

export interface FilterState {
  role?: string;
  status?: string;
  type?: string;
}

export interface AnalyticsItem {
  id: string;
  corner: number;
  duration: number;
  createdAt: string;
  userId?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CornerStats {
  corner: number;
  totalVisits: number;
  totalDuration: number;
  avgDuration: number;
  cornerName: string;
}

export interface UserDateStats {
  userId: string;
  userName: string;
  userEmail?: string;
  date: string;
  corners: Record<number, number>;
}

export interface Wish {
  id: string;
  userId: string;
  content: string;
  isHighlighted: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface AdminRedeemItem {
  id: string;
  status: string;
  pointsUsed: number;
  createdAt: string;
  updatedAt: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  reward?: {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
  };
}
