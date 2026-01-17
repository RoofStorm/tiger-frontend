import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useNextAuth } from '@/hooks/useNextAuth';
import apiClient from '@/lib/api';
import type { Post, PostsFeedResponse, LikePostResponse } from '../carousel.types';

interface UsePostLikesOptions {
  posts: Post[];
}

/**
 * Hook to manage post likes with optimistic updates
 * Uses onMutate pattern for proper React Query optimistic updates
 * Single source of truth: local state (likedPosts, likeCounts)
 */
export function usePostLikes({ posts }: UsePostLikesOptions) {
  const { isAuthenticated } = useNextAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Single source of truth for like state
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [likeCounts, setLikeCounts] = useState<Map<string, number>>(new Map());

  // Initialize and sync local state from server data
  useEffect(() => {
    const newCounts = new Map<string, number>();
    const newLikedPosts = new Set<string>();

    posts.forEach((post) => {
      // Always sync likeCount from server (server is source of truth for counts)
      if (post.likeCount !== undefined) {
        newCounts.set(post.id, post.likeCount);
      } else {
        newCounts.set(post.id, 0);
      }

      // Sync likedPosts from server
      if (post.isLiked === true) {
        newLikedPosts.add(post.id);
      }
    });

    // Update likeCounts - always sync from server (server is source of truth)
    setLikeCounts((prev) => {
      const merged = new Map(prev);
      newCounts.forEach((count, id) => {
        // Always update from server data to ensure sync
        merged.set(id, count);
      });
      return merged;
    });

    // Update likedPosts - merge with server data
    setLikedPosts((prev) => {
      const merged = new Set(prev);
      // Add server likes
      newLikedPosts.forEach((id) => merged.add(id));
      // Remove likes that are no longer liked on server
      merged.forEach((id) => {
        if (!newLikedPosts.has(id) && posts.some((p) => p.id === id && p.isLiked === false)) {
          merged.delete(id);
        }
      });
      return merged;
    });
  }, [posts]);

  // Like mutation with optimistic updates
  const likeMutation = useMutation({
    mutationFn: (postId: string) => apiClient.likePost(postId) as Promise<LikePostResponse>,
    onMutate: async (postId) => {
      // Cancel outgoing refetches for all post queries
      await queryClient.cancelQueries({ queryKey: ['highlighted-posts-carousel'] });
      await queryClient.cancelQueries({ queryKey: ['grid-posts'] });

      // Snapshot previous values for rollback and determine current state
      let previousLikedPosts: Set<string>;
      let previousLikeCounts: Map<string, number>;
      let isCurrentlyLiked = false;
      let currentCount = 0;
      
      setLikedPosts((prev) => {
        previousLikedPosts = new Set(prev);
        isCurrentlyLiked = prev.has(postId);
        const newSet = new Set(prev);
        if (isCurrentlyLiked) {
          newSet.delete(postId);
        } else {
          newSet.add(postId);
        }
        return newSet;
      });

      setLikeCounts((prev) => {
        previousLikeCounts = new Map(prev);
        currentCount = prev.get(postId) ?? 0;
        const newCounts = new Map(prev);
        if (isCurrentlyLiked) {
          newCounts.set(postId, Math.max(0, currentCount - 1));
        } else {
          newCounts.set(postId, currentCount + 1);
        }
        return newCounts;
      });

      const previousQueryDataCarousel = queryClient.getQueryData<{ pages: PostsFeedResponse[] }>([
        'highlighted-posts-carousel',
      ]);
      const previousQueryDataGrid = queryClient.getQueryData<{ pages: PostsFeedResponse[] }>([
        'grid-posts',
      ]);

      // Optimistically update query cache for all post queries
      const updateQueryCache = (queryKey: string[]) => {
        queryClient.setQueryData<{ pages: PostsFeedResponse[] }>(
          queryKey,
          (oldData) => {
            if (!oldData?.pages) return oldData;

            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                data: {
                  ...page.data,
                  posts: page.data?.posts?.map((post) => {
                    if (post.id === postId) {
                      const postLikeCount = post.likeCount ?? 0;
                      return {
                        ...post,
                        likeCount: isCurrentlyLiked
                          ? Math.max(0, postLikeCount - 1)
                          : postLikeCount + 1,
                        isLiked: !isCurrentlyLiked,
                      };
                    }
                    return post;
                  }),
                },
              })),
            };
          }
        );
      };

      updateQueryCache(['highlighted-posts-carousel']);
      updateQueryCache(['grid-posts']);

      return {
        previousLikedPosts: previousLikedPosts!,
        previousLikeCounts: previousLikeCounts!,
        previousQueryDataCarousel,
        previousQueryDataGrid,
      };
    },
    onError: (_err, _postId, context) => {
      // Rollback on error
      if (context) {
        setLikedPosts(context.previousLikedPosts);
        setLikeCounts(context.previousLikeCounts);
        if (context.previousQueryDataCarousel) {
          queryClient.setQueryData(['highlighted-posts-carousel'], context.previousQueryDataCarousel);
        }
        if (context.previousQueryDataGrid) {
          queryClient.setQueryData(['grid-posts'], context.previousQueryDataGrid);
        }
      }

      toast({
        title: 'Lỗi',
        description: 'Không thể thích bài viết. Vui lòng thử lại.',
        variant: 'destructive',
        duration: 4000,
      });
    },
    onSuccess: (response) => {
      // Extract action from response
      // Response structure can be: { action: 'liked' } or { data: { action: 'liked' } }
      const responseData = response?.data || response;
      const action = responseData?.action || (responseData?.liked === true ? 'liked' : 'unliked');

      // Show toast
      if (action === 'liked') {
        toast({
          title: 'Đã thích bài viết!',
          description: 'Cảm ơn bạn đã chia sẻ cảm xúc.',
          duration: 3000,
        });
      } else if (action === 'unliked') {
        toast({
          title: 'Đã bỏ thích bài viết',
          description: 'Bạn đã bỏ thích bài viết này.',
          duration: 3000,
        });
      }
    },
    onSettled: () => {
      // Invalidate to sync with server for all post queries
      queryClient.invalidateQueries({ queryKey: ['highlighted-posts-carousel'] });
      queryClient.invalidateQueries({ queryKey: ['grid-posts'] });
    },
  });

  const toggleLike = useCallback(
    (postId: string, e: React.MouseEvent) => {
      e.stopPropagation();

      if (!isAuthenticated) {
        toast({
          title: 'Cần đăng nhập',
          description: 'Vui lòng đăng nhập để thích bài viết.',
          duration: 3000,
        });
        return;
      }

      likeMutation.mutate(postId);
    },
    [likeMutation, isAuthenticated, toast]
  );

  // Helper functions to get like state for a specific post
  const getIsLiked = useCallback(
    (postId: string): boolean => {
      return likedPosts.has(postId);
    },
    [likedPosts]
  );

  const getLikeCount = useCallback(
    (postId: string): number => {
      return likeCounts.get(postId) ?? 0;
    },
    [likeCounts]
  );

  return {
    // Direct access (for backward compatibility)
    likedPosts,
    likeCounts,
    // Helper functions (preferred)
    getIsLiked,
    getLikeCount,
    toggleLike,
    isLiking: likeMutation.isPending,
  };
}

