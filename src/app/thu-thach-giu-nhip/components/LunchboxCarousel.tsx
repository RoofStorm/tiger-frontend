'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useZoneView } from '@/hooks/useZoneView';
import { useMobileDetect } from '@/hooks/useMobileDetect';
import { useHighlightedPosts } from './hooks/useHighlightedPosts';
import { useCarouselController } from './hooks/useCarouselController';
import { usePostLikes } from './hooks/usePostLikes';
import { CarouselSlide } from './CarouselSlide';
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';
import { PostGridModal } from './PostGridModal';

/**
 * Main carousel component for highlighted posts
 * Refactored for better maintainability, performance, and clean architecture
 * 
 * Responsibilities:
 * - Orchestrates hooks and sub-components
 * - Handles analytics tracking
 * - Manages modal state
 */
export function LunchboxCarousel() {
  const { trackClick } = useAnalytics();
  const zoneB2Ref = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Track time on Zone B.2
  useZoneView(zoneB2Ref, {
    page: 'challenge',
    zone: 'zoneB2',
  });

  // Mobile detection using matchMedia (more performant)
  const isMobile = useMobileDetect();

  // Data fetching and normalization
  const {
    highlightedPosts,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isLoading,
    refetch,
  } = useHighlightedPosts();

  // Like management with optimistic updates
  const { likedPosts, likeCounts, toggleLike } = usePostLikes({
    posts: highlightedPosts,
  });

  // Carousel navigation and controls
  const {
    currentIndex,
    isTransitioning,
    isAutoPlaying,
    setIsAutoPlaying,
    nextSlide,
    prevSlide,
    goToSlide,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  } = useCarouselController({
    posts: highlightedPosts,
    isMobile,
    hasNextPage,
    fetchNextPage,
    fetchPreviousPage,
  });

  // Handle image click to open grid modal
  const handleImageClick = useCallback(
    (postId: string, index: number) => {
    trackClick('challenge', {
      zone: 'zoneB2',
      component: 'image',
      metadata: { postId, imageIndex: index },
    });

    setIsModalOpen(true);
    },
    [trackClick]
  );

  // Pause autoplay when modal opens, restore when closes
  useEffect(() => {
    if (isModalOpen) {
      // Pause autoplay when modal opens
      setIsAutoPlaying(false);
    }
    // Note: We don't auto-resume when modal closes - let user control it
  }, [isModalOpen, setIsAutoPlaying]);

  // Refetch carousel data when modal closes to sync like counts
  useEffect(() => {
    if (!isModalOpen) {
      // Invalidate and refetch to sync like counts from server
      queryClient.invalidateQueries({ queryKey: ['highlighted-posts-carousel'] });
    }
  }, [isModalOpen, queryClient]);

  return (
    <div ref={zoneB2Ref} className="mt-4 pt-6 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Carousel Section */}
        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <div className="text-gray-500">Đang tải...</div>
          </div>
        ) : highlightedPosts.length === 0 ? (
          <div className="flex justify-center items-center h-96">
            <div className="text-gray-500">Chưa có bài viết nào được highlight</div>
          </div>
        ) : (
          <div className="relative flex items-center w-full max-w-full overflow-x-hidden">
            {/* Left Arrow */}
            <button
              onClick={prevSlide}
              disabled={isTransitioning || currentIndex === 0}
              className="flex-shrink-0 z-40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mr-2 md:mr-4"
              aria-label="Previous slide"
            >
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
            </button>

            {/* Carousel Container */}
            <div
              ref={carouselRef}
              className="relative h-[350px] md:h-[500px] flex-1 overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Pause/Play Button */}
              <button
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                disabled={highlightedPosts.length <= 1}
                className="absolute top-2 right-2 md:top-4 md:right-4 z-40 bg-white/80 backdrop-blur-sm rounded-full p-2 md:p-3 shadow-lg hover:bg-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={isAutoPlaying ? 'Pause' : 'Play'}
              >
                {isAutoPlaying ? (
                  <Pause className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
                ) : (
                  <Play className="w-4 h-4 md:w-5 md:h-5 text-gray-700" />
                )}
              </button>

              <div className="relative h-full w-full flex items-center justify-center overflow-hidden">
                {highlightedPosts.map((post, index) => {
                  const isLiked = likedPosts.has(post.id);
                  const likeCount = likeCounts.get(post.id) ?? post.likeCount ?? 0;

                  return (
                    <CarouselSlide
                      key={post.id}
                      post={post}
                      index={index}
                      currentIndex={currentIndex}
                      isMobile={isMobile}
                      isTransitioning={isTransitioning}
                      isLiked={isLiked}
                      likeCount={likeCount}
                      onLike={toggleLike}
                      onSlideClick={handleImageClick}
                      onSlideSelect={goToSlide}
                    />
                  );
                })}
              </div>
            </div>

            {/* Right Arrow */}
            <button
              onClick={nextSlide}
              disabled={isTransitioning || currentIndex === highlightedPosts.length - 1}
              className="flex-shrink-0 z-40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ml-2 md:ml-4"
              aria-label="Next slide"
            >
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
            </button>
          </div>
        )}

        <PostGridModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          initialPostId={highlightedPosts[currentIndex]?.id}
        />
      </div>
    </div>
  );
}
