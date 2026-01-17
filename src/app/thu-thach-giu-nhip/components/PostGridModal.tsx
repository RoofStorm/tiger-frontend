'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useInfiniteGridPosts } from './hooks/useInfiniteGridPosts';
import { usePostLikes } from './hooks/usePostLikes';
import { GridCard } from './GridCard';
import { SkeletonCard } from './SkeletonCard';

interface PostGridModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPostId?: string;
}

/**
 * Grid modal component for browsing posts in grid layout
 * Features:
 * - Infinite scroll with IntersectionObserver
 * - Self-contained data fetching
 * - Reuses like logic from usePostLikes
 */
export function PostGridModal({ isOpen, onClose, initialPostId }: PostGridModalProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasScrolledRef = useRef(false);

  // Fetch posts with infinite query
  const {
    posts,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteGridPosts({
    enabled: isOpen,
    limit: 20,
    type: 'IMAGE',
  });

  // Like management (reuses hook from carousel)
  const { getIsLiked, getLikeCount, toggleLike } = usePostLikes({
    posts,
  });

  // IntersectionObserver for lazy loading
  useEffect(() => {
    // Guard: ensure all refs are available
    if (!isOpen || !sentinelRef.current || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        root: containerRef.current,
        rootMargin: '200px', // Start loading before reaching the bottom
        threshold: 0.1,
      }
    );

    observer.observe(sentinelRef.current);

    return () => {
      observer.disconnect();
    };
  }, [isOpen, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Handle ESC key and body scroll lock
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Reset scroll flag when modal closes
  useEffect(() => {
    if (!isOpen) {
      hasScrolledRef.current = false;
    }
  }, [isOpen]);

  // Scroll to initial post if provided - only once, only when post exists
  useEffect(() => {
    if (!isOpen || !initialPostId || hasScrolledRef.current) return;
    if (!containerRef.current) return;

    // Check if post exists in current posts
    const postExists = posts.some((post) => post.id === initialPostId);
    if (!postExists) return;

    const element = containerRef.current.querySelector(
      `[data-post-id="${initialPostId}"]`
    );

    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      hasScrolledRef.current = true;
    }
  }, [isOpen, initialPostId, posts]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex flex-col">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />

          {/* Header */}
          <div className="relative z-[110] flex items-center justify-between p-4 md:p-6 bg-black/50 backdrop-blur-sm">
            <h2 className="text-white text-lg md:text-xl font-bold">Tất cả khoảnh khắc</h2>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors bg-black/20 rounded-full p-2"
              aria-label="Close"
            >
              <X size={24} className="md:w-6 md:h-6" />
            </button>
          </div>

          {/* Grid Container */}
          <div
            ref={containerRef}
            className="relative z-[105] flex-1 overflow-y-auto p-4 md:p-6"
            onClick={(e) => {
              // Stop propagation to prevent closing when clicking inside container
              e.stopPropagation();
            }}
          >
            {isLoading && posts.length === 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-white/70 text-center">Chưa có bài viết nào</p>
              </div>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                >
                  {posts.map((post) => {
                    // Use helper functions - single source of truth
                    const isLiked = getIsLiked(post.id);
                    const likeCount = getLikeCount(post.id);

                    return (
                      <div key={post.id} data-post-id={post.id}>
                        <GridCard
                          post={post}
                          isLiked={isLiked}
                          likeCount={likeCount}
                          onLike={toggleLike}
                          // Grid card click does nothing (only hover + like)
                        />
                      </div>
                    );
                  })}
                </motion.div>

                {/* Sentinel for infinite scroll */}
                <div ref={sentinelRef} className="h-4 w-full" />

                {/* Loading indicator at bottom */}
                {isFetchingNextPage && (
                  <div className="flex justify-center items-center py-8">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <SkeletonCard key={`loading-${i}`} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

