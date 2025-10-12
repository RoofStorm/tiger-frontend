'use client';

import { useQuery } from '@tanstack/react-query';
import { useNextAuth } from '@/hooks/useNextAuth';
import { Button } from '@/components/ui/button';
import { Gift, Calendar, Star, LogOut, Home } from 'lucide-react';
import apiClient from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface RedeemItem {
  id: string;
  status: string;
  pointsUsed: number;
  createdAt: string;
  updatedAt: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  reward?: {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
  };
}

export default function ProfilePage() {
  const { user, isAuthenticated, logout } = useNextAuth();
  const router = useRouter();

  // Function to scroll to corner
  const scrollToCorner = (cornerId: string) => {
    console.log('Scrolling to corner:', cornerId);
    router.push('/');
    setTimeout(() => {
      const element = document.getElementById(cornerId);
      console.log('Element found:', element);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
        console.log('Scrolled to element');
      } else {
        console.log('Element not found, trying again...');
        // Try again after a longer delay
        setTimeout(() => {
          const retryElement = document.getElementById(cornerId);
          if (retryElement) {
            retryElement.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            });
            console.log('Scrolled to element on retry');
          } else {
            console.log('Element still not found');
          }
        }, 500);
      }
    }, 300);
  };

  // Fetch user details including points
  const { data: userDetails } = useQuery({
    queryKey: ['userDetails'],
    queryFn: () => apiClient.getCurrentUser(),
    enabled: isAuthenticated,
  });

  // Fetch redeem history
  const {
    data: redeemHistoryData,
    isLoading: redeemHistoryLoading,
    error: redeemHistoryError,
  } = useQuery({
    queryKey: ['redeemHistory'],
    queryFn: () => apiClient.getRedeemHistory(),
    enabled: isAuthenticated,
  });

  const redeemHistory = Array.isArray(redeemHistoryData?.data?.redeems)
    ? redeemHistoryData.data.redeems
    : [];

  console.log('Profile page redeem history debug:', {
    redeemHistoryData,
    redeemHistoryLoading,
    redeemHistoryError,
    isAuthenticated,
    user: user?.id,
    redeemHistoryLength: redeemHistory.length,
    redeemHistoryArray: redeemHistory,
    deliveredCount: redeemHistory.filter(
      (r: RedeemItem) => r.status === 'DELIVERED'
    ).length,
    statusBreakdown: redeemHistory.reduce(
      (acc: Record<string, number>, req: RedeemItem) => {
        acc[req.status] = (acc[req.status] || 0) + 1;
        return acc;
      },
      {}
    ),
  });

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
              {user?.image ? (
                <Image
                  src={user.image}
                  alt={user.name || 'User avatar'}
                  width={96}
                  height={96}
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
              <div className="inline-flex items-center space-x-2 bg-yellow-100 px-4 py-2 rounded-full mb-4">
                <Gift className="w-5 h-5 text-yellow-600" />
                <span className="text-lg font-semibold text-yellow-800">
                  {userDetails?.points || 0} điểm
                </span>
              </div>

              {/* Logout Button */}
              <Button
                variant="outline"
                onClick={logout}
                className="text-red-600 hover:text-red-800 hover:bg-red-50 border-red-200 hover:border-red-300"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Đăng xuất
              </Button>
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
                  {
                    redeemHistory.filter(
                      (r: RedeemItem) => r.status === 'DELIVERED'
                    ).length
                  }
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
            <div className="flex items-center space-x-3">
              <Link href="/">
                <Button
                  variant="outline"
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                >
                  <Home className="w-4 h-4" />
                  <span>Trang chủ</span>
                </Button>
              </Link>
              <Link href="/#corner-4">
                <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white">
                  Đổi quà mới
                </Button>
              </Link>
            </div>
          </div>

          {redeemHistoryLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-green-500 mx-auto"></div>
              <p className="mt-6 text-gray-600 text-lg">Đang tải lịch sử...</p>
            </div>
          ) : redeemHistoryError ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-12 h-12 text-red-400" />
              </div>
              <p className="text-red-600 text-lg mb-2">Lỗi tải lịch sử</p>
              <p className="text-gray-500">
                Không thể tải lịch sử đổi quà. Vui lòng thử lại sau.
              </p>
            </div>
          ) : redeemHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg mb-2">
                Chưa có lịch sử đổi quà
              </p>
              <p className="text-gray-500">Hãy bắt đầu đổi quà ngay!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {redeemHistory.map((redeem: RedeemItem) => (
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
                        {redeem.reward?.name || 'Unknown Reward'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Người nhận: {redeem.receiverName}
                      </p>
                      <p className="text-sm text-gray-500">
                        SĐT: {redeem.receiverPhone}
                      </p>
                      <p className="text-sm text-gray-500">
                        Địa chỉ:{' '}
                        <span className="break-words">
                          {redeem.receiverAddress}
                        </span>
                      </p>
                      <p className="text-sm text-gray-500">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        {new Date(redeem.createdAt).toLocaleDateString(
                          'vi-VN'
                        )}{' '}
                        -{' '}
                        {new Date(redeem.createdAt).toLocaleTimeString('vi-VN')}
                      </p>
                      {redeem.updatedAt !== redeem.createdAt && (
                        <p className="text-xs text-gray-400">
                          Cập nhật:{' '}
                          {new Date(redeem.updatedAt).toLocaleDateString(
                            'vi-VN'
                          )}{' '}
                          -{' '}
                          {new Date(redeem.updatedAt).toLocaleTimeString(
                            'vi-VN'
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium mb-2 ${
                        redeem.status === 'DELIVERED'
                          ? 'bg-green-100 text-green-800'
                          : redeem.status === 'APPROVED'
                            ? 'bg-blue-100 text-blue-800'
                            : redeem.status === 'REJECTED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {redeem.status === 'DELIVERED'
                        ? '✅ Hoàn thành'
                        : redeem.status === 'APPROVED'
                          ? '✅ Đã duyệt'
                          : redeem.status === 'REJECTED'
                            ? '❌ Từ chối'
                            : '⏳ Chờ duyệt'}
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
          <button
            onClick={() => scrollToCorner('corner-1')}
            className="group h-full text-left"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow h-full flex flex-col">
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xl">😊</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-purple-600">
                    Tạo Mood Card
                  </h3>
                  <p className="text-sm text-gray-600">
                    Chia sẻ cảm xúc của bạn
                  </p>
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => scrollToCorner('corner-2')}
            className="group h-full text-left"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow h-full flex flex-col">
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xl">📸</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600">
                    Chia sẻ ảnh
                  </h3>
                  <p className="text-sm text-gray-600">Kết nối với cộng đồng</p>
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => scrollToCorner('corner-4')}
            className="group h-full text-left"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow h-full flex flex-col">
              <div className="flex items-center space-x-4 flex-1">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 group-hover:text-green-600">
                    Đổi quà
                  </h3>
                  <p className="text-sm text-gray-600">Sử dụng điểm của bạn</p>
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
