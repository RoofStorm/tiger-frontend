'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Gift, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reward, CreateRedeemData } from '@/types';

interface UserRedeem {
  id: string;
  rewardId: string;
  status: string;
}
import apiClient from '@/lib/api';
import { useNextAuth } from '@/hooks/useNextAuth';
import { useToast } from '@/hooks/use-toast';
import { useInputFix } from '@/hooks/useInputFix';
import { PhoneInput } from '@/components/ui/phone-input';

export function Corner4() {
  const { user, isAuthenticated } = useNextAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { onKeyDown: handleInputKeyDown } = useInputFix();
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemForm, setRedeemForm] = useState({
    receiverName: '',
    receiverPhone: '',
    receiverAddress: '',
  });

  // Fetch user details including points
  const { data: userDetails } = useQuery({
    queryKey: ['userDetails', user?.id],
    queryFn: () => apiClient.getCurrentUser(),
    enabled: isAuthenticated,
  });

  // Fetch rewards
  const { data: rewardsData, isLoading: rewardsLoading } = useQuery({
    queryKey: ['rewards'],
    queryFn: () => apiClient.getRewards(),
  });

  const rewards = Array.isArray(rewardsData?.data?.data)
    ? rewardsData.data.data.sort((a: Reward, b: Reward) => {
        // Sort by points required (smallest to largest)
        const aPoints = a.lifeRequired
          ? a.lifeRequired * 1000
          : a.pointsRequired;
        const bPoints = b.lifeRequired
          ? b.lifeRequired * 1000
          : b.pointsRequired;
        return aPoints - bPoints;
      })
    : [];

  // Fetch user's redeem history
  const { data: redeemHistory } = useQuery({
    queryKey: ['redeemHistory', user?.id],
    queryFn: () => apiClient.getRedeemHistory(),
    enabled: isAuthenticated,
  });

  const userRedeems = Array.isArray(redeemHistory?.data?.redeems)
    ? redeemHistory.data.redeems
    : [];

  // Function to calculate remaining redeem count for a reward
  const getRemainingRedeems = (reward: Reward) => {
    if (!reward.maxPerUser) {
      return null; // No limit
    }

    const redeemedCount = userRedeems.filter(
      (redeem: UserRedeem) =>
        redeem.rewardId === reward.id &&
        (redeem.status === 'PENDING' ||
          redeem.status === 'APPROVED' ||
          redeem.status === 'DELIVERED')
    ).length;

    return {
      used: redeemedCount,
      max: reward.maxPerUser,
      remaining: Math.max(0, reward.maxPerUser - redeemedCount),
    };
  };

  // Redeem mutation
  const redeemMutation = useMutation({
    mutationFn: (data: CreateRedeemData) => apiClient.createRedeemRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.invalidateQueries({ queryKey: ['userDetails', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['redeemHistory'] });
      setShowRedeemModal(false);
      setSelectedReward(null);
      setRedeemForm({
        receiverName: '',
        receiverPhone: '',
        receiverAddress: '',
      });
      toast({
        title: 'Đã gửi yêu cầu đổi quà!',
        description: 'Yêu cầu của bạn đang được xử lý.',
        duration: 3000,
      });
    },
    onError: () => {
      toast({
        title: 'Lỗi',
        description: 'Không thể gửi yêu cầu. Vui lòng thử lại.',
        variant: 'destructive',
        duration: 4000,
      });
    },
  });

  const handleRedeem = (reward: Reward) => {
    if (!isAuthenticated) {
      toast({
        title: 'Cần đăng nhập',
        description: 'Vui lòng đăng nhập để đổi quà.',
        variant: 'destructive',
        duration: 4000,
      });
      return;
    }

    const userPoints = userDetails?.points || 0;

    // Kiểm tra đủ điểm/nhịp sống
    if (reward.lifeRequired && reward.lifeRequired > 0) {
      const userLife = Math.floor(userPoints / 1000);
      if (userLife < reward.lifeRequired) {
        toast({
          title: 'Không đủ Nhịp sống',
          description: `Bạn cần ${reward.lifeRequired} Nhịp sống để đổi quà này. (Hiện tại: ${userLife} Nhịp sống)`,
          variant: 'destructive',
          duration: 4000,
        });
        return;
      }
    } else if (reward.pointsRequired > 0) {
      if (userPoints < reward.pointsRequired) {
        toast({
          title: 'Không đủ điểm',
          description: `Bạn cần ${reward.pointsRequired} điểm năng lượng để đổi quà này. (Hiện tại: ${userPoints} điểm)`,
          variant: 'destructive',
          duration: 4000,
        });
        return;
      }
    }

    setSelectedReward(reward);
    setShowRedeemModal(true);
  };

  const handleRedeemSubmit = () => {
    if (!selectedReward) return;

    const data: CreateRedeemData = {
      rewardId: selectedReward.id,
      ...redeemForm,
    };

    redeemMutation.mutate(data);
  };

  const canRedeem = (reward: Reward) => {
    if (!isAuthenticated) return false;

    const userPoints = userDetails?.points || 0;

    // Kiểm tra giới hạn số lần đổi
    const remainingRedeems = getRemainingRedeems(reward);
    if (remainingRedeems && remainingRedeems.remaining <= 0) {
      return false;
    }

    // Nếu cần Nhịp sống
    if (reward.lifeRequired && reward.lifeRequired > 0) {
      const userLife = Math.floor(userPoints / 1000);
      return userLife >= reward.lifeRequired;
    }

    // Nếu cần điểm năng lượng
    if (reward.pointsRequired > 0) {
      return userPoints >= reward.pointsRequired;
    }

    return false;
  };

  return (
    <div
      data-corner="4"
      id="corner-4"
      className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-12 lg:py-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Góc Phần Thưởng
            </h2>
            <p className="text-xl sm:text-2xl lg:text-3xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Đổi điểm của bạn lấy những phần quà ý nghĩa
            </p>

            {/* Hint công thức đổi */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 max-w-4xl mx-auto border border-blue-200"
            >
              <h3 className="text-lg font-bold text-blue-800 mb-3 text-center">
                💡 Công thức đổi điểm
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    1.000 điểm
                  </div>
                  <div className="text-sm text-gray-600">= 1 Nhịp sống</div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    1 Nhịp sống
                  </div>
                  <div className="text-sm text-gray-600">
                    = 1.000 điểm năng lượng
                  </div>
                </div>
              </div>
            </motion.div>

            {isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6"
              >
                <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-yellow-100 to-amber-100 px-8 py-4 rounded-full shadow-lg">
                  <Gift className="w-8 h-8 text-yellow-600" />
                  <span className="text-2xl font-bold text-yellow-800">
                    {userDetails?.points || 0} điểm năng lượng
                  </span>
                </div>
                <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-green-100 to-emerald-100 px-8 py-4 rounded-full shadow-lg">
                  <Star className="w-8 h-8 text-green-600" />
                  <span className="text-2xl font-bold text-green-800">
                    {Math.floor((userDetails?.points || 0) / 1000)} Nhịp sống
                  </span>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Rewards Grid */}
        <div className="mb-16">
          {rewardsLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mx-auto"></div>
              <p className="mt-6 text-gray-600 text-lg">Đang tải...</p>
            </div>
          ) : rewards.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-32 h-32 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Gift className="w-16 h-16 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-4">
                Chưa có phần thưởng nào
              </h3>
              <p className="text-gray-500 text-lg">
                Admin sẽ thêm phần thưởng mới sớm!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {rewards.map((reward: Reward, index: number) => (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 group flex flex-col h-full ${
                    !canRedeem(reward) ? 'opacity-60' : ''
                  }`}
                >
                  {/* Reward Image */}
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={reward.imageUrl}
                      alt={reward.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Points Badge */}
                    <div className="absolute top-4 right-4">
                      <div className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-3 py-2 rounded-full shadow-lg flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-bold">
                          {reward.lifeRequired
                            ? `${reward.lifeRequired} Nhịp sống`
                            : `${reward.pointsRequired} điểm`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Reward Content */}
                  <div className="p-6 flex flex-col h-full">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                        {reward.name}
                      </h3>

                      <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">
                        {reward.description}
                      </p>
                    </div>

                    <div className="mt-auto">
                      {/* Remaining Redeems Counter */}
                      {(() => {
                        const remainingRedeems = getRemainingRedeems(reward);
                        if (remainingRedeems) {
                          return (
                            <div className="mb-3 text-center">
                              <div className="inline-flex items-center space-x-2 bg-blue-100 px-3 py-1 rounded-full">
                                <span className="text-sm font-medium text-blue-800">
                                  Còn lại: {remainingRedeems.remaining}/
                                  {remainingRedeems.max} lần
                                </span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      <Button
                        onClick={() => handleRedeem(reward)}
                        disabled={!canRedeem(reward)}
                        className={`w-full py-3 text-lg font-semibold rounded-xl transition-all duration-300 ${
                          canRedeem(reward)
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-green-500/25 hover:scale-105'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {(() => {
                          if (!isAuthenticated) return '🔒 Cần đăng nhập';

                          const remainingRedeems = getRemainingRedeems(reward);
                          if (
                            remainingRedeems &&
                            remainingRedeems.remaining <= 0
                          ) {
                            return '🚫 Hết lượt đổi';
                          }

                          const userPoints = userDetails?.points || 0;
                          if (reward.lifeRequired && reward.lifeRequired > 0) {
                            const userLife = Math.floor(userPoints / 1000);
                            if (userLife < reward.lifeRequired) {
                              return '❌ Không đủ Nhịp sống';
                            }
                          } else if (reward.pointsRequired > 0) {
                            if (userPoints < reward.pointsRequired) {
                              return '❌ Không đủ điểm';
                            }
                          }

                          return '🎁 Đổi quà';
                        })()}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Redeem Modal */}
        {showRedeemModal && selectedReward && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl"
            >
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">
                  Đổi quà
                </h3>
                <p className="text-gray-600 text-lg">{selectedReward.name}</p>
                <div className="inline-flex items-center space-x-2 bg-yellow-100 px-4 py-2 rounded-full mt-4">
                  <Star className="w-5 h-5 text-yellow-600 fill-current" />
                  <span className="font-bold text-yellow-800">
                    {selectedReward.lifeRequired
                      ? `${selectedReward.lifeRequired} Nhịp sống`
                      : `${selectedReward.pointsRequired} điểm năng lượng`}
                  </span>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Tên người nhận
                  </label>
                  <input
                    type="text"
                    value={redeemForm.receiverName}
                    onChange={e =>
                      setRedeemForm(prev => ({
                        ...prev,
                        receiverName: e.target.value,
                      }))
                    }
                    onKeyDown={handleInputKeyDown}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-lg"
                    placeholder="Nhập tên người nhận"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Số điện thoại
                  </label>
                  <PhoneInput
                    value={redeemForm.receiverPhone}
                    onChange={value =>
                      setRedeemForm(prev => ({
                        ...prev,
                        receiverPhone: value,
                      }))
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-lg"
                    placeholder="Nhập số điện thoại"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Địa chỉ
                  </label>
                  <textarea
                    value={redeemForm.receiverAddress}
                    onChange={e =>
                      setRedeemForm(prev => ({
                        ...prev,
                        receiverAddress: e.target.value,
                      }))
                    }
                    onKeyDown={handleInputKeyDown}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 resize-none text-lg"
                    rows={3}
                    placeholder="Nhập địa chỉ nhận quà"
                  />
                </div>
              </div>

              <div className="flex space-x-4 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setShowRedeemModal(false)}
                  className="flex-1 py-3 text-lg rounded-xl border-2 hover:bg-gray-50 transition-all duration-300"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleRedeemSubmit}
                  disabled={
                    !redeemForm.receiverName ||
                    !redeemForm.receiverPhone ||
                    !redeemForm.receiverAddress ||
                    redeemMutation.isPending
                  }
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 text-lg rounded-xl shadow-lg hover:shadow-green-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {redeemMutation.isPending
                    ? '⏳ Đang xử lý...'
                    : '🎁 Xác nhận đổi quà'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
