'use client';

import { useRouter } from 'next/navigation';
import { RewardImageModal } from './RewardImageModal';

interface DailyLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DailyLoginModal({
  isOpen,
  onClose,
}: DailyLoginModalProps) {
  const router = useRouter();

  const handleButtonClick = () => {
    router.push('/nhip-song');
  };

  return (
    <RewardImageModal
      isOpen={isOpen}
      onClose={onClose}
      imagePath="/popup/daily_login.png"
      alt="Daily Login Reward"
      showCloseButton={false}
      buttonText="Chọn nhịp sống của bạn hôm nay"
      onButtonClick={handleButtonClick}
    />
  );
}

