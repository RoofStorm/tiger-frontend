'use client';

import { motion } from 'framer-motion';

export function LunchboxChallengeIntro() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.45 }}
      className="mb-2"
    >
      <div className="flex flex-col items-center space-y-2">
        {/* Title */}
        <h3 className="font-prata text-tiger-blue-600 text-center px-6 sm:px-8 md:px-0 text-3xl sm:text-4xl lg:text-5xl">
          Lunchbox Challenge
        </h3>
        
        {/* Text box */}
        <div className="px-6 sm:px-8 md:px-0 max-w-4xl mx-auto">
        <p className="text-[14px] text-gray-700 leading-relaxed font-nunito text-justify md:text-center">
            Một hộp cơm giản dị, một bình nước bên bàn làm việc, hay nụ cười bên đồng nghiệp cũng đủ
            trở thành &quot;nhịp giữ&quot; trong ngày bận rộn.
          </p>
          <p className="text-[14px] text-gray-700 leading-relaxed font-nunito text-justify md:text-center">
            Bạn hãy lưu giữ và chia sẻ khoảnh khắc trưa nay – để thấy nhịp sống của mình cũng đang hòa chung cùng mọi người.
          </p>
        </div>
        <div className="px-6 sm:px-8 md:px-0 max-w-4xl mx-auto mt-10">
          <p className="text-[14px] text-tiger-blue-600 leading-relaxed font-prata text-justify md:text-center"  >
            Đặc biệt, mỗi tháng TIGER sẽ chọn ra TOP 2 bạn có nhịp sống được lan toả nhất để trao giải thưởng hấp dẫn nhất.</p>
        </div>
      </div>
    </motion.div>
  );
}
