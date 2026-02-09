'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNextPage: () => void;
}

export function RewardModal({
  isOpen,
  onClose,
  onNextPage,
}: RewardModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          onClick={onClose}
        />
        
        {/* Reward Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div 
            className="rounded-2xl shadow-xl max-w-md w-full max-h-[95vh] overflow-y-auto p-8"
            style={{ backgroundColor: '#00579F' }}
          >
            {/* Top Section */}
            <div className="text-center mb-6">
              <h2 
                className="font-nunito text-center mb-2"
                style={{
                  fontFamily: 'Nunito',
                  fontWeight: 700,
                  fontSize: '48px',
                  lineHeight: '40.67px',
                  letterSpacing: '-0.03em',
                  textAlign: 'center',
                  color: '#FFFFFF',
                }}
              >
                Bạn nhận được
              </h2>
              <p 
                className="font-nunito text-center"
                style={{
                  fontFamily: 'Nunito',
                  fontWeight: 700,
                  fontSize: '34.86px',
                  lineHeight: '40.67px',
                  letterSpacing: '-0.03em',
                  textAlign: 'center',
                  color: '#FFFFFF',
                }}
              >
                200 Điểm năng lượng
              </p>
            </div>

            {/* Middle Section - Voucher */}
            <div 
              className="border-2 border-dashed border-white rounded-lg p-6 mb-6"
              style={{ borderColor: '#FFFFFF' }}
            >
              <div className="text-center">
                <p 
                  className="font-prata text-white mb-2"
                  style={{
                    fontFamily: 'Prata',
                    fontWeight: 400,
                    fontSize: '40.67px',
                    lineHeight: '46.48px',
                    letterSpacing: '0.03em',
                    color: '#FFFFFF',
                  }}
                >
                  VOUCHER GOT IT
                </p>
                <p 
                  className="font-nunito font-bold mb-2"
                  style={{
                    fontFamily: 'Nunito',
                    fontWeight: 700,
                    fontSize: '127.82px',
                    lineHeight: '127.82px',
                    letterSpacing: '0%',
                    color: '#8CCBFE',
                  }}
                >
                  50K
                </p>
                <p 
                  className="font-nunito text-center"
                  style={{
                    fontFamily: 'Nunito',
                    fontWeight: 400,
                    fontSize: '17.43px',
                    lineHeight: '20.33px',
                    letterSpacing: '-0.03em',
                    textAlign: 'center',
                    color: '#FFFFFF',
                  }}
                >
                  Cho sản phẩm TIGER (giới hạn 3 lần/user)
                </p>
              </div>
            </div>

            {/* Bottom Section - CTA Button */}
            <div>
              <button
                onClick={onNextPage}
                className="w-full py-4 rounded-lg font-bold text-lg"
                style={{ 
                  backgroundColor: '#F5F5DC',
                  color: '#000000',
                }}
              >
                Trang kế tiếp
              </button>
            </div>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
}
