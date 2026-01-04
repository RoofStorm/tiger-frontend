'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Gift, Star, Leaf } from 'lucide-react';
import Image from 'next/image';
import { Reward, CreateRedeemData } from '@/types';
import apiClient from '@/lib/api';
import { useNextAuth } from '@/hooks/useNextAuth';
import { useToast } from '@/hooks/use-toast';
import { useGlobalNavigationLoading } from '@/hooks/useGlobalNavigationLoading';
import { RedeemModal } from '@/components/RedeemModal';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useZoneView } from '@/hooks/useZoneView';

interface UserRedeem {
  id: string;
  rewardId: string;
  status: string;
}

type TabType = 'doi-qua' | 'the-le' | 'nhip-song' | 'thu-thach' | 'nhip-bep' | 'tc';

export function DoiQuaPageContent() {
  const { user, isAuthenticated } = useNextAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { navigateWithLoading } = useGlobalNavigationLoading();
  const { trackClick } = useAnalytics();
  const pageRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<TabType>('doi-qua');
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showRedeemModal, setShowRedeemModal] = useState(false);

  // Track time on Đổi Quà page (Overview)
  useZoneView(pageRef, {
    page: 'doi-qua',
    zone: 'overview',
  });

  // Fetch user details including points
  const { data: userDetails } = useQuery({
    queryKey: ['userDetails', user?.id],
    queryFn: () => apiClient.getCurrentUser(),
    enabled: isAuthenticated,
  });

  // Fetch rewards from API
  const { data: rewardsData, isLoading: isLoadingRewards } = useQuery({
    queryKey: ['rewards'],
    queryFn: () => apiClient.getRewards(1, 100), // Get first 100 rewards
  });

  // Filter active rewards and sort by pointsRequired (ascending)
  const rewards: Reward[] = (rewardsData?.data?.data?.filter((reward: Reward) => reward.isActive) || [])
    .sort((a: Reward, b: Reward) => (a.pointsRequired || 0) - (b.pointsRequired || 0));

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

  const handleRedeemSubmit = (formData: { receiverPhone: string; receiverEmail: string }) => {
    if (!selectedReward) return;

    // API accepts CreateRedeemData with additional receiverEmail field
    const data = {
      rewardId: selectedReward.id,
      receiverName: '', // Not used in current form but required by API
      receiverPhone: formData.receiverPhone,
      receiverAddress: '', // Not used in current form but required by API
      receiverEmail: formData.receiverEmail,
    };

    redeemMutation.mutate(data as CreateRedeemData & { receiverEmail: string });
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
    <div ref={pageRef} className="min-h-screen">
      <main 
        className="mt-[64px] xl:mt-[80px]"
        style={{ 
          backgroundImage: 'url(/uudai/traodoinhipsong_background.svg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 0px',
          backgroundRepeat: 'no-repeat',
          minHeight: 'calc(100vh - 80px)',
          width: '100%'
        }}
      >
        <div
          data-corner="4"
          id="corner-4"
          className="min-h-screen py-12 lg:py-5"
        >
          <div className="max-w-[90%] mx-auto px-0.5 sm:px-1 lg:px-2">
            {/* Header Section */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <h2 
                  className="mb-6" 
                  style={{ 
                    fontFamily: 'Prata',
                    fontWeight: 400,
                    fontStyle: 'normal',
                    fontSize: '54px',
                    lineHeight: '64px',
                    letterSpacing: '0.03em',
                    textAlign: 'center',
                    verticalAlign: 'middle',
                    color: '#004F93'
                  }}
                >
                  Trao đổi nhịp sống
                </h2>
                <p 
                  className="max-w-3xl mx-auto" 
                  style={{ 
                    fontFamily: 'Nunito',
                    fontWeight: 400,
                    fontStyle: 'normal',
                    fontSize: '16px',
                    lineHeight: '24px',
                    letterSpacing: '0',
                    textAlign: 'center',
                    color: '#374151'
                  }}
                >
                  Điểm &quot;năng lượng&quot; bạn tích lũy chính là những dấu mốc nhỏ trong hành trình giữ nhịp sống. <br/>Đổi điểm để nhận về những món quà từ TIGER – như một lời nhắc: bạn xứng đáng được chăm sóc mỗi ngày.
                </p>

                {/* Tips Image */}
                <div className="flex justify-center"
                // style={{ marginTop: '100px', marginBottom: '100px' }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <Image
                      src="/uudai/traodoinhipsong_tips.webp"
                      alt="Trao đổi nhịp sống tips"
                      width={1200}
                      height={600}
                      className="w-full h-auto object-contain max-w-[90vw]"
                      quality={100}
                      sizes="(max-width: 768px) 90vw, 1200px"
                      priority
                      // style={{ transform: 'scale(1)' }}
                    />
                  </motion.div>
                </div>

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
            <div className="flex justify-center mb-2 px-4 py-2">
              <div 
                className="flex items-center justify-center overflow-x-auto overflow-y-visible w-full max-w-full [&::-webkit-scrollbar]:hidden pb-1"
                style={{
                  scrollbarWidth: 'none', /* Firefox */
                  msOverflowStyle: 'none', /* IE and Edge */
                  WebkitOverflowScrolling: 'touch', /* iOS smooth scrolling */
                }}
              >
                <div className="flex items-center justify-center gap-1 md:gap-0 pb-0.5">
                  {[
                    { id: 'doi-qua' as TabType, label: 'Đổi quà', href: null },
                    { id: 'the-le' as TabType, label: 'Thể lệ', href: null },
                    { id: 'nhip-song' as TabType, label: 'Nhịp sống', href: '/nhip-song' },
                    { id: 'thu-thach' as TabType, label: 'Thử thách giữ nhịp', href: '/thu-thach-giu-nhip' },
                    { id: 'nhip-bep' as TabType, label: 'Nhịp bếp', href: '/nhip-bep' },
                    { id: 'tc' as TabType, label: 'T&C', href: null },
                  ].map((tab, index, array) => (
                    <div key={tab.id} className="flex items-center flex-shrink-0">
                      <button
                        onClick={() => {
                          if (tab.href) {
                            // Navigate to other page - don't track as tab click
                            navigateWithLoading(tab.href, `Đang chuyển đến ${tab.label}...`);
                          } else {
                            // Track tab click (only for tabs that change content on same page)
                            trackClick('doi-qua', {
                              zone: 'overview',
                              component: 'tab',
                              metadata: { 
                                tabId: tab.id,
                                tabLabel: tab.label,
                              },
                            });
                            setActiveTab(tab.id);
                          }
                        }}
                        className={`px-3 py-2 md:px-6 md:py-3 font-medium transition-all duration-300 rounded-full whitespace-nowrap ${
                          activeTab === tab.id
                            ? 'bg-[#284A8F] text-white'
                            : 'bg-white text-gray-800 border border-gray-800'
                        }`}
                        style={{
                          fontFamily: 'var(--font-nunito)',
                          fontSize: 'clamp(12px, 3vw, 16px)',
                          fontWeight: activeTab === tab.id ? 600 : 500,
                        }}
                      >
                        {tab.label}
                      </button>
                      {index < array.length - 1 && (
                        <div 
                          className="h-[1px] w-4 md:w-8 mx-0.5 md:mx-1 flex-shrink-0 hidden sm:block"
                          style={{ backgroundColor: '#333435' }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Centered Title */}
            {activeTab === 'doi-qua' && (
              <div className="text-center mb-4">
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
            )}

            {/* Tab Content */}
            {activeTab === 'doi-qua' && (
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-3 justify-items-center max-w-6xl mx-auto">
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
                        style={{ 
                          backgroundImage: 'url(/uudai/card_voucher_background.svg)',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          backgroundRepeat: 'no-repeat',
                          aspectRatio: '3/4',
                          minHeight: '360px',
                          maxHeight: '400px'
                        }}
                      >
                        {/* Voucher Card Content */}
                        <div className="px-4 py-6 flex flex-col h-full">
                          {/* Dashed Border Section */}
                          <div className="mt-auto mb-4">
                            {/* Points Requirement */}
                            <div className="text-center mb-2">
                              <p className="text-white font-nunito font-medium" style={{ fontSize: '18px' }}>
                                {pointsRequired} Điểm năng lượng
                              </p>
                            </div>

                            <div 
                              className="border-[2px] border-dashed rounded-lg px-2 py-2 mb-3 flex flex-col justify-center"
                              style={{ borderColor: '#FFFFFF' }}
                            >
                            <div className="text-center">
                              {/* VOUCHER Label */}
                              <p 
                                className="font-prata text-white mb-1"
                                style={{
                                  fontFamily: 'Prata',
                                  fontWeight: 400,
                                  fontSize: '22px',
                                  letterSpacing: '0.03em',
                                  color: '#FFFFFF',
                                }}
                              >
                                VOUCHER
                              </p>

                              {/* Voucher Value */}
                              <p 
                                className="font-nunito font-bold mb-1"
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
                                  fontSize: '11px',
                                  lineHeight: '16px',
                                  color: '#FFFFFF',
                                }}
                              >
                                Cho sản phẩm TIGER (giới hạn 3 lần/user)
                              </p>
                            </div>
                          </div>
                          </div>

                          {/* Button */}
                          <button
                            onClick={() => handleRedeem(reward)}
                            disabled={!canRedeem(reward)}
                            className={`w-full py-2 rounded-lg font-nunito font-semibold transition-all duration-300 ${
                              canRedeem(reward)
                                ? 'bg-white hover:bg-gray-100'
                                : 'bg-gray-300 cursor-not-allowed'
                            }`}
                            style={{ 
                              color: canRedeem(reward) ? '#284A8F' : '#666666',
                              fontSize: '14px'
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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-16 max-w-4xl mx-auto"
              >
                {/* Title */}
                <div className="text-center mb-8">
                  <h2 
                    className="font-prata mb-4"
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
                    Thể lệ
                  </h2>
                  
                  {/* Subtitle with leaf icon */}
                  <div className="flex items-center justify-center gap-2 mb-8">
                    <Leaf className="w-5 h-5" style={{ color: '#22c55e' }} />
                    <p 
                      className="font-noto-sans"
                      style={{
                        fontFamily: 'var(--font-noto-sans)',
                        fontSize: '18px',
                        fontWeight: 400,
                        color: '#333',
                        textAlign: 'center',
                      }}
                    >
                      Cơ chế &quot;Điểm năng lượng&quot;
                    </p>
                  </div>
                </div>

                {/* Content Sections */}
                <div className="space-y-8 text-left">
                  {/* Section 1: Tích Điểm Năng Lượng */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="bg-transparent"
                  >
                    <h3 
                      className="font-prata mb-4"
                      style={{
                        fontFamily: 'Prata',
                        fontWeight: 400,
                        fontSize: '24px',
                        color: '#00579F',
                        marginBottom: '16px',
                      }}
                    >
                      1. Tích Điểm Năng Lượng
                    </h3>
                    <p 
                      className="font-noto-sans mb-4"
                      style={{
                        fontFamily: 'var(--font-noto-sans)',
                        fontSize: '16px',
                        color: '#333',
                        marginBottom: '16px',
                      }}
                    >
                      Mỗi hoạt động nhỏ giúp bạn nạp thêm năng lượng:
                    </p>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="text-[#00579F] font-bold mt-1">•</span>
                        <span className="font-noto-sans" style={{ fontFamily: 'var(--font-noto-sans)', fontSize: '16px', color: '#333' }}>
                          Đăng nhập mỗi ngày: <strong>+10 điểm</strong>
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-[#00579F] font-bold mt-1">•</span>
                        <span className="font-noto-sans" style={{ fontFamily: 'var(--font-noto-sans)', fontSize: '16px', color: '#333' }}>
                          Tham gia My lunchbox challenge: <strong>+100 điểm</strong> (Tối đa 1 lần/user/tuần)
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-[#00579F] font-bold mt-1">•</span>
                        <span className="font-noto-sans" style={{ fontFamily: 'var(--font-noto-sans)', fontSize: '16px', color: '#333' }}>
                          Tham gia viết Note giữ nhịp: <strong>+100 điểm</strong> (Tối đa 1 lần/user/tuần)
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-[#00579F] font-bold mt-1">•</span>
                        <span className="font-noto-sans" style={{ fontFamily: 'var(--font-noto-sans)', fontSize: '16px', color: '#333' }}>
                          Chia sẻ quote/lunchbox challenge/note giữ nhịp: <strong>+50 điểm</strong> (Tối đa 1 lần/user/tuần)
                        </span>
                      </li>
                    </ul>
                  </motion.div>

                  {/* Section 2: Đổi Nhịp sống -> Quà tặng đến từ TIGER */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="bg-transparent"
                  >
                    <h3 
                      className="font-prata mb-4"
                      style={{
                        fontFamily: 'Prata',
                        fontWeight: 400,
                        fontSize: '24px',
                        color: '#00579F',
                        marginBottom: '16px',
                      }}
                    >
                      2. Đổi Nhịp sống → Quà tặng đến từ TIGER
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="text-[#00579F] font-bold mt-1">•</span>
                        <span className="font-noto-sans" style={{ fontFamily: 'var(--font-noto-sans)', fontSize: '16px', color: '#333' }}>
                          <strong>300 điểm năng lượng</strong> → Voucher 50k Got It
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-[#00579F] font-bold mt-1">•</span>
                        <span className="font-noto-sans" style={{ fontFamily: 'var(--font-noto-sans)', fontSize: '16px', color: '#333' }}>
                          <strong>500 điểm năng lượng</strong> → Voucher 100k Got It
                        </span>
                      </li>
                    </ul>
                  </motion.div>

                  {/* Section 3: Phần thưởng cho nhịp sống được lan toả nhất tại Lunchbox Challenge */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="bg-transparent"
                  >
                    <h3 
                      className="font-prata mb-4"
                      style={{
                        fontFamily: 'Prata',
                        fontWeight: 400,
                        fontSize: '24px',
                        color: '#00579F',
                        marginBottom: '16px',
                      }}
                    >
                      3. Phần thưởng cho nhịp sống được lan toả nhất tại Lunchbox Challenge
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <span className="text-[#00579F] font-bold mt-1">•</span>
                        <span className="font-noto-sans" style={{ fontFamily: 'var(--font-noto-sans)', fontSize: '16px', color: '#333' }}>
                          Số lượt tym cao nhất mỗi tháng sẽ nhận được voucher Got It trị giá <strong>1,000,000 VND</strong>
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-[#00579F] font-bold mt-1">•</span>
                        <span className="font-noto-sans" style={{ fontFamily: 'var(--font-noto-sans)', fontSize: '16px', color: '#333' }}>
                          Số lượt tym cao thứ hai mỗi tháng sẽ nhận được voucher Got It trị giá <strong>500,000 VND</strong>
                        </span>
                      </li>
                    </ul>
                  </motion.div>
                </div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center mt-12"
                >
                  <button
                    onClick={() => setActiveTab('doi-qua')}
                    className="px-8 py-3 rounded-lg font-nunito font-semibold transition-all duration-300 bg-transparent border-2 border-[#00579F] text-[#00579F] hover:bg-[#00579F] hover:text-white"
                    style={{
                      fontFamily: 'var(--font-nunito)',
                      fontSize: '16px',
                    }}
                  >
                    Đổi quà ngay
                  </button>
                  <button
                    onClick={() => navigateWithLoading('/thu-thach-giu-nhip', 'Đang chuyển đến Thử thách giữ nhịp...')}
                    className="px-8 py-3 rounded-lg font-nunito font-semibold transition-all duration-300 bg-[#00579F] text-white hover:bg-[#284A8F]"
                    style={{
                      fontFamily: 'var(--font-nunito)',
                      fontSize: '16px',
                    }}
                  >
                    Thử thách ngay để nhận quà
                  </button>
                </motion.div>

                {/* Disclaimer */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="mt-8 text-center"
                >
                  <p 
                    className="font-noto-sans"
                    style={{
                      fontFamily: 'var(--font-noto-sans)',
                      fontSize: '14px',
                      color: '#60A5FA',
                      fontStyle: 'italic',
                    }}
                  >
                    *Mỗi user có thể nhận được tối đa một giải thưởng trên mỗi hạng mục giải thưởng xuyên suốt thời gian diễn ra chương trình
                  </p>
                </motion.div>
              </motion.div>
            )}

            {activeTab === 'tc' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-16 max-w-4xl mx-auto"
              >
                {/* Title */}
                <div className="text-center mb-8">
                  <h2 
                    className="font-prata mb-8"
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
                    Điều khoản sử dụng
                  </h2>
                </div>

                <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-10 rounded-r-lg text-left">
                  <p className="text-gray-800 leading-relaxed font-medium font-noto-sans" style={{ fontFamily: 'var(--font-noto-sans)', fontSize: '16px' }}>
                    Chào mừng bạn đến với trang web của TIGER Việt Nam (&quot;trang web&quot;)! Chúng tôi hy vọng bạn sẽ thích thú với trải nghiệm trực tuyến của bạn.
                  </p>
                  <p className="text-gray-700 leading-relaxed mt-4 font-noto-sans" style={{ fontFamily: 'var(--font-noto-sans)', fontSize: '16px' }}>
                    Công ty trách nhiệm hữu hạn (TNHH) TIGER Marketing Việt Nam (&quot;TIGER Việt Nam&quot;) cam kết duy trì niềm tin với người sử dụng về trang web của mình. Các quy định dưới đây chi phối việc sử dụng trang web này của bạn.
                  </p>
                </div>

                {/* Content Sections */}
                <div className="space-y-10 text-left">
                  <section>
                    <h3 
                      className="font-prata mb-4"
                      style={{
                        fontFamily: 'Prata',
                        fontWeight: 400,
                        fontSize: '24px',
                        color: '#00579F',
                        marginBottom: '16px',
                      }}
                    >
                      1. Những hình thức sử dụng có thể được chấp nhận
                    </h3>
                    <div className="pl-6 space-y-4">
                      <p className="font-noto-sans" style={{ fontFamily: 'var(--font-noto-sans)', fontSize: '16px', color: '#333' }}>
                        Hãy tự do khám phá trang web của chúng tôi và nếu có thể, hãy đóng góp tài liệu cho trang web, chẳng hạn như câu hỏi, thông báo và nội dung đa phương tiện (ví dụ như hình ảnh, video).
                      </p>
                      <p className="font-noto-sans" style={{ fontFamily: 'var(--font-noto-sans)', fontSize: '16px', color: '#333' }}>
                        Tuy nhiên, việc sử dụng trang web và các tài liệu được đưa lên không được bất hợp pháp hoặc phản cảm theo bất kỳ phương diện nào. Bạn cần lưu tâm để không:
                      </p>
                      <ul className="space-y-3">
                        <li className="flex items-start gap-3 font-noto-sans" style={{ fontFamily: 'var(--font-noto-sans)', fontSize: '16px', color: '#333' }}>
                          <span className="text-[#00579F] font-bold mt-1">(a)</span>
                          <span>xâm phạm quyền riêng tư của người khác;</span>
                        </li>
                        <li className="flex items-start gap-3 font-noto-sans" style={{ fontFamily: 'var(--font-noto-sans)', fontSize: '16px', color: '#333' }}>
                          <span className="text-[#00579F] font-bold mt-1">(b)</span>
                          <span>vi phạm các quyền sở hữu trí tuệ;</span>
                        </li>
                        <li className="flex items-start gap-3 font-noto-sans" style={{ fontFamily: 'var(--font-noto-sans)', fontSize: '16px', color: '#333' }}>
                          <span className="text-[#00579F] font-bold mt-1">(c)</span>
                          <span>đưa ra những tuyên bổ phỉ báng (kể cả đối với TIGER Việt Nam), liên quan đến nội dung khiêu dâm, có tính phân biệt chủng tộc hoặc bài ngoại, xúi bẩy căm ghét hoặc kích động bạo lực hoặc hỗn loạn;</span>
                        </li>
                        <li className="flex items-start gap-3 font-noto-sans" style={{ fontFamily: 'var(--font-noto-sans)', fontSize: '16px', color: '#333' }}>
                          <span className="text-[#00579F] font-bold mt-1">(d)</span>
                          <span>tải lên các tập tin chứa virus hoặc dẫn đến các vấn đề về an ninh; hoặc bằng cách nào đó gây nguy hiểm cho tính trọn vẹn của trang web.</span>
                        </li>
                      </ul>
                      <p className="italic text-gray-600 bg-gray-100/50 p-4 border-l-2 border-gray-300 font-noto-sans" style={{ fontFamily: 'var(--font-noto-sans)', fontSize: '15px' }}>
                        Hãy lưu ý rằng TIGER Việt Nam có quyền loại bỏ nội dung bất kỳ mà mình tin là bất hợp pháp hoặc phản cảm ra khỏi trang web.
                      </p>
                    </div>
                  </section>

                  <section>
                    <h3 
                      className="font-prata mb-4"
                      style={{
                        fontFamily: 'Prata',
                        fontWeight: 400,
                        fontSize: '24px',
                        color: '#00579F',
                        marginBottom: '16px',
                      }}
                    >
                      2. Bảo vệ dữ liệu
                    </h3>
                    <div className="pl-6">
                      <p className="font-noto-sans" style={{ fontFamily: 'var(--font-noto-sans)', fontSize: '16px', color: '#333' }}>
                        Thông báo về Quyền Riêng tư của chúng tôi áp dụng với dữ liệu hoặc tư liệu cá nhân bất kỳ được chia sẻ trên trang web này.
                      </p>
                    </div>
                  </section>

                  <section>
                    <h3 
                      className="font-prata mb-4"
                      style={{
                        fontFamily: 'Prata',
                        fontWeight: 400,
                        fontSize: '24px',
                        color: '#00579F',
                        marginBottom: '16px',
                      }}
                    >
                      3. Sở Hữu Trí Tuệ
                    </h3>
                    <div className="pl-6 space-y-8">
                      <div>
                        <h4 className="font-bold text-[#00579F] mb-3 font-noto-sans" style={{ fontSize: '18px' }}>3.1. Nội dung do TIGER Việt Nam cung cấp</h4>
                        <p className="font-noto-sans mb-4" style={{ fontFamily: 'var(--font-noto-sans)', fontSize: '16px', color: '#333' }}>
                          Mọi quyền sở hữu trí tuệ, bao gồm quyền tác giả và nhãn hiệu, trong các tài liệu được TIGER Việt Nam hoặc nhân danh TIGER Việt Nam công bố trên trang web (ví dụ như văn bản và hình ảnh) thuộc sở hữu của TIGER Việt Nam hoặc những đơn vị được TIGER Việt Nam cấp phép sử dụng.
                        </p>
                        <p className="font-noto-sans" style={{ fontFamily: 'var(--font-noto-sans)', fontSize: '16px', color: '#333' }}>
                          Bạn có quyền sao các trích đoạn của trang web để sử dụng riêng cho chính mình (ví dụ, sử dụng vì mục đích phi thương mại) với điều kiện là bạn giữ nguyên và tôn trọng mọi quyền sở hữu trí tuệ, bao gồm thông báo bản quyền bất kỳ xuất hiện trong nội dung đó (ví dụ © 2016 TIGER Việt Nam).
                        </p>
                      </div>

                      <div>
                        <h4 className="font-bold text-[#00579F] mb-3 font-noto-sans" style={{ fontSize: '18px' }}>3.2. Nội dung do Bạn cung cấp</h4>
                        <p className="font-noto-sans mb-4" style={{ fontFamily: 'var(--font-noto-sans)', fontSize: '16px', color: '#333' }}>
                          Bạn tuyên bố với TIGER Việt Nam rằng bạn là tác giả của nội dung mà bạn đóng góp cho trang web này, hoặc bạn có các quyền (ví dụ, được người có quyền cho phép) và có thể đóng góp nội dung đó (ví dụ, hình ảnh, video, nhạc) cho trang web.
                        </p>
                        <p className="font-noto-sans mb-4" style={{ fontFamily: 'var(--font-noto-sans)', fontSize: '16px', color: '#333' }}>
                          Bạn đồng ý rằng nội dung đó sẽ được xử lý như không phải thông tin mật và bạn cho TIGER Việt Nam quyền sử dụng miễn phí, vĩnh viễn trên toàn thế giới (bao gồm tiết lộ, sao chép, truyền đạt, công bố hoặc phổ biến) nội dung mà bạn cung cấp cho các mục đích liên quan đến việc kinh doanh của TIGER Việt Nam.
                        </p>
                        <p className="italic text-gray-600 font-noto-sans" style={{ fontFamily: 'var(--font-noto-sans)', fontSize: '15px' }}>
                          Hãy lưu ý rằng TIGER Việt Nam tự do quyết định có hay không sử dụng nội dung đó và TIGER Việt Nam có thể đã triển khai nội dung tương tự hoặc đã có nội dung đó từ các nguồn khác, khi đó mọi quyền sở hữu trí tuệ từ nội dung đó sẽ vẫn thuộc TIGER Việt Nam và những đơn vị được TIGER Việt Nam cấp phép sử dụng.
                        </p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 
                      className="font-prata mb-4"
                      style={{
                        fontFamily: 'Prata',
                        fontWeight: 400,
                        fontSize: '24px',
                        color: '#00579F',
                        marginBottom: '16px',
                      }}
                    >
                      4. Trách nhiệm pháp lý
                    </h3>
                    <div className="pl-6 space-y-4">
                      <p className="font-noto-sans" style={{ fontFamily: 'var(--font-noto-sans)', fontSize: '16px', color: '#333' }}>
                        Mặc dù TIGER Việt Nam vận dụng mọi nỗ lực để bảo đảm tính chính xác của tư liệu trên trang web của mình và tránh thiếu sót, chúng tôi không chịu trách nhiệm về thông tin không chính xác, những thiếu sót, gián đoạn hoặc sự kiện khác có thể gây tổn hại cho bạn, bất kể là trực tiếp (như hỏng máy tính) hay gián tiếp (như giảm lợi nhuận). Bạn phải chịu mọi rủi ro khi tin hay không vào các tư liệu trên trang web này.
                      </p>
                      <p className="font-noto-sans" style={{ fontFamily: 'var(--font-noto-sans)', fontSize: '16px', color: '#333' }}>
                        Trang web này có thể chứa các đường dẫn ra ngoài TIGER Việt Nam. TIGER Việt Nam không kiểm soát các trang web của bên thứ ba, không nhất thiết xác nhận chúng và cũng không nhận trách nhiệm bất kỳ về chúng, kể cả nội dung, tính chính xác hoặc chức năng của chúng. Do đó, chúng tôi đề nghị bạn xem xét kỹ các thông báo pháp lý về các trang web của bên thứ ba như vậy, kể cả việc khiến bạn được cập nhật về những thay đổi bất kỳ của chúng.
                      </p>
                      <p className="font-noto-sans" style={{ fontFamily: 'var(--font-noto-sans)', fontSize: '16px', color: '#333' }}>
                        Bạn có thể điều hành một trang web của bên thứ ba và muốn liên kết đến trang web này. Khi đó, TIGER Việt Nam không phản đối liên kết đó, với điều kiện là bản sử dụng url trang chủ chính xác của trang web này (ví dụ như không liên kết sâu) và không gợi ý theo cách bất kỳ rằng bạn là công ty con của TIGER Việt Nam hay được TIGER Việt Nam xác nhận. Bạn không được dùng “framing” hoặc kỹ thuật tương tự, và phải bảo đảm đường dẫn đến trang web mở trong cửa sổ mới.
                      </p>
                    </div>
                  </section>

                  <section>
                    <h3 
                      className="font-prata mb-4"
                      style={{
                        fontFamily: 'Prata',
                        fontWeight: 400,
                        fontSize: '24px',
                        color: '#00579F',
                        marginBottom: '16px',
                      }}
                    >
                      5. Liên hệ
                    </h3>
                    <div className="pl-6 space-y-6">
                      <p className="font-noto-sans" style={{ fontFamily: 'var(--font-noto-sans)', fontSize: '16px', color: '#333' }}>
                        Trang web này do Công ty TNHH TIGER Marketing Việt Nam vận hành. Nếu bạn có câu hỏi hoặc bình luận bất kỳ về trang web, xin đừng ngần ngại liên hệ với chúng tôi:
                      </p>
                      <ul className="space-y-3">
                        <li className="flex items-center gap-3 font-noto-sans" style={{ fontFamily: 'var(--font-noto-sans)', fontSize: '16px', color: '#333' }}>
                          <span className="font-bold text-[#00579F]">(i)</span>
                          <span>Gửi thư điện tử đến địa chỉ: <a href="mailto:hello@tigermarketing.vn" className="text-[#00579F] font-semibold hover:underline">hello@tigermarketing.vn</a></span>
                        </li>
                        <li className="flex items-center gap-3 font-noto-sans" style={{ fontFamily: 'var(--font-noto-sans)', fontSize: '16px', color: '#333' }}>
                          <span className="font-bold text-[#00579F]">(ii)</span>
                          <span>Gọi điện thoại số: <a href="tel:02836221281" className="text-[#00579F] font-semibold hover:underline">(028) 3622 1281</a></span>
                        </li>
                        <li className="flex items-start gap-3 font-noto-sans" style={{ fontFamily: 'var(--font-noto-sans)', fontSize: '16px', color: '#333' }}>
                          <span className="font-bold text-[#00579F]">(iii)</span>
                          <span>Gửi thư thường đến:</span>
                        </li>
                      </ul>

                      <div className="bg-white/50 p-6 rounded-xl border border-gray-200 ml-6">
                        <p className="font-bold text-gray-900 mb-1 font-noto-sans">Phòng Chăm Sóc Khách Hàng</p>
                        <p className="font-bold text-gray-900 mb-3 font-noto-sans">Công ty TNHH TIGER Marketing Việt Nam</p>
                        <p className="mb-2 font-noto-sans text-gray-700">Phòng 1006, Tầng 10, Tòa nhà Saigon Riverside Office Center, 2A-4A Tôn Đức Thắng, Phường Sài Gòn, TP. Hồ Chí Minh, Việt Nam</p>
                        <p className="font-noto-sans text-gray-700">Điện thoại: (028) 3622 1281</p>
                        <p className="font-noto-sans text-gray-700">Email: <a href="mailto:hello@tigermarketing.vn" className="text-[#00579F] font-semibold hover:underline">hello@tigermarketing.vn</a></p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 
                      className="font-prata mb-4"
                      style={{
                        fontFamily: 'Prata',
                        fontWeight: 400,
                        fontSize: '24px',
                        color: '#00579F',
                        marginBottom: '16px',
                      }}
                    >
                      6. Thay đổi
                    </h3>
                    <div className="pl-6">
                      <p className="font-noto-sans" style={{ fontFamily: 'var(--font-noto-sans)', fontSize: '16px', color: '#333' }}>
                        TIGER Việt Nam bảo lưu quyền thay đổi các điều khoản sử dụng này. Thỉnh thoảng hãy trở lại trang này để xem lại các điều khoản và thông tin mới bất kỳ.
                      </p>
                    </div>
                  </section>
                </div>
              </motion.div>
            )}


            {/* Redeem Modal */}
            <RedeemModal
              isOpen={showRedeemModal}
              onClose={() => {
                setShowRedeemModal(false);
                setSelectedReward(null);
              }}
              selectedReward={selectedReward}
              onSubmit={handleRedeemSubmit}
              isPending={redeemMutation.isPending}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
