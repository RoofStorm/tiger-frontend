'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useInputFix } from '@/hooks/useInputFix';

export function ShareNoteSection() {
  const router = useRouter();
  const { toast } = useToast();
  const { onKeyDown: handleInputKeyDown } = useInputFix();
  const [noteText, setNoteText] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [sharedNoteText, setSharedNoteText] = useState('');
  const noteTextareaRef = useRef<HTMLTextAreaElement>(null);
  const notesScrollRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Auto scroll notes loop
  useEffect(() => {
    const scrollContainer = notesScrollRef.current;
    if (!scrollContainer) return;

    let scrollInterval: NodeJS.Timeout;
    let isResetting = false;

    const startAutoScroll = () => {
      scrollInterval = setInterval(() => {
        if (!scrollContainer || isResetting) return;

        const maxScroll = scrollContainer.scrollHeight - scrollContainer.clientHeight;
        const currentScroll = scrollContainer.scrollTop;
        const scrollStep = 0.5; // Pixels to scroll per interval

        if (currentScroll >= maxScroll - 5) {
          // Reset to top for loop
          isResetting = true;
          scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
          setTimeout(() => {
            isResetting = false;
          }, 500);
        } else {
          scrollContainer.scrollTop += scrollStep;
        }
      }, 16); // Scroll every 16ms (~60fps)
    };

    // Start scrolling after a short delay
    const timeout = setTimeout(() => {
      startAutoScroll();
    }, 1000);

    return () => {
      if (scrollInterval) {
        clearInterval(scrollInterval);
      }
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, []);

  // Update modal background size for mobile
  useEffect(() => {
    if (!showSuccessModal) return;

    const updateModalBackground = () => {
      if (modalRef.current) {
        const isMobile = window.matchMedia('(max-width: 767px)').matches;
        modalRef.current.style.backgroundSize = isMobile ? 'cover' : 'contain';
        modalRef.current.style.minHeight = isMobile ? 'auto' : 'auto';
      }
    };

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      updateModalBackground();
    });

    window.addEventListener('resize', updateModalBackground);
    return () => window.removeEventListener('resize', updateModalBackground);
  }, [showSuccessModal]);

  const scrollToTextarea = () => {
    setTimeout(() => {
      noteTextareaRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      setTimeout(() => {
        noteTextareaRef.current?.focus();
      }, 300);
    }, 100);
  };

  const handleShareNote = () => {
    if (!noteText.trim()) {
      toast({
        title: 'Vui lòng nhập nội dung',
        description: 'Hãy chia sẻ câu chuyện của bạn nhé!',
        variant: 'destructive',
      });
      // Scroll và focus vào textarea khi chưa có nội dung
      scrollToTextarea();
      return;
    }
    // Lưu nội dung note để hiển thị trong modal
    setSharedNoteText(noteText);
    // Hiển thị modal thành công
    setShowSuccessModal(true);
    // Reset textarea
    setNoteText('');
  };

  return (
    <>
      {/* Share Section */}
      <div className="mt-16 rounded-[30px] border-2 border-gray-200 overflow-hidden bg-white mx-4 md:mx-8 lg:mx-32 max-w-full md:max-w-none min-h-[300px] md:min-h-[250px]">
        <div className="grid grid-cols-1 md:grid-cols-5 h-full">
          {/* Left Part: Text - 20% width */}
          <div 
            onClick={scrollToTextarea}
            className="p-4 md:p-6 flex items-center justify-center bg-[#00579F] md:col-span-1 relative cursor-pointer transition-all duration-300 hover:opacity-90 hover:bg-[#1f3a6b]"
            style={{
              backgroundImage: 'url(/thuthachnhipsong/bonghoa.svg)',
              backgroundPosition: 'top left',
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'auto'
            }}
          >
            <h3 className="font-prata text-white text-center relative z-10" style={{ fontSize: '36px' }}>
              Chia sẻ<br />ngay!
            </h3>
          </div>

          {/* Right Part: Content - 80% width */}
          <div className="bg-[#FFFDF5] md:col-span-4 grid grid-cols-1 md:grid-cols-2 md:min-h-[250px]">
            {/* Left: Avatar, Name, Content */}
            <div className="p-4 md:p-6 space-y-3 flex flex-col justify-center">
              {/* Avatar + Name */}
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src="/thuthachnhipsong/slide_example.svg"
                    alt="User avatar"
                    fill
                    className="object-cover"
                  />
                </div>
                <span className="text-lg font-medium text-gray-700">
                  Hanh Nguyen
                </span>
              </div>

              {/* Note */}
              <div>
                <p className="text-gray-700 leading-relaxed text-base">
                Trong bối cảnh thị trường biến động nhanh, việc cập nhật kiến thức, tối ưu quy trình và ra quyết định dựa trên dữ liệu là yếu tố then chốt giúp tổ chức duy trì hiệu quả và phát triển bền vững lâu dài.
                </p>
              </div>
            </div>

            {/* Right: Image */}
            <div className="flex items-end justify-end pr-0 pb-0">
              <div 
                className="relative overflow-hidden w-full"
              >
                <Image
                  src="/thuthachnhipsong/buaangiadinh.svg"
                  alt="Bữa ăn gia đình"
                  width={500}
                  height={200}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Write Note Section */}
      <div className="mt-16 text-center">
        <h2 className="font-prata text-4xl md:text-5xl mb-6" style={{ color: '#00579F' }}>
          Viết note giữ nhịp!
        </h2>
        <p className="text-gray-700 max-w-3xl mx-auto text-center leading-relaxed" style={{ fontSize: '16px' }}>
          Giữ nhịp đâu chỉ dừng lại ở bữa trưa. Bạn có lời nhắc nào muốn gửi đến chính mình, hay gửi
          đến một người quan trong. Đôi khi chỉ cần vài đôi điều ngắn gọn - cũng đủ trở thành nhịp
          sống dịu dàng cho cả bạn và người khác
        </p>
      </div>

      {/* Highlighted Notes Section */}
      <div 
        id="highlighted-notes-section"
        className="mt-16 rounded-lg overflow-hidden min-h-[700px]"
        style={{
          backgroundImage: 'url(/thuthachnhipsong/highlightedNote_background.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'top right',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 lg:p-12 min-h-[700px]">
          {/* Left: Image, TextArea, Button */}
          <div className="space-y-4 flex flex-col items-center">
            <div className="space-y-4 flex flex-col">
              {/* Image */}
              <div className="relative w-full mt-6">
                <Image
                  src="/thuthachnhipsong/giadinhancom.svg"
                  alt="Giadinhancom"
                  width={800}
                  height={600}
                  className="w-full h-auto object-contain"
                />
              </div>

              {/* TextArea */}
              <textarea
                id="share-note-textarea"
                ref={noteTextareaRef}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Câu chuyện của bạn thì sao? Chia sẻ cùng mình nhé!"
                rows={4}
                className="w-full px-4 py-3 border border-white/30 rounded-lg resize-none focus:outline-none focus:border-blue-300 placeholder-gray-300 font-nunito backdrop-blur-sm"
                style={{ 
                  backgroundColor: '#FFFFFF1A',
                  color: '#DCDCDC'
                }}
              />

              {/* Button */}
              <Button
                onClick={handleShareNote}
                className="w-full font-medium py-3 rounded-lg transition-all duration-300 cursor-pointer hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: '#ffffff', color: '#00579F' }}
              >
                Chia sẻ ngay!
              </Button>
            </div>
          </div>

          {/* Right: Highlighted Notes - Scrollable */}
          <div 
            ref={notesScrollRef}
            className="space-y-8 h-full max-h-[900px] overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden"
            style={{ 
              scrollBehavior: 'smooth',
              scrollbarWidth: 'none', /* Firefox */
              msOverflowStyle: 'none', /* IE and Edge */
            }}
          >
            {/* Mock highlighted notes - Replace with actual data */}
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map((index) => (
              <div
                key={index}
                className={`backdrop-blur-sm rounded-lg p-6 border border-white/30 relative w-[80%] ${
                  index % 2 === 0 ? 'ml-[20%]' : ''
                }`}
                style={{ backgroundColor: '#FFFFFF1A' }}
              >
                {/* Quote Mark - Top Left */}
                <div className="absolute top-[-10px] md:top-[-20px] left-3">
                  <Image
                    src="/icons/quotemark_white.svg"
                    alt="Quote mark"
                    width={40}
                    height={40}
                    className="object-contain w-6 h-6 md:w-10 md:h-10"
                  />
                </div>
                <div className="flex items-center gap-3 mb-3 pt-4">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src="/thuthachnhipsong/slide_example.svg"
                      alt="User avatar"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="font-medium text-sm" style={{ color: '#FFFFFF' }}>Hanh Nguyen</span>
                </div>
                <div className="text-sm leading-relaxed" style={{ color: '#FFFFFF' }}>
                  Một hộp cơm giản dị, một bình nước bên bàn làm việc, hay nụ cười bên đồng nghiệp cũng đủ trở thành &quot;nhịp giữ&quot; trong ngày bận rộn.
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
              onClick={() => setShowSuccessModal(false)}
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
                      alt="Tiger Logo"
                      width={120}
                      height={40}
                      className="object-contain"
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
                      textAlign: 'center',
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
                        src="/thuthachnhipsong/tramnamgiunhipsong.svg"
                        alt="Trăm năm giữ trọn nhịp sống"
                        width={240}
                        height={72}
                        className="object-contain w-40 md:w-60"
                      />
                    </div>
                  </div>

                  {/* Info Text */}
                  <p 
                    className="text-center mb-8 font-nunito mx-auto"
                    style={{
                      fontFamily: 'Nunito',
                      fontWeight: 400,
                      fontStyle: 'normal',
                      fontSize: '14px',
                      lineHeight: '14px',
                      letterSpacing: '-0.05em',
                      textAlign: 'center',
                      color: '#00579F',
                      maxWidth: '70%'
                    }}
                  >
                    TIGER đã giữ nhịp cho hàng triệu gia đình suốt trăm năm qua. Hãy cùng khám phá hành trình của TIGER
                  </p>

                  {/* Buttons */}
                  <div className="flex gap-4 justify-center mx-auto" style={{ maxWidth: '70%' }}>
                    <Button
                      onClick={() => {
                        setShowSuccessModal(false);
                        router.push('/nhip-bep');
                      }}
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
                      onClick={() => {
                        // TODO: Handle Facebook share
                        setShowSuccessModal(false);
                      }}
                      className="font-nunito transition-all duration-300 flex items-center justify-center gap-2 flex-1"
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
                      Chia sẻ
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
    </>
  );
}

