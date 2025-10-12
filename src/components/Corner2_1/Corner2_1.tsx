'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Heart, Play, Pause } from 'lucide-react';

export function Corner2_1() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const products = [
    {
      id: 'books',
      title: 'BÁC HỒ TUYÊN NGÔN ĐỘC LẬP',
      subtitle: 'Ấn bản kỷ niệm 80 năm Quốc Khánh',
      description: 'Bác Hồ viết Tuyên ngôn độc lập - Di sản văn hóa quốc gia',
      image: '/api/placeholder/200/250',
      color: 'from-red-600 to-red-800',
      icon: '📚',
      brand: 'Fahasa.com',
    },
    {
      id: 'phone-coffee',
      title: 'DÒNG LÒNG ĐI CHILL',
      subtitle: 'Dây đeo &ldquo;Đồng Lòng Đi Chill&rdquo;',
      description: '01 Dây đeo đa năng + 01 sản phẩm Phê-la',
      image: '/api/placeholder/200/250',
      color: 'from-green-500 to-green-700',
      icon: '📱',
      brand: 'Phe La',
    },
    {
      id: 'cake',
      title: 'CỜ ĐỎ SAO VÀNG BÁNH VELVET',
      subtitle: 'MENU ĐỘC LẬP - TỰ DO - HẠNH PHÚC',
      description: 'Bánh velvet với thiết kế cờ Việt Nam đặc biệt',
      image: '/api/placeholder/200/250',
      color: 'from-red-600 to-red-800',
      icon: '🎂',
      brand: 'Vietnamese Cuisine',
    },
    {
      id: 'cosmetics',
      title: 'ACHUAYEUNUOC',
      subtitle: 'Yêu nước mỗi ngày',
      description: 'Sản phẩm chăm sóc da Việt Nam với tinh thần yêu nước',
      image: '/api/placeholder/200/250',
      color: 'from-red-500 to-red-700',
      icon: '💄',
      brand: 'EUNUOC',
    },
    {
      id: 'coffee',
      title: 'HIGHLANDS COFFEE',
      subtitle: 'Sắc Việt',
      description: 'Cà phê Việt Nam với hương vị đậm đà bản sắc dân tộc',
      image: '/api/placeholder/200/250',
      color: 'from-red-600 to-red-800',
      icon: '☕',
      brand: 'Highlands Coffee',
    },
  ];

  // Navigation functions
  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(prev => (prev + 1) % products.length);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning, products.length]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(prev => (prev - 1 + products.length) % products.length);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning, products.length]);

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning || index === currentSlide) return;
      setIsTransitioning(true);
      setCurrentSlide(index);
      setTimeout(() => setIsTransitioning(false), 500);
    },
    [isTransitioning, currentSlide]
  );

  // Auto-play logic
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

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

  const testimonials = [
    {
      name: 'Nguyễn Thị Nhật Lệ',
      quote:
        'Tinh thần yêu nước là một truyền thống quý báu của dân tộc Việt Nam. Từ xưa đến nay, mỗi khi Tổ quốc bị xâm lăng là...',
      avatar: '/api/placeholder/60/60',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-600 via-red-700 to-red-800 relative overflow-hidden">
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

            {/* 5-Slide Carousel with Center Highlight */}
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
                  <div className="relative h-[500px] flex items-center justify-center overflow-hidden">
                    <motion.div
                      className="flex items-center justify-center space-x-2 relative"
                      layout
                    >
                      {/* Render 5 slides: 2 left, center, 2 right */}
                      {[-2, -1, 0, 1, 2].map(offset => {
                        const slideIndex =
                          (currentSlide + offset + products.length) %
                          products.length;
                        const isCenter = offset === 0;
                        const isLeft = offset < 0;

                        return (
                          <motion.div
                            key={`${currentSlide}-${offset}`}
                            layout
                            initial={{
                              opacity: 0,
                              scale: 0.8,
                              x: isLeft ? -200 : !isLeft && !isCenter ? 200 : 0,
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
                                ? 'w-80 h-96'
                                : `w-64 h-80 ${isLeft ? 'mr-2' : 'ml-2'}`
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
                                  (currentSlide + offset + products.length) %
                                  products.length;
                                goToSlide(targetIndex);
                              }
                            }}
                          >
                            <div
                              className={`bg-gradient-to-br ${products[slideIndex].color} h-full rounded-3xl shadow-xl border-4 ${
                                isCenter
                                  ? 'border-white/60 shadow-2xl'
                                  : 'border-white/30 hover:border-white/50'
                              } overflow-hidden relative transform transition-all duration-300 ${
                                isCenter ? 'hover:scale-105' : 'hover:scale-110'
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
                                      {products[slideIndex].brand}
                                    </span>
                                  </div>
                                </div>

                                {/* Product Icon */}
                                <div className="mb-6">
                                  <div
                                    className={`text-white opacity-90 drop-shadow-2xl ${
                                      isCenter ? 'text-6xl' : 'text-5xl'
                                    }`}
                                  >
                                    {products[slideIndex].icon}
                                  </div>
                                  <div className="w-20 h-1 bg-white/40 mx-auto rounded-full mt-3"></div>
                                </div>

                                {/* Product Info */}
                                <div className="max-w-xs">
                                  <h2
                                    className={`text-white font-bold mb-3 leading-tight ${
                                      isCenter ? 'text-xl' : 'text-lg'
                                    }`}
                                  >
                                    {products[slideIndex].title}
                                  </h2>
                                  <p
                                    className={`text-white/90 mb-4 ${
                                      isCenter ? 'text-sm' : 'text-xs'
                                    }`}
                                  >
                                    {products[slideIndex].subtitle}
                                  </p>

                                  {/* Only show description and CTA for center slide */}
                                  {isCenter && (
                                    <>
                                      <p className="text-white/80 text-xs leading-relaxed mb-6">
                                        {products[slideIndex].description}
                                      </p>

                                      {/* CTA Button */}
                                      <Button className="bg-white text-red-600 hover:bg-gray-100 font-bold text-sm px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                                        Khám phá ngay
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                      </Button>
                                    </>
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

                  {/* Navigation Dots */}
                  <div className="flex justify-center mt-8 space-x-2">
                    {products.map((_, index) => (
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
                  </div>

                  {/* Slide Counter */}
                  <div className="absolute bottom-4 left-4 z-50">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 border border-white/30">
                      <span className="text-white text-sm font-medium">
                        {currentSlide + 1} / {products.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Testimonials Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
            >
              <div className="flex flex-col md:flex-row items-start space-y-6 md:space-y-0 md:space-x-8">
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                    <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center">
                      <span className="text-white text-2xl">👩</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-4">
                    {testimonials[0].name}
                  </h3>
                  <blockquote className="text-white/90 text-lg leading-relaxed italic">
                    &ldquo;{testimonials[0].quote}&rdquo;
                  </blockquote>
                </div>

                <div className="flex-shrink-0">
                  <Button className="bg-white text-red-600 hover:bg-gray-100 font-medium px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
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
