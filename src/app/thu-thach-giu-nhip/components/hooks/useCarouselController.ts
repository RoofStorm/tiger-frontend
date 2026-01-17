import { useState, useEffect, useCallback, useRef } from 'react';
import { CAROUSEL_CONFIG } from '../carousel.constants';
import type { Post } from '../carousel.types';

interface UseCarouselControllerOptions {
  posts: Post[];
  isMobile: boolean;
  hasNextPage: boolean;
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
  fetchNextPage,
  fetchPreviousPage,
}: UseCarouselControllerOptions) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const lastPrependCountRef = useRef(0);

  const config = isMobile ? CAROUSEL_CONFIG.mobile : CAROUSEL_CONFIG.desktop;
  const { transitionDuration, autoPlayInterval } = CAROUSEL_CONFIG.animation;
  const { visibleThreshold, bufferSize } = CAROUSEL_CONFIG.fetch;
  const { minSwipeDistance } = CAROUSEL_CONFIG.swipe;

  // Adjust currentIndex when prepending data
  useEffect(() => {
    if (posts.length === 0) return;

    const currentFirstPageCount = posts.length;
    if (lastPrependCountRef.current > 0 && currentFirstPageCount > lastPrependCountRef.current) {
      const addedCount = currentFirstPageCount - lastPrependCountRef.current;
      setCurrentIndex((prev) => prev + addedCount);
    }
    lastPrependCountRef.current = currentFirstPageCount;
  }, [posts.length]);

  // Fetch thresholds
  useEffect(() => {
    const visible = isMobile ? visibleThreshold.mobile : visibleThreshold.desktop;

    // Fetch Next
    if (
      hasNextPage &&
      currentIndex >= posts.length - (visible + bufferSize)
    ) {
      fetchNextPage();
    }

    // Fetch Prev
    if (currentIndex <= bufferSize) {
      fetchPreviousPage();
    }
  }, [currentIndex, posts.length, hasNextPage, isMobile, visibleThreshold, bufferSize, fetchNextPage, fetchPreviousPage]);

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

