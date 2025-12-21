'use client';

import { motion } from 'framer-motion';

export function ChallengeHeaderSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center mb-12 space-y-8"
    >
      <h1 className="font-prata text-tiger-blue-600 leading-tight" style={{ fontSize: '54px' }}>
        Thử thách giữ nhịp sống
      </h1>
      <div className="px-6 sm:px-8 md:px-0">
        <p className="text-[16px] text-gray-700 leading-relaxed max-w-4xl mx-auto font-noto-sans text-center">
          Đôi khi, nhịp sống nằm trong hơi nóng từ bữa cơm giản dị. Đôi khi, nó gói gọn trong vài dòng chữ nhỏ.
        </p>
        <p className="text-[16px] text-gray-700 leading-relaxed max-w-4xl mx-auto font-noto-sans text-center" style={{ marginTop: 0 }}>
          Tiger mời bạn tham gia Thử thách Giữ Nhịp – nơi những điều nhỏ bé trở thành khoảnh khắc đáng nhớ – để cùng nhau tạo nên một dòng chảy bình yên, đầy đủ sắc màu.
        </p>
      </div>
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-prata" style={{ marginTop: '48px' }}>
        <span style={{ color: '#616364' }}>Cùng </span>
        <span className="text-tiger-blue-600">TIGER</span>
        <span style={{ color: '#616364' }}> giữ nhịp</span>
      </h2>
    </motion.div>
  );
}
