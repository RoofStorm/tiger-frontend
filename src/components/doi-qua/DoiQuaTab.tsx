'use client';

import { Reward } from '@/types';
import { RewardCard } from './RewardCard';

interface DoiQuaTabProps {
  rewards: Reward[];
  isLoadingRewards: boolean;
  canRedeem: (reward: Reward) => boolean;
  onRedeem: (reward: Reward) => void;
}

export function DoiQuaTab({ rewards, isLoadingRewards, canRedeem, onRedeem }: DoiQuaTabProps) {
  return (
    <div className="mb-16">
      {isLoadingRewards ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-600">Đang tải danh sách quà...</div>
        </div>
      ) : rewards.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-600">Không có quà nào khả dụng</div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3 lg:gap-3 justify-items-center max-w-6xl mx-auto">
          {rewards.map((reward: Reward, index: number) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              canRedeem={canRedeem(reward)}
              onRedeem={onRedeem}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
}

