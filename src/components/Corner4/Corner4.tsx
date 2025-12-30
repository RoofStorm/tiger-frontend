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

type TabType = 'doi-qua' | 'the-le' | 'nhip-song' | 'thu-thach';

export function Corner4() {
  const { user, isAuthenticated } = useNextAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { onKeyDown: handleInputKeyDown } = useInputFix();
  const [activeTab, setActiveTab] = useState<TabType>('doi-qua');
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
      className="min-h-screen py-12 lg:py-20"
      style={{ backgroundColor: '#FFFDF5' }}
    >
      <div className="max-w-[90%] mx-auto px-0.5 sm:px-1 lg:px-2">
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="font-prata text-4xl md:text-5xl mb-6" style={{ color: '#00579F' }}>
              Trao đổi nhịp sống
            </h2>
            <p className="text-gray-700 max-w-3xl mx-auto text-center leading-relaxed font-noto-sans" style={{ fontSize: '16px' }}>
              Điểm &quot;năng lượng&quot; bạn tích lũy chính là những dấu mốc nhỏ trong hành trình giữ nhịp sống. Đổi điểm để nhận về những món quà từ TIGER – như một lời nhắc: bạn xứng đáng được chăm sóc mỗi ngày.
            </p>

            {/* Temporarily hidden */}
            {false && isAuthenticated && (
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

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center">
            {[
              { id: 'doi-qua' as TabType, label: 'Đổi quà' },
              { id: 'the-le' as TabType, label: 'Thể lệ' },
              { id: 'nhip-song' as TabType, label: 'Nhịp sống' },
              { id: 'thu-thach' as TabType, label: 'Thử thách' },
            ].map((tab, index, array) => (
              <div key={tab.id} className="flex items-center">
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 font-medium transition-all duration-300 rounded-full ${
                    activeTab === tab.id
                      ? 'bg-[#284A8F] text-white'
                      : 'bg-white text-gray-800 border border-gray-800'
                  }`}
                  style={{
                    fontFamily: 'var(--font-nunito)',
                    fontSize: '16px',
                    fontWeight: activeTab === tab.id ? 600 : 500,
                  }}
                >
                  {tab.label}
                </button>
                {index < array.length - 1 && (
                  <div 
                    className="h-[1px] w-8 mx-1"
                    style={{ backgroundColor: '#333435' }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Centered Title */}
        <div className="text-center mb-12">
          <h2 
            className="font-prata"
            style={{ 
              color: '#00579F',
              fontFamily: 'Prata',
              fontWeight: 400,
              fontStyle: 'normal',
              fontSize: '36px',
              lineHeight: '40px',
              letterSpacing: '0.03em',
              textAlign: 'center',
            }}
          >
            Đổi quà
          </h2>
        </div>

        {/* Tab Content */}
        {activeTab === 'doi-qua' && (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              {rewards.map((reward: Reward, index: number) => {
                // Extract voucher value from reward name (e.g., "50K", "100K")
                const voucherMatch = reward.name.match(/(\d+K|\d+k)/i);
                const voucherValue = voucherMatch ? voucherMatch[1].toUpperCase() : 'VOUCHER';
                const pointsRequired = reward.lifeRequired 
                  ? reward.lifeRequired * 1000 
                  : reward.pointsRequired;

                return (
                  <motion.div
                    key={reward.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className={`rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 flex flex-col h-full ${
                      !canRedeem(reward) ? 'opacity-60' : ''
                    }`}
                    style={{ backgroundColor: '#284A8F', minHeight: '500px' }}
                  >
                    {/* Voucher Card Content */}
                    <div className="p-6 flex flex-col h-full">
                      {/* Points Requirement */}
                      <div className="text-center mb-4">
                        <p className="text-white font-nunito font-medium" style={{ fontSize: '14px' }}>
                          {pointsRequired} Điểm năng lượng
                        </p>
                      </div>

                      {/* Dashed Border Section */}
                      <div 
                        className="border-2 border-dashed rounded-lg p-6 mb-4 flex-1 flex flex-col justify-center"
                        style={{ borderColor: '#3B65AD' }}
                      >
                        <div className="text-center">
                          {/* VOUCHER Label */}
                          <p 
                            className="font-prata text-white mb-3"
                            style={{
                              fontFamily: 'Prata',
                              fontWeight: 400,
                              fontSize: '24px',
                              letterSpacing: '0.03em',
                              color: '#FFFFFF',
                            }}
                          >
                            VOUCHER
                          </p>

                          {/* Voucher Value */}
                          <p 
                            className="font-nunito font-bold mb-3"
                            style={{
                              fontFamily: 'Nunito',
                              fontWeight: 700,
                              fontSize: '64px',
                              lineHeight: '64px',
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
                              fontSize: '14px',
                              lineHeight: '20px',
                              color: '#FFFFFF',
                            }}
                          >
                            Cho sản phẩm TIGER (giới hạn 3 lần/user)
                          </p>
                        </div>
                      </div>

                      {/* Button */}
                      <button
                        onClick={() => handleRedeem(reward)}
                        disabled={!canRedeem(reward)}
                        className={`w-full py-3 rounded-lg font-nunito font-semibold transition-all duration-300 ${
                          canRedeem(reward)
                            ? 'bg-white hover:bg-gray-100'
                            : 'bg-gray-300 cursor-not-allowed'
                        }`}
                        style={{ 
                          color: canRedeem(reward) ? '#284A8F' : '#666666'
                        }}
                      >
                        Đổi quà ngay
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
          </div>
        )}

        {activeTab === 'the-le' && (
          <div className="mb-16 text-center py-16">
            <p className="text-gray-600 text-lg">Nội dung thể lệ sẽ được cập nhật...</p>
          </div>
        )}

        {activeTab === 'nhip-song' && (
          <div className="mb-16 text-center py-16">
            <p className="text-gray-600 text-lg">Nội dung nhịp sống sẽ được cập nhật...</p>
          </div>
        )}

        {activeTab === 'thu-thach' && (
          <div className="mb-16 text-center py-16">
            <p className="text-gray-600 text-lg">Nội dung thử thách sẽ được cập nhật...</p>
          </div>
        )}

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
                    onChange={e => {
                      // Không trim - giữ nguyên giá trị người dùng nhập
                      setRedeemForm(prev => ({
                        ...prev,
                        receiverAddress: e.target.value,
                      }));
                    }}
                    onKeyDown={(e) => {
                      // Ngăn event bubbling lên parent để tránh bị ảnh hưởng
                      e.stopPropagation();
                    }}
                    onKeyPress={(e) => {
                      // Ngăn event bubbling lên parent
                      e.stopPropagation();
                    }}
                    onKeyUp={(e) => {
                      // Ngăn event bubbling lên parent
                      e.stopPropagation();
                    }}
                    onDragOver={(e) => {
                      // Ngăn drag events từ parent ảnh hưởng đến textarea
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      // Ngăn drop events từ parent ảnh hưởng đến textarea
                      e.stopPropagation();
                    }}
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
