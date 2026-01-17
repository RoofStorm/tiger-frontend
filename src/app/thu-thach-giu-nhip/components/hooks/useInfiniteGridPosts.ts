import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import type { Post, PostsFeedResponse } from '../carousel.types';

interface UseInfiniteGridPostsOptions {
  enabled?: boolean;
  initialCursor?: string;
  limit?: number;
  type?: string;
}

/**
 * Hook to fetch posts for grid modal with infinite pagination
 * Separate from carousel query to avoid coupling
 */
export function useInfiniteGridPosts({
  enabled = true,
  initialCursor,
  limit = 20,
  type = 'IMAGE',
}: UseInfiniteGridPostsOptions = {}) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery<PostsFeedResponse>({
    queryKey: ['grid-posts', type],
    queryFn: ({ pageParam }) => {
      const param = pageParam as { cursor?: string; direction: 'next' } | undefined;
      return apiClient.getPostsFeed({
        cursor: param?.cursor || initialCursor,
        direction: 'next',
        limit,
        type,
      }) as Promise<PostsFeedResponse>;
    },
    initialPageParam: { cursor: initialCursor, direction: 'next' as const },
    getNextPageParam: (lastPage) =>
      lastPage?.data?.pagination?.hasNext
        ? { cursor: lastPage.data.pagination.nextCursor, direction: 'next' as const }
        : undefined,
    enabled,
    staleTime: 5 * 60 * 1000,
  });

  // Flatten and deduplicate posts
  const posts = useMemo(() => {
    if (!data?.pages) return [];

    const allPosts: Post[] = [];
    const seenIds = new Set<string>();

    data.pages.forEach((page: PostsFeedResponse) => {
      const pagePosts = Array.isArray(page?.data?.posts) ? page.data.posts : [];
      pagePosts.forEach((post: Post) => {
        if (!seenIds.has(post.id)) {
          allPosts.push(post);
          seenIds.add(post.id);
        }
      });
    });

    return allPosts;
  }, [data]);

  return {
    posts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  };
}

