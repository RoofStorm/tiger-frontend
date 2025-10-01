'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Gift, Calendar, Star, TrendingUp } from 'lucide-react';
import apiClient from '@/lib/api';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();

  // Fetch redeem history
  const { data: redeemHistoryData } = useQuery({
    queryKey: ['redeemHistory'],
    queryFn: () => apiClient.getRedeemHistory(),
    enabled: isAuthenticated,
  });

  const redeemHistory = redeemHistoryData?.data || [];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Cần đăng nhập
          </h1>
          <p className="text-gray-600 mb-6">
            Vui lòng đăng nhập để xem thông tin cá nhân.
          </p>
          <Link href="/auth/login">
            <Button>Đăng nhập</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-3xl">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {user?.name}
              </h1>
              <p className="text-gray-600 mb-4">{user?.email}</p>
              
              {/* Points Display */}
              <div className="inline-flex items-center space-x-2 bg-yellow-100 px-4 py-2 rounded-full">
                <Gift className="w-5 h-5 text-yellow-600" />
                <span className="text-lg font-semibold text-yellow-800">
                  {user?.points || 0} điểm
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {redeemHistory.length}
                </div>
                <div className="text-sm text-gray-600">Lần đổi quà</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {redeemHistory.filter((r: any) => r.status === 'completed').length}
                </div>
                <div className="text-sm text-gray-600">Quà đã nhận</div>
              </div>
            </div>
          </div>
        </div>

        {/* Redeem History */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Lịch sử đổi quà
            </h2>
            <Link href="/#corner-4">
              <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
                Đổi quà mới
              </Button>
            </Link>
          </div>

          {redeemHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg mb-2">Chưa có lịch sử đổi quà</p>
              <p className="text-gray-500">Hãy bắt đầu đổi quà ngay!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {redeemHistory.map((redeem: any) => (
                <div
                  key={redeem.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
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
                        Người nhận: {redeem.receiverName}
                      </p>
                      <p className="text-sm text-gray-500">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        {new Date(redeem.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium mb-2 ${
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
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Star className="w-4 h-4" />
                      <span>-{redeem.pointsUsed} điểm</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <Link href="/#corner-1" className="group">
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">😊</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-purple-600">
                    Tạo Mood Card
                  </h3>
                  <p className="text-sm text-gray-600">
                    Chia sẻ cảm xúc của bạn
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/#corner-2" className="group">
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">📸</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                    Chia sẻ ảnh
                  </h3>
                  <p className="text-sm text-gray-600">
                    Kết nối với cộng đồng
                  </p>
                </div>
              </div>
            </div>
          </Link>

          <Link href="/#corner-4" className="group">
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-green-600">
                    Đổi quà
                  </h3>
                  <p className="text-sm text-gray-600">
                    Sử dụng điểm của bạn
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

