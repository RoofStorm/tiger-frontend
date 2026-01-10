'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useGlobalNavigationLoading } from '@/hooks/useGlobalNavigationLoading';
import { useAnalytics } from '@/hooks/useAnalytics';

export function HomeContentSection() {
  const { navigateWithLoading } = useGlobalNavigationLoading();
  const { trackClick } = useAnalytics();

  return (
    <>
      {/* Mobile Layout: Product Image First, Content Second */}
      {/* Desktop Layout: Content Right, Product Image Bottom (absolute) */}

      {/* Product Image - Mobile: Top, Desktop: Hidden (shown in absolute below) */}
      <div className="md:hidden relative z-10 flex justify-center w-full order-1">
        <div className="w-full max-w-md px-4 mt-[30%]">
          <Image
            src="/trangchu/sanpham.png"
            alt="Sản phẩm"
            width={1000}
            height={800}
            className="w-full h-auto object-cover"
            priority
          />
        </div>
      </div>

      {/* Content - Mobile: Bottom, Desktop: Right */}
      <div className="relative z-20 h-full flex order-2 md:order-none">
        {/* Empty space - 2/3 left (Desktop only) */}
        <div className="hidden md:block w-1/2"></div>

        {/* Content - Mobile: Full width, Desktop: 1/3 right */}
        <div className="w-full lg:w-1/2 px-6 lg:px-12 py-4 sm:py-6 lg:py-8 lg:mr-38 flex flex-col justify-center">
          {/* Title */}
          <h1 className="font-prata font-normal mb-6 md:mb-8 text-center text-[28px] lg:text-[36px] leading-[40px] tracking-[0.03em] text-[#0B4386]">
            Giữ nhịp trọn vẹn hơn
            <br />
            một thế kỷ
          </h1>

          {/* Body Text */}
          <div className="font-nunito font-normal space-y-3 md:space-y-4 mb-2 md:mb-4 max-w-xl mx-auto text-[15px] leading-[18px] tracking-[-0.02em] text-justify text-[#0B4386]">
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
            <p>
              TIGER đã giữ nhịp sống trọn vẹn hơn một thế kỷ. Còn nhịp sống hôm nay của bạn thì sao?
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
              className="px-8 py-3 rounded-lg text-white font-medium transition-all duration-300 w-full cursor-pointer hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg relative z-50 bg-[#00579F] hover:bg-[#004080]"
            >
              Khám phá ngay
            </Button>
          </div>
        </div>
      </div>

      {/* Desktop: Product Image Bottom */}
      <div className="hidden md:flex relative w-full z-10 flex justify-center -mt-[170px]">
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
    </>
  );
}

