'use client';

import { useEffect } from 'react';
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

  // Nếu chưa đăng nhập và chưa xem video, điều hướng đến trang video
  useEffect(() => {
    if (!isAuthenticated) {
      const hasWatchedVideo = localStorage.getItem('hasWatchedVideo');
      if (!hasWatchedVideo) {
        router.push('/video');
      }
    }
  }, [isAuthenticated, router]);

  return (
    <div className="min-h-screen relative">
      <Header />
      <main className="mt-20 min-h-[calc(100vh)] relative">
        {/* Background Image */}
        <div className="absolute inset-0 w-full h-full min-h-screen pt-32">
          <Image
            src="/trangchu/trangchu_background.jpg"
            alt="Trang chủ background"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Content - 1/3 right */}
        <div className="relative z-10 h-full flex">
          {/* Empty space - 2/3 left */}
          <div className="w-1/2"></div>
          
          {/* Content - 1/3 right */}
          <div className="px-12 py-12 mr-38 flex flex-col justify-center">
            {/* Title */}
            <h1 className="font-prata text-4xl md:text-5xl font-normal mb-8 leading-tight text-center" style={{ color: '#2A4A8C' }}>
              Giữ nhịp trọn vẹn
              <br />
              hơn một thế kỷ
            </h1>

            {/* Body Text */}
            <div className="space-y-4 mb-8 max-w-xl mx-auto" style={{ color: '#2A4A8C', fontSize: '16px' }}>
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
            <div className="flex justify-center max-w-xl mx-auto w-full">
              <Button
                onClick={() => {
                  navigateWithLoading('/nhip-song', 'Đang chuyển đến Nhịp sống...');
                }}
                className="px-8 py-3 rounded-lg text-white font-medium transition-colors w-full"
                style={{ backgroundColor: '#00579F' }}
              >
                Khám phá ngay
              </Button>
            </div>
          </div>
        </div>

        {/* Product Image - Bottom */}
        <div className="absolute bottom-0 right-0 w-full z-10 flex justify-center">
          <Image
            src="/trangchu/sanpham.png"
            alt="Sản phẩm"
            width={1000}
            height={800}
            className="w-[90%] object-cover"
          />
        </div>
      </main>
    </div>
  );
}

