'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useNextAuth } from '@/hooks/useNextAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useZoneView } from '@/hooks/useZoneView';

interface Post {
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

interface ApiResponse {
  success: boolean;
  data: {
    posts: Post[];
    pagination: {
      hasNext: boolean;
      hasPrev: boolean;
      nextCursor?: string;
      prevCursor?: string;
    };
  };
  message: string;
}

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

export function LunchboxCarousel() {
  const { isAuthenticated } = useNextAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { trackClick } = useAnalytics();
  const zoneB2Ref = useRef<HTMLDivElement>(null);
  
  // State management
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [likeCounts, setLikeCounts] = useState<Map<string, number>>(new Map());
  const carouselRef = useRef<HTMLDivElement>(null);
  const lastPrependCountRef = useRef(0);

  // Track time on Zone B.2
  useZoneView(zoneB2Ref, {
    page: 'challenge',
    zone: 'zoneB2',
  });

  // Infinite Query for highlighted posts
  const {
    data,
    fetchNextPage,
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['highlighted-posts-carousel'],
    queryFn: ({ pageParam }) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (apiClient as any).getPostsFeed({
        cursor: pageParam?.cursor,
        direction: pageParam?.direction,
        limit: 10,
        type: 'IMAGE', // Filter by IMAGE type as per requirement
      }),
    initialPageParam: { cursor: undefined, direction: 'next' } as { cursor: string | undefined, direction: 'next' | 'prev' },
    getNextPageParam: (lastPage: ApiResponse) =>
      lastPage?.data?.pagination?.hasNext
        ? { cursor: lastPage.data.pagination.nextCursor, direction: 'next' }
        : undefined,
    getPreviousPageParam: (firstPage: ApiResponse) =>
      firstPage?.data?.pagination?.hasPrev
        ? { cursor: firstPage.data.pagination.prevCursor, direction: 'prev' }
        : undefined,
    staleTime: 5 * 60 * 1000,
  });

  // Flatten and deduplicate posts
  const highlightedPosts = useMemo(() => {
    if (!data?.pages) return mockPosts;
    
    const allPosts: Post[] = [];
    const seenIds = new Set<string>();
    
    data.pages.forEach((page: ApiResponse) => {
      const pagePosts = Array.isArray(page?.data?.posts) ? page.data.posts : [];
      pagePosts.forEach((post: Post) => {
        if (!seenIds.has(post.id)) {
          allPosts.push(post);
          seenIds.add(post.id);
        }
      });
    });

    if (allPosts.length === 0) return mockPosts;
    
    // If we have fewer than 5 posts, pad with mock data if necessary
    if (allPosts.length < 5) {
      const needed = 5 - allPosts.length;
      return [...allPosts, ...mockPosts.slice(0, needed)];
    }

    return allPosts;
  }, [data]);

  // Adjust currentIndex when prepending data
  useEffect(() => {
    if (!data?.pages) return;
    
    // Calculate total posts in the first page (to detect prepending)
    const firstPagePosts = (data.pages[0] as ApiResponse)?.data?.posts || [];
    const currentFirstPageCount = firstPagePosts.length;
    
    if (lastPrependCountRef.current > 0 && currentFirstPageCount > lastPrependCountRef.current) {
      const addedCount = currentFirstPageCount - lastPrependCountRef.current;
      setCurrentIndex(prev => prev + addedCount);
    }
    
    lastPrependCountRef.current = currentFirstPageCount;
  }, [data?.pages]);

  // Fetch thresholds
  useEffect(() => {
    const VISIBLE = isMobile ? 1 : 2;
    const BUFFER = 3;

    // Fetch Next
    if (
      hasNextPage &&
      !isFetchingNextPage &&
      currentIndex >= highlightedPosts.length - (VISIBLE + BUFFER)
    ) {
      fetchNextPage();
    }

    // Fetch Prev
    if (
      hasPreviousPage &&
      !isFetchingPreviousPage &&
      currentIndex <= BUFFER
    ) {
      fetchPreviousPage();
    }
  }, [currentIndex, highlightedPosts.length, hasNextPage, hasPreviousPage, isFetchingNextPage, isFetchingPreviousPage, isMobile, fetchNextPage, fetchPreviousPage]);

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

  // Khởi tạo và cập nhật likeCounts và likedPosts từ posts khi data thay đổi
  useEffect(() => {
    const newCounts = new Map<string, number>();
    const newLikedPosts = new Set<string>();
    
    highlightedPosts.forEach((post: Post) => {
      // Cập nhật likeCount
      if (post.likeCount !== undefined) {
        newCounts.set(post.id, post.likeCount);
      } else {
        newCounts.set(post.id, 0);
      }
      
      // Cập nhật likedPosts từ isLiked field (ưu tiên isLiked từ server)
      if (post.isLiked === true) {
        newLikedPosts.add(post.id);
      }
    });
    
    // Merge với state hiện tại để giữ lại các thay đổi local chưa được sync
    setLikeCounts(prev => {
      const merged = new Map(prev);
      newCounts.forEach((count, id) => {
        merged.set(id, count);
      });
      return merged;
    });
    
    setLikedPosts(prev => {
      const merged = new Set(prev);
      // Thêm các posts được liked từ server
      newLikedPosts.forEach(id => merged.add(id));
      // Giữ lại các posts đã được liked local nhưng chưa có trong server data
      // (trường hợp optimistic update)
      return merged;
    });
  }, [highlightedPosts]);

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: (postId: string) => apiClient.likePost(postId),
    onSuccess: (response, postId) => {
      // API response structure: {success: true, data: {action: "liked", liked: true}, message: "Success"}
      // apiClient.likePost() returns response.data, so we get: {success: true, data: {action: "liked", liked: true}, message: "Success"}
      // Therefore, we need to access response.data.action
      const responseData = response?.data || response;
      const action = responseData?.action || (responseData?.liked === true ? 'liked' : 'unliked');
      
      // Cập nhật local state ngay lập tức để UI responsive
      setLikedPosts(prev => {
        const newSet = new Set(prev);
        if (action === 'liked') {
          newSet.add(postId);
        } else if (action === 'unliked') {
          newSet.delete(postId);
        }
        return newSet;
      });

      // Cập nhật likeCount ngay lập tức
      setLikeCounts(prevCounts => {
        const newCounts = new Map(prevCounts);
        const currentCount = newCounts.get(postId) ?? 0;
        if (action === 'liked') {
          newCounts.set(postId, currentCount + 1);
        } else if (action === 'unliked') {
          newCounts.set(postId, Math.max(0, currentCount - 1));
        }
        return newCounts;
      });

      // Cập nhật cache trực tiếp để sync với server
      queryClient.setQueryData(
        ['highlighted-posts-carousel'],
        (oldData: { pages: ApiResponse[]; pageParams: unknown[] } | undefined) => {
          if (!oldData?.pages) return oldData;
          
          return {
            ...oldData,
            pages: oldData.pages.map((page: ApiResponse) => ({
              ...page,
              data: {
                ...page.data,
                posts: page.data?.posts?.map((post: Post) => {
                  if (post.id === postId) {
                    const currentLikeCount = post.likeCount ?? 0;
                    return {
                      ...post,
                      likeCount: action === 'liked' 
                        ? currentLikeCount + 1 
                        : Math.max(0, currentLikeCount - 1),
                      isLiked: action === 'liked',
                    };
                  }
                  return post;
                }),
              },
            })),
          };
        }
      );

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
    onError: () => {
      toast({
        title: 'Lỗi',
        description: 'Không thể thích bài viết. Vui lòng thử lại.',
        variant: 'destructive',
        duration: 4000,
      });
    },
  });

  // Navigation functions
  const nextSlide = useCallback(() => {
    if (isTransitioning || highlightedPosts.length === 0) return;
    if (currentIndex >= highlightedPosts.length - 1) return;
    
    setIsTransitioning(true);
    setCurrentIndex(prev => prev + 1);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning, highlightedPosts.length, currentIndex]);

  const prevSlide = useCallback(() => {
    if (isTransitioning || highlightedPosts.length === 0) return;
    if (currentIndex <= 0) return;
    
    setIsTransitioning(true);
    setCurrentIndex(prev => prev - 1);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning, currentIndex, highlightedPosts.length]);

  const handleDotClick = useCallback((index: number) => {
    if (!isTransitioning && index !== currentIndex) {
      // Track navigation dot click
      trackClick('challenge', {
        zone: 'zoneB2',
        component: 'navigation_dot',
        metadata: { dotIndex: index, totalDots: highlightedPosts.length },
      });

      setIsTransitioning(true);
      setCurrentIndex(index);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  }, [isTransitioning, currentIndex, highlightedPosts.length, trackClick]);

  const handleImageClick = useCallback((postId: string, index: number) => {
    // Track image click in showcase
    trackClick('challenge', {
      zone: 'zoneB2',
      component: 'image',
      metadata: { postId, imageIndex: index },
    });
  }, [trackClick]);

  // Auto-play logic
  useEffect(() => {
    if (!isAutoPlaying || highlightedPosts.length <= 1) return;

    const interval = setInterval(() => {
      if (currentIndex < highlightedPosts.length - 1) {
        nextSlide();
      } else {
        // If at the end, maybe pause or reset (though reset is not desired for infinite feed)
        // For infinite feed, we just stop auto-playing if we can't fetch more
        if (!hasNextPage) setIsAutoPlaying(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, highlightedPosts.length, currentIndex, hasNextPage]);

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
    
    // Kiểm tra đăng nhập trước khi like
    if (!isAuthenticated) {
      toast({
        title: 'Cần đăng nhập',
        description: 'Vui lòng đăng nhập để thích bài viết.',
        duration: 3000,
      });
      return;
    }
    
    // Gọi API để like/unlike post
    likeMutation.mutate(postId);
  }, [likeMutation, isAuthenticated, toast]);

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
            <div className="text-gray-500">
              Chưa có bài viết nào được highlight
            </div>
          </div>
        ) : (
          <div className="relative flex items-center w-full max-w-full overflow-x-hidden">
            {/* Left Arrow - Outside carousel */}
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
              <div className="relative h-full w-full flex items-center justify-center overflow-hidden">
                {highlightedPosts.map((post: Post, index: number) => {
                  // Virtualization logic: only render slides within range
                  const maxVisibleRange = isMobile ? 1 : 2;
                  const diff = index - currentIndex;
                  
                  // Chỉ hiển thị slides trong range
                  if (Math.abs(diff) > maxVisibleRange) {
                    return null;
                  }

                  const pos = diff;
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
                  const zIndex = 30 - Math.abs(pos) * 10;

                  // Kích thước responsive - đảm bảo tỉ lệ 3:4
                  const widthValue = isMobile
                    ? pos === 0 ? 256 : 224
                    : pos === 0 ? 320 : Math.abs(pos) === 1 ? 288 : 224;
                  
                  const height = Math.round(widthValue * 4 / 3);

                  const width = isMobile
                    ? pos === 0 ? 'w-[16rem]' : 'w-[14rem]'
                    : pos === 0 ? 'w-[20rem]' : Math.abs(pos) === 1 ? 'w-[18rem]' : 'w-[14rem]';

                  // Optimized onClick handler
                  const handleSlideClick = () => {
                    if (!isCenter && !isTransitioning) {
                      handleImageClick(post.id, index);
                      setIsTransitioning(true);
                      setCurrentIndex(index);
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
                          {post.imageUrl && typeof post.imageUrl === 'string' && post.imageUrl.trim() !== '' ? (
                            <div className="relative w-full h-full rounded-lg overflow-hidden">
                              <Image
                                src={post.imageUrl}
                                alt={post.caption || 'Post image'}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 256px, 320px"
                              />
                              {/* Tiger Logo - Centered Top */}
                              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src="/thuthachnhipsong/tiger_logo.svg"
                                  alt="TIGER Logo"
                                  width={80}
                                  height={80}
                                  className="object-contain"
                                />
                              </div>
                              {/* White Heart Logo - Bottom Right */}
                              <div 
                                className="absolute bottom-2 right-2 z-10 flex flex-col items-center gap-0.5"
                              >
                                <div
                                  className="cursor-pointer transition-all duration-200 hover:scale-110"
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
                                      fill={(post.isLiked || likedPosts.has(post.id)) ? "#EF4444" : "none"}
                                      stroke={(post.isLiked || likedPosts.has(post.id)) ? "#EF4444" : "white"}
                                      strokeWidth="1.875" 
                                      strokeLinecap="round" 
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </div>
                                <span className="text-white text-xs font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                                  {likeCounts.get(post.id) ?? post.likeCount ?? 0}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="relative w-full h-full rounded-lg overflow-hidden bg-gray-50">
                              <Image
                                src="/thuthachnhipsong/slide_example.png"
                                alt="Slide example"
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 256px, 320px"
                              />
                              {/* Tiger Logo - Centered Top */}
                              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src="/thuthachnhipsong/tiger_logo.svg"
                                  alt="TIGER Logo"
                                  width={80}
                                  height={80}
                                  className="object-contain"
                                />
                              </div>
                              {/* White Heart Logo - Bottom Right */}
                              <div 
                                className="absolute bottom-2 right-2 z-10 flex flex-col items-center gap-0.5"
                              >
                                <div
                                  className="cursor-pointer transition-all duration-200 hover:scale-110"
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
                                      fill={(post.isLiked || likedPosts.has(post.id)) ? "#EF4444" : "none"}
                                      stroke={(post.isLiked || likedPosts.has(post.id)) ? "#EF4444" : "white"}
                                      strokeWidth="1.875" 
                                      strokeLinecap="round" 
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </div>
                                <span className="text-white text-xs font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                                  {likeCounts.get(post.id) ?? post.likeCount ?? 0}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Bottom Section - tramnamnhipsong image */}
                        <div className="flex justify-center items-center pb-2 px-2 flex-shrink-0">
                          <Image
                            src="/thuthachnhipsong/tramnamgiunhipsong.png"
                            alt="Trăm năm giữ nhịp sống"
                            width={200}
                            height={60}
                            className="max-w-[100px] md:max-w-[140px]"
                            sizes="(max-width: 768px) 100px, 140px"
                            quality={90}
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
              disabled={isTransitioning || currentIndex === highlightedPosts.length - 1}
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
        {/* Navigation Dots - Sliding Window Logic */}
        {/* <div className="flex justify-center items-center gap-1.5 md:gap-2 mt-4 md:mt-8">
          {(() => {
            const MAX_VISIBLE_DOTS = 7;
            const totalPosts = highlightedPosts.length;
            
            if (totalPosts <= 1) return null;

            // Tính toán range của dots cần hiển thị
            let start = Math.max(0, currentIndex - Math.floor(MAX_VISIBLE_DOTS / 2));
            const end = Math.min(totalPosts - 1, start + MAX_VISIBLE_DOTS - 1);

            // Điều chỉnh lại start nếu đang ở gần cuối danh sách
            if (end - start + 1 < MAX_VISIBLE_DOTS) {
              start = Math.max(0, end - MAX_VISIBLE_DOTS + 1);
            }

            return highlightedPosts.slice(start, end + 1).map((_: Post, i: number) => {
              const actualIndex = start + i;
              return (
                <button
                  key={actualIndex}
                  onClick={() => handleDotClick(actualIndex)}
                  disabled={isTransitioning}
                  className={`transition-all duration-300 rounded-full ${
                    actualIndex === currentIndex
                      ? 'w-3 h-3 md:w-4 md:h-4 bg-blue-600'
                      : 'w-2 h-2 md:w-3 md:h-3 bg-gray-300 hover:bg-gray-400'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  aria-label={`Go to slide ${actualIndex + 1}`}
                />
              );
            });
          })()}
        </div> */}
      </div>
    </div>
  );
}

