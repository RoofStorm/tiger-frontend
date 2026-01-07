'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { useGlobalNavigationLoading } from '@/hooks/useGlobalNavigationLoading';
import { Button } from '@/components/ui/button';
import { HomeVideoPlayer } from '@/components/HomeVideoPlayer';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useZoneView } from '@/hooks/useZoneView';
import { useVideo } from '@/contexts/VideoContext';

export function HomePageContent() {
  const { navigateWithLoading } = useGlobalNavigationLoading();
  const mainRef = useRef<HTMLElement>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const [showVideo, setShowVideo] = useState(true);
  const { trackClick } = useAnalytics();
  const { setIsContentReady } = useVideo();

  // Reset video context state when home page mounts
  useEffect(() => {
    setIsContentReady(false);
    // Note: isVideoPlaying will be set by HomeVideoPlayer
  }, [setIsContentReady]);

  // Track time on Welcome page
  useZoneView(pageRef, {
    page: 'welcome',
    zone: 'overview',
    enabled: !showVideo, // Only track when content is shown
  });

  // Tạm thời tắt auto redirect đến /video
  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     const hasWatchedVideo = localStorage.getItem('hasWatchedVideo');
  //     if (!hasWatchedVideo) {
  //       router.push('/video');
  //     }
  //   }
  // }, [isAuthenticated, router]);

  const handleVideoEnded = () => {
    setShowVideo(false);
    setIsContentReady(true); // Content đã sẵn sàng sau khi video kết thúc
  };

  const handleSkipVideo = () => {
    setShowVideo(false);
    setIsContentReady(true); // Content đã sẵn sàng sau khi skip video
  };

  useEffect(() => {
    // Chỉ update background khi content đã hiển thị (showVideo = false)
    if (showVideo) return;

    const updateBackgroundStyle = () => {
      if (mainRef.current) {
        const isMobile = window.matchMedia('(max-width: 767px)').matches;
        mainRef.current.style.backgroundImage = isMobile 
          ? 'url(/trangchu/trangchu_background_mobile.svg)'
          : 'url(/trangchu/trangchu_background.svg)';
        mainRef.current.style.backgroundSize = isMobile ? 'contain' : 'cover';
        mainRef.current.style.backgroundPosition = isMobile ? 'top' : 'center -70px';
        mainRef.current.style.backgroundRepeat = 'no-repeat';
      }
    };

    // Sử dụng requestAnimationFrame để đảm bảo DOM đã render
    let rafId2: number | null = null;
    const rafId = requestAnimationFrame(() => {
      // Thêm một frame nữa để chắc chắn
      rafId2 = requestAnimationFrame(() => {
        updateBackgroundStyle();
      });
    });

    window.addEventListener('resize', updateBackgroundStyle);
    return () => {
      cancelAnimationFrame(rafId);
      if (rafId2 !== null) {
        cancelAnimationFrame(rafId2);
      }
      window.removeEventListener('resize', updateBackgroundStyle);
    };
  }, [showVideo]);

  return (
    <div ref={pageRef} className="">
      {/* Video Player - hiển thị trước khi show content */}
      <AnimatePresence>
        {showVideo && (
          <motion.div
            key="video-player"
            exit={{ y: '-100%' }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="fixed inset-0 z-[70]"
          >
            <HomeVideoPlayer
              onVideoEnded={handleVideoEnded}
              onSkip={handleSkipVideo}
              videoUrl="https://s3.tiger-corporation-vietnam.vn/tiger-videos/tiger%2021.mp4"
            />
          </motion.div>
        )}

        {!showVideo && (
          <motion.main
            key="main-content"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            ref={mainRef}
            className="relative flex flex-col md:block mt-[64px] xl:mt-[80px]"
          >
        {/* Mobile Layout: Product Image First, Content Second */}
        {/* Desktop Layout: Content Right, Product Image Bottom (absolute) */}

        {/* Product Image - Mobile: Top, Desktop: Hidden (shown in absolute below) */}
        <div 
          className="md:hidden relative z-10 flex justify-center w-full order-1"
          
        >
          <div className="w-full max-w-md px-4" style={{ marginTop: '30%' }}>
            <Image
              src="/trangchu/sanpham.png"
              alt="Sản phẩm"
              width={1000}
              height={800}
              className="w-full h-auto object-cover"
              style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
            />
          </div>
        </div>

        {/* Content - Mobile: Bottom, Desktop: Right */}
        <div className="relative z-20 h-full flex order-2 md:order-none">
          {/* Empty space - 2/3 left (Desktop only) */}
          <div className="hidden md:block w-1/2"></div>
          
          {/* Content - Mobile: Full width, Desktop: 1/3 right */}
          <div className="w-full lg:w-1/2 px-6 ld:px-12 py-4 sm:py-6 lg:py-8 lg:mr-38 flex flex-col justify-center">
            {/* Title */}
            <h1 
              className="font-prata font-normal mb-6 md:mb-8 text-center lg:text-[36px] text-[28px]" 
              style={{ 
                // fontSize: '36px',
                lineHeight: '40px',
                letterSpacing: '0.03em',
                color: '#0B4386'
              }}
            >
              Giữ nhịp trọn vẹn hơn
              <br />
              một thế kỷ
            </h1>

            {/* Body Text */}
            <div 
              className="font-nunito font-normal space-y-3 md:space-y-4 mb-2 md:mb-4 max-w-xl mx-auto" 
              style={{ 
                fontSize: '16px',
                lineHeight: '22px',
                letterSpacing: '-0.02em',
                textAlign: 'justify',
                color: '#0B4386'
              }}
            >
              <p>
              Hơn một thế kỷ trước, TIGER chọn con đường giản dị: giữ nhiệt ổn định cho nhu cầu uống nước rất đời thường, để nhịp sinh hoạt hàng ngày được duy trì trọn vẹn.
              </p>
              <p>
              Năm 1923, sau trận động đất Kanto, nhiều chiếc bình TIGER vẫn còn nguyên vẹn giữa đổ nát, trong khi phần lớn các bình chân không khác bị hư hại nặng nề. Chính độ bền và sự ổn định này đã khiến TIGER dần trở thành lựa chọn quen thuộc của nhiều gia đình Nhật Bản trong giai đoạn đó.
              </p>
              <p>
              Từ di sản ấy, TIGER tiếp tục phát triển nồi cơm điện, hộp cơm, máy xay sinh tố,… 
              </p>
              <p>
              Dù sản phẩm thay đổi theo thời gian, lời hứa của TIGER vẫn không đổi: Giữ ấm từng bữa ăn, giữ trọn từng nhịp sống. 
              </p>
              <p>TIGER đã giữ nhịp sống trọn vẹn hơn một thế kỷ. Còn nhịp sống hôm nay của bạn thì sao? 
              </p>
            </div>

            {/* Button */}
            <div className="flex justify-center max-w-xl mx-auto w-full relative z-50">
              <Button
                onClick={() => {
                  trackClick('welcome', {
                    zone: 'overview',
                    component: 'button',
                    metadata: { label: 'kham_pha_ngay' },
                  });
                  navigateWithLoading('/nhip-song', 'Đang chuyển đến Nhịp sống...');
                }}
                className="px-8 py-3 rounded-lg text-white font-medium transition-all duration-300 w-full cursor-pointer hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg relative z-50"
                style={{ backgroundColor: '#00579F', zIndex: 50 }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#004080';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#00579F';
                }}
              >
                Khám phá ngay
              </Button>
            </div>
          </div>
        </div>

        {/* Desktop: Product Image Bottom */}
        <div 
          className="hidden md:flex relative w-full z-10 flex justify-center mt-[-170px]"
        >
          <Image
            src="/trangchu/sanpham.png"
            alt="Sản phẩm"
            width={1000}
            height={800}
            className="w-[80%] h-auto object-contain"
            sizes="(max-width: 768px) 100vw, (max-width: 1536px) 80vw, 1536px"
            priority
            quality={90}
            />
        </div>
      </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}

