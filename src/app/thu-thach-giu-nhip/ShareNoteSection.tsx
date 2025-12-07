'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useInputFix } from '@/hooks/useInputFix';

export function ShareNoteSection() {
  const { toast } = useToast();
  const { onKeyDown: handleInputKeyDown } = useInputFix();
  const [noteText, setNoteText] = useState('');
  const noteTextareaRef = useRef<HTMLTextAreaElement>(null);
  const notesScrollRef = useRef<HTMLDivElement>(null);

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
    // TODO: Handle share note
    toast({
      title: 'Chia sẻ thành công!',
      description: 'Note của bạn đã được chia sẻ.',
    });
    setNoteText('');
    
    // Auto scroll và focus vào textarea sau khi chia sẻ thành công
    scrollToTextarea();
  };

  return (
    <>
      {/* Share Section */}
      <div className="mt-16 rounded-lg border-2 border-gray-200 overflow-hidden bg-white">
        <div className="grid grid-cols-1 md:grid-cols-5">
          {/* Left Part: Text - 20% width */}
          <div 
            onClick={scrollToTextarea}
            className="p-4 md:p-6 flex items-center justify-center bg-[#2A4A8C] md:col-span-1 relative cursor-pointer transition-all duration-300 hover:opacity-90 hover:bg-[#1f3a6b]"
            style={{
              backgroundImage: 'url(/thuthachnhipsong/bonghoa.png)',
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
          <div className="bg-[#FFFDF5] md:col-span-4 grid grid-cols-1 md:grid-cols-2">
            {/* Left: Avatar, Name, Content */}
            <div className="p-4 md:p-6 space-y-3">
              {/* Avatar + Name */}
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src="/thuthachnhipsong/slide_example.png"
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
                  Một hộp cơm giản dị, một bình nước bên bàn làm việc, hay nụ cười bên đồng nghiệp cũng đủ trở thành "nhịp giữ" trong ngày bận rộn.
                </p>
              </div>
            </div>

            {/* Right: Image */}
            <div className="flex items-end justify-end pr-0 pb-0">
              <div className="relative rounded-lg overflow-hidden">
                <Image
                  src="/thuthachnhipsong/buaangiadinh.png"
                  alt="Bữa ăn gia đình"
                  width={400}
                  height={200}
                  className="w-auto h-auto object-cover"
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
        className="mt-16 rounded-lg overflow-hidden min-h-[700px]"
        style={{
          backgroundImage: 'url(/thuthachnhipsong/highlightedNote_background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 lg:p-12 min-h-[700px] max-h-[900px]">
          {/* Left: Image, TextArea, Button */}
          <div className="space-y-4 flex flex-col">
            {/* Image */}
            <div className="relative w-full overflow-hidden rounded-t-[30px]">
              <div className="relative w-full" style={{ paddingTop: '110%' }}>
                <Image
                  src="/thuthachnhipsong/giadinhancom.png"
                  alt="Giadinhancom"
                  fill
                  className="object-cover rounded-t-[30px]"
                  style={{ borderRadius: '30px 30px 0 0' }}
                />
              </div>
            </div>

            {/* TextArea */}
            <textarea
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
                <div className="absolute top-[-15px] left-3">
                  <Image
                    src="/icons/quotemark.png"
                    alt="Quote mark"
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
                <div className="flex items-center gap-3 mb-3 pt-4">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src="/thuthachnhipsong/slide_example.png"
                      alt="User avatar"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="font-medium text-sm" style={{ color: '#FFFFFF' }}>Hanh Nguyen</span>
                </div>
                <div className="text-sm leading-relaxed" style={{ color: '#FFFFFF' }}>
                  Một hộp cơm giản dị, một bình nước bên bàn làm việc, hay nụ cười bên đồng nghiệp cũng đủ trở thành "nhịp giữ" trong ngày bận rộn.
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

