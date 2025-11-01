'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Corner0 } from '@/components/Corner0/Corner0';
import { Corner1 } from '@/components/Corner1/Corner1';
import { CornerChallenge } from '@/components/CornerChallenge/CornerChallenge';
import { CornerTimeline } from '@/components/CornerTimeline/CornerTimeline';
import { CornerNotes } from '@/components/CornerNotes/CornerNotes';
import { Corner2_1 } from '@/components/Corner2_1/Corner2_1';
import { Corner3 } from '@/components/Corner3/Corner3';
import { Corner4 } from '@/components/Corner4/Corner4';
import { Header } from '@/components/Header';
import { NavigationDots } from '@/components/NavigationDots';
import { VideoProvider, useVideo } from '@/contexts/VideoContext';
import { useNextAuth } from '@/hooks/useNextAuth';
import { Button } from '@/components/ui/button';
import { useCornerAnalytics } from '@/hooks/useCornerAnalytics';

function HomePageContent() {
  const { startTimer, stopTimer } = useCornerAnalytics();
  const [currentSection, setCurrentSection] = useState(0);
  const { isVideoPlaying } = useVideo();
  const { isAuthenticated } = useNextAuth();
  const [showAllSections, setShowAllSections] =
    useState<boolean>(isAuthenticated);
  const [showIntroModal, setShowIntroModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const corners = document.querySelectorAll('[data-corner]');

      corners.forEach(corner => {
        const rect = corner.getBoundingClientRect();
        const cornerNumber = parseInt(
          corner.getAttribute('data-corner') || '0'
        );

        const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;

        // Check if corner is in viewport
        if (isInViewport) {
          startTimer(cornerNumber);
        } else {
          stopTimer(cornerNumber);
        }
      });
    };

    // Throttle scroll events
    let timeoutId: NodeJS.Timeout;
    const throttledHandleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 100);
    };

    window.addEventListener('scroll', throttledHandleScroll);
    handleScroll(); // Initial check

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      clearTimeout(timeoutId);
    };
  }, [startTimer, stopTimer]);

  // Nếu đã đăng nhập: luôn hiển thị full content, không intro
  useEffect(() => {
    if (isAuthenticated) {
      setShowAllSections(true);
      setShowIntroModal(false);
    }
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
      {/* Header cố định full width trên top */}
      <Header />

      <main className="relative">
        {/* Corner 0: Video Player */}
        <section data-corner="0" className="min-h-screen w-full">
          <Corner0
            onVideoEnded={() => setShowIntroModal(true)}
            hideSkip={showAllSections}
          />
        </section>

        {showAllSections && (
          <>
            {/* Container cho Corner 1, 2, 3, 4 với Card wrapper */}
            <div className="w-full py-11 sm:py-[3.75rem] lg:py-[4.75rem]">
              <div className="max-w-7xl mx-auto flex flex-col gap-11 sm:gap-[3.75rem] lg:gap-[4.75rem]">
                {/* Corner 1: Emoji Grid & Mood Card */}
                <section data-corner="1" className="min-h-screen w-full">
                  <div className="bg-gray-50 rounded-2xl shadow-lg overflow-hidden mx-4 sm:mx-6 lg:mx-8 xl:mx-12">
                    <Corner1 />
                  </div>
                </section>

                {/* Text Section giữa Corner 1 và Corner 2 */}
                <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
                  <div className="max-w-4xl mx-auto text-center space-y-6">
                    <div className="space-y-2">
                      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
                        Thử thách
                      </h2>
                      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
                        giữ nhịp sống
                      </h2>
                    </div>
                    <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                      Đôi khi, nhịp sống nằm trong hơi nóng từ bưa cơm giản dị.
                      Đôi khi, nó gói gọn trong vài dòng chữ nhỏ. Tiger mời bạn
                      tham gia thử thách giữ nhịp - nơi những điều nhỏ bé trở
                      thành khoảnh khắc đáng nhớ - để cùng nhau tạo nên dòng
                      chảy bình yên, đầy đủ màu sắc
                    </p>
                  </div>
                </div>

                {/* Corner Challenge: Thử thách giữ nhịp sống */}
                <section data-corner="2" className="min-h-screen w-full">
                  <div className="bg-gray-50 rounded-2xl shadow-lg overflow-hidden mx-4 sm:mx-6 lg:mx-8 xl:mx-12">
                    <CornerChallenge />
                  </div>
                </section>

                {/* Corner Timeline: Cột mốc thời gian giữ nhịp sống */}
                <section data-corner="2.5" className="min-h-screen w-full">
                  <div className="bg-gray-50 rounded-2xl shadow-lg overflow-hidden mx-4 sm:mx-6 lg:mx-8 xl:mx-12">
                    <CornerTimeline />
                  </div>
                </section>

                {/* Corner Notes: Viết note giữ nhịp */}
                <section data-corner="2.6" className="min-h-screen w-full">
                  <div className="bg-gray-50 rounded-2xl shadow-lg overflow-hidden mx-4 sm:mx-6 lg:mx-8 xl:mx-12">
                    <CornerNotes />
                  </div>
                </section>

                {/* Corner 2: Made in Vietnam Products */}
                <section data-corner="3" className="min-h-screen w-full">
                  <div className="bg-gray-50 rounded-2xl shadow-lg overflow-hidden mx-4 sm:mx-6 lg:mx-8 xl:mx-12">
                    <Corner2_1 />
                  </div>
                </section>

                {/* Corner 3: Flip Card (Nhịp bếp / Góc Phát Triển) */}
                <section data-corner="4" className="min-h-screen w-full">
                  <div className="bg-gray-50 rounded-2xl shadow-lg overflow-hidden mx-4 sm:mx-6 lg:mx-8 xl:mx-12">
                    <Corner3 />
                  </div>
                </section>

                {/* Corner 4: Rewards (Quà tặng / Góc Phần Thưởng) */}
                <section data-corner="5" className="min-h-screen w-full">
                  <div className="bg-gray-50 rounded-2xl shadow-lg overflow-hidden mx-4 sm:mx-6 lg:mx-8 xl:mx-12">
                    <Corner4 />
                  </div>
                </section>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Navigation Dots - ẩn hoàn toàn theo yêu cầu */}
      {false && showAllSections && (
        <AnimatePresence>
          {!isVideoPlaying && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <NavigationDots
                currentSection={currentSection}
                onSectionChange={setCurrentSection}
              />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Intro Modal - hiển thị sau khi video kết thúc */}
      <AnimatePresence>
        {showIntroModal && !showAllSections && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4"
            onClick={() => setShowIntroModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="max-w-xl w-full bg-gradient-to-b from-gray-50 to-gray-100 rounded-3xl shadow-2xl border border-gray-200 p-8 text-center"
              onClick={e => e.stopPropagation()}
            >
              <div className="mb-4">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 via-red-500 to-pink-500 flex items-center justify-center text-white font-extrabold text-2xl">
                  T
                </div>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-snug mb-4">
                Giữ nhịp trọn vẹn
                <br />
                hơn một thế kỷ
              </h2>
              <div className="text-gray-700 space-y-3 text-base leading-relaxed text-left mx-auto max-w-prose">
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
                <p className="font-medium">
                  Còn nhịp sống hôm nay của bạn thì sao?
                </p>
              </div>
              <div className="mt-8 flex flex-col items-center justify-center gap-4">
                <Button
                  className="px-8 py-6 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  onClick={() => {
                    setShowAllSections(true);
                    setShowIntroModal(false);
                  }}
                >
                  Khám phá ngay
                </Button>
                <p className="text-sm text-gray-600">
                  Bạn đã có tài khoản?{' '}
                  <button
                    className="text-gray-900 underline underline-offset-2 hover:text-blue-700"
                    onClick={() => {
                      window.location.href = '/auth/login';
                    }}
                  >
                    Đăng nhập ngay
                  </button>
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HomePage() {
  return (
    <VideoProvider>
      <HomePageContent />
    </VideoProvider>
  );
}
