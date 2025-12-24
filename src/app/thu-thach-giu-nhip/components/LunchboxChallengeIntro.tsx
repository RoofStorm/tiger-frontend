'use client';

import { motion } from 'framer-motion';

export function LunchboxChallengeIntro() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.45 }}
      className="mb-2 mt-2 md:my-[30px]"
    >
      <div className="flex flex-col items-center space-y-2">
        {/* Title */}
        <h3 className="font-prata text-tiger-blue-600 text-center px-6 sm:px-8 md:px-0 text-3xl sm:text-4xl lg:text-5xl">
          Lunchbox Challenge
        </h3>
        
        {/* Text box */}
        <div className="px-6 sm:px-8 md:px-0 max-w-2xl mx-auto">
          <p className="text-[14px] text-gray-700 leading-relaxed font-nunito text-left md:text-center">
            Một hộp cơm giản dị, một bình nước bên bàn làm việc, hay nụ cười bên đồng nghiệp cũng đủ
            trở thành &quot;nhịp giữ&quot; trong ngày bận rộn. Hãy lưu giữ và chia sẻ khoảnh khắc trưa nay – để
            thấy nhịp sống của mình cũng đang hòa chung cùng mọi người.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
