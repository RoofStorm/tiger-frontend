export interface Post {
  id: string;
  caption?: string;
  imageUrl?: string;
  likeCount?: number;
  isLiked?: boolean;
  user?: {
    name?: string;
    avatarUrl?: string;
  };
}

export interface PostsFeedParams {
  cursor?: string;
  direction?: 'next' | 'prev';
  limit?: number;
  type?: string;
}

export interface PaginationInfo {
  hasNext: boolean;
  hasPrev: boolean;
  nextCursor?: string;
  prevCursor?: string;
}

export interface PostsFeedResponse {
  success: boolean;
  data: {
    posts: Post[];
    pagination: PaginationInfo;
  };
  message: string;
}

export interface LikePostResponse {
  success: boolean;
  data: {
    action: 'liked' | 'unliked';
    liked: boolean;
  };
  message: string;
}

