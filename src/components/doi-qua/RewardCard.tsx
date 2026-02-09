'use client';

import { motion } from 'framer-motion';
import { Reward } from '@/types';
import { isSpecialVoucher, getRewardDescription } from '@/constants/doiQuaContent';

interface RewardCardProps {
  reward: Reward;
  canRedeem: boolean;
  onRedeem: (reward: Reward) => void;
  index: number;
}

export function RewardCard({ reward, canRedeem, onRedeem, index }: RewardCardProps) {
  // Extract voucher value from reward name (e.g., "50K", "100K")
  const voucherMatch = reward.name.match(/(\d+K|\d+k)/i);
  const voucherValue = voucherMatch ? voucherMatch[1].toUpperCase() : 'VOUCHER';
  const pointsRequired = reward.pointsRequired;

  return (
    <motion.div
      key={reward.id}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className={`rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 flex flex-col h-full w-full min-h-[240px] max-h-[280px] md:min-h-[320px] md:max-h-[360px] lg:min-h-[360px] lg:max-h-[400px] ${
        !canRedeem ? 'opacity-60' : ''
      }`}
      style={{ 
        backgroundImage: 'url(/uudai/card_voucher_background.svg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        aspectRatio: '3/4'
      }}
    >
      {/* Voucher Card Content */}
      <div className="px-2 py-3 md:px-4 md:py-6 flex flex-col h-full">
        {/* Dashed Border Section */}
        <div className="mt-auto mb-2 md:mb-4">
          {/* Points Requirement - Hidden for special vouchers (monthly rank rewards) */}
          {!isSpecialVoucher(reward.id) && (
            <div className="text-center mb-1 md:mb-2">
              <p className="text-white font-nunito font-medium text-xs md:text-base lg:text-lg">
                {pointsRequired} Điểm năng lượng
              </p>
            </div>
          )}

          <div 
            className="border-[2px] border-dashed rounded-lg px-1 py-1 md:px-2 md:py-2 mb-2 md:mb-3 flex flex-col justify-center"
            style={{ borderColor: '#FFFFFF' }}
          >
            <div className="text-center">
              {/* VOUCHER Label */}
              <p 
                className="font-prata text-white mb-0.5 md:mb-1"
                style={{
                  fontFamily: 'Prata',
                  fontWeight: 400,
                  fontSize: 'clamp(12px, 3vw, 22px)',
                  letterSpacing: '0.03em',
                  color: '#FFFFFF',
                }}
              >
                VOUCHER GOT IT
              </p>

              {/* Voucher Value */}
              <p 
                className="font-nunito font-bold mb-0.5 md:mb-1"
                style={{
                  fontFamily: 'Nunito',
                  fontWeight: 700,
                  fontSize: 'clamp(32px, 8vw, 64px)',
                  lineHeight: 'clamp(32px, 8vw, 64px)',
                  color: '#ADD1EE',
                }}
              >
                {voucherValue}
              </p>

              {/* Description */}
              <p 
                className="font-nunito text-center"
                style={{
                  fontFamily: 'Nunito',
                  fontWeight: 400,
                  fontSize: 'clamp(8px, 2vw, 11px)',
                  lineHeight: 'clamp(12px, 3vw, 16px)',
                  color: '#FFFFFF',
                }}
              >
                {getRewardDescription(reward.id)}
              </p>
            </div>
          </div>
        </div>

        {/* Button */}
        <button
          onClick={() => onRedeem(reward)}
          disabled={!canRedeem}
          className={`w-full py-1.5 md:py-2 rounded-lg font-nunito font-semibold transition-all duration-300 ${
            canRedeem
              ? 'bg-white hover:bg-gray-100'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
          style={{ 
            color: canRedeem ? '#284A8F' : '#666666',
            fontSize: 'clamp(10px, 2.5vw, 14px)'
          }}
        >
          Đổi quà ngay
        </button>
      </div>
    </motion.div>
  );
}

