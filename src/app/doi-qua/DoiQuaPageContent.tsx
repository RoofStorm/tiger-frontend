'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Gift, Star, Leaf } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Reward, CreateRedeemData } from '@/types';
import apiClient from '@/lib/api';
import { useNextAuth } from '@/hooks/useNextAuth';
import { useToast } from '@/hooks/use-toast';
import { useInputFix } from '@/hooks/useInputFix';
import { PhoneInput } from '@/components/ui/phone-input';
import { useGlobalNavigationLoading } from '@/hooks/useGlobalNavigationLoading';

interface UserRedeem {
  id: string;
  rewardId: string;
  status: string;
}

type TabType = 'doi-qua' | 'the-le' | 'nhip-song' | 'thu-thach' | 'nhip-bep';

export function DoiQuaPageContent() {
  const { user, isAuthenticated } = useNextAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { onKeyDown: handleInputKeyDown } = useInputFix();
  const { navigateWithLoading } = useGlobalNavigationLoading();
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

  // Fixed reward cards data (no longer fetch from API)
  const rewards: Reward[] = [
    {
      id: 'voucher-50k',
      name: 'Voucher 50K',
      description: 'Cho sản phẩm TIGER (giới hạn 3 lần/user)',
      pointsRequired: 200,
      imageUrl: '/uudai/card_voucher_background.svg',
      isActive: true,
      maxPerUser: 3,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'voucher-100k',
      name: 'Voucher 100K',
      description: 'Cho sản phẩm TIGER (giới hạn 3 lần/user)',
      pointsRequired: 200,
      imageUrl: '/uudai/card_voucher_background.svg',
      isActive: true,
      maxPerUser: 3,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'voucher-500k',
      name: 'Voucher 500K',
      description: 'Cho sản phẩm TIGER (giới hạn 3 lần/user)',
      pointsRequired: 200,
      imageUrl: '/uudai/card_voucher_background.svg',
      isActive: true,
      maxPerUser: 3,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'voucher-700k',
      name: 'Voucher 700K',
      description: 'Cho sản phẩm TIGER (giới hạn 3 lần/user)',
      pointsRequired: 200,
      imageUrl: '/uudai/card_voucher_background.svg',
      isActive: true,
      maxPerUser: 3,
      createdAt: new Date().toISOString(),
    },
  ];

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
    <div className="min-h-screen">
      <main 
        className="mt-[64px] md:mt-[80px]"
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
                  ].map((tab, index, array) => (
                    <div key={tab.id} className="flex items-center flex-shrink-0">
                      <button
                        onClick={() => {
                          if (tab.href) {
                            navigateWithLoading(tab.href, `Đang chuyển đến ${tab.label}...`);
                          } else {
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
      </main>
    </div>
  );
}
