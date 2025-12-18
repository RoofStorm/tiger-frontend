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
  const carouselRef = useRef<HTMLDivElement>(null);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
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

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    }
    if (isRightSwipe) {
      prevSlide();
    }
  };

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
                  const getPos = (idx: number, isMobile: boolean) => {
                    const diff =
                      (idx - currentSlide + highlightedPosts.length) %
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
                      return 99; // Không hiển thị
                    }

                    return pos;
                  };

                  const pos = getPos(index, isMobile);

                  if (pos === 99) return null;

                  const isCenter = pos === 0;

                  // Tính toán khoảng cách - mobile gần hơn và đảm bảo không overflow
                  const translateBaseAdjacent = isMobile ? 140 : 260; // Mobile: gần hơn để tránh overflow
                  const translateBaseOuter = isMobile ? 0 : 210; // Mobile không có ±2

                  const xMove =
                    pos === 0
                      ? 0
                      : Math.abs(pos) === 1
                        ? pos * translateBaseAdjacent
                        : pos * translateBaseOuter;

                  // Scale và opacity
                  const scale = isMobile
                    ? pos === 0 ? 1.0 : 0.85 // Mobile: scale nhỏ hơn
                    : pos === 0 ? 1.12 : Math.abs(pos) === 1 ? 0.94 : 0.8;
                  const opacity = 1;
                  // Z-index: center cao nhất, ±1 cao hơn ±2
                  const zIndex = pos === 0 ? 30 : Math.abs(pos) === 1 ? 20 : 10;

                  // Kích thước responsive
                  const getHeight = (position: number, isMobile: boolean) => {
                    if (isMobile) {
                      if (position === 0) return 300;
                      return 260; // ±1 nhỏ hơn
                    }
                    if (position === 0) return 420;
                    if (Math.abs(position) === 1) return 380;
                    return 320;
                  };

                  const getWidth = (position: number, isMobile: boolean) => {
                    if (isMobile) {
                      if (position === 0) return 'w-[16rem]'; // 256px
                      return 'w-[14rem]'; // 224px
                    }
                    if (position === 0) return 'w-[20rem]';
                    if (Math.abs(position) === 1) return 'w-[18rem]';
                    return 'w-[14rem]';
                  };

                  return (
                    <motion.div
                      key={post.id}
                      className={`absolute ${getWidth(pos, isMobile)} cursor-pointer`}
                      style={{
                        height: `${getHeight(pos, isMobile)}px`,
                        left: '50%',
                      }}
                      animate={{
                        x: `calc(-50% + ${xMove}px)`, // Center tại 50%, sau đó offset bằng x
                        scale,
                        opacity,
                        zIndex,
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 220,
                        damping: 22,
                      }}
                      onClick={() => {
                        if (!isCenter) {
                          setIsTransitioning(true);
                          setCurrentSlide(index);
                          setTimeout(() => setIsTransitioning(false), 500);
                        }
                      }}
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
                        } overflow-hidden bg-white flex flex-col`}
                      >
                        {/* Image Section - Top */}
                        <div className="relative flex-1 p-2">
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
                                <Image
                                  src="/thuthachnhipsong/tiger_logo.png"
                                  alt="Tiger Logo"
                                  width={80}
                                  height={80}
                                  className="object-contain"
                                />
                              </div>
                              {/* White Heart Logo - Bottom Right */}
                              <div className="absolute bottom-2 right-2 z-10">
                                <Image
                                  src="/icons/white_heart.png"
                                  alt="White Heart"
                                  width={32}
                                  height={32}
                                  className="object-contain"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="relative w-full h-full rounded-lg overflow-hidden">
                              <Image
                                src="/thuthachnhipsong/slide_example.png"
                                alt="Slide example"
                                fill
                                className="object-cover"
                              />
                              {/* Tiger Logo - Centered Top */}
                              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
                                <Image
                                  src="/thuthachnhipsong/tiger_logo.png"
                                  alt="Tiger Logo"
                                  width={80}
                                  height={80}
                                  className="object-contain"
                                />
                              </div>
                              {/* White Heart Logo - Bottom Right */}
                              <div className="absolute bottom-2 right-2 z-10">
                                <Image
                                  src="/icons/white_heart.png"
                                  alt="White Heart"
                                  width={32}
                                  height={32}
                                  className="object-contain"
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Bottom Section - tramnamnhipsong image */}
                        <div className="flex justify-center items-center pb-2 px-2">
                          <Image
                            src="/thuthachnhipsong/tramnamnhipsong.png"
                            alt="Trăm năm giữ nhịp sống"
                            width={120}
                            height={36}
                            className="object-contain"
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

