'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Gift, Star, MapPin, Phone, User, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Reward, CreateRedeemData } from '@/types';
import apiClient from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export function Corner4() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemForm, setRedeemForm] = useState({
    receiverName: '',
    receiverPhone: '',
    receiverAddress: '',
  });

  // Fetch rewards
  const { data: rewardsData, isLoading: rewardsLoading } = useQuery({
    queryKey: ['rewards'],
    queryFn: () => apiClient.getRewards(),
  });

  const rewards = rewardsData?.data || [];

  // Fetch redeem history
  const { data: redeemHistoryData } = useQuery({
    queryKey: ['redeemHistory'],
    queryFn: () => apiClient.getRedeemHistory(),
    enabled: isAuthenticated,
  });

  const redeemHistory = redeemHistoryData?.data || [];

  // Redeem mutation
  const redeemMutation = useMutation({
    mutationFn: (data: CreateRedeemData) => apiClient.createRedeemRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['redeemHistory'] });
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      setShowRedeemModal(false);
      setSelectedReward(null);
      setRedeemForm({ receiverName: '', receiverPhone: '', receiverAddress: '' });
      toast({
        title: 'Đã gửi yêu cầu đổi quà!',
        description: 'Yêu cầu của bạn đang được xử lý.',
      });
    },
    onError: () => {
      toast({
        title: 'Lỗi',
        description: 'Không thể gửi yêu cầu. Vui lòng thử lại.',
        variant: 'destructive',
      });
    },
  });

  const handleRedeem = (reward: Reward) => {
    if (!isAuthenticated) {
      toast({
        title: 'Cần đăng nhập',
        description: 'Vui lòng đăng nhập để đổi quà.',
        variant: 'destructive',
      });
      return;
    }

    if ((user?.points || 0) < reward.pointsRequired) {
      toast({
        title: 'Không đủ điểm',
        description: `Bạn cần ${reward.pointsRequired} điểm để đổi quà này.`,
        variant: 'destructive',
      });
      return;
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
    return isAuthenticated && (user?.points || 0) >= reward.pointsRequired;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-12 lg:py-20">
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
            {isAuthenticated && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="inline-flex items-center space-x-3 bg-gradient-to-r from-yellow-100 to-amber-100 px-8 py-4 rounded-full shadow-lg"
              >
                <Gift className="w-8 h-8 text-yellow-600" />
                <span className="text-2xl font-bold text-yellow-800">
                  {user?.points || 0} điểm
                </span>
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {rewards.map((reward: Reward, index: number) => (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={`bg-white/90 backdrop-blur-sm rounded-3xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-105 group ${
                    !canRedeem(reward) ? 'opacity-60' : ''
                  }`}
                >
                  {/* Reward Image */}
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
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
                        <span className="font-bold">{reward.pointsRequired}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Reward Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      {reward.name}
                    </h3>
                    
                    <p className="text-gray-600 mb-6 line-clamp-3 leading-relaxed">
                      {reward.description}
                    </p>
                    
                    <Button
                      onClick={() => handleRedeem(reward)}
                      disabled={!canRedeem(reward)}
                      className={`w-full py-3 text-lg font-semibold rounded-xl transition-all duration-300 ${
                        canRedeem(reward)
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-green-500/25 hover:scale-105'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {canRedeem(reward) ? '🎁 Đổi quà' : '❌ Không đủ điểm'}
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Redeem History */}
        {isAuthenticated && redeemHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 lg:p-12"
          >
            <div className="text-center mb-8">
              <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                Lịch sử đổi quà
              </h3>
              <p className="text-gray-600 text-lg">
                Theo dõi các yêu cầu đổi quà của bạn
              </p>
            </div>
            
            <div className="space-y-4">
              {redeemHistory.map((redeem: any, index: number) => (
                <motion.div
                  key={redeem.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Gift className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">
                        {redeem.reward.name}
                      </p>
                      <p className="text-gray-500">
                        {new Date(redeem.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`px-4 py-2 rounded-full text-sm font-bold ${
                      redeem.status === 'completed' ? 'bg-green-100 text-green-800' :
                      redeem.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                      redeem.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {redeem.status === 'completed' ? '✅ Hoàn thành' :
                       redeem.status === 'approved' ? '✅ Đã duyệt' :
                       redeem.status === 'rejected' ? '❌ Từ chối' :
                       '⏳ Chờ duyệt'}
                    </div>
                    <p className="text-sm text-gray-500 mt-2 font-semibold">
                      -{redeem.pointsUsed} điểm
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
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
                <p className="text-gray-600 text-lg">
                  {selectedReward.name}
                </p>
                <div className="inline-flex items-center space-x-2 bg-yellow-100 px-4 py-2 rounded-full mt-4">
                  <Star className="w-5 h-5 text-yellow-600 fill-current" />
                  <span className="font-bold text-yellow-800">
                    {selectedReward.pointsRequired} điểm
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
                    onChange={(e) => setRedeemForm(prev => ({
                      ...prev,
                      receiverName: e.target.value,
                    }))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-300 text-lg"
                    placeholder="Nhập tên người nhận"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={redeemForm.receiverPhone}
                    onChange={(e) => setRedeemForm(prev => ({
                      ...prev,
                      receiverPhone: e.target.value,
                    }))}
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
                    onChange={(e) => setRedeemForm(prev => ({
                      ...prev,
                      receiverAddress: e.target.value,
                    }))}
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
                  disabled={!redeemForm.receiverName || !redeemForm.receiverPhone || !redeemForm.receiverAddress || redeemMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 text-lg rounded-xl shadow-lg hover:shadow-green-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {redeemMutation.isPending ? '⏳ Đang xử lý...' : '🎁 Xác nhận đổi quà'}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

