'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

export function ChallengeSections() {
  return (
    <div className="w-screen relative left-1/2 -translate-x-1/2 grid grid-cols-1 lg:grid-cols-2 gap-0 mb-16 px-4">
      {/* Left - LunchBox Challenge Image */}
      <div className="relative w-full h-[300px] lg:h-[450px] flex items-center justify-center overflow-hidden">
        <div className="relative w-full h-full" style={{ transform: 'scale(0.85)' }}>
          <Image
            src="/thuthachnhipsong/lunchBox_challenge.png"
            alt="LunchBox Challenge"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Right - Note Giữ Nhịp Image */}
      <div className="relative w-full h-[300px] lg:h-[450px] flex items-center justify-center overflow-hidden">
        <div className="relative w-full h-full" style={{ transform: 'scale(0.85)' }}>
          <Image
            src="/thuthachnhipsong/note_giu_nhip.png"
            alt="Note Giữ Nhịp"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* Old Layout - Commented Out */}
      {/* <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 mb-16 items-stretch">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[28rem] h-[28rem] lg:w-[44.8rem] lg:h-[44.8rem] pointer-events-none z-0" style={{ marginTop: '5rem' }}>
          <Image
            src="/thuthachnhipsong/noicomto.png"
            alt="Background"
            fill
            className="object-contain"
            style={{ opacity: 0.18 }}
          />
        </div>
        
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="space-y-6 flex flex-col h-full relative z-10"
        >
          <div className="relative flex flex-col lg:flex-row items-start">
            <div className="absolute w-full lg:w-[270px] h-[21rem] lg:h-96 flex-shrink-0 pointer-events-none">
              <Image
                src="/thuthachnhipsong/lunchBox.png"
                alt="LunchBox"
                fill
                className="object-contain"
                style={{
                  top: '10%',
                  left: '-10%',
                }}
              />
            </div>
            
            <div className="flex-1 flex flex-col space-y-6 lg:ml-[14rem] h-full">
              <div className="ml-[1rem]">
                <h3 className="font-prata text-tiger-blue-600" style={{ fontSize: '44px' }}>
                  LunchBox<br />Challenge
                </h3>
              </div>
              
              <div className="bg-[#F5F5DC] rounded-lg p-6 flex-1 flex flex-col">
                <p className="text-[14px] text-gray-700 leading-relaxed font-nunito mb-4">
                  Một hộp cơm giản dị, một bình nước bên bàn làm việc, hay nụ cười
                  bên đồng nghiệp cũng đủ trở thành &quot;nhịp giữ&quot; trong ngày
                  bận rộn.
                </p>
                <p className="text-[14px] text-gray-700 leading-relaxed font-nunito">
                  Hãy lưu giữ và chia sẻ khoảnh khắc trưa nay để thấy nhịp
                  sống của mình cũng đang hòa chung cùng mọi người
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-6 flex flex-col h-full relative z-10"
        >
          <div className="relative flex flex-col lg:flex-row items-start">
            <div className="absolute w-full lg:w-[270px] h-[21rem] lg:h-96 flex-shrink-0 pointer-events-none">
              <Image
                src="/thuthachnhipsong/noteGiuNhip.png"
                alt="Note Giữ Nhịp"
                fill
                className="object-contain"
                style={{
                  top: '10%',
                }}
              />
            </div>
            
            <div className="flex-1 flex flex-col space-y-6 lg:ml-[14rem] h-full">
              <div className="ml-[3rem]">
                <h3 className="font-prata text-tiger-blue-600" style={{ fontSize: '44px' }}>
                  Note Giữ Nhịp<br />Challenge
                </h3>
              </div>
              
              <div className="bg-[#F5F5DC] rounded-lg p-6 flex-1 flex flex-col lg:min-h-[200px]">
                <p className="text-[14px] text-gray-700 leading-relaxed font-nunito mb-4">
                  Giữ nhịp đâu chỉ dừng lại ở bữa trưa. Bạn có lời nhắc nào muốn
                  gửi đến chính mình, hay gửi đến một người quan trọng.
                </p>
                <p className="text-[14px] text-gray-700 leading-relaxed font-nunito">
                  Đôi khi chỉ cần vài dòng điều ngắn gọn - cũng đủ trở thành nhịp sống dịu dàng
                  cho cả bạn và người khác
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div> */}
    </div>
  );
}

