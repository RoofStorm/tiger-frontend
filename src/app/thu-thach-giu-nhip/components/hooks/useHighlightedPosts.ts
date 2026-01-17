import { useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import type { Post, PostsFeedResponse } from '../carousel.types';

// Mock data để fallback nếu không có đủ posts
const mockPosts: Post[] = [
  {
    id: 'mock-1',
    caption: 'Cột mốc thời gian 1',
    imageUrl: undefined,
    likeCount: 0,
  },
  {
    id: 'mock-2',
    caption: 'Cột mốc thời gian 2',
    imageUrl: undefined,
    likeCount: 0,
  },
  {
    id: 'mock-3',
    caption: 'Cột mốc thời gian 3',
    imageUrl: undefined,
    likeCount: 0,
  },
  {
    id: 'mock-4',
    caption: 'Cột mốc thời gian 4',
    imageUrl: undefined,
    likeCount: 0,
  },
  {
    id: 'mock-5',
    caption: 'Cột mốc thời gian 5',
    imageUrl: undefined,
    likeCount: 0,
  },
];

const MIN_POSTS_REQUIRED = 5;

/**
 * Hook to fetch and normalize highlighted posts with infinite pagination
 * Handles deduplication and mock data padding
 */
export function useHighlightedPosts() {
  const {
    data,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    isLoading,
    refetch,
  } = useInfiniteQuery<PostsFeedResponse>({
    queryKey: ['highlighted-posts-carousel'],
    queryFn: ({ pageParam }) =>
      apiClient.getPostsFeed({
        cursor: pageParam?.cursor,
        direction: pageParam?.direction,
        limit: 10,
        type: 'IMAGE',
      }) as Promise<PostsFeedResponse>,
    initialPageParam: { cursor: undefined, direction: 'next' as const },
    getNextPageParam: (lastPage) =>
      lastPage?.data?.pagination?.hasNext
        ? { cursor: lastPage.data.pagination.nextCursor, direction: 'next' as const }
        : undefined,
    getPreviousPageParam: (firstPage) =>
      firstPage?.data?.pagination?.hasPrev
        ? { cursor: firstPage.data.pagination.prevCursor, direction: 'prev' as const }
        : undefined,
    staleTime: 5 * 60 * 1000,
  });

  // Flatten and deduplicate posts, pad with mock data if needed
  const highlightedPosts = useMemo(() => {
    if (!data?.pages) return mockPosts;

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

    if (allPosts.length === 0) return mockPosts;

    // Pad with mock data if we have fewer than required posts
    if (allPosts.length < MIN_POSTS_REQUIRED) {
      const needed = MIN_POSTS_REQUIRED - allPosts.length;
      return [...allPosts, ...mockPosts.slice(0, needed)];
    }

    return allPosts;
  }, [data]);

  return {
    highlightedPosts,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    isLoading,
    refetch,
    queryData: data,
  };
}

