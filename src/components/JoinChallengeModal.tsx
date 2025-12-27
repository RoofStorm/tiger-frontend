'use client';

import { RewardImageModal } from './RewardImageModal';

interface JoinChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JoinChallengeModal({
  isOpen,
  onClose,
}: JoinChallengeModalProps) {
  return (
    <RewardImageModal
      isOpen={isOpen}
      onClose={onClose}
      imagePath="/popup/join_challenge.png"
      alt="Join Challenge Reward"
      showCloseButton={false}
      closeOnContentClick={true}
    />
  );
}

