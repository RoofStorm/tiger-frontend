'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Corner0 } from '@/components/Corner0/Corner0';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { useGlobalNavigationLoading } from '@/hooks/useGlobalNavigationLoading';
import { useRouter } from 'next/navigation';

export function VideoPageContent() {
  const [showIntroModal, setShowIntroModal] = useState(false);
  const { navigateWithLoading } = useGlobalNavigationLoading();
  const router = useRouter();

  const handleSkip = () => {
    localStorage.setItem('hasWatchedVideo', 'true');
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
      <Header />
      <main className="relative">
        <Corner0
          onVideoEnded={() => setShowIntroModal(true)}
          hideSkip={false}
          onSkip={handleSkip}
        />
      </main>

      {/* Intro Modal - hiển thị sau khi video kết thúc */}
      <AnimatePresence>
        {showIntroModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4"
            onClick={() => {
              setShowIntroModal(false);
              localStorage.setItem('hasWatchedVideo', 'true');
              router.push('/');
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="max-w-xl w-full bg-gradient-to-b from-gray-50 to-gray-100 rounded-3xl shadow-2xl border border-gray-200 p-8 text-center"
              onClick={e => e.stopPropagation()}
            >
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
                    setShowIntroModal(false);
                    localStorage.setItem('hasWatchedVideo', 'true');
                    navigateWithLoading('/', 'Đang chuyển đến trang chủ...');
                  }}
                >
                  Khám phá ngay
                </Button>
                <p className="text-sm text-gray-600">
                  Bạn đã có tài khoản?{' '}
                  <button
                    className="text-gray-900 underline underline-offset-2 hover:text-blue-700"
                    onClick={() => {
                      navigateWithLoading('/auth/login', 'Đang chuyển đến đăng nhập...');
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

