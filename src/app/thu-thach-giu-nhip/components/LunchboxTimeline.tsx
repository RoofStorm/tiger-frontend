'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';

interface Post {
  id: string;
  caption?: string;
  imageUrl?: string;
  user?: {
    name?: string;
    avatarUrl?: string;
  };
}

export function LunchboxTimeline() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const carouselRef = useRef<HTMLDivElement>(null);

  // Detect mobile screen size with debounce
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    const debouncedCheckMobile = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkMobile, 150);
    };
    
    checkMobile();
    window.addEventListener('resize', debouncedCheckMobile);
    return () => {
      window.removeEventListener('resize', debouncedCheckMobile);
      clearTimeout(timeoutId);
    };
  }, []);

  // Fetch highlighted posts for carousel
  // Tạm thời disable để dùng mock data
  // const { data: postsData, isLoading } = useQuery({
  //   queryKey: ['highlighted-posts-timeline'],
  //   queryFn: () => apiClient.getHighlightedPosts(),
  //   staleTime: 5 * 60 * 1000, // 5 minutes
  //   refetchOnWindowFocus: false,
  // });
  const isLoading = false;

  // Mock data để test 5 slides
  const mockPosts: Post[] = [
    {
      id: 'mock-1',
      caption: 'Cột mốc thời gian 1',
      imageUrl: undefined,
    },
    {
      id: 'mock-2',
      caption: 'Cột mốc thời gian 2',
      imageUrl: undefined,
    },
    {
      id: 'mock-3',
      caption: 'Cột mốc thời gian 3',
      imageUrl: undefined,
    },
    {
      id: 'mock-4',
      caption: 'Cột mốc thời gian 4',
      imageUrl: undefined,
    },
    {
      id: 'mock-5',
      caption: 'Cột mốc thời gian 5',
      imageUrl: undefined,
    },
  ];

  // Luôn dùng mock data để test 5 slides
  const highlightedPosts = mockPosts;

  // Nếu muốn dùng data thật, uncomment dòng sau và comment dòng trên:
  // const highlightedPosts =
  //   Array.isArray(postsData?.data?.posts) && postsData.data.posts.length >= 5
  //     ? postsData.data.posts
  //     : mockPosts;

  // Navigation functions
  const nextSlide = useCallback(() => {
    if (isTransitioning || highlightedPosts.length === 0) return;
    setIsTransitioning(true);
    setCurrentSlide(prev => (prev + 1) % highlightedPosts.length);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning, highlightedPosts.length]);

  const prevSlide = useCallback(() => {
    if (isTransitioning || highlightedPosts.length === 0) return;
    setIsTransitioning(true);
    setCurrentSlide(
      prev => (prev - 1 + highlightedPosts.length) % highlightedPosts.length
    );
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning, highlightedPosts.length]);

  // Auto-play logic
  useEffect(() => {
    if (!isAutoPlaying || highlightedPosts.length <= 1) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, highlightedPosts.length]);

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
        setIsAutoPlaying(!isAutoPlaying);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide, isAutoPlaying]);

  // Touch handlers for mobile swipe - memoized
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
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
  }, [touchStart, touchEnd, nextSlide, prevSlide]);

  // Toggle like for a post
  const toggleLike = useCallback((postId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent slide click when clicking heart
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  }, []);

  return (
    <div className="mt-16 pt-12 px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
       
        {/* Carousel Section */}
        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <div className="text-gray-500">Đang tải...</div>
          </div>
        ) : highlightedPosts.length === 0 ? (
          <div className="flex justify-center items-center h-96">
            <div className="text-gray-500">
              Chưa có bài viết nào được highlight
            </div>
          </div>
        ) : (
          <div className="relative flex items-center w-full max-w-full overflow-x-hidden">
            {/* Left Arrow - Outside carousel */}
            <button
              onClick={prevSlide}
              disabled={isTransitioning || highlightedPosts.length <= 1}
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
              <div className="relative h-full w-full flex items-center justify-center overflow-hidden">
                {highlightedPosts.map((post: Post, index: number) => {
                  // Tính relative position so với currentSlide
                  const diff =
                    (index - currentSlide + highlightedPosts.length) %
                    highlightedPosts.length;

                  // Trên mobile: chỉ hiển thị 3 slides (-1, 0, 1)
                  // Trên desktop: hiển thị 5 slides (-2, -1, 0, 1, 2)
                  const maxPos = isMobile ? 1 : 2;
                  let pos = diff;
                  const total = highlightedPosts.length;

                  // Wrap-around logic
                  if (diff > maxPos) {
                    pos = diff - total; // Negative position
                  }

                  // Chỉ hiển thị slides trong range
                  if (Math.abs(pos) > maxPos) {
                    return null;
                  }

                  const isCenter = pos === 0;

                  // Tính toán khoảng cách - mobile gần hơn và đảm bảo không overflow
                  const translateBaseAdjacent = isMobile ? 140 : 260;
                  const translateBaseOuter = isMobile ? 0 : 210;

                  const xMove =
                    pos === 0
                      ? 0
                      : Math.abs(pos) === 1
                        ? pos * translateBaseAdjacent
                        : pos * translateBaseOuter;

                  // Scale và opacity
                  const scale = isMobile
                    ? pos === 0 ? 1.0 : 0.85
                    : pos === 0 ? 1.12 : Math.abs(pos) === 1 ? 0.94 : 0.8;
                  const zIndex = pos === 0 ? 30 : Math.abs(pos) === 1 ? 20 : 10;

                  // Kích thước responsive
                  const height = isMobile
                    ? pos === 0 ? 300 : 260
                    : pos === 0 ? 420 : Math.abs(pos) === 1 ? 380 : 320;

                  const width = isMobile
                    ? pos === 0 ? 'w-[16rem]' : 'w-[14rem]'
                    : pos === 0 ? 'w-[20rem]' : Math.abs(pos) === 1 ? 'w-[18rem]' : 'w-[14rem]';

                  // Optimized onClick handler - avoid creating new function on each render
                  const handleSlideClick = () => {
                    if (!isCenter && !isTransitioning) {
                      setIsTransitioning(true);
                      setCurrentSlide(index);
                      setTimeout(() => setIsTransitioning(false), 500);
                    }
                  };

                  return (
                    <motion.div
                      key={post.id}
                      className={`absolute ${width} cursor-pointer`}
                      style={{
                        height: `${height}px`,
                        left: '50%',
                      }}
                      animate={{
                        x: `calc(-50% + ${xMove}px)`,
                        scale,
                        opacity: 1,
                        zIndex,
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 220,
                        damping: 22,
                      }}
                      onClick={handleSlideClick}
                      whileHover={{
                        scale: isCenter ? 1.15 : 0.9,
                        transition: {
                          duration: 0.2,
                        },
                      }}
                    >
                      <div
                        className={`h-full rounded-lg border-2 ${
                          isCenter
                            ? 'border-white shadow-2xl'
                            : 'border-white shadow-xl'
                        } bg-white flex flex-col`}
                      >
                        {/* Image Section - Top */}
                        <div className="relative flex-1 p-2 overflow-hidden">
                          {post.imageUrl ? (
                            <div className="relative w-full h-full rounded-lg overflow-hidden">
                              <Image
                                src={post.imageUrl}
                                alt={post.caption || 'Post image'}
                                fill
                                className="object-cover"
                                unoptimized={post.imageUrl?.includes(
                                  'localhost:9000'
                                )}
                              />
                              {/* Tiger Logo - Centered Top */}
                              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src="/thuthachnhipsong/tiger_logo.svg"
                                  alt="Tiger Logo"
                                  width={80}
                                  height={80}
                                  className="object-contain"
                                />
                              </div>
                              {/* White Heart Logo - Bottom Right */}
                              <div 
                                className="absolute bottom-2 right-2 z-10 cursor-pointer transition-all duration-200 hover:scale-110"
                                onClick={(e) => toggleLike(post.id, e)}
                              >
                                <svg 
                                  width="32" 
                                  height="32" 
                                  viewBox="0 0 30 30" 
                                  fill="none" 
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="transition-all duration-200"
                                >
                                  <path 
                                    d="M15.775 26.0125C15.35 26.1625 14.65 26.1625 14.225 26.0125C10.6 24.775 2.5 19.6125 2.5 10.8625C2.5 7 5.6125 3.875 9.45 3.875C11.725 3.875 13.7375 4.975 15 6.675C16.2625 4.975 18.2875 3.875 20.55 3.875C24.3875 3.875 27.5 7 27.5 10.8625C27.5 19.6125 19.4 24.775 15.775 26.0125Z" 
                                    fill={likedPosts.has(post.id) ? "#EF4444" : "none"}
                                    stroke={likedPosts.has(post.id) ? "#EF4444" : "white"}
                                    strokeWidth="1.875" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </div>
                            </div>
                          ) : (
                            <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-50">
                              <Image
                                src="/thuthachnhipsong/slide_example_optimized.svg"
                                alt="Slide example"
                                fill
                                className="object-cover"
                              />
                              {/* Tiger Logo - Centered Top */}
                              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src="/thuthachnhipsong/tiger_logo.svg"
                                  alt="Tiger Logo"
                                  width={80}
                                  height={80}
                                  className="object-contain"
                                />
                              </div>
                              {/* White Heart Logo - Bottom Right */}
                              <div 
                                className="absolute bottom-2 right-2 z-10 cursor-pointer transition-all duration-200 hover:scale-110"
                                onClick={(e) => toggleLike(post.id, e)}
                              >
                                <svg 
                                  width="32" 
                                  height="32" 
                                  viewBox="0 0 30 30" 
                                  fill="none" 
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="transition-all duration-200"
                                >
                                  <path 
                                    d="M15.775 26.0125C15.35 26.1625 14.65 26.1625 14.225 26.0125C10.6 24.775 2.5 19.6125 2.5 10.8625C2.5 7 5.6125 3.875 9.45 3.875C11.725 3.875 13.7375 4.975 15 6.675C16.2625 4.975 18.2875 3.875 20.55 3.875C24.3875 3.875 27.5 7 27.5 10.8625C27.5 19.6125 19.4 24.775 15.775 26.0125Z" 
                                    fill={likedPosts.has(post.id) ? "#EF4444" : "none"}
                                    stroke={likedPosts.has(post.id) ? "#EF4444" : "white"}
                                    strokeWidth="1.875" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Bottom Section - tramnamnhipsong image */}
                        <div className="flex justify-center items-center pb-2 px-2 flex-shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src="/thuthachnhipsong/tramnamgiunhipsong.svg"
                            alt="Trăm năm giữ nhịp sống"
                            width={180}
                            height={54}
                            className="object-contain w-32 md:w-44"
                            style={{ display: 'block', height: 'auto' }}
                          />
                        </div>
                      </div>
                      {/* Đánh số slide để debug */}
                      {/* <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center">
                        <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                          Slide {index + 1} (pos: {pos})
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          ID: {post.id}
                        </div>
                      </div> */}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Right Arrow - Outside carousel */}
            <button
              onClick={nextSlide}
              disabled={isTransitioning || highlightedPosts.length <= 1}
              className="flex-shrink-0 z-40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ml-2 md:ml-4"
              aria-label="Next slide"
            >
              <ArrowRight className="w-5 h-5 md:w-6 md:h-6 text-gray-700" />
            </button>

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
          </div>
        )}
        {/* Navigation Dots */}
        <div className="flex justify-center items-center gap-1.5 md:gap-2 mt-4 md:mt-8">
              {highlightedPosts.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (!isTransitioning && index !== currentSlide) {
                      setIsTransitioning(true);
                      setCurrentSlide(index);
                      setTimeout(() => setIsTransitioning(false), 500);
                    }
                  }}
                  disabled={isTransitioning}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentSlide
                      ? 'w-3 h-3 md:w-4 md:h-4 bg-blue-600'
                      : 'w-2 h-2 md:w-3 md:h-3 bg-gray-300 hover:bg-gray-400'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
      </div>
    </div>
  );
}

