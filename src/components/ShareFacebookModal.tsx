'use client';

import { useRouter } from 'next/navigation';
import { RewardImageModal } from './RewardImageModal';

interface ShareFacebookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShareFacebookModal({
  isOpen,
  onClose,
}: ShareFacebookModalProps) {
  const router = useRouter();

  const handleButtonClick = () => {
    router.push('/thu-thach-giu-nhip');
    onClose();
  };

  return (
    <RewardImageModal
      isOpen={isOpen}
      onClose={onClose}
      imagePath="/popup/share_facebook.png"
      alt="Share Facebook Reward"
      showCloseButton={false}
      closeOnContentClick={true}
      buttonText="Tham gia ngay"
      onButtonClick={handleButtonClick}
      buttonClassName="relative -top-[50px]"
    />
  );
}

