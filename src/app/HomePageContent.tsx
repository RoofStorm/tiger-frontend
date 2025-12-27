'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { useNextAuth } from '@/hooks/useNextAuth';
import { useGlobalNavigationLoading } from '@/hooks/useGlobalNavigationLoading';
import { Button } from '@/components/ui/button';
import { HomeVideoPlayer } from '@/components/HomeVideoPlayer';

export function HomePageContent() {
  const { isAuthenticated } = useNextAuth();
  const router = useRouter();
  const { navigateWithLoading } = useGlobalNavigationLoading();
  const mainRef = useRef<HTMLElement>(null);
  const [showVideo, setShowVideo] = useState(true);

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
  };

  const handleSkipVideo = () => {
    setShowVideo(false);
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
    <div className="">
      {/* Video Player - hiển thị trước khi show content */}
      <AnimatePresence>
        {showVideo && (
          <HomeVideoPlayer
            onVideoEnded={handleVideoEnded}
            onSkip={handleSkipVideo}
          />
        )}
      </AnimatePresence>

      {/* Main Content - chỉ hiển thị sau khi video kết thúc */}
      <AnimatePresence>
        {!showVideo && (
          <motion.main
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }} 
            ref={mainRef}
            className="min-h-[calc(100vh-80px)] relative flex flex-col md:block mt-[64px] md:mt-[80px]"
          >
        {/* Mobile Layout: Product Image First, Content Second */}
        {/* Desktop Layout: Content Right, Product Image Bottom (absolute) */}

        {/* Product Image - Mobile: Top, Desktop: Hidden (shown in absolute below) */}
        <div 
          className="md:hidden relative z-10 flex justify-center w-full order-1"
          
        >
          <div className="w-full max-w-md px-4" style={{ marginTop: '30%' }}>
            <Image
              src="/trangchu/sanpham.svg"
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
          <div className="w-full md:w-1/2 px-6 md:px-12 py-8 md:py-12 md:mr-38 flex flex-col justify-center">
            {/* Title */}
            <h1 
              className="font-prata font-normal mb-6 md:mb-8 text-center" 
              style={{ 
                fontSize: '36px',
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
                Hơn một thế kỷ trước, chúng tôi chọn một con đường giản dị:
                giữ lại hơi ấm trong từng khoảnh khắc, để nhịp sống được gìn
                giữ trọn vẹn.
              </p>
              <p>
                Năm 1923, những chiếc bình Tiger vẫn đứng vững sau trận động
                đất Kanto, trở mang lại niềm tin cho hàng ngàn gia đình Nhật
                Bản.
              </p>
              <p>
                Từ di sản ấy, Tiger tiếp tục sáng tạo nồi cơm điện, hộp cơm,
                bình nước...
              </p>
              <p>
                Dù sản phẩm thay đổi, lời hứa vẫn nguyên vẹn: Giữ ấm từng bữa
                ăn, giữ trọn từng nhịp sống.
              </p>
            </div>

            {/* Button */}
            <div className="flex justify-center max-w-xl mx-auto w-full relative z-50">
              <Button
                onClick={() => {
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

