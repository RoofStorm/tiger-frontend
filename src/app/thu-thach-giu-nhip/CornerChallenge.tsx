'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { ChallengeSections } from './ChallengeSections';
import { ShareNoteSection } from './ShareNoteSection';
import { LunchboxUploadSection } from './LunchboxUploadSection';
import { LunchboxTimeline } from './LunchboxTimeline';

export function CornerChallenge() {


  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFFDF5' }}>
      <div className="mx-auto sm:px-2 lg:px-4 py-6">
        {/* Container with Background */}
        <div
          className="relative rounded-lg overflow-hidden"
          style={{
            backgroundImage: 'url(/thuthachnhipsong/thuthachgiunhip_background.png)',
            backgroundSize: '90%',
            backgroundPosition: 'center 20px',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <div className="max-w-7xl mx-auto sm:px-2 lg:px-4 py-12">
            {/* Top Section - Title and Introduction */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12 space-y-8"
            >
              <h1 className="font-prata text-tiger-blue-600 leading-tight" style={{ fontSize: '54px' }}>
                Thử thách giữ nhịp sống
              </h1>
              <div>
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

            {/* Middle Section - CHỈ VÀNG TRAO TAY */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
              style={{ marginBottom: '200px' }}
            >
              {/* Central Text in Yellow Oval - Always Center */}
              <div className="flex items-center justify-center">
                <div className="bg-[#FFE5B4] rounded-full px-8 py-6 lg:px-12 lg:py-8">
                  <p className="text-2xl sm:text-3xl lg:text-4xl font-noto-sans text-gray-700 font-medium whitespace-nowrap">
                    CHỈ VÀNG TRAO TAY
                  </p>
                </div>
              </div>

              {/* Left Product Image - Absolute */}
              {/* <div className="absolute left-[-60px] top-[180%] -translate-y-1/2 w-48 h-48 lg:w-72 lg:h-72 pointer-events-none">
                <Image
                  src="/thuthachnhipsong/hopcom.png"
                  alt="Tiger product"
                  fill
                  className="object-contain"
                  style={{ opacity: 0.25 }}
                />
              </div> */}

              {/* Right Product Image - Absolute */}
              {/* <div className="absolute right-[-25px] top-[-15%] -translate-y-1/2 w-48 h-48 lg:w-72 lg:h-72 pointer-events-none">
                <Image
                  src="/thuthachnhipsong/noicom.png"
                  alt="Tiger rice cooker"
                  fill
                  className="object-contain"
                  style={{ opacity: 0.25 }}
                />
              </div> */}
            </motion.div>

            {/* Lower Sections - LunchBox Challenge and Note Giữ Nhịp Challenge */}
            <ChallengeSections />

            {/* Section Before Upload - Lunchbox Challenge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.45 }}
              className="mb-16"
              style={{ marginTop: '60px' }}
            >
              <div className="flex flex-col items-center space-y-2">
                {/* Title */}
                <h3 className="font-prata text-tiger-blue-600 text-center" style={{ fontSize: '44px' }}>
                  Lunchbox Challenge
                </h3>
                
                {/* Text box */}
                <div className="px-4 max-w-2xl">
                  <p className="text-[14px] text-gray-700 leading-relaxed font-nunito text-center">
                    Một hộp cơm giản dị, một bình nước bên bàn làm việc, hay nụ cười bên đồng nghiệp cũng đủ
                    trở thành &quot;nhịp giữ&quot; trong ngày bận rộn. Hãy lưu giữ và chia sẻ khoảnh khắc trưa nay – để
                    thấy nhịp sống của mình cũng đang hòa chung cùng mọi người.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Lunchbox Upload Section */}
        <LunchboxUploadSection />

        {/* Lunchbox Timeline Section */}
        <LunchboxTimeline />

          {/* Share Note Section */}
          <ShareNoteSection />
      </div>
    </div>
  );
}
