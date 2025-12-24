'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { RotateCcw, Share2 } from 'lucide-react';
import html2canvas from 'html2canvas';

interface MoodCardFlipCardProps {
  whisper: string;
  reminder: string;
  isCardFlipped: boolean;
  onCardFlip: (flipped: boolean) => void;
  onSave: () => void;
  onShare: (cardElementRef?: React.RefObject<HTMLDivElement | null>) => void;
  onReset: () => void;
  onExploreMore: () => void;
}

export function MoodCardFlipCard({
  whisper,
  reminder,
  isCardFlipped,
  onCardFlip,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSave: _onSave, // Không sử dụng để tránh đóng modal khi download
  onShare,
  onReset,
  onExploreMore,
}: MoodCardFlipCardProps) {
  const hasAutoFlipped = useRef(false);
  const frontCardRef = useRef<HTMLDivElement>(null);
  const cardContentRef = useRef<HTMLDivElement>(null);

  // Tự động flip card sau 2 giây khi component được hiển thị
  useEffect(() => {
    if (hasAutoFlipped.current) return;

    const timer = setTimeout(() => {
      if (!isCardFlipped && !hasAutoFlipped.current) {
        hasAutoFlipped.current = true;
        onCardFlip(true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [isCardFlipped, onCardFlip]);

  // Hàm download ảnh front card (chỉ Whisper và Reminder, không có button)
  const handleDownloadFrontCard = async () => {
    if (!frontCardRef.current) return;

    try {
      // Đảm bảo phần tử ẩn được hiển thị tạm thời để render đúng nhưng vẫn ngoài màn hình
      const element = frontCardRef.current;
      const originalStyle = {
        opacity: element.style.opacity,
        visibility: element.style.visibility,
        pointerEvents: element.style.pointerEvents,
      };

      // Chỉ thay đổi opacity và visibility để html2canvas capture được
      // Giữ nguyên vị trí ở ngoài màn hình (-9999px)
      element.style.opacity = '1'; // Cần opacity 1 để html2canvas capture được
      element.style.visibility = 'visible'; // Cần visible để html2canvas capture được
      element.style.pointerEvents = 'none'; // Đảm bảo không tương tác được

      // Đợi một chút để đảm bảo render
      await new Promise(resolve => setTimeout(resolve, 100));

      // Đợi tất cả images trong element load xong
      const images = element.querySelectorAll('img');
      await Promise.all(
        Array.from(images).map(
          (img) =>
            new Promise((resolve, reject) => {
              if (img.complete) {
                resolve(null);
              } else {
                img.onload = () => resolve(null);
                img.onerror = reject;
              }
            })
        )
      );

      // Đợi thêm một chút để đảm bảo mọi thứ đã render hoàn toàn
      await new Promise(resolve => setTimeout(resolve, 300));

      const canvas = await html2canvas(element, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: element.offsetWidth,
        height: element.offsetHeight,
      });

      // Khôi phục style ban đầu ngay lập tức sau khi capture
      element.style.opacity = originalStyle.opacity || '0';
      element.style.visibility = originalStyle.visibility || 'hidden';
      element.style.pointerEvents = originalStyle.pointerEvents || 'none';

      const imageData = canvas.toDataURL('image/png');
      
      // Kiểm tra xem có data không
      if (!imageData || imageData === 'data:,') {
        throw new Error('Failed to generate image data');
      }
      
      // Tạo link download
      const link = document.createElement('a');
      link.download = `mood-card-${Date.now()}.png`;
      link.href = imageData;
      link.click();

      // Không gọi onSave() để không đóng modal
    } catch (error) {
      console.error('Error downloading front card:', error);
      // Đảm bảo khôi phục style nếu có lỗi
      if (frontCardRef.current) {
        frontCardRef.current.style.position = 'fixed';
        frontCardRef.current.style.left = '-9999px';
        frontCardRef.current.style.top = '-9999px';
        frontCardRef.current.style.opacity = '0';
        frontCardRef.current.style.visibility = 'hidden';
        frontCardRef.current.style.zIndex = '-1';
      }
    }
  };

  return (
    <>
      {/* Backdrop overlay */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40"
          onClick={() => onCardFlip(false)}
        />
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="w-full flex flex-col relative z-50"
      >
        {/* Flip Card Container */}
        <div
          className="w-full mx-auto"
          style={{ perspective: '1000px', minHeight: '550px', height: '77vh', maxWidth: '543px' }}
        >
          <div
            className="relative w-full h-full min-h-[550px] group cursor-pointer"
            onClick={() => onCardFlip(!isCardFlipped)}
          >
            {/* Card */}
            <motion.div
              className="relative w-full h-full min-h-[550px]"
              style={{
                transformStyle: 'preserve-3d',
              }}
              animate={{
                rotateY: isCardFlipped ? 180 : 0,
              }}
              transition={{
                duration: 1.2,
                ease: [0.4, 0, 0.2, 1], // Custom cubic-bezier for smooth animation
              }}
            >
              {/* Back of Card (front_card_1.svg) */}
              <div
                className="absolute inset-0 w-full h-full"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <div className="relative w-full h-full min-h-[550px]">
                  <Image
                    src="/nhipsong/front_card_1.png"
                    alt="Mood Card Back"
                    fill
                    className="object-contain"
                    priority
                    sizes="(max-width: 768px) 100vw, 880px"
                  />
                </div>
              </div>

              {/* Front of Card (Content) */}
              <div
                ref={cardContentRef}
                className="absolute inset-0 w-full h-full flex flex-col"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  backgroundImage: 'url(/nhipsong/card_content1.png)',
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                }}
              >
                {/* Main Content Section - 80% height */}
                <div className="flex-1 p-8 flex flex-col items-center justify-center overflow-y-auto" style={{ height: '80%', marginTop: '130px' }}>
                  {/* Content wrapper */}
                  <div className="flex flex-col items-center justify-center w-full max-w-xs">
                    {/* Whisper Section */}
                    <div className="mb-4 text-center">
                      <h3 className="font-bold text-white mb-2" style={{ fontSize: '16px' }}>
                        Whisper:
                      </h3>
                      <p className="text-white leading-relaxed" style={{ fontSize: '14px' }}>
                        {whisper}
                      </p>
                    </div>

                    {/* Reminder Section */}
                    <div className="mb-4 text-center">
                      <h3 className="font-bold text-white mb-2" style={{ fontSize: '16px' }}>
                        Reminder:
                      </h3>
                      <p className="text-white leading-relaxed" style={{ fontSize: '14px' }}>
                        {reminder}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 pt-6 w-full flex flex-col items-center">
                    <div className="grid grid-cols-2 gap-3 mb-4 max-w-xs w-full">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadFrontCard();
                        }}
                        variant="outline"
                        className="w-full py-3 rounded-lg border border-white text-white bg-transparent hover:text-white hover:opacity-80 hover:scale-105 active:scale-95 transition-all duration-200"
                        style={{ fontSize: '14px', backgroundColor: 'transparent', color: '#ffffff' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = '#ffffff';
                        }}
                      >
                        Lưu cảm xúc
                      </Button>

                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          onShare(cardContentRef);
                        }}
                        className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
                        style={{ fontSize: '14px' }}
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Chia sẻ ngay
                      </Button>
                    </div>

                    {/* Try Again Link */}
                    <div className="text-center mb-4">
                      <span className="text-white" style={{ fontSize: '14px' }}>Chọn lại nhịp sống? </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onReset();
                        }}
                        className="text-white underline hover:text-white/80 transition-colors inline-flex items-center gap-1"
                        style={{ fontSize: '14px' }}
                      >
                        <span>Thử lại ngay</span>
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Section - 20% height */}
                <div 
                  className="w-full flex flex-col items-center justify-center px-8 pb-6"
                  style={{ height: '20%', minHeight: '110px', backgroundColor: '#ffffff' }}
                >
                  {/* Subtitle */}
                  <p className="mb-3 mt-2 text-center" style={{ fontSize: '14px', lineHeight: '1.5', color: '#00579F' }}>
                    Mood là khởi đầu - Giữ nhịp là điều bạn tự tạo nên mỗi ngày. Cùng TIGER tham gia thử thách Giữ Nhịp nhé.
                  </p>
                  
                  {/* Join Now Button */}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onExploreMore();
                    }}
                    className="w-full max-w-md py-3 rounded-lg border-2 transition-all duration-200 inline-flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
                    style={{ 
                      fontSize: '16px', 
                      backgroundColor: '#ffffff', 
                      color: '#00579F',
                      borderColor: '#00579F',
                      fontWeight: 600
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#f0f8ff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                    }}
                  >
                    <span>Tham gia ngay</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Hidden element for download - chỉ chứa Whisper và Reminder với background */}
      <div
        ref={frontCardRef}
        style={{
          position: 'fixed',
          left: '-9999px',
          top: '-9999px',
          opacity: '0',
          visibility: 'hidden',
          pointerEvents: 'none',
          width: '543px',
          minHeight: '550px',
          zIndex: '-1',
        }}
      >
        <div className="relative w-full h-full min-h-[550px]">
          <Image
            src="/nhipsong/card_content1.png"
            alt="Card Background"
            fill
            className="object-contain"
            priority
            sizes="543px"
          />
          <div className="absolute inset-0 flex-1 p-8 flex flex-col items-center justify-center" style={{ height: '80%', marginTop: '130px' }}>
            <div className="flex flex-col items-center justify-center w-full max-w-xs relative z-10">
              {/* Whisper Section */}
              <div className="mb-4 text-center">
                <h3 className="font-bold text-white mb-2" style={{ fontSize: '16px' }}>
                  Whisper:
                </h3>
                <p className="text-white leading-relaxed" style={{ fontSize: '14px' }}>
                  {whisper}
                </p>
              </div>

              {/* Reminder Section */}
              <div className="mb-4 text-center">
                <h3 className="font-bold text-white mb-2" style={{ fontSize: '16px' }}>
                  Reminder:
                </h3>
                <p className="text-white leading-relaxed" style={{ fontSize: '14px' }}>
                  {reminder}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
