import { useState, useEffect, useCallback, useRef } from 'react';
import { CAROUSEL_CONFIG } from '../carousel.constants';
import type { Post } from '../carousel.types';

interface UseCarouselControllerOptions {
  posts: Post[];
  isMobile: boolean;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  fetchNextPage: () => void;
  fetchPreviousPage: () => void;
}

/**
 * Hook to manage carousel navigation, transitions, autoplay, keyboard, and swipe
 */
export function useCarouselController({
  posts,
  isMobile,
  hasNextPage,
  hasPreviousPage,
  fetchNextPage,
  fetchPreviousPage,
}: UseCarouselControllerOptions) {
  const [currentIndex, setCurrentIndex] = useState(3);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const shouldShiftForPrependRef = useRef(false);
  const lastPostsCountRef = useRef(0);
  const hasUserNavigatedBackwardRef = useRef(false);
  const isInitializedRef = useRef(false);

  const config = isMobile ? CAROUSEL_CONFIG.mobile : CAROUSEL_CONFIG.desktop;
  const { transitionDuration, autoPlayInterval } = CAROUSEL_CONFIG.animation;
  const { visibleThreshold, bufferSize } = CAROUSEL_CONFIG.fetch;
  const { minSwipeDistance } = CAROUSEL_CONFIG.swipe;

  // Initialize currentIndex to 3 when posts are first loaded, but ensure it's within bounds
  useEffect(() => {
    if (isInitializedRef.current || posts.length === 0) return;
    
    const initialIndex = Math.min(3, Math.max(0, posts.length - 1));
    setCurrentIndex(initialIndex);
    isInitializedRef.current = true;
  }, [posts.length]);

  // Adjust currentIndex only when we actually prepended items (triggered by fetchPreviousPage)
  useEffect(() => {
    if (posts.length === 0) return;

    const previousCount = lastPostsCountRef.current;
    const currentCount = posts.length;
    lastPostsCountRef.current = currentCount;

    if (!shouldShiftForPrependRef.current) return;
    if (previousCount === 0 || currentCount <= previousCount) return;

    const addedCount = currentCount - previousCount;
    setCurrentIndex(prev => prev + addedCount);
    shouldShiftForPrependRef.current = false;
  }, [posts.length]);

  // Fetch thresholds
  useEffect(() => {
    if (posts.length === 0) return;
    const visible = isMobile ? visibleThreshold.mobile : visibleThreshold.desktop;

    // Fetch Next
    if (
      hasNextPage &&
      currentIndex >= posts.length - (visible + bufferSize)
    ) {
      fetchNextPage();
    }

    // Fetch Prev
    // Only prefetch previous pages after the user has actually navigated backward.
    // This avoids an immediate "prev" request on first load (currentIndex=0),
    // which also caused index shifting and made the carousel not start at the first post after refresh.
    if (
      hasPreviousPage &&
      hasUserNavigatedBackwardRef.current &&
      currentIndex <= bufferSize
    ) {
      shouldShiftForPrependRef.current = true;
      fetchPreviousPage();
    }
  }, [
    currentIndex,
    posts.length,
    hasNextPage,
    hasPreviousPage,
    isMobile,
    visibleThreshold,
    bufferSize,
    fetchNextPage,
    fetchPreviousPage,
  ]);

  // Navigation functions
  const nextSlide = useCallback(() => {
    if (isTransitioning || posts.length === 0) return;
    if (currentIndex >= posts.length - 1) return;

    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
    setTimeout(() => setIsTransitioning(false), transitionDuration);
  }, [isTransitioning, posts.length, currentIndex, transitionDuration]);

  const prevSlide = useCallback(() => {
    if (isTransitioning || posts.length === 0) return;
    if (currentIndex <= 0) return;

    hasUserNavigatedBackwardRef.current = true;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
    setTimeout(() => setIsTransitioning(false), transitionDuration);
  }, [isTransitioning, currentIndex, posts.length, transitionDuration]);

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning || index === currentIndex || index < 0 || index >= posts.length) return;

      setIsTransitioning(true);
      setCurrentIndex(index);
      setTimeout(() => setIsTransitioning(false), transitionDuration);
    },
    [isTransitioning, currentIndex, posts.length, transitionDuration]
  );

  // Auto-play logic
  useEffect(() => {
    if (!isAutoPlaying || posts.length <= 1) return;

    const interval = setInterval(() => {
      if (currentIndex < posts.length - 1) {
        nextSlide();
      } else {
        // Stop auto-playing if we can't fetch more
        if (!hasNextPage) setIsAutoPlaying(false);
      }
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, posts.length, currentIndex, hasNextPage, autoPlayInterval]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        prevSlide();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        nextSlide();
      } else if (event.key === ' ') {
        event.preventDefault();
        setIsAutoPlaying((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Touch handlers for mobile swipe
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (touchStart === null || touchEnd === null) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      hasUserNavigatedBackwardRef.current = true;
      prevSlide();
    }
  }, [touchStart, touchEnd, nextSlide, prevSlide, minSwipeDistance]);

  return {
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
  };
}

