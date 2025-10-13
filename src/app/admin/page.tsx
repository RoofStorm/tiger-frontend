'use client';

import { useNextAuth } from '@/hooks/useNextAuth';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Users,
  Gift,
  BarChart3,
  Settings,
  Home,
  MessageSquare,
  CreditCard,
} from 'lucide-react';
import apiClient from '@/lib/api';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { useConfirm } from '@/hooks/useConfirm';

// Import refactored components
import { AdminLayout } from '@/components/admin/AdminLayout';
import { OverviewTab } from '@/components/admin/tabs/OverviewTab';
import { UsersTab } from '@/components/admin/tabs/UsersTab';
import { PostsTab } from '@/components/admin/tabs/PostsTab';
import { RewardsTab } from '@/components/admin/tabs/RewardsTab';
import { RedeemsTab } from '@/components/admin/tabs/RedeemsTab';
import { AnalyticsTab } from '@/components/admin/tabs/AnalyticsTab';
import { WishesTab } from '@/components/admin/tabs/WishesTab';

type TabType =
  | 'overview'
  | 'users'
  | 'rewards'
  | 'posts'
  | 'redeems'
  | 'wishes'
  | 'analytics'
  | 'settings';

export default function AdminPage() {
  const { isAuthenticated, isAdmin } = useNextAuth();
  const router = useRouter();
  const { closeConfirm, confirmState } = useConfirm();
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Redirect if not admin
  useEffect(() => {
    if (isAuthenticated && !isAdmin) {
      router.push('/');
    }
  }, [isAuthenticated, isAdmin, router]);

  // Fetch admin data
  const { data: usersData } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => apiClient.getUsers(),
    enabled: isAdmin,
  });

  const { data: rewardsData } = useQuery({
    queryKey: ['admin-rewards'],
    queryFn: () => apiClient.getRewards(1, 10),
    enabled: isAdmin,
  });

  const { data: postsData } = useQuery({
    queryKey: ['admin-posts'],
    queryFn: () => apiClient.getPosts(),
    enabled: isAdmin,
  });

  const allUsers = usersData?.data?.data || [];
  const allRewards = rewardsData?.data?.data || [];
  const allPosts = postsData?.data?.posts || [];

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: Home },
    { id: 'users', label: 'Người dùng', icon: Users },
    { id: 'rewards', label: 'Phần thưởng', icon: Gift },
    { id: 'posts', label: 'Bài viết', icon: MessageSquare },
    { id: 'redeems', label: 'Đổi thưởng', icon: CreditCard },
    { id: 'wishes', label: 'Lời chúc', icon: MessageSquare },
    { id: 'analytics', label: 'Corner Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab users={allUsers} posts={allPosts} rewards={allRewards} />
        );
      case 'users':
        return <UsersTab isAdmin={isAdmin} />;
      case 'rewards':
        return <RewardsTab isAdmin={isAdmin} />;
      case 'posts':
        return <PostsTab isAdmin={isAdmin} />;
      case 'redeems':
        return <RedeemsTab isAdmin={isAdmin} />;
      case 'wishes':
        return <WishesTab isAdmin={isAdmin} />;
      case 'analytics':
        return <AnalyticsTab isAdmin={isAdmin} />;
      case 'settings':
        return (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Cài đặt hệ thống
            </h2>
            <div className="text-center py-8 text-gray-500">
              Tính năng đang được phát triển...
            </div>
          </div>
        );
      default:
        return (
          <OverviewTab users={allUsers} posts={allPosts} rewards={allRewards} />
        );
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-700 mb-4">
            Vui lòng đăng nhập
          </h1>
          <button
            onClick={() => router.push('/auth/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-700 mb-4">
            Không có quyền truy cập
          </h1>
          <p className="text-gray-600 mb-4">
            Bạn cần quyền admin để truy cập trang này
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <AdminLayout
        activeTab={activeTab}
        onTabChange={(tab: string) => setActiveTab(tab as TabType)}
        tabs={tabs}
      >
        {renderContent()}
      </AdminLayout>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmState.onConfirm || (() => {})}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={confirmState.confirmText}
        cancelText={confirmState.cancelText}
        type={confirmState.type}
        isLoading={confirmState.isLoading}
      />
    </>
  );
}
