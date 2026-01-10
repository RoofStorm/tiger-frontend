'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Gift } from 'lucide-react';
import Image from 'next/image';
import { Reward, CreateRedeemData } from '@/types';
import apiClient from '@/lib/api';
import { useNextAuth } from '@/hooks/useNextAuth';
import { useToast } from '@/hooks/use-toast';
import { useGlobalNavigationLoading } from '@/hooks/useGlobalNavigationLoading';
import { RedeemModal } from '@/components/RedeemModal';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useZoneView } from '@/hooks/useZoneView';
import { ShareRegistrationModal } from '@/app/nhip-song/components/ShareRegistrationModal';
import { TabNavigation } from '@/components/doi-qua/TabNavigation';
import { DoiQuaTab } from '@/components/doi-qua/DoiQuaTab';
import { TheLeTab } from '@/components/doi-qua/TheLeTab';
import { TermsAndConditionsTab } from '@/components/doi-qua/TermsAndConditionsTab';

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
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  // Track time on Đổi Quà page (Overview)
  useZoneView(pageRef, {
    page: 'doi-qua',
    zone: 'overview',
  });

  // Show registration modal when user is not authenticated (only once per session)
  useEffect(() => {
    // Only check on client side
    if (typeof window === 'undefined') return;

    // Check if user is not authenticated
    if (!isAuthenticated) {
      // Check if modal has already been shown in this session
      const modalShown = sessionStorage.getItem('doiQuaRegistrationModalShown');
      
      if (!modalShown) {
        // Show modal and mark as shown in sessionStorage
        setShowRegistrationModal(true);
        sessionStorage.setItem('doiQuaRegistrationModalShown', 'true');
      }
    } else {
      // If user is authenticated, close modal if it's open
      setShowRegistrationModal(false);
    }
  }, [isAuthenticated]);

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

  // Redeem mutation
  const redeemMutation = useMutation({
    mutationFn: (data: CreateRedeemData) => apiClient.createRedeemRequest(data),
    onSuccess: (_, variables) => {
      const reward = rewards.find((r: Reward) => r.id === variables.rewardId);
      const isMonthlyRank = reward?.rewardCategory === 'MONTHLY_RANK';

      queryClient.invalidateQueries({ queryKey: ['auth'] });
      queryClient.invalidateQueries({ queryKey: ['userDetails', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['redeemHistory'] });
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      
      setShowRedeemModal(false);
      setSelectedReward(null);
      
      toast({
        title: isMonthlyRank
          ? 'Bạn đã nhận giải thành công 🎉'
          : 'Đã gửi yêu cầu đổi quà!',
        description: isMonthlyRank
          ? 'Phần thưởng sẽ được gửi sau khi chúng tôi xác nhận thông tin.'
          : 'Yêu cầu của bạn đang được xử lý.',
        duration: 3000,
      });
    },
    onError: (error: unknown) => {
      const errorMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Không thể gửi yêu cầu. Vui lòng thử lại.';
      
      toast({
        title: 'Lỗi',
        description: errorMessage,
        variant: 'destructive',
        duration: 4000,
      });
    },
  });

  const handleRedeem = (reward: Reward) => {
    if (!isAuthenticated) {
      toast({
        title: 'Cần đăng nhập',
        description: 'Vui lòng đăng nhập để thực hiện.',
        variant: 'destructive',
        duration: 4000,
      });
      return;
    }

    if (!reward.canRedeem) {
      toast({
        title: 'Không khả dụng',
        description: 'Bạn không đủ điều kiện để nhận phần quà này.',
        variant: 'destructive',
        duration: 4000,
      });
      return;
    }

    setSelectedReward(reward);
    setShowRedeemModal(true);
  };

  const handleRedeemSubmit = (formData: { receiverPhone: string; receiverEmail: string }) => {
    if (!selectedReward) return;

    // API accepts CreateRedeemData with additional receiverEmail field
    const data = {
      rewardId: selectedReward.id,
      // receiverName: '', // Not used in current form but required by API
      receiverPhone: formData.receiverPhone,
      // receiverAddress: '', // Not used in current form but required by API
      receiverEmail: formData.receiverEmail,
    };

    redeemMutation.mutate(data as CreateRedeemData & { receiverEmail: string });
  };

  const handleRegistrationModalClose = () => {
    setShowRegistrationModal(false);
  };

  const handleRegistrationModalRegister = () => {
    setShowRegistrationModal(false);
    // Modal will handle the registration flow
  };

  const handleRegistrationModalLogin = () => {
    setShowRegistrationModal(false);
    // Modal will handle the login flow
  };

  const canRedeem = (reward: Reward) => {
    if (!isAuthenticated) return false;
    return reward.isActive && reward.canRedeem;
  };

  return (
    <div ref={pageRef} className="min-h-screen">
      <main 
        className="mt-[64px] xl:mt-[80px]"
        style={{ 
          backgroundImage: 'url(/uudai/traodoinhipsong_background.png)',
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
          className="min-h-screen pt-8 lg:py-5"
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
                  Trao đổi điểm năng lượng
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
                    className="flex items-center justify-center"
                  >
                    <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-yellow-100 to-amber-100 px-8 py-4 rounded-full shadow-lg">
                      <Gift className="w-8 h-8 text-yellow-600" />
                      <span className="text-2xl font-bold text-yellow-800">
                        {userDetails?.points || 0} điểm năng lượng
                      </span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </div>

            {/* Tab Navigation */}
            <TabNavigation
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onNavigate={navigateWithLoading}
              onTrackClick={trackClick}
            />

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
              <DoiQuaTab
                rewards={rewards}
                isLoadingRewards={isLoadingRewards}
                canRedeem={canRedeem}
                onRedeem={handleRedeem}
              />
            )}

            {activeTab === 'the-le' && (
              <TheLeTab
                onNavigateToDoiQua={() => setActiveTab('doi-qua')}
                onNavigateToChallenge={() => navigateWithLoading('/thu-thach-giu-nhip', 'Đang chuyển đến Thử thách giữ nhịp...')}
              />
            )}

            {activeTab === 'tc' && (
              <TermsAndConditionsTab />
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

      {/* Share Registration Modal */}
      <ShareRegistrationModal
        isOpen={showRegistrationModal}
        onClose={handleRegistrationModalClose}
        onRegister={handleRegistrationModalRegister}
        onLogin={handleRegistrationModalLogin}
        initialMode="register"
      />
    </div>
  );
}
