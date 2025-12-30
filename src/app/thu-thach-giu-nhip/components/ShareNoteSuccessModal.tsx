import { RefObject } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

interface ShareNoteSuccessModalProps {
  show: boolean;
  onClose: () => void;
  modalRef: RefObject<HTMLDivElement | null>;
  sharedNoteText: string;
  isGeneratingImage: boolean;
  onShare: () => void;
  isSharePending: boolean;
  hasCreatedWishId: boolean;
  onExplore: () => void;
}

export const ShareNoteSuccessModal = ({
  show,
  onClose,
  modalRef,
  sharedNoteText,
  isGeneratingImage,
  onShare,
  isSharePending,
  hasCreatedWishId,
  onExplore,
}: ShareNoteSuccessModalProps) => {
  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div 
              ref={modalRef}
              className="rounded-2xl shadow-xl max-w-2xl w-full overflow-y-auto pointer-events-auto"
              style={{
                backgroundImage: 'url(/thuthachnhipsong/popup_share_note_background.svg)',
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8">
                {/* Tiger Logo - Centered Top */}
                <div className="flex justify-center mb-6">
                  <Image
                    src="/icons/tiger_logo.svg"
                    alt="TIGER Logo"
                    width={120}
                    height={40}
                    className="object-contain"
                    style={{ width: "auto", height: "auto" }}
                  />
                </div>

                {/* Thank You Message */}
                <h2 
                  className="text-center mb-8 font-prata"
                  style={{
                    fontFamily: 'Prata',
                    fontWeight: 400,
                    fontStyle: 'normal',
                    fontSize: '16px',
                    lineHeight: '20px',
                    letterSpacing: '0.03em',
                    color: '#00579F'
                  }}
                >
                  Nhịp sống của bạn đã được gửi đi!
                </h2>

                {/* Content Box - Wraps both text and image */}
                <div 
                  className="mb-8 p-3 rounded-lg mx-auto" 
                  style={{ 
                    border: '1px solid',
                    borderImageSource: 'linear-gradient(180deg, #CCF5FF 0%, #B2DCFF 100%)',
                    borderImageSlice: 1,
                    maxWidth: '80%',
                    width: '100%'
                  }}
                >
                  {/* Text Content - Blue background, white text */}
                  <div 
                    className="mb-6 p-6 rounded-lg"
                    style={{ 
                      backgroundColor: '#00579F',
                      color: '#ffffff'
                    }}
                  >
                    <p 
                      className="font-nunito leading-relaxed"
                      style={{
                        fontFamily: 'Nunito',
                        fontWeight: 500,
                        fontStyle: 'italic',
                        fontSize: '14px',
                        lineHeight: '24px',
                        letterSpacing: '-0.02em',
                        color: '#ffffff'
                      }}
                    >
                      &quot;{sharedNoteText}&quot;
                    </p>
                  </div>

                  {/* TRĂM NĂM GIỮ TRỌN nhịp sống */}
                  <div className="flex justify-center">
                    <Image
                      src="/thuthachnhipsong/tramnamgiunhipsong.png"
                      alt="Trăm năm giữ trọn nhịp sống"
                      width={240}
                      height={72}
                      className="max-w-[100px] md:max-w-[140px]"
                      sizes="(max-width: 768px) 100px, 140px"
                      quality={90}
                    />
                  </div>
                </div>

                {/* Info Text */}
                <p 
                  className="text-left md:text-center mb-8 font-nunito mx-auto"
                  style={{
                    fontFamily: 'Nunito',
                    fontWeight: 400,
                    fontStyle: 'normal',
                    fontSize: '14px',
                    lineHeight: '14px',
                    letterSpacing: '-0.05em',
                    color: '#00579F',
                    maxWidth: '70%'
                  }}
                >
                  TIGER đã giữ nhịp cho hàng triệu gia đình suốt trăm năm qua. Hãy cùng khám phá hành trình của TIGER
                </p>

                {/* Buttons */}
                <div className="flex gap-4 justify-center mx-auto" style={{ maxWidth: '70%' }}>
                  <Button
                    onClick={onExplore}
                    className="font-nunito transition-all duration-300 flex-1"
                    style={{ 
                      height: '40px',
                      borderRadius: '8px',
                      paddingTop: '8px',
                      paddingRight: '16px',
                      paddingBottom: '8px',
                      paddingLeft: '16px',
                      backgroundColor: '#00579F',
                      color: '#ffffff',
                      fontFamily: 'Nunito',
                      fontWeight: 700,
                      fontSize: '16px',
                      lineHeight: '24px'
                    }}
                  >
                    Khám phá về TIGER
                  </Button>
                  <Button
                    onClick={onShare}
                    disabled={isSharePending || !hasCreatedWishId || isGeneratingImage}
                    className="font-nunito transition-all duration-300 flex items-center justify-center gap-2 flex-1 disabled:opacity-50"
                    style={{ 
                      backgroundColor: '#ffffff',
                      color: '#00579F',
                      border: '1px solid #00579F',
                      fontFamily: 'Nunito',
                      fontWeight: 700,
                      fontSize: '16px',
                      lineHeight: '24px',
                      height: '40px',
                      borderRadius: '8px',
                      paddingTop: '8px',
                      paddingRight: '16px',
                      paddingBottom: '8px',
                      paddingLeft: '16px'
                    }}
                  >
                    {isGeneratingImage ? 'Đang tạo ảnh...' : 'Chia sẻ'}
                    <Image
                      src="/icons/facebook.svg"
                      alt="Facebook"
                      width={20}
                      height={20}
                      className="object-contain"
                    />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

