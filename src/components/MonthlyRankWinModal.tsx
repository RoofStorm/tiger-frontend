'use client';

import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Image from 'next/image';
import { formatDate } from '@/lib/utils';

interface MonthlyRankWinModalProps {
  isOpen: boolean;
  onClose: () => void;
  rank: number;
  month: string;
  notificationId: string;
}

export function MonthlyRankWinModal({
  isOpen,
  onClose,
  rank,
  month,
}: MonthlyRankWinModalProps) {
  const router = useRouter();

  const handleButtonClick = () => {
    router.push('/doi-qua');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="relative max-w-md w-full bg-[#1a1a1a] rounded-[2rem] p-8 border border-[#FFD700]/30 flex flex-col items-center text-center shadow-[0_0_50px_rgba(255,215,0,0.1)]"
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          <div className="mb-6 relative">
            <div className="absolute inset-0 bg-[#FFD700] blur-[40px] opacity-20 rounded-full" />
            <Image
              src="/icons/tiger_logo.svg"
              alt="Tiger Logo"
              width={80}
              height={80}
              className="relative z-10"
            />
          </div>

          <h2 className="text-3xl font-bold text-white mb-2 uppercase tracking-wider">
            Chúc mừng!
          </h2>
          
          <p className="text-lg text-gray-300 mb-6">
            Bạn đã đạt <span className="text-blue-600 font-bold">Hạng {rank}</span> bài viết nhiều like nhất <span className="text-white font-semibold">tháng {formatDate(month)}</span>
          </p>

          <div className="w-full bg-[#2a2a2a] rounded-2xl p-6 mb-8 border border-white/5">
            <p className="text-sm text-gray-400 mb-2 uppercase tracking-widest">Phần thưởng của bạn đã được thêm vào trang Đổi quà</p>
            {/* <p className="text-xl font-bold text-white">Voucher quà tặng đặc biệt</p> */}
          </div>

          <button
            onClick={handleButtonClick}
            className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl text-lg hover:bg-blue-500 transition-colors shadow-[0_10px_20px_rgba(59,130,246,0.3)]"
          >
            Đổi quà
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
