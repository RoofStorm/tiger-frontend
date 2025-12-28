'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNextAuth } from '@/hooks/useNextAuth';
import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Gift, Calendar, Star, Home, RefreshCw, ChefHat } from 'lucide-react';
import apiClient from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { useGlobalNavigationLoading } from '@/hooks/useGlobalNavigationLoading';
import { useShareRegistrationModal } from '@/contexts/ShareRegistrationModalContext';
import { useZoneView } from '@/hooks/useZoneView';

interface RedeemItem {
  id: string;
  status: string;
  pointsUsed: number;
  createdAt: string;
  updatedAt: string;
  receiverPhone: string;
  receiverEmail: string;
  rejectionReason?: string;
  reward?: {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
  };
}

interface PointLog {
  id: string;
  points: number;
  reason: string;
  createdAt: string;
}

export default function ProfilePage() {
  const { user, isAuthenticated } = useNextAuth();
  const queryClient = useQueryClient();
  const { navigateWithLoading } = useGlobalNavigationLoading();
  const { showModal: showRegistrationModal } = useShareRegistrationModal();
  const pageRef = useRef<HTMLDivElement>(null);

  // Track time on Profile page
  useZoneView(pageRef, {
    page: 'profile',
    zone: 'overview',
    enabled: isAuthenticated, // Only track when user is authenticated
  });

  // Refetch all queries when user enters profile page
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      queryClient.refetchQueries({ queryKey: ['userDetails', user.id] });
      queryClient.refetchQueries({ queryKey: ['pointHistory', user.id] });
      queryClient.refetchQueries({ queryKey: ['redeemHistory', user.id] });
      queryClient.refetchQueries({ queryKey: ['referralStats'] });
    }
  }, [isAuthenticated, user?.id, queryClient]);

  // Fetch user details including points
  const { data: userDetails } = useQuery({
    queryKey: ['userDetails', user?.id],
    queryFn: () => apiClient.getCurrentUser(),
    enabled: isAuthenticated,
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
  });

  // Fetch redeem history
  const {
    data: redeemHistoryData,
    isLoading: redeemHistoryLoading,
    error: redeemHistoryError,
    refetch: refetchRedeemHistory,
  } = useQuery({
    queryKey: ['redeemHistory', user?.id],
    queryFn: () => apiClient.getRedeemHistory(),
    enabled: isAuthenticated,
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
  });

  // Function to refresh redeem history
  const handleRefreshRedeemHistory = () => {
    refetchRedeemHistory();
  };

  // Fetch point history
  const {
    data: pointHistoryData,
    isLoading: pointHistoryLoading,
    error: pointHistoryError,
    refetch: refetchPointHistory,
  } = useQuery({
    queryKey: ['pointHistory', user?.id],
    queryFn: () => apiClient.getPointHistory(),
    enabled: isAuthenticated,
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
  });

  // Function to refresh point history
  const handleRefreshPointHistory = () => {
    refetchPointHistory();
  };

  const redeemHistory = Array.isArray(redeemHistoryData?.data?.redeems)
    ? redeemHistoryData.data.redeems
    : [];

  const pointHistory = Array.isArray(pointHistoryData?.data?.logs)
    ? pointHistoryData.data.logs
    : [];

  if (!isAuthenticated) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: 'url(/uudai/traodoinhipsong_background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Cần đăng nhập
          </h1>
          <p className="text-gray-600 mb-6">
            Vui lòng đăng nhập để xem thông tin cá nhân.
          </p>
          <Button onClick={() => showRegistrationModal('login')}>Đăng nhập</Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={pageRef}
      className="min-h-screen py-20"
      style={{
        backgroundImage: 'url(/uudai/traodoinhipsong_background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'top',
        backgroundRepeat: 'no-repeat',
        // backgroundAttachment: 'fixed',
      }}
    >
      <div className="max-w-6xl mx-auto px-4">
        {/* Profile Header */}
        <div className="rounded-2xl shadow-lg p-8 mb-8" style={{ backgroundColor: 'rgb(0, 87, 159)' }}>
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
                  sizes="96px"
                  onError={e => {
                    // Hide the image and show fallback
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove(
                      'hidden'
                    );
                  }}
                />
              ) : null}
              <span
                className={`text-white font-bold text-3xl ${user?.image ? 'hidden' : ''}`}
              >
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-white mb-2">
                {user?.name}
              </h1>
              <p className="text-white mb-4">{user?.email}</p>

              {/* Points Display */}
              <div className="inline-flex items-center space-x-2 bg-yellow-100 px-4 py-2 rounded-full mb-4">
                <Gift className="w-5 h-5 text-yellow-600" />
                <span className="text-lg font-semibold text-yellow-800">
                  {userDetails?.points || 0} điểm
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex flex-col items-end space-y-6">
              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <Link href="/">
                  <Button className="flex items-center space-x-2 border-0 transition-colors" style={{ backgroundColor: 'rgba(251, 249, 243, 1)', color: 'black' }}>
                    <Home className="w-4 h-4" />
                    <span>Trang chủ</span>
                  </Button>
                </Link>
                {/* <Button
                  variant="outline"
                  onClick={logout}
                  className="text-red-600 hover:text-red-800 hover:bg-red-50 border-red-200 hover:border-red-300 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Đăng xuất 2
                </Button> */}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {redeemHistory.length}
                  </div>
                  <div className="text-sm text-white">Lần đổi quà</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {
                      redeemHistory.filter(
                        (r: RedeemItem) => r.status === 'DELIVERED'
                      ).length
                    }
                  </div>
                  <div className="text-sm text-white">Quà đã nhận</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Point History */}
        <div className="rounded-2xl shadow-lg p-8" style={{ backgroundColor: 'rgb(0, 87, 159)' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              Lịch sử cộng điểm
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefreshPointHistory}
              disabled={pointHistoryLoading}
              className="flex items-center space-x-2 text-black hover:text-black hover:bg-white/20 border-white bg-white"
            >
              <RefreshCw
                className={`w-4 h-4 ${pointHistoryLoading ? 'animate-spin' : ''}`}
              />
              <span>Làm mới</span>
            </Button>
          </div>

          {pointHistoryLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto"></div>
              <p className="mt-4 text-white">Đang tải lịch sử điểm...</p>
            </div>
          ) : pointHistoryError ? (
            <div className="text-center py-12">
              <p className="text-white">Lỗi khi tải lịch sử điểm</p>
            </div>
          ) : pointHistory.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white">Chưa có lịch sử cộng điểm</p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto space-y-4 pr-2">
              {pointHistory.map((log: PointLog) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{log.reason}</p>
                      <p className="text-sm text-white/80">
                        {new Date(log.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold ${log.points > 0 ? 'text-white' : 'text-white'}`}
                    >
                      {log.points > 0 ? '+' : ''}
                      {log.points}
                    </p>
                    <p className="text-sm text-white/80">điểm</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Redeem History */}
        <div className="rounded-2xl shadow-lg p-8 mt-6" style={{ backgroundColor: 'rgb(0, 87, 159)' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              Lịch sử đổi quà
            </h2>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefreshRedeemHistory}
                disabled={redeemHistoryLoading}
                className="flex items-center space-x-2 text-black hover:text-black hover:bg-white/20 border-white bg-white"
              >
                <RefreshCw
                  className={`w-4 h-4 ${redeemHistoryLoading ? 'animate-spin' : ''}`}
                />
                <span>Làm mới</span>
              </Button>
              <Link href="/#corner-4">
                <Button className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 flex items-center space-x-2">
                  <Gift className="w-5 h-5 text-yellow-600" />
                  <span>Đổi quà mới</span>
                </Button>
              </Link>
            </div>
          </div>

          {redeemHistoryLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto"></div>
              <p className="mt-6 text-white text-lg">Đang tải lịch sử...</p>
            </div>
          ) : redeemHistoryError ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-12 h-12 text-white" />
              </div>
              <p className="text-white text-lg mb-2">Lỗi tải lịch sử</p>
              <p className="text-white/80">
                Không thể tải lịch sử đổi quà. Vui lòng thử lại sau.
              </p>
            </div>
          ) : redeemHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-12 h-12 text-white" />
              </div>
              <p className="text-white text-lg mb-2">
                Chưa có lịch sử đổi quà
              </p>
              <p className="text-white/80">Hãy bắt đầu đổi quà ngay!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {redeemHistory.map((redeem: RedeemItem) => (
                <div
                  key={redeem.id}
                  className="flex items-center justify-between p-4 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center">
                      <Gift className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">
                        {redeem.reward?.name || 'Unknown Reward'}
                      </p>
                      <p className="text-sm text-white/80">
                        SĐT: {redeem.receiverPhone}
                      </p>
                      <p className="text-sm text-white/80">
                        Email: {redeem.receiverEmail}
                      </p>
                      <p className="text-sm text-white/80">
                        <Calendar className="w-4 h-4 inline mr-1" />
                        {new Date(redeem.createdAt).toLocaleDateString(
                          'vi-VN'
                        )}{' '}
                        -{' '}
                        {new Date(redeem.createdAt).toLocaleTimeString('vi-VN')}
                      </p>
                      {redeem.updatedAt !== redeem.createdAt && (
                        <p className="text-xs text-white/60">
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

                  <div className="text-right flex flex-col items-end">
                    <div
                      className={`px-3 py-1 rounded-full text-sm font-medium mb-2 w-fit ${
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
                    {redeem.status === 'REJECTED' && redeem.rejectionReason && (
                      <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded-md w-fit max-w-xs">
                        <p className="text-xs text-red-600 font-medium mb-1">
                          Lý do từ chối:
                        </p>
                        <p className="text-xs text-red-700">
                          {redeem.rejectionReason}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center space-x-1 text-sm text-white/80">
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
        <div className="rounded-2xl shadow-lg p-8 mt-6" style={{ backgroundColor: 'rgb(0, 87, 159)' }}>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <button
              onClick={() => navigateWithLoading('/nhip-song', 'Đang chuyển về trang nhịp sống...')}
              className="group h-full text-left"
            >
              <div className="bg-white/10 rounded-lg p-6 hover:bg-white/20 transition-colors h-full flex flex-col">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xl">😊</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white group-hover:text-white">
                      Tạo emoji card
                    </h3>
                    <p className="text-sm text-white/80">
                      Chia sẻ cảm xúc của bạn
                    </p>
                  </div>
                </div>
              </div>
            </button>

            <button
              onClick={() => navigateWithLoading('/thu-thach-giu-nhip', 'Đang chuyển về trang thử thách giữ nhịp...')}
              className="group h-full text-left"
            >
              <div className="bg-white/10 rounded-lg p-6 hover:bg-white/20 transition-colors h-full flex flex-col">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xl">📸</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white group-hover:text-white">
                      Chia sẻ ảnh
                    </h3>
                    <p className="text-sm text-white/80">Tham gia Thử thách giữ nhịp</p>
                  </div>
                </div>
              </div>
            </button>

            <Link href="/nhip-bep" className="group h-full">
              <div className="bg-white/10 rounded-lg p-6 hover:bg-white/20 transition-colors h-full flex flex-col">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ChefHat className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white group-hover:text-white">
                      Tips cho căn bếp
                    </h3>
                    <p className="text-sm text-white/80">
                      Khám phá sản phẩm của TIGER
                    </p>
                  </div>
                </div>
              </div>
            </Link>

            <button
              onClick={() => navigateWithLoading('/doi-qua', 'Đang chuyển về trang đổi quà...')}
              className="group h-full text-left"
            >
              <div className="bg-white/10 rounded-lg p-6 hover:bg-white/20 transition-colors h-full flex flex-col">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Gift className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white group-hover:text-white">
                      Đổi quà
                    </h3>
                    <p className="text-sm text-white/80">Sử dụng điểm năng lượng của bạn</p>
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Referral Section */}
        {/* <div className="mb-8">
          <ReferralSection />
        </div> */}
      </div>
    </div>
  );
}
