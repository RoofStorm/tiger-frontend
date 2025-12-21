'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Header } from '@/components/Header';
import { useNextAuth } from '@/hooks/useNextAuth';
import { useGlobalNavigationLoading } from '@/hooks/useGlobalNavigationLoading';
import { Button } from '@/components/ui/button';

export function HomePageContent() {
  const { isAuthenticated } = useNextAuth();
  const router = useRouter();
  const { navigateWithLoading } = useGlobalNavigationLoading();
  const mainRef = useRef<HTMLElement>(null);

  // Tạm thời tắt auto redirect đến /video
  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     const hasWatchedVideo = localStorage.getItem('hasWatchedVideo');
  //     if (!hasWatchedVideo) {
  //       router.push('/video');
  //     }
  //   }
  // }, [isAuthenticated, router]);

  useEffect(() => {
    const updateBackgroundStyle = () => {
      if (mainRef.current) {
        const isMobile = window.matchMedia('(max-width: 767px)').matches;
        mainRef.current.style.backgroundImage = isMobile 
          ? 'url(/trangchu/trangchu_background_mobile.svg)'
          : 'url(/trangchu/trangchu_background.svg)';
        mainRef.current.style.backgroundSize = isMobile ? 'contain' : 'cover';
        mainRef.current.style.backgroundPosition = isMobile ? 'top' : 'center';
      }
    };

    updateBackgroundStyle();
    window.addEventListener('resize', updateBackgroundStyle);
    return () => window.removeEventListener('resize', updateBackgroundStyle);
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      <main 
        ref={mainRef}
        className="min-h-[calc(100vh-80px)] relative flex flex-col md:block"
        style={{
          backgroundImage: 'url(/trangchu/trangchu_background_mobile.svg)',
          backgroundSize: 'contain',
          backgroundPosition: 'top',
          backgroundRepeat: 'no-repeat',
        }}
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
              priority
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
            <h1 className="font-prata text-3xl md:text-4xl lg:text-5xl font-normal mb-6 md:mb-8 leading-tight text-center" style={{ color: '#2A4A8C' }}>
              Giữ nhịp trọn vẹn
              <br />
              hơn một thế kỷ
            </h1>

            {/* Body Text */}
            <div className="space-y-3 md:space-y-4 mb-6 md:mb-8 max-w-xl mx-auto" style={{ color: '#2A4A8C', fontSize: '15px', lineHeight: '1.6' }}>
              <p className="leading-relaxed">
                Hơn một thế kỷ trước, chúng tôi chọn một con đường giản dị:
                giữ lại hơi ấm trong từng khoảnh khắc, để nhịp sống được gìn
                giữ trọn vẹn.
              </p>
              <p className="leading-relaxed">
                Năm 1923, những chiếc bình Tiger vẫn đứng vững sau trận động
                đất Kanto, trở mang lại niềm tin cho hàng ngàn gia đình Nhật
                Bản.
              </p>
              <p className="leading-relaxed">
                Từ di sản ấy, Tiger tiếp tục sáng tạo nồi cơm điện, hộp cơm,
                bình nước...
              </p>
              <p className="leading-relaxed">
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
          className="hidden md:block relative w-full z-10 flex justify-center mt-[-100px]"
        >
          <Image
            src="/trangchu/sanpham.svg"
            alt="Sản phẩm"
            width={1000}
            height={800}
            className="w-full h-auto object-cover"
            style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
          />
        </div>
      </main>
    </div>
  );
}

