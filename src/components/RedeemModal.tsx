'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Reward } from '@/types';
import { useInputFix } from '@/hooks/useInputFix';
import { PhoneInput } from '@/components/ui/phone-input';

interface RedeemModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedReward: Reward | null;
  onSubmit: (data: { receiverPhone: string; receiverEmail: string }) => void;
  isPending?: boolean;
}

// Get voucher image based on reward value
const getVoucherImage = (reward: Reward): string => {
  const voucherMatch = reward.name.match(/(\d+K|\d+k)/i);
  if (!voucherMatch) return '/popup/voucher_50k.png';
  
  const value = voucherMatch[1].toUpperCase();
  switch (value) {
    case '50K':
      return '/popup/voucher_50k.png';
    case '100K':
      return '/popup/voucher_100k.png';
    case '500K':
      return '/popup/voucher_500k.png';
    case '1000K':
      return '/popup/voucher_1000k.png';
    default:
      return '/popup/voucher_50k.png';
  }
};

export function RedeemModal({
  isOpen,
  onClose,
  selectedReward,
  onSubmit,
  isPending = false,
}: RedeemModalProps) {
  const { onKeyDown: handleInputKeyDown } = useInputFix();
  const [redeemForm, setRedeemForm] = useState({
    receiverPhone: '',
    receiverEmail: '',
  });

  if (!isOpen || !selectedReward) return null;

  const handleSubmit = () => {
    onSubmit(redeemForm);
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4 z-[70]"
      onClick={onClose}
    >
      {/* Backdrop layer - only this has opacity */}
      <div className="absolute inset-0 bg-black opacity-90"></div>
      {/* Content layer - not affected by backdrop opacity */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        className="relative rounded-3xl p-6 md:p-8 w-full max-w-5xl md:top-[-150px] overflow-hidden bg-transparent flex flex-col items-center z-10"
      >
        {/* Voucher Image */}
        <div className="flex justify-center mb-6">
          <Image
            src={getVoucherImage(selectedReward)}
            alt={selectedReward.name}
            width={800}
            height={900}
            className="w-full h-auto object-contain max-w-5xl relative scale-[2] top-[-100px] sm:scale-100 sm:top-0"
            quality={100}
          />
        </div>

        {/* Instruction Text */}
        <div className="text-center mb-6">
          <p 
            className="text-gray-700 max-w-2xl mx-auto"
            style={{
              fontFamily: 'var(--font-nunito)',
              fontSize: '16px',
              lineHeight: '24px',
              color: '#ffffff',
            }}
          >
            Bạn vui lòng để lại số điện thoại và email,<br />
            để TIGER gửi mã đến bạn nhé!
          </p>
        </div>

        {/* Form Fields */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 justify-center items-center">
          <div>
            <PhoneInput
              value={redeemForm.receiverPhone}
              onChange={value =>
                setRedeemForm(prev => ({
                  ...prev,
                  receiverPhone: value,
                }))
              }
              className="bg-gray-100 transition-all duration-300 bg-transparent text-white"
              style={{
                width: '231px',
                height: '48px',
                paddingTop: '12px',
                paddingRight: '8px',
                paddingBottom: '12px',
                paddingLeft: '8px',
                gap: '8px',
                borderRadius: '8px',
                borderWidth: '1px',
                border: '1px solid #DCDCDC',
                color: '#ffffff',
              }}
              placeholder="Số điện thoại"
            />
          </div>

          <div>
            <input
              type="email"
              value={redeemForm.receiverEmail}
              onChange={e =>
                setRedeemForm(prev => ({
                  ...prev,
                  receiverEmail: e.target.value,
                }))
              }
              onKeyDown={handleInputKeyDown}
              className="bg-gray-100 transition-all duration-300 bg-transparent text-white"
              style={{
                width: '231px',
                height: '48px',
                paddingTop: '12px',
                paddingRight: '8px',
                paddingBottom: '12px',
                paddingLeft: '8px',
                gap: '8px',
                borderRadius: '8px',
                borderWidth: '1px',
                border: '1px solid #DCDCDC',
                color: '#ffffff',
              }}
              placeholder="Email"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center w-full">
          <Button
            onClick={handleSubmit}
            disabled={
              !redeemForm.receiverPhone ||
              !redeemForm.receiverEmail ||
              isPending
            }
            className="bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              fontFamily: 'var(--font-nunito)',
              fontWeight: 600,
              width: '478px', // 231px + 16px (gap) + 231px
            }}
          >
            {isPending
              ? '⏳ Đang xử lý...'
              : 'Gửi'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

