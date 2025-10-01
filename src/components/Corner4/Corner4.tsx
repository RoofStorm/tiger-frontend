'use client';

import { useState } from 'react';
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Góc Phần Thưởng
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 mb-4">
            Đổi điểm của bạn lấy những phần quà ý nghĩa
          </p>
          {isAuthenticated && (
            <div className="inline-flex items-center space-x-2 bg-yellow-100 px-6 py-3 rounded-full">
              <Gift className="w-6 h-6 text-yellow-600" />
              <span className="text-lg font-semibold text-yellow-800">
                {user?.points || 0} điểm
              </span>
            </div>
          )}
        </div>

        {/* Rewards Grid */}
        <div className="mb-16">
          {rewardsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải...</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map((reward: Reward) => (
                <div
                  key={reward.id}
                  className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${
                    !canRedeem(reward) ? 'opacity-60' : ''
                  }`}
                >
                  <div className="aspect-video bg-gray-100">
                    <img
                      src={reward.imageUrl}
                      alt={reward.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        {reward.name}
                      </h3>
                      <div className="flex items-center space-x-1 text-yellow-500">
                        <Star className="w-5 h-5 fill-current" />
                        <span className="font-semibold">
                          {reward.pointsRequired}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {reward.description}
                    </p>
                    
                    <Button
                      onClick={() => handleRedeem(reward)}
                      disabled={!canRedeem(reward)}
                      className={`w-full ${
                        canRedeem(reward)
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {canRedeem(reward) ? 'Đổi quà' : 'Không đủ điểm'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Redeem History */}
        {isAuthenticated && redeemHistory.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Lịch sử đổi quà
            </h3>
            <div className="space-y-4">
              {redeemHistory.map((redeem: any) => (
                <div
                  key={redeem.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                      <Gift className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {redeem.reward.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(redeem.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                      redeem.status === 'completed' ? 'bg-green-100 text-green-800' :
                      redeem.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                      redeem.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {redeem.status === 'completed' ? 'Hoàn thành' :
                       redeem.status === 'approved' ? 'Đã duyệt' :
                       redeem.status === 'rejected' ? 'Từ chối' :
                       'Chờ duyệt'}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      -{redeem.pointsUsed} điểm
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Redeem Modal */}
        {showRedeemModal && selectedReward && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Đổi quà: {selectedReward.name}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên người nhận
                  </label>
                  <input
                    type="text"
                    value={redeemForm.receiverName}
                    onChange={(e) => setRedeemForm(prev => ({
                      ...prev,
                      receiverName: e.target.value,
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Nhập tên người nhận"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số điện thoại
                  </label>
                  <input
                    type="tel"
                    value={redeemForm.receiverPhone}
                    onChange={(e) => setRedeemForm(prev => ({
                      ...prev,
                      receiverPhone: e.target.value,
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Địa chỉ
                  </label>
                  <textarea
                    value={redeemForm.receiverAddress}
                    onChange={(e) => setRedeemForm(prev => ({
                      ...prev,
                      receiverAddress: e.target.value,
                    }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    rows={3}
                    placeholder="Nhập địa chỉ nhận quà"
                  />
                </div>
              </div>
              
              <div className="flex space-x-4 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowRedeemModal(false)}
                  className="flex-1"
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleRedeemSubmit}
                  disabled={!redeemForm.receiverName || !redeemForm.receiverPhone || !redeemForm.receiverAddress || redeemMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                >
                  {redeemMutation.isPending ? 'Đang xử lý...' : 'Xác nhận đổi quà'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

