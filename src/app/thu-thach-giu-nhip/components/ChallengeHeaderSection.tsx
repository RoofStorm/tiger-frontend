'use client';

import { motion } from 'framer-motion';

export function ChallengeHeaderSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center mb-6 space-y-4"
    >
      <h1
        className="font-prata text-center"
        style={{
          fontFamily: 'Prata',
          fontWeight: 400,
          fontStyle: 'normal',
          fontSize: '54px',
          lineHeight: '64px',
          textAlign: 'center',
          verticalAlign: 'middle',
          color: '#004EA3',
          padding: '10x',
        }}
      >
        Thử thách giữ nhịp sống
      </h1>
      <div className="px-6 sm:px-8 md:px-0">
        <p className="text-[16px] text-gray-700 leading-relaxed max-w-4xl mx-auto font-noto-sans text-left md:text-center">
          Đôi khi, nhịp sống nằm trong hơi nóng từ bữa cơm giản dị. Đôi khi, nó gói gọn trong vài dòng chữ nhỏ.
        </p>
        <p className="text-[16px] text-gray-700 leading-relaxed max-w-[82rem] mx-auto font-noto-sans text-left md:text-center" style={{ marginTop: 0 }}>
          Tiger mời bạn tham gia Thử thách Giữ Nhịp – nơi những điều nhỏ bé trở thành khoảnh khắc đáng nhớ – để cùng nhau tạo nên một dòng chảy bình yên, đầy đủ sắc màu.
        </p>
      </div>
      <h2
        className="font-nunito text-center px-6 sm:px-8 md:px-0"
        style={{
          fontFamily: 'Nunito',
          fontWeight: 400,
          fontStyle: 'normal',
          fontSize: '30px',
          lineHeight: '38px',
          letterSpacing: '0%',
          textAlign: 'center',
          verticalAlign: 'middle',
          color: '#616364',
          marginTop: '28px',
        }}
      >
        <span>Cùng </span>
        <span
          className="font-prata"
          style={{
            fontFamily: 'Prata',
            fontWeight: 400,
            fontStyle: 'normal',
            fontSize: '54px',
            lineHeight: '64px',
            letterSpacing: '3%',
            textAlign: 'center',
            verticalAlign: 'middle',
            color: '#00579F',
          }}
        >
          TIGER
        </span>
        <span> giữ nhịp</span>
      </h2>
    </motion.div>
  );
}
