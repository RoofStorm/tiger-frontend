'use client';

import { useRouter } from 'next/navigation';
import { RewardImageModal } from './RewardImageModal';

interface ShareFacebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  hideButton?: boolean;
}

export function ShareFacebookModal({
  isOpen,
  onClose,
  hideButton = false,
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
      buttonText={hideButton ? undefined : "Tham gia ngay"}
      onButtonClick={hideButton ? undefined : handleButtonClick}
      buttonClassName="relative -top-[50px]"
    />
  );
}

