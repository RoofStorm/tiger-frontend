'use client';

import { useRouter } from 'next/navigation';
import { RewardImageModal } from './RewardImageModal';

interface FirstLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  hideButton?: boolean;
}

export function FirstLoginModal({
  isOpen,
  onClose,
  hideButton = false,
}: FirstLoginModalProps) {
  const router = useRouter();

  const handleButtonClick = () => {
    router.push('/thu-thach-giu-nhip');
    onClose();
  };

  return (
    <RewardImageModal
      isOpen={isOpen}
      onClose={onClose}
      imagePath="/popup/first_login.png"
      alt="First Login Welcome"
      showCloseButton={false}
      closeOnContentClick={true}
      buttonText={hideButton ? undefined : "Tham gia Thử thách giữ nhịp!"}
      onButtonClick={hideButton ? undefined : handleButtonClick}
      buttonClassName="relative -top-[30px]"
    />
  );
}

