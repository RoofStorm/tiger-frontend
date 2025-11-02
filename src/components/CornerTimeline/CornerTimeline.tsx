'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

interface Post {
  id: string;
  caption?: string;
  imageUrl?: string;
  user?: {
    name?: string;
    avatarUrl?: string;
  };
}

export function CornerTimeline() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 space-y-6"
        >
          <div className="space-y-2">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-blue-900">
              Cột mốc thời gian
            </h2>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-blue-900">
              giữ nhịp sống
            </h2>
          </div>
          <p className="text-base sm:text-lg text-gray-700 leading-relaxed max-w-4xl mx-auto">
            Đôi khi, nhịp sống nằm trong hơi nóng từ bữa cơm giản dị. Đôi khi,
            nó gói gọn trong vài dòng chữ nhỏ. Tiger mời bạn tham gia Thử thách
            Giữ Nhịp – nơi những điều nhỏ bé trở thành khoảnh khắc đáng nhớ – để
            cùng nhau tạo nên một dòng chảy bình yên, đầy đủ sắc màu.
          </p>
        </motion.div>

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
          <div className="relative">
            {/* Navigation Arrows */}
            <button
              onClick={prevSlide}
              disabled={isTransitioning || highlightedPosts.length <= 1}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-50 bg-white/80 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed opacity-40 hover:opacity-100"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>

            <button
              onClick={nextSlide}
              disabled={isTransitioning || highlightedPosts.length <= 1}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-50 bg-white/80 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed opacity-40 hover:opacity-100"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>

            {/* Pause/Play Button */}
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              disabled={highlightedPosts.length <= 1}
              className="absolute top-4 right-4 z-50 bg-white/80 backdrop-blur-sm rounded-full p-3 shadow-lg hover:bg-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={isAutoPlaying ? 'Pause' : 'Play'}
            >
              {isAutoPlaying ? (
                <Pause className="w-5 h-5 text-gray-700" />
              ) : (
                <Play className="w-5 h-5 text-gray-700" />
              )}
            </button>

            {/* Carousel Container */}
            <div
              ref={carouselRef}
              className="relative h-[500px] w-full overflow-visible"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className="relative h-full w-full flex items-center justify-center">
                {highlightedPosts.map((post: Post, index: number) => {
                  // Tính relative position so với currentSlide
                  const getPos = (idx: number) => {
                    const diff =
                      (idx - currentSlide + highlightedPosts.length) %
                      highlightedPosts.length;

                    // Chuyển đổi diff thành relative position (-2, -1, 0, 1, 2)
                    // Với wrap-around: nếu diff > 2, tính từ phía bên kia
                    let pos = diff;
                    const total = highlightedPosts.length;

                    // Với 5 items: diff = 0,1,2 là right (0,1,2), diff = 3,4 là left (-2,-1)
                    if (diff > 2) {
                      pos = diff - total; // Negative position: 3 -> -2, 4 -> -1
                    }

                    // Chỉ hiển thị 5 slides gần center: -2, -1, 0, 1, 2
                    if (Math.abs(pos) > 2) {
                      return 99; // Không hiển thị
                    }

                    return pos;
                  };

                  const pos = getPos(index);

                  if (pos === 99) return null; // Chỉ hiển thị 5 slides gần center

                  const isCenter = pos === 0;

                  // Tính toán: slides ±2 overlap với slides ±1
                  // translateBase cho slides ±1
                  const translateBaseAdjacent = 290; // Khoảng cách từ center đến ±1
                  // translateBase cho slides ±2 - điều chỉnh để hiển thị trong viewport
                  // Slides ±2 sẽ overlap với ±1 nên khoảng cách không quá xa
                  const translateBaseOuter = 240; // Giảm từ 500 xuống 380 để slides ±2 hiển thị được

                  const xMove =
                    pos === 0
                      ? 0
                      : Math.abs(pos) === 1
                        ? pos * translateBaseAdjacent
                        : pos * translateBaseOuter;

                  // Scale và opacity - slides ±2 nhỏ hơn và mờ hơn nhưng vẫn thấy được
                  const scale =
                    pos === 0 ? 1.12 : Math.abs(pos) === 1 ? 0.94 : 0.8; // ±2 tăng từ 0.75 lên 0.8 để thấy rõ hơn
                  const opacity =
                    pos === 0 ? 1 : Math.abs(pos) === 1 ? 0.6 : 0.5; // ±2 tăng từ 0.4 lên 0.5 để thấy rõ hơn
                  // Z-index: center cao nhất, ±1 cao hơn ±2 (thấp hơn header z-40)
                  const zIndex = pos === 0 ? 30 : Math.abs(pos) === 1 ? 20 : 10;

                  // Kích thước responsive - slides ±2 nhỏ hơn ±1
                  const getHeight = (position: number) => {
                    if (position === 0) return 380;
                    if (Math.abs(position) === 1) return 340;
                    return 280; // ±2 nhỏ hơn
                  };

                  const getWidth = (position: number) => {
                    if (position === 0) return 'w-[28rem]'; // 448px
                    if (Math.abs(position) === 1) return 'w-[24rem]'; // 384px
                    return 'w-[18rem]'; // 288px - ±2 nhỏ hơn
                  };

                  return (
                    <motion.div
                      key={post.id}
                      className={`absolute ${getWidth(pos)} cursor-pointer`}
                      style={{
                        height: `${getHeight(pos)}px`,
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
                        } overflow-hidden bg-white`}
                      >
                        {post.imageUrl ? (
                          <Image
                            src={post.imageUrl}
                            alt={post.caption || 'Post image'}
                            fill
                            className="object-cover"
                            unoptimized={post.imageUrl?.includes(
                              'localhost:9000'
                            )}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400">No image</span>
                          </div>
                        )}
                        <div
                          className={`absolute inset-0 transition-colors duration-300 ${
                            isCenter
                              ? 'bg-black/0 hover:bg-black/10'
                              : 'bg-black/20 hover:bg-black/30'
                          }`}
                        />
                      </div>
                      {/* Đánh số slide để debug */}
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-center">
                        <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                          Slide {index + 1} (pos: {pos})
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          ID: {post.id}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
