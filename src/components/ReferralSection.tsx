'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Copy, Users, Gift, Share2 } from 'lucide-react';

// ReferralStats interface is defined inline in the component

export default function ReferralSection() {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Fetch referral data from API
  const {
    data: referralData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['referralStats'],
    queryFn: async () => {
      try {
        const response = await apiClient.getReferralStats();
        if (!response.success) {
          throw new Error(response.error || 'Failed to fetch referral stats');
        }
        return response.data;
      } catch (error) {
        console.error('Error fetching referral stats:', error);
        throw error;
      }
    },
    retry: 2,
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
  });

  const handleCopyLink = async () => {
    if (!referralData?.referralLink) return;

    try {
      await navigator.clipboard.writeText(referralData.referralLink);
      setCopied(true);
      toast({
        title: 'Đã sao chép!',
        description: 'Link mời bạn đã được sao chép vào clipboard.',
        duration: 3000,
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Lỗi',
        description: 'Không thể sao chép link. Vui lòng thử lại.',
        variant: 'destructive',
        duration: 3000,
      });
    }
  };

  const handleShare = async () => {
    if (!referralData?.referralLink) return;

    const shareData = {
      title: 'Tham gia Tiger Mood Corner!',
      text: 'Khám phá thế giới cảm xúc qua những emoji đặc biệt. Tạo mood card cá nhân và chia sẻ với cộng đồng.',
      url: referralData.referralLink,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to copy
        await handleCopyLink();
      }
    } catch {
      console.log('Share cancelled or failed');
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 text-center mt-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Đang tải thông tin mời bạn...</p>
      </div>
    );
  }

  if (error || !referralData) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 text-center mt-6">
        <p className="text-red-600 mb-4">Không thể tải thông tin mời bạn</p>
        <Button
          onClick={() => window.location.reload()}
          variant="outline"
          size="sm"
        >
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-6 mt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Mời bạn bè</h3>
          <p className="text-gray-600">
            Mời bạn bè tham gia và nhận 50 điểm cho mỗi người!
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-purple-600">
            {referralData.totalEarned}
          </div>
          <div className="text-sm text-gray-500">điểm đã kiếm</div>
        </div>
      </div>

      {/* Referral Code */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mã mời của bạn
        </label>
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-gray-100 rounded-lg px-4 py-3 font-mono text-lg">
            {referralData.referralCode}
          </div>
          <Button
            onClick={handleCopyLink}
            variant="outline"
            size="sm"
            className="px-4"
          >
            <Copy className="w-4 h-4 mr-2" />
            {copied ? 'Đã sao chép!' : 'Sao chép'}
          </Button>
        </div>
      </div>

      {/* Referral Link */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Link mời bạn
        </label>
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-gray-100 rounded-lg px-4 py-3 text-sm break-all">
            {referralData.referralLink}
          </div>
          <Button
            onClick={handleCopyLink}
            variant="outline"
            size="sm"
            className="px-4"
          >
            <Copy className="w-4 h-4 mr-2" />
            {copied ? 'Đã sao chép!' : 'Sao chép'}
          </Button>
          <Button
            onClick={handleShare}
            variant="outline"
            size="sm"
            className="px-4"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Chia sẻ
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-purple-50 rounded-lg p-4 text-center">
          <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-purple-600">
            {referralData.totalReferrals}
          </div>
          <div className="text-sm text-purple-500">Bạn đã mời</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4 text-center">
          <Gift className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-green-600">
            {referralData.totalEarned}
          </div>
          <div className="text-sm text-green-500">Điểm kiếm được</div>
        </div>
      </div>

      {/* Weekly Stats Info */}
      <div className="mb-6 space-y-4">
        {/* Total Referrals This Week */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-green-900 mb-1">
                Người đã mời tuần này
              </h4>
              <p className="text-sm text-green-700">
                Bạn có thể mời không giới hạn số người
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {referralData.weeklyStats.totalReferralsThisWeek}
              </div>
              <div className="text-sm text-green-500">người đã đăng ký</div>
            </div>
          </div>
        </div>

        {/* Points Limit This Week */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">
                Điểm thưởng tuần này
              </h4>
              <p className="text-sm text-blue-700">
                Chỉ cộng điểm cho 2 người đầu tiên mỗi tuần
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">
                {referralData.weeklyStats.pointsAwarded}/
                {referralData.weeklyStats.pointsLimit}
              </div>
              <div className="text-sm text-blue-500">
                {referralData.weeklyStats.canEarnMorePoints
                  ? 'Còn có thể cộng điểm'
                  : 'Đã đạt giới hạn điểm'}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  referralData.weeklyStats.canEarnMorePoints
                    ? 'bg-blue-500'
                    : 'bg-red-500'
                }`}
                style={{
                  width: `${(referralData.weeklyStats.pointsAwarded / referralData.weeklyStats.pointsLimit) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Referrals */}
      {referralData.referrals.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">
            Bạn bè đã tham gia
          </h4>
          <div className="space-y-2">
            {referralData.referrals
              .slice(0, 5)
              .map(
                (referral: {
                  id: string;
                  name: string;
                  email: string;
                  createdAt: string;
                }) => (
                  <div
                    key={referral.id}
                    className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {referral.name || 'Người dùng'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {referral.email}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(referral.createdAt).toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                )
              )}
            {referralData.referrals.length > 5 && (
              <div className="text-center text-sm text-gray-500">
                và {referralData.referrals.length - 5} người khác...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
