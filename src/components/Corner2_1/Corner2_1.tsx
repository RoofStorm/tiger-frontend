'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Heart, Play, Pause, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import apiClient from '@/lib/api';
import { useNextAuth } from '@/hooks/useNextAuth';
import { useToast } from '@/hooks/use-toast';

interface Post {
  id: string;
  caption?: string;
  imageUrl?: string;
  user?: {
    name?: string;
    avatarUrl?: string;
  };
}

export function Corner2_1() {
  const router = useRouter();
  const { isAuthenticated, user } = useNextAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  // Fetch highlighted wishes for testimonials
  const { data: wishesData } = useQuery({
    queryKey: ['highlighted-wishes-testimonials'],
    queryFn: () => apiClient.getHighlightedWishes(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Fetch highlighted posts for carousel
  const { data: postsData, isLoading: isLoadingPosts } = useQuery({
    queryKey: ['highlighted-posts-carousel', user?.id],
    queryFn: () => apiClient.getHighlightedPosts(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Fetch user actions to check which posts are liked
  const { data: userActionsData } = useQuery({
    queryKey: ['user-actions', user?.id],
    queryFn: () => apiClient.getUserActions(),
    enabled: isAuthenticated && !!user,
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
  });

  const userActions = userActionsData?.data || [];
  const likedPostIds = userActions
    .filter(
      (action: { type: string; postId: string }) => action.type === 'LIKE'
    )
    .map((action: { type: string; postId: string }) => action.postId);

  const highlightedWishes = wishesData?.data || [];

  const highlightedPosts = Array.isArray(postsData?.data?.posts)
    ? postsData.data.posts.slice(0, 15) // Limit to max 15 posts
    : [];

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: (postId: string) => apiClient.likePost(postId),
    onSuccess: data => {
      // Invalidate posts and user actions to refresh data
      queryClient.invalidateQueries({
        queryKey: ['highlighted-posts-carousel', user?.id],
      });
      queryClient.invalidateQueries({ queryKey: ['user-actions', user?.id] });
      // Invalidate user details to refresh points
      queryClient.invalidateQueries({ queryKey: ['userDetails', user?.id] });

      if (data.action === 'liked') {
        toast({
          title: 'Đã thích bài viết!',
          description: 'Cảm ơn bạn đã chia sẻ cảm xúc.',
          duration: 3000,
        });
      } else if (data.action === 'unliked') {
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

  // Share mutation
  const shareMutation = useMutation({
    mutationFn: (postId: string) => apiClient.sharePost(postId),
    onSuccess: result => {
      // Invalidate posts to refresh global counts
      queryClient.invalidateQueries({
        queryKey: ['highlighted-posts-carousel', user?.id],
      });
      // Invalidate user details to refresh points
      queryClient.invalidateQueries({ queryKey: ['userDetails', user?.id] });
      // Invalidate point logs to refresh point history
      queryClient.invalidateQueries({ queryKey: ['pointHistory', user?.id] });

      // Show success message with points info
      toast({
        title: 'Chia sẻ thành công!',
        description:
          result.pointsMessage || 'Bài viết đã được chia sẻ thành công.',
        duration: 4000,
      });
    },
  });

  // Auto-slide testimonials every 4 seconds
  useEffect(() => {
    if (highlightedWishes.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentTestimonial(prev => (prev + 1) % highlightedWishes.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [highlightedWishes.length]);

  // Mock products removed - using only highlighted posts

  // Create products from highlighted posts with extra safety
  const postsAsProducts = (() => {
    if (!Array.isArray(highlightedPosts)) {
      return [];
    }

    if (highlightedPosts.length === 0) {
      return [];
    }

    return highlightedPosts?.map((post: Post, index: number) => ({
      id: `post-${post.id}`,
      title:
        post.caption?.substring(0, 30) +
          (post.caption && post.caption.length > 30 ? '...' : '') ||
        'Bài viết nổi bật',
      subtitle: post.user?.name || 'Người dùng ẩn danh',
      description: post.caption || 'Nội dung bài viết',
      image: post.imageUrl || '/api/placeholder/200/250',
      color: [
        'from-red-600 to-red-800',
        'from-green-500 to-green-700',
        'from-blue-500 to-blue-700',
        'from-purple-500 to-purple-700',
        'from-orange-500 to-orange-700',
      ][index % 5],
      icon: post.user?.avatarUrl,
      brand: 'Tiger Highlight Posts',
    }));
  })();

  // Use posts as products (no fallback needed)
  const displayProducts = postsAsProducts;

  // Navigation functions
  const nextSlide = useCallback(() => {
    if (isTransitioning || displayProducts.length === 0) return;
    setIsTransitioning(true);
    setCurrentSlide(prev => (prev + 1) % displayProducts.length);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning, displayProducts.length]);

  const prevSlide = useCallback(() => {
    if (isTransitioning || displayProducts.length === 0) return;
    setIsTransitioning(true);
    setCurrentSlide(
      prev => (prev - 1 + displayProducts.length) % displayProducts.length
    );
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning, displayProducts.length]);

  const goToSlide = useCallback(
    (index: number) => {
      if (
        isTransitioning ||
        index === currentSlide ||
        displayProducts.length === 0
      )
        return;
      setIsTransitioning(true);
      setCurrentSlide(index);
      setTimeout(() => setIsTransitioning(false), 500);
    },
    [isTransitioning, currentSlide, displayProducts.length]
  );

  // Auto-play logic
  useEffect(() => {
    if (!isAutoPlaying || displayProducts.length <= 1) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, displayProducts.length]);

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
  }, [isAutoPlaying, nextSlide, prevSlide]);

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
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  // Handle like post
  const handleLike = (postId: string) => {
    if (!isAuthenticated) {
      toast({
        title: 'Cần đăng nhập',
        description: 'Vui lòng đăng nhập để thích bài viết.',
        variant: 'destructive',
        duration: 4000,
      });
      return;
    }

    // Prevent duplicate calls
    if (likeMutation.isPending) {
      return;
    }
    likeMutation.mutate(postId);
  };

  // Handle share post
  const handleShare = (post: Post) => {
    if (!isAuthenticated) {
      toast({
        title: 'Cần đăng nhập',
        description: 'Vui lòng đăng nhập để chia sẻ bài viết.',
        variant: 'destructive',
        duration: 4000,
      });
      return;
    }

    // Tạo URL preview cho bài viết
    const baseUrl =
      process.env.NEXT_PUBLIC_PUBLIC_URL ||
      process.env.NEXTAUTH_URL ||
      'http://localhost:3000';
    const postUrl = `${baseUrl}/posts/${post.id}`;

    // Tạo Facebook Share URL
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;

    // Mở popup Facebook Share Dialog
    const popup = window.open(
      facebookShareUrl,
      'facebook-share-dialog',
      'width=800,height=600,scrollbars=yes,resizable=yes'
    );

    // Kiểm tra nếu popup bị block
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      toast({
        title: 'Popup bị chặn',
        description: 'Vui lòng cho phép popup để chia sẻ.',
        variant: 'destructive',
        duration: 4000,
      });
      return;
    }

    // Focus vào popup
    if (popup) {
      popup.focus();
    }

    // Cập nhật share count
    shareMutation.mutate(post.id);
  };

  // Create testimonials from highlighted wishes
  const testimonials = highlightedWishes.map(
    (wish: {
      user?: { name?: string; image?: string; avatarUrl?: string };
      content: string;
    }) => ({
      name: wish.user?.name || 'Người dùng ẩn danh',
      quote: wish.content,
      avatar: wish.user?.avatarUrl || wish.user?.image || null,
    })
  );

  // Fallback testimonials if no highlighted wishes
  const fallbackTestimonials = [
    {
      name: 'Nguyễn Thị Nhật Lệ',
      quote:
        'Tinh thần yêu nước là một truyền thống quý báu của dân tộc Việt Nam. Từ xưa đến nay, mỗi khi Tổ quốc bị xâm lăng là tinh thần ấy lại kết thành một làn sóng mạnh mẽ.',
      avatar: null,
    },
  ];

  const displayTestimonials =
    testimonials.length > 0 ? testimonials : fallbackTestimonials;

  return (
    <div
      data-corner="2"
      className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-400 to-red-600 transform rotate-12 scale-150"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
      </div>

      <div className="relative z-10 min-h-screen py-12">
        {/* Phần 1: Two Cards Layout - Minimal margins */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-full mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12"
            >
              {/* Card 1 - 1/3 width */}
              <div className="lg:col-span-1">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 h-full flex items-center">
                  <p className="text-white text-lg leading-relaxed">
                    Lan tỏa tình yêu nước bằng những sản phẩm &ldquo;made in
                    Vietnam&rdquo; sáng tạo & chất lượng
                  </p>
                </div>
              </div>

              {/* Card 2 - 2/3 width */}
              <div className="lg:col-span-2">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 h-full">
                  <h2 className="text-xl font-bold text-white mb-4">
                    Toplist uy tín do Ban biên tập Kenh14 thẩm định và bình
                    chọn, dựa trên các tiêu chí rõ ràng:
                  </h2>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <h3 className="text-lg font-bold text-white mb-2">
                          Made in Việt Nam
                        </h3>
                        <p className="text-white/80 leading-relaxed">
                          Sản phẩm của thương hiệu nội địa phát triển, mang dấu
                          ấn bản địa, được ra mắt dịp 2/9 hoặc lan tỏa tinh thần
                          tích cực, yêu nước.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-white rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <h3 className="text-lg font-bold text-white mb-2">
                          Chất lượng và độ hoàn thiện
                        </h3>
                        <p className="text-white/80 leading-relaxed">
                          Sản phẩm được hoàn thiện tốt, sẵn sàng sử dụng hoặc
                          kinh doanh, không vi phạm bản quyền và có nguồn gốc
                          xuất xứ rõ ràng (đặc biệt đối với F&B và sản phẩm dành
                          cho trẻ em).
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Phần 2: Call to Action + Products Showcase - Normal margins */}
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center mb-12"
            >
              <p className="text-xl text-white mb-6">
                Xem các sản phẩm yêu nước & chơi game nhận quà ngay!
              </p>
              <Button className="bg-white text-red-600 hover:bg-gray-100 font-bold text-lg px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                KHÁM PHÁ
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>

            {/* Loading Spinner */}
            {isLoadingPosts && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center py-20"
              >
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-white/80 text-lg font-medium">
                    Đang tải bài viết nổi bật...
                  </p>
                  <p className="text-white/60 text-sm">
                    Vui lòng chờ trong giây lát
                  </p>
                </div>
              </motion.div>
            )}

            {/* 5-Slide Carousel with Center Highlight - Only show if we have posts */}
            {!isLoadingPosts && displayProducts.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mb-12"
              >
                <div className="relative">
                  {/* Carousel Container */}
                  <div
                    ref={carouselRef}
                    className="relative w-full max-w-7xl mx-auto"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                  >
                    {/* 5-Slide Display */}
                    <div className="relative h-[600px] flex items-center justify-center overflow-hidden">
                      <motion.div
                        className="flex items-center justify-center space-x-2 relative"
                        layout
                      >
                        {/* Render 5 slides: 2 left, center, 2 right */}
                        {[-2, -1, 0, 1, 2].map(offset => {
                          const slideIndex =
                            (currentSlide + offset + displayProducts.length) %
                            displayProducts.length;
                          const isCenter = offset === 0;
                          const isLeft = offset < 0;

                          return (
                            <motion.div
                              key={`${currentSlide}-${offset}`}
                              layout
                              initial={{
                                opacity: 0,
                                scale: 0.8,
                                x: isLeft
                                  ? -200
                                  : !isLeft && !isCenter
                                    ? 200
                                    : 0,
                              }}
                              animate={{
                                opacity: isCenter ? 1 : 0.6,
                                scale: isCenter ? 1 : 0.8,
                                x: 0,
                                zIndex: isCenter
                                  ? 50
                                  : Math.abs(offset) === 1
                                    ? 40
                                    : 30,
                              }}
                              whileInView={{
                                scale: isCenter ? [1, 1.02, 1] : 0.8,
                                transition: {
                                  duration: 0.6,
                                  ease: [0.25, 0.46, 0.45, 0.94],
                                  delay: 0.5,
                                },
                              }}
                              transition={{
                                duration: 0.8,
                                ease: [0.25, 0.46, 0.45, 0.94],
                                type: 'spring',
                                stiffness: 100,
                                damping: 20,
                                delay: Math.abs(offset) * 0.1,
                              }}
                              className={`relative cursor-pointer transition-all duration-300 ease-in-out ${
                                isCenter
                                  ? 'w-80 h-[450px]'
                                  : `w-64 h-[400px] ${isLeft ? 'mr-2' : 'ml-2'}`
                              }`}
                              style={{}}
                              whileHover={{
                                scale: isCenter ? 1.05 : 0.85,
                                transition: {
                                  duration: 0.3,
                                  ease: [0.25, 0.46, 0.45, 0.94],
                                  type: 'spring',
                                  stiffness: 300,
                                  damping: 20,
                                },
                              }}
                              onClick={() => {
                                if (!isCenter) {
                                  const targetIndex =
                                    (currentSlide +
                                      offset +
                                      displayProducts.length) %
                                    displayProducts.length;
                                  goToSlide(targetIndex);
                                }
                              }}
                            >
                              <div
                                className={`bg-gradient-to-br ${displayProducts[slideIndex].color} h-full rounded-3xl shadow-xl border-4 ${
                                  isCenter
                                    ? 'border-white/60 shadow-2xl'
                                    : 'border-white/30 hover:border-white/50'
                                } overflow-hidden relative transform transition-all duration-300 ${
                                  isCenter
                                    ? 'hover:scale-105'
                                    : 'hover:scale-110'
                                }`}
                              >
                                {/* Background Pattern */}
                                <div className="absolute inset-0 opacity-10">
                                  <div className="absolute top-8 right-8 w-24 h-24 bg-white/20 rounded-full"></div>
                                  <div className="absolute bottom-8 left-8 w-20 h-20 bg-white/20 rounded-full"></div>
                                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/10 rounded-full"></div>
                                </div>

                                {/* Content */}
                                <div className="relative z-10 h-full flex flex-col justify-center items-center text-center p-6">
                                  {/* Brand Logo */}
                                  <div className="mb-4">
                                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
                                      <span className="text-white font-bold text-sm">
                                        {displayProducts[slideIndex].brand}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Product Info */}
                                  <div className="max-w-xs">
                                    {/* Post Image - Only for center slide */}
                                    {isCenter &&
                                      displayProducts[slideIndex].image && (
                                        <div className="mb-4">
                                          <div className="relative w-full h-32 rounded-lg overflow-hidden border-2 border-white/30">
                                            <Image
                                              src={
                                                displayProducts[slideIndex]
                                                  .image
                                              }
                                              alt={
                                                displayProducts[slideIndex]
                                                  .title
                                              }
                                              width={300}
                                              height={128}
                                              className="w-full h-full object-cover"
                                              unoptimized={displayProducts[
                                                slideIndex
                                              ].image?.includes(
                                                'localhost:9000'
                                              )}
                                            />
                                          </div>
                                        </div>
                                      )}

                                    {/* Caption */}
                                    <h2
                                      className={`text-white font-bold mb-3 leading-tight ${
                                        isCenter ? 'text-xl' : 'text-lg'
                                      }`}
                                    >
                                      {displayProducts[slideIndex].title}
                                    </h2>

                                    {/* User Info with Avatar */}
                                    <div className="flex items-center justify-center space-x-3 mb-4">
                                      {/* User Avatar */}
                                      <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/30 flex-shrink-0">
                                        {displayProducts[slideIndex].icon ? (
                                          <Image
                                            src={
                                              displayProducts[slideIndex].icon
                                            }
                                            alt={
                                              displayProducts[slideIndex]
                                                .subtitle
                                            }
                                            width={40}
                                            height={40}
                                            className="w-full h-full object-cover"
                                            unoptimized={displayProducts[
                                              slideIndex
                                            ].icon?.includes(
                                              'platform-lookaside.fbsbx.com'
                                            )}
                                            onError={e => {
                                              const target =
                                                e.target as HTMLImageElement;
                                              target.style.display = 'none';
                                              const fallback =
                                                target.nextElementSibling as HTMLElement;
                                              if (fallback)
                                                fallback.style.display = 'flex';
                                            }}
                                          />
                                        ) : null}
                                        <div
                                          className="text-white text-sm flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 w-full h-full"
                                          style={{
                                            display: displayProducts[slideIndex]
                                              .icon
                                              ? 'none'
                                              : 'flex',
                                          }}
                                        >
                                          {displayProducts[slideIndex].subtitle
                                            ?.charAt(0)
                                            ?.toUpperCase() || '👤'}
                                        </div>
                                      </div>
                                      {/* User Name */}
                                      <p
                                        className={`text-white/90 ${
                                          isCenter ? 'text-base' : 'text-sm'
                                        }`}
                                      >
                                        {displayProducts[slideIndex].subtitle}
                                      </p>
                                    </div>

                                    {/* Only show CTA for center slide */}
                                    {isCenter && (
                                      <div className="space-y-4">
                                        <Button
                                          onClick={() => {
                                            // Extract post ID from displayProducts[slideIndex].id
                                            const postId = displayProducts[
                                              slideIndex
                                            ].id.replace('post-', '');
                                            router.push(`/posts/${postId}`);
                                          }}
                                          className="bg-white text-red-600 hover:bg-gray-100 font-bold text-sm px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                                        >
                                          Khám phá ngay
                                          <ArrowRight className="w-4 h-4 ml-2" />
                                        </Button>

                                        {/* Action Buttons */}
                                        <div className="flex items-center justify-center space-x-4">
                                          {/* Like Button */}
                                          <button
                                            onClick={() => {
                                              const postId = displayProducts[
                                                slideIndex
                                              ].id.replace('post-', '');
                                              handleLike(postId);
                                            }}
                                            disabled={likeMutation.isPending}
                                            className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
                                              likedPostIds.includes(
                                                displayProducts[
                                                  slideIndex
                                                ].id.replace('post-', '')
                                              )
                                                ? 'bg-red-500 text-white'
                                                : 'bg-white/20 text-white hover:bg-white/30'
                                            }`}
                                          >
                                            <Heart
                                              className={`w-4 h-4 transition-colors duration-200 ${
                                                likedPostIds.includes(
                                                  displayProducts[
                                                    slideIndex
                                                  ].id.replace('post-', '')
                                                )
                                                  ? 'fill-red-500'
                                                  : ''
                                              }`}
                                            />
                                            <span className="text-sm font-medium">
                                              {likeMutation.isPending
                                                ? '...'
                                                : highlightedPosts.find(
                                                    (p: Post) =>
                                                      p.id ===
                                                      displayProducts[
                                                        slideIndex
                                                      ].id.replace('post-', '')
                                                  )?.likeCount || 0}
                                            </span>
                                          </button>

                                          {/* Share Button */}
                                          <button
                                            onClick={() => {
                                              const postId = displayProducts[
                                                slideIndex
                                              ].id.replace('post-', '');
                                              const post =
                                                highlightedPosts.find(
                                                  (p: Post) => p.id === postId
                                                );
                                              if (post) {
                                                handleShare(post);
                                              }
                                            }}
                                            className="flex items-center space-x-2 px-4 py-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-all duration-300"
                                          >
                                            <Share2 className="w-4 h-4" />
                                            <span className="text-sm font-medium">
                                              {highlightedPosts.find(
                                                (p: Post) =>
                                                  p.id ===
                                                  displayProducts[
                                                    slideIndex
                                                  ].id.replace('post-', '')
                                              )?.shareCount || 0}
                                            </span>
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Decorative Elements - only for center */}
                                  {isCenter && (
                                    <>
                                      <div className="absolute top-4 left-4 w-12 h-12 bg-white/10 rounded-full"></div>
                                      <div className="absolute bottom-4 right-4 w-8 h-8 bg-white/10 rounded-full"></div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    </div>

                    {/* Auto-play Control */}
                    <div className="absolute top-4 right-4 z-50">
                      <button
                        onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                          isAutoPlaying
                            ? 'bg-white/90 hover:bg-white'
                            : 'bg-white/60 hover:bg-white/80'
                        }`}
                        aria-label={
                          isAutoPlaying ? 'Pause slideshow' : 'Play slideshow'
                        }
                      >
                        {isAutoPlaying ? (
                          <Pause className="w-5 h-5 text-red-600" />
                        ) : (
                          <Play className="w-5 h-5 text-red-600" />
                        )}
                      </button>
                    </div>

                    {/* Navigation Dots - Commented out */}
                    {/* <div className="flex justify-center mt-8 space-x-2">
                      {displayProducts.map((_: unknown, index: number) => (
                        <button
                          key={index}
                          onClick={() => goToSlide(index)}
                          disabled={isTransitioning}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            index === currentSlide
                              ? 'bg-white scale-125'
                              : 'bg-white/50 hover:bg-white/70'
                          }`}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      ))}
                    </div> */}

                    {/* Slide Counter */}
                    <div className="absolute bottom-4 left-4 z-50">
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 border border-white/30">
                        <span className="text-white text-sm font-medium">
                          {currentSlide + 1} / {displayProducts.length}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* No Posts Message */}
            {!isLoadingPosts && displayProducts.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="mb-12 text-center"
              >
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Chưa có bài viết nổi bật
                  </h3>
                  <p className="text-white/80 mb-6">
                    Hãy tạo bài viết đầu tiên để xuất hiện ở đây!
                  </p>
                  <Button
                    onClick={() => router.push('/#corner-2')}
                    className="bg-white text-red-600 hover:bg-gray-100 font-bold px-6 py-3 rounded-xl"
                  >
                    Tạo bài viết
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Testimonials Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
            >
              <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center overflow-hidden">
                      {displayTestimonials[currentTestimonial]?.avatar ? (
                        <Image
                          src={displayTestimonials[currentTestimonial].avatar}
                          alt={
                            displayTestimonials[currentTestimonial]?.name ||
                            'User'
                          }
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                          unoptimized={displayTestimonials[
                            currentTestimonial
                          ].avatar?.includes('platform-lookaside.fbsbx.com')}
                          onError={e => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const fallback =
                              target.nextElementSibling as HTMLElement;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className="text-white text-2xl flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 w-full h-full"
                        style={{
                          display: displayTestimonials[currentTestimonial]
                            ?.avatar
                            ? 'none'
                            : 'flex',
                        }}
                      >
                        {displayTestimonials[currentTestimonial]?.name
                          ?.charAt(0)
                          ?.toUpperCase() || '👤'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentTestimonial}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.5 }}
                    >
                      <h3 className="text-xl font-bold text-white mb-4">
                        {displayTestimonials[currentTestimonial]?.name}
                      </h3>
                      <blockquote className="text-white/90 text-lg leading-relaxed italic">
                        &ldquo;
                        {displayTestimonials[currentTestimonial]?.quote &&
                        displayTestimonials[currentTestimonial].quote.length >
                          100
                          ? `${displayTestimonials[currentTestimonial].quote.substring(0, 100)}...`
                          : displayTestimonials[currentTestimonial]?.quote}
                        &rdquo;
                      </blockquote>
                    </motion.div>
                  </AnimatePresence>
                </div>

                <div className="flex-shrink-0">
                  <Button
                    onClick={() => router.push('/wishes')}
                    className="bg-white text-red-600 hover:bg-gray-100 font-medium px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    GỬI LỜI CHÚC NGAY
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
