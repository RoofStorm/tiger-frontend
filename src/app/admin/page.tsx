'use client';

import { useNextAuth } from '@/hooks/useNextAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { useConfirm } from '@/hooks/useConfirm';
import {
  Users,
  Gift,
  BarChart3,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Home,
  MessageSquare,
  CreditCard,
  User,
  Filter,
  X,
  LogOut,
  ArrowLeft,
  Star,
  StarOff,
} from 'lucide-react';
import apiClient from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback, memo, useMemo } from 'react';

type TabType =
  | 'overview'
  | 'users'
  | 'rewards'
  | 'posts'
  | 'redeems'
  | 'analytics'
  | 'settings';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  points: number;
  loginMethod: string;
}

interface Post {
  id: string;
  caption: string;
  type: string;
  likeCount: number;
  shareCount: number;
  commentCount: number;
  isHighlighted: boolean;
  user?: {
    name: string;
  };
}

interface FilterState {
  role?: string;
  status?: string;
  type?: string;
}

interface AnalyticsItem {
  id: string;
  corner: number;
  duration: number;
  createdAt: string;
  userId?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

interface CornerStats {
  corner: number;
  totalVisits: number;
  totalDuration: number;
  avgDuration: number;
  cornerName: string;
}

interface UserDateStats {
  userId: string;
  userName: string;
  userEmail?: string;
  date: string;
  corners: Record<number, { visits: number; totalDuration: number }>;
  totalVisits: number;
  totalDuration: number;
}

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  imageUrl?: string;
  isActive: boolean;
}

interface AdminRedeemItem {
  id: string;
  status: string;
  pointsUsed: number;
  createdAt: string;
  updatedAt: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  reward?: {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
  };
}

// Component để hiển thị phương thức đăng nhập
const LoginMethodBadge = ({ method }: { method: string }) => {
  const getLoginMethodInfo = (loginMethod: string) => {
    switch (loginMethod) {
      case 'GOOGLE':
        return {
          label: 'Google',
          className: 'bg-red-100 text-red-800',
          emoji: '🔴',
        };
      case 'FACEBOOK':
        return {
          label: 'Facebook',
          className: 'bg-blue-100 text-blue-800',
          emoji: '🔵',
        };
      case 'LOCAL':
      default:
        return {
          label: 'Local',
          className: 'bg-gray-100 text-gray-800',
          emoji: '⚪',
        };
    }
  };

  const { label, className, emoji } = getLoginMethodInfo(method);

  return (
    <span
      className={`px-2 py-1 text-xs font-semibold rounded-full flex items-center space-x-1 ${className}`}
    >
      <span className="text-xs">{emoji}</span>
      <span>{label}</span>
    </span>
  );
};

export default function AdminPage() {
  const { user, isAuthenticated, isAdmin, logout } = useNextAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { confirm, closeConfirm, setLoading, confirmState } = useConfirm();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [currentPage, setCurrentPage] = useState(1);
  const [analyticsPage, setAnalyticsPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [analyticsPerPage] = useState(20);

  // Redeem management states
  const [redeemPage, setRedeemPage] = useState(1);
  const [redeemPerPage] = useState(20);
  const [redeemStatusFilter, setRedeemStatusFilter] = useState<string>('');

  // Rewards management states
  const [rewardsPage, setRewardsPage] = useState(1);
  const [rewardsPerPage] = useState(10);
  const [highlightingPosts, setHighlightingPosts] = useState<Set<string>>(
    new Set()
  );

  // Reward modal states
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [viewingReward, setViewingReward] = useState<Reward | null>(null);
  const [rewardForm, setRewardForm] = useState({
    name: '',
    description: '',
    pointsRequired: 0,
    imageUrl: '',
    isActive: true,
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Filter states (simplified - no search)
  const [userFilters, setUserFilters] = useState<FilterState>({
    role: '',
    status: '',
  });
  const [postFilters, setPostFilters] = useState<FilterState>({
    type: '',
  });

  // Redirect if not admin
  useEffect(() => {
    if (isAuthenticated && !isAdmin) {
      router.push('/');
    }
  }, [isAuthenticated, isAdmin, router]);

  // Filter functions (only dropdown filters)
  const filterUsers = useCallback(
    (users: User[]) => {
      return users.filter(user => {
        const matchesRole = !userFilters.role || user.role === userFilters.role;
        const matchesStatus =
          !userFilters.status || user.status === userFilters.status;
        return matchesRole && matchesStatus;
      });
    },
    [userFilters]
  );

  const filterPosts = useCallback(
    (posts: Post[]) => {
      return posts.filter(post => {
        const matchesType = !postFilters.type || post.type === postFilters.type;
        return matchesType;
      });
    },
    [postFilters]
  );

  // Fetch admin data
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => apiClient.getUsers(),
    enabled: isAdmin,
  });

  const { data: rewardsData, isLoading: rewardsLoading } = useQuery({
    queryKey: ['admin-rewards', rewardsPage],
    queryFn: () => apiClient.getRewards(rewardsPage, rewardsPerPage),
    enabled: isAdmin,
  });

  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['admin-posts'],
    queryFn: () => apiClient.getPosts(),
    enabled: isAdmin,
  });

  // Fetch analytics data
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => apiClient.getCornerAnalytics(),
    enabled: isAdmin,
  });

  // Redeem management queries
  const {
    data: redeemData,
    isLoading: redeemLoading,
    refetch: refetchRedeems,
  } = useQuery({
    queryKey: ['admin-redeems', redeemPage, redeemStatusFilter],
    queryFn: () =>
      apiClient.getAllRedeems(
        redeemPage,
        redeemPerPage,
        redeemStatusFilter || undefined
      ),
    enabled: isAdmin,
  });

  // Update redeem status mutation
  const updateRedeemStatusMutation = useMutation({
    mutationFn: ({ redeemId, status }: { redeemId: string; status: string }) =>
      apiClient.updateRedeemStatus(redeemId, status),
    onSuccess: () => {
      toast({
        title: 'Cập nhật thành công',
        description: 'Trạng thái đổi thưởng đã được cập nhật',
        variant: 'success',
      });
      refetchRedeems();
    },
    onError: (error: Error) => {
      toast({
        title: 'Lỗi',
        description: error.message || 'Có lỗi xảy ra',
        variant: 'destructive',
      });
    },
  });

  // Reward CRUD mutations
  const createRewardMutation = useMutation({
    mutationFn: (data: {
      name: string;
      description: string;
      pointsRequired: number;
      imageUrl?: string;
      isActive: boolean;
    }) => apiClient.createReward(data),
    onSuccess: () => {
      toast({
        title: 'Thành công',
        description: 'Phần thưởng đã được tạo',
        variant: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-rewards'] });
      setShowRewardModal(false);
      resetRewardForm();
    },
    onError: (error: Error) => {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể tạo phần thưởng',
        variant: 'destructive',
      });
    },
  });

  const updateRewardMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        name: string;
        description: string;
        pointsRequired: number;
        imageUrl?: string;
        isActive: boolean;
      };
    }) => apiClient.updateReward(id, data),
    onSuccess: () => {
      toast({
        title: 'Thành công',
        description: 'Phần thưởng đã được cập nhật',
        variant: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-rewards'] });
      setShowRewardModal(false);
      setEditingReward(null);
      resetRewardForm();
    },
    onError: (error: Error) => {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể cập nhật phần thưởng',
        variant: 'destructive',
      });
    },
  });

  const deleteRewardMutation = useMutation({
    mutationFn: (id: string) => apiClient.deleteReward(id),
    onSuccess: () => {
      toast({
        title: 'Thành công',
        description: 'Phần thưởng đã được xóa',
        variant: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-rewards'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể xóa phần thưởng',
        variant: 'destructive',
      });
    },
  });

  const allUsers = useMemo(() => usersData?.data?.data || [], [usersData]);
  const allRewards = useMemo(
    () => rewardsData?.data?.data || [],
    [rewardsData]
  );
  const allPosts = useMemo(() => postsData?.data?.posts || [], [postsData]);

  // Highlight handlers
  const handleHighlightPost = useCallback(
    async (postId: string) => {
      setHighlightingPosts(prev => new Set(prev).add(postId));
      try {
        await apiClient.highlightPost(postId);
        // Invalidate and refetch posts data
        await queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
        await queryClient.invalidateQueries({
          queryKey: ['highlighted-posts'],
        });

        toast({
          title: 'Thành công!',
          description:
            'Bài viết đã được highlight và sẽ hiển thị trong Góc Chia Sẻ.',
        });
      } catch (error) {
        console.error('Failed to highlight post:', error);
        toast({
          title: 'Lỗi',
          description: 'Không thể highlight bài viết. Vui lòng thử lại.',
          variant: 'destructive',
        });
      } finally {
        setHighlightingPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      }
    },
    [queryClient, toast]
  );

  const handleUnhighlightPost = useCallback(
    async (postId: string) => {
      setHighlightingPosts(prev => new Set(prev).add(postId));
      try {
        await apiClient.unhighlightPost(postId);
        // Invalidate and refetch posts data
        await queryClient.invalidateQueries({ queryKey: ['admin-posts'] });
        await queryClient.invalidateQueries({
          queryKey: ['highlighted-posts'],
        });

        toast({
          title: 'Thành công!',
          description: 'Bài viết đã được bỏ highlight khỏi Góc Chia Sẻ.',
        });
      } catch (error) {
        console.error('Failed to unhighlight post:', error);
        toast({
          title: 'Lỗi',
          description: 'Không thể bỏ highlight bài viết. Vui lòng thử lại.',
          variant: 'destructive',
        });
      } finally {
        setHighlightingPosts(prev => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      }
    },
    [queryClient, toast]
  );

  // Reward management helpers
  const resetRewardForm = useCallback(() => {
    setRewardForm({
      name: '',
      description: '',
      pointsRequired: 0,
      imageUrl: '',
      isActive: true,
    });
    setSelectedImageFile(null);
    setImagePreview(null);
    setUploadingImage(false);
  }, []);

  const openCreateRewardModal = useCallback(() => {
    resetRewardForm();
    setEditingReward(null);
    setViewingReward(null);
    setShowRewardModal(true);
  }, [resetRewardForm]);

  const openEditRewardModal = useCallback(
    async (reward: Reward) => {
      const confirmed = await confirm({
        title: 'Chỉnh sửa phần thưởng',
        message: `Bạn có chắc chắn muốn chỉnh sửa phần thưởng "${reward.name}"?`,
        type: 'info',
        confirmText: 'Chỉnh sửa',
        cancelText: 'Hủy',
      });

      if (confirmed) {
        setRewardForm({
          name: reward.name,
          description: reward.description,
          pointsRequired: reward.pointsRequired,
          imageUrl: reward.imageUrl || '',
          isActive: reward.isActive,
        });
        setSelectedImageFile(null);
        setImagePreview(reward.imageUrl || null);
        setUploadingImage(false);
        setEditingReward(reward);
        setViewingReward(null);
        setShowRewardModal(true);
      }
    },
    [confirm]
  );

  const openViewRewardModal = useCallback((reward: Reward) => {
    setViewingReward(reward);
    setEditingReward(null);
    setShowRewardModal(true);
  }, []);

  // Image upload handlers
  const handleImageSelect = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setSelectedImageFile(file);
        const reader = new FileReader();
        reader.onload = e => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    },
    []
  );

  const handleImageUpload = useCallback(async () => {
    if (!selectedImageFile) return;

    setUploadingImage(true);
    try {
      const uploadResult = await apiClient.uploadFile(selectedImageFile);
      setRewardForm(prev => ({
        ...prev,
        imageUrl: uploadResult.data.url,
      }));
      setImagePreview(uploadResult.data.url);
      toast({
        title: 'Upload thành công',
        description: 'Hình ảnh đã được tải lên thành công',
        variant: 'success',
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload thất bại',
        description: 'Không thể tải lên hình ảnh',
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(false);
    }
  }, [selectedImageFile, toast]);

  const handleSaveReward = useCallback(async () => {
    try {
      let finalImageUrl = rewardForm.imageUrl;

      // If there's a new image file selected, upload it first
      if (selectedImageFile) {
        setUploadingImage(true);
        try {
          const uploadResult = await apiClient.uploadFile(selectedImageFile);
          finalImageUrl = uploadResult.data.url;

          toast({
            title: 'Upload thành công',
            description: 'Hình ảnh đã được tải lên thành công',
            variant: 'success',
          });
        } catch (error) {
          console.error('Upload error:', error);
          toast({
            title: 'Upload thất bại',
            description: 'Không thể tải lên hình ảnh',
            variant: 'destructive',
          });
          return; // Don't proceed with saving if upload fails
        } finally {
          setUploadingImage(false);
        }
      }

      // Prepare the final form data with the uploaded image URL
      const finalFormData = {
        ...rewardForm,
        imageUrl: finalImageUrl,
      };

      // Save the reward
      if (editingReward) {
        updateRewardMutation.mutate({
          id: editingReward.id,
          data: finalFormData,
        });
      } else {
        createRewardMutation.mutate(finalFormData);
      }
    } catch (error) {
      console.error('Save reward error:', error);
      toast({
        title: 'Lưu thất bại',
        description: 'Không thể lưu phần thưởng',
        variant: 'destructive',
      });
    }
  }, [
    editingReward,
    rewardForm,
    selectedImageFile,
    updateRewardMutation,
    createRewardMutation,
    toast,
  ]);

  const handleDeleteReward = useCallback(
    async (rewardId: string, rewardName: string) => {
      const confirmed = await confirm({
        title: 'Vô hiệu hóa phần thưởng',
        message: `Bạn có chắc chắn muốn vô hiệu hóa phần thưởng "${rewardName}"? Phần thưởng sẽ không hiển thị cho người dùng nhưng vẫn giữ lại dữ liệu.`,
        type: 'warning',
        confirmText: 'Vô hiệu hóa',
        cancelText: 'Hủy',
      });

      if (confirmed) {
        setLoading(true);
        try {
          await deleteRewardMutation.mutateAsync(rewardId);
        } finally {
          setLoading(false);
        }
      }
    },
    [confirm, deleteRewardMutation, setLoading]
  );

  // Memoize filtered data
  const users = useMemo(() => filterUsers(allUsers), [allUsers, filterUsers]);
  const rewards = allRewards;
  const posts = useMemo(() => filterPosts(allPosts), [allPosts, filterPosts]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-700 mb-4">
            Vui lòng đăng nhập
          </h1>
          <Button onClick={() => router.push('/auth/login')}>Đăng nhập</Button>
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
          <Button onClick={() => router.push('/')}>Về trang chủ</Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Tổng quan', icon: Home },
    { id: 'users', label: 'Người dùng', icon: Users },
    { id: 'rewards', label: 'Phần thưởng', icon: Gift },
    { id: 'posts', label: 'Bài viết', icon: MessageSquare },
    { id: 'redeems', label: 'Đổi thưởng', icon: CreditCard },
    { id: 'analytics', label: 'Corner Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Cài đặt', icon: Settings },
  ];

  const renderPagination = (
    total: number,
    currentPage: number,
    onPageChange: (page: number) => void,
    itemsPerPageOverride?: number
  ) => {
    const pageSize = itemsPerPageOverride || itemsPerPage;
    const totalPages = Math.ceil(total / pageSize);
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-700">
          Hiển thị {(currentPage - 1) * pageSize + 1} đến{' '}
          {Math.min(currentPage * pageSize, total)} trong tổng số {total} kết
          quả
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(page)}
              className="w-8 h-8 p-0"
            >
              {page}
            </Button>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  };

  // Filter Bar Component (simplified - no search)
  const FilterBar = memo(
    ({
      type,
      filters,
      setFilters,
    }: {
      type: 'users' | 'posts';
      filters: FilterState;
      setFilters: (filters: FilterState) => void;
    }) => {
      const clearFilters = () => {
        if (type === 'users') {
          setFilters({ role: '', status: '' });
        } else {
          setFilters({ type: '' });
        }
      };

      const hasActiveFilters = Object.values(filters).some(
        value => value !== ''
      );

      return (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-700 flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Bộ lọc
            </h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4 mr-1" />
                Xóa bộ lọc
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Role/Type Filter */}
            <select
              value={filters.role || filters.type || ''}
              onChange={e =>
                setFilters({
                  ...filters,
                  [type === 'users' ? 'role' : 'type']: e.target.value,
                })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">
                Tất cả {type === 'users' ? 'vai trò' : 'loại'}
              </option>
              {type === 'users' ? (
                <>
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                </>
              ) : (
                <>
                  <option value="EMOJI_CARD">EMOJI_CARD</option>
                  <option value="CONFESSION">CONFESSION</option>
                  <option value="IMAGE">IMAGE</option>
                  <option value="VIDEO">VIDEO</option>
                  <option value="CLIP">CLIP</option>
                </>
              )}
            </select>

            {/* Status Filter (only for users) */}
            {type === 'users' && (
              <select
                value={filters.status}
                onChange={e =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            )}
          </div>
        </div>
      );
    }
  );

  FilterBar.displayName = 'FilterBar';

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Người dùng</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Gift className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Phần thưởng</p>
              <p className="text-2xl font-bold text-gray-900">
                {rewards.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Bài viết</p>
              <p className="text-2xl font-bold text-gray-900">{posts.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Settings className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Cài đặt</p>
              <p className="text-2xl font-bold text-gray-900">-</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Hoạt động gần đây
        </h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">Người dùng mới đăng ký</p>
              <p className="text-xs text-gray-500">2 phút trước</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">Bài viết mới được tạo</p>
              <p className="text-xs text-gray-500">5 phút trước</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">Phần thưởng được đổi</p>
              <p className="text-xs text-gray-500">10 phút trước</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Quản lý người dùng</h2>
        <Button className="bg-blue-500 hover:bg-blue-600">
          <Plus className="w-4 h-4 mr-2" />
          Thêm người dùng
        </Button>
      </div>

      <FilterBar
        type="users"
        filters={userFilters}
        setFilters={setUserFilters}
      />

      {usersLoading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Hiển thị {users.length} trong tổng số {allUsers.length} người dùng
            </p>
            {users.length === 0 && allUsers.length > 0 && (
              <p className="text-sm text-amber-600">
                Không tìm thấy kết quả phù hợp với bộ lọc
              </p>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Điểm
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Đăng nhập
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((userItem: User) => (
                  <tr key={userItem.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-bold text-sm">
                            {userItem.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {userItem.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {userItem.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          userItem.role === 'ADMIN'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {userItem.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {userItem.points}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <LoginMethodBadge
                        method={userItem.loginMethod || 'LOCAL'}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          userItem.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {userItem.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm" title="Xem chi tiết">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            const confirmed = await confirm({
                              title: 'Chỉnh sửa người dùng',
                              message: `Bạn có chắc chắn muốn chỉnh sửa thông tin người dùng "${userItem.name}"?`,
                              type: 'info',
                              confirmText: 'Chỉnh sửa',
                              cancelText: 'Hủy',
                            });
                            if (confirmed) {
                              // TODO: Implement edit user functionality
                              console.log('Edit user:', userItem.id);
                            }
                          }}
                          title="Chỉnh sửa"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          onClick={async () => {
                            const confirmed = await confirm({
                              title: 'Xóa người dùng',
                              message: `Bạn có chắc chắn muốn xóa người dùng "${userItem.name}"? Hành động này không thể hoàn tác!`,
                              type: 'danger',
                              confirmText: 'Xóa',
                              cancelText: 'Hủy',
                            });
                            if (confirmed) {
                              // TODO: Implement delete user functionality
                              console.log('Delete user:', userItem.id);
                            }
                          }}
                          title="Xóa người dùng"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPagination(users.length, currentPage, setCurrentPage)}
        </>
      )}
    </div>
  );

  const renderRewards = () => {
    const rewards: Reward[] = rewardsData?.data?.data || [];
    const totalRewards = rewardsData?.data?.total || 0;

    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Quản lý phần thưởng
          </h2>
          <Button
            className="bg-green-500 hover:bg-green-600"
            onClick={openCreateRewardModal}
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm phần thưởng
          </Button>
        </div>

        {rewardsLoading ? (
          <div className="text-center py-8">Đang tải...</div>
        ) : rewards.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Chưa có phần thưởng nào
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mô tả
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Điểm yêu cầu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rewards.map((reward: Reward) => (
                    <tr key={reward.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                            <Gift className="w-4 h-4 text-white" />
                          </div>
                          <div className="text-sm font-medium text-gray-900">
                            {reward.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {reward.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {reward.pointsRequired}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            reward.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {reward.isActive ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openViewRewardModal(reward)}
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditRewardModal(reward)}
                            title="Chỉnh sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            onClick={() =>
                              handleDeleteReward(reward.id, reward.name)
                            }
                            disabled={deleteRewardMutation.isPending}
                            title="Vô hiệu hóa phần thưởng"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {renderPagination(
              totalRewards,
              rewardsPage,
              setRewardsPage,
              rewardsPerPage
            )}
          </>
        )}
      </div>
    );
  };

  const renderPosts = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Quản lý bài viết</h2>
        <Button className="bg-purple-500 hover:bg-purple-600">
          <Plus className="w-4 h-4 mr-2" />
          Thêm bài viết
        </Button>
      </div>

      <FilterBar
        type="posts"
        filters={postFilters}
        setFilters={setPostFilters}
      />

      {postsLoading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Hiển thị {posts.length} trong tổng số {allPosts.length} bài viết
            </p>
            {posts.length === 0 && allPosts.length > 0 && (
              <p className="text-sm text-amber-600">
                Không tìm thấy kết quả phù hợp với bộ lọc
              </p>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nội dung
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người đăng
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Highlight
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lượt thích
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lượt chia sẻ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {posts.map((post: Post) => (
                  <tr key={post.id}>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {post.caption || 'Không có nội dung'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {post.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {post.user?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {post.isHighlighted ? (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 flex items-center space-x-1">
                            <Star className="w-3 h-3" />
                            <span>Highlighted</span>
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-600">
                            Normal
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {post.likeCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {post.shareCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {post.isHighlighted ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUnhighlightPost(post.id)}
                            disabled={highlightingPosts.has(post.id)}
                            className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 disabled:opacity-50"
                            title="Bỏ highlight"
                          >
                            {highlightingPosts.has(post.id) ? (
                              <div className="w-4 h-4 animate-spin rounded-full border-2 border-yellow-600 border-t-transparent" />
                            ) : (
                              <StarOff className="w-4 h-4" />
                            )}
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleHighlightPost(post.id)}
                            disabled={highlightingPosts.has(post.id)}
                            className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 disabled:opacity-50"
                            title="Highlight bài viết"
                          >
                            {highlightingPosts.has(post.id) ? (
                              <div className="w-4 h-4 animate-spin rounded-full border-2 border-yellow-600 border-t-transparent" />
                            ) : (
                              <Star className="w-4 h-4" />
                            )}
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={async () => {
                            const confirmed = await confirm({
                              title: 'Chỉnh sửa bài viết',
                              message: `Bạn có chắc chắn muốn chỉnh sửa bài viết này?`,
                              type: 'info',
                              confirmText: 'Chỉnh sửa',
                              cancelText: 'Hủy',
                            });
                            if (confirmed) {
                              // TODO: Implement edit post functionality
                              console.log('Edit post:', post.id);
                            }
                          }}
                          title="Chỉnh sửa bài viết"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          onClick={async () => {
                            const confirmed = await confirm({
                              title: 'Xóa bài viết',
                              message: `Bạn có chắc chắn muốn xóa bài viết này? Hành động này không thể hoàn tác!`,
                              type: 'danger',
                              confirmText: 'Xóa',
                              cancelText: 'Hủy',
                            });
                            if (confirmed) {
                              // TODO: Implement delete post functionality
                              console.log('Delete post:', post.id);
                            }
                          }}
                          title="Xóa bài viết"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPagination(posts.length, currentPage, setCurrentPage)}
        </>
      )}
    </div>
  );

  const renderAnalytics = () => {
    const analytics: AnalyticsItem[] = analyticsData?.data || [];

    const getCornerName = (corner: number) => {
      const names = {
        0: 'Trang chủ (Video)',
        1: 'Mục lục (Emoji Grid)',
        2: 'Made in Vietnam',
        3: 'Chia sẻ (Gallery)',
        4: 'Flip Card',
        5: 'Phần thưởng',
      };
      return names[corner as keyof typeof names] || `Corner ${corner}`;
    };

    // Group analytics by corner for overview
    const cornerStats = analytics.reduce(
      (acc: Record<number, CornerStats>, item: AnalyticsItem) => {
        const corner = item.corner;
        if (!acc[corner]) {
          acc[corner] = {
            corner,
            totalVisits: 0,
            totalDuration: 0,
            avgDuration: 0,
            cornerName: getCornerName(corner),
          };
        }
        acc[corner].totalVisits += 1;
        acc[corner].totalDuration += item.duration;
        acc[corner].avgDuration = Math.round(
          acc[corner].totalDuration / acc[corner].totalVisits
        );
        return acc;
      },
      {}
    );

    // Group analytics by user and date for detailed table
    const userDateStats = analytics.reduce(
      (acc: Record<string, UserDateStats>, item: AnalyticsItem) => {
        const userId = item.userId || 'Anonymous';
        const userName = item.user?.name || 'Anonymous User';
        const userEmail = item.user?.email;
        const date = new Date(item.createdAt).toLocaleDateString('vi-VN');
        const key = `${userId}-${date}`;

        if (!acc[key]) {
          acc[key] = {
            userId,
            userName,
            userEmail,
            date,
            corners: {} as Record<
              number,
              { visits: number; totalDuration: number }
            >,
            totalVisits: 0,
            totalDuration: 0,
          };
        }

        const corner = item.corner;
        if (!acc[key].corners[corner]) {
          acc[key].corners[corner] = { visits: 0, totalDuration: 0 };
        }

        acc[key].corners[corner].visits += 1;
        acc[key].corners[corner].totalDuration += item.duration;
        acc[key].totalVisits += 1;
        acc[key].totalDuration += item.duration;

        return acc;
      },
      {}
    );

    const userDateArray = Object.values(userDateStats).sort(
      (a: UserDateStats, b: UserDateStats) =>
        new Date(b.date.split('/').reverse().join('-')).getTime() -
        new Date(a.date.split('/').reverse().join('-')).getTime()
    );

    return (
      <div className="space-y-6">
        {/* Analytics Overview */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Corner Analytics Overview
          </h2>

          {analyticsLoading ? (
            <div className="text-center py-8">Đang tải analytics...</div>
          ) : analytics.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Chưa có dữ liệu analytics
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.values(cornerStats).map((stat: CornerStats) => (
                <div
                  key={stat.corner}
                  className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {stat.cornerName}
                    </h3>
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {stat.corner}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Tổng lượt truy cập:
                      </span>
                      <span className="font-semibold text-blue-600">
                        {stat.totalVisits}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Tổng thời gian:
                      </span>
                      <span className="font-semibold text-green-600">
                        {stat.totalDuration}s
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Thời gian TB:
                      </span>
                      <span className="font-semibold text-purple-600">
                        {stat.avgDuration}s
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detailed Analytics Table */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Chi tiết Analytics theo User & Ngày
            </h3>
            <div className="text-sm text-gray-600">
              Hiển thị{' '}
              {Math.min(
                (analyticsPage - 1) * analyticsPerPage + 1,
                userDateArray.length
              )}{' '}
              đến{' '}
              {Math.min(analyticsPage * analyticsPerPage, userDateArray.length)}{' '}
              trong tổng số {userDateArray.length} records
            </div>
          </div>

          {analyticsLoading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : userDateArray.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Chưa có dữ liệu analytics
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Corner 0
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Corner 1
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Corner 2
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Corner 3
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Corner 4
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Corner 5
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tổng
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {userDateArray
                      .slice(
                        (analyticsPage - 1) * analyticsPerPage,
                        analyticsPage * analyticsPerPage
                      )
                      .map((userDate: UserDateStats) => (
                        <tr key={`${userDate.userId}-${userDate.date}`}>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mr-3">
                                <span className="text-white font-bold text-sm">
                                  {userDate.userName.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div className="text-sm font-medium text-gray-900">
                                <div className="font-semibold">
                                  {userDate.userName}
                                </div>
                                {userDate.userEmail && (
                                  <div className="text-xs text-gray-500">
                                    {userDate.userEmail}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                            {userDate.date}
                          </td>
                          {[0, 1, 2, 3, 4, 5].map(corner => {
                            const cornerData = userDate.corners[corner];
                            return (
                              <td
                                key={corner}
                                className="px-2 py-4 text-center text-sm"
                              >
                                {cornerData ? (
                                  <div className="space-y-1">
                                    <div className="font-semibold text-blue-600">
                                      {cornerData.visits}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {cornerData.totalDuration}s
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-300">-</span>
                                )}
                              </td>
                            );
                          })}
                          <td className="px-4 py-4 text-center text-sm font-semibold text-gray-900">
                            <div className="space-y-1">
                              <div className="text-blue-600">
                                {userDate.totalVisits}
                              </div>
                              <div className="text-xs text-gray-500">
                                {userDate.totalDuration}s
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Analytics Pagination */}
              {renderPagination(
                userDateArray.length,
                analyticsPage,
                setAnalyticsPage,
                analyticsPerPage
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const renderRedeems = () => {
    const redeems: AdminRedeemItem[] = redeemData?.data?.redeems || [];
    const totalRedeems = redeemData?.data?.total || 0;

    const getStatusBadge = (status: string) => {
      switch (status) {
        case 'PENDING':
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              ⏳ Chờ duyệt
            </span>
          );
        case 'APPROVED':
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              ✅ Đã duyệt
            </span>
          );
        case 'DELIVERED':
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              📦 Đã giao
            </span>
          );
        case 'REJECTED':
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              ❌ Từ chối
            </span>
          );
        default:
          return (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {status}
            </span>
          );
      }
    };

    const handleStatusUpdate = (redeemId: string, newStatus: string) => {
      updateRedeemStatusMutation.mutate({ redeemId, status: newStatus });
    };

    return (
      <div className="space-y-6">
        {/* Filter Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Quản lý đổi thưởng
            </h2>
            <div className="flex items-center space-x-4">
              <select
                value={redeemStatusFilter}
                onChange={e => {
                  setRedeemStatusFilter(e.target.value);
                  setRedeemPage(1);
                }}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="PENDING">Chờ duyệt</option>
                <option value="APPROVED">Đã duyệt</option>
                <option value="DELIVERED">Đã giao</option>
                <option value="REJECTED">Từ chối</option>
              </select>
            </div>
          </div>

          {redeemLoading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : redeems.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Chưa có yêu cầu đổi thưởng nào
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phần thưởng
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Thông tin nhận
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Điểm sử dụng
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày tạo
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {redeems.map((redeem: AdminRedeemItem) => (
                      <tr key={redeem.id}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mr-3">
                              <span className="text-white font-bold text-sm">
                                {redeem.user.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {redeem.user.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {redeem.user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {redeem.reward?.name || 'N/A'}
                          </div>
                          {redeem.reward?.description && (
                            <div className="text-sm text-gray-500">
                              {redeem.reward.description}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className="font-medium">
                              {redeem.receiverName}
                            </div>
                            <div className="text-gray-500">
                              {redeem.receiverPhone}
                            </div>
                            <div className="text-gray-500 break-words max-w-xs">
                              {redeem.receiverAddress}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {redeem.pointsUsed} điểm
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {getStatusBadge(redeem.status)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(redeem.createdAt).toLocaleDateString(
                            'vi-VN'
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {redeem.status === 'PENDING' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleStatusUpdate(redeem.id, 'APPROVED')
                                  }
                                  disabled={
                                    updateRedeemStatusMutation.isPending
                                  }
                                  className="text-green-600 hover:text-green-800"
                                >
                                  Duyệt
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    handleStatusUpdate(redeem.id, 'REJECTED')
                                  }
                                  disabled={
                                    updateRedeemStatusMutation.isPending
                                  }
                                  className="text-red-600 hover:text-red-800"
                                >
                                  Từ chối
                                </Button>
                              </>
                            )}
                            {redeem.status === 'APPROVED' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleStatusUpdate(redeem.id, 'DELIVERED')
                                }
                                disabled={updateRedeemStatusMutation.isPending}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                Đã giao
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Redeem Pagination */}
              {renderPagination(
                totalRedeems,
                redeemPage,
                setRedeemPage,
                redeemPerPage
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'users':
        return renderUsers();
      case 'rewards':
        return renderRewards();
      case 'posts':
        return renderPosts();
      case 'redeems':
        return renderRedeems();
      case 'analytics':
        return renderAnalytics();
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
        return renderOverview();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Quản lý CMS
              </h1>
              <p className="text-gray-600">
                Chào mừng {user?.name}, quản lý hệ thống Tiger
              </p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="flex items-center space-x-2 text-sm"
                size="sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Về trang chủ</span>
                <span className="sm:hidden">Trang chủ</span>
              </Button>
              <Button
                variant="outline"
                onClick={logout}
                className="flex items-center space-x-2 text-red-600 hover:text-red-800 hover:bg-red-50 border-red-200 hover:border-red-300 text-sm"
                size="sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Đăng xuất</span>
                <span className="sm:hidden">Thoát</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        {renderContent()}

        {/* Reward Modal */}
        {showRewardModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    {viewingReward
                      ? 'Chi tiết phần thưởng'
                      : editingReward
                        ? 'Chỉnh sửa phần thưởng'
                        : 'Thêm phần thưởng mới'}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowRewardModal(false);
                      setEditingReward(null);
                      setViewingReward(null);
                      resetRewardForm();
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {viewingReward ? (
                  // View Mode
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên phần thưởng
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        {viewingReward.name}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mô tả
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        {viewingReward.description}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Điểm yêu cầu
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        {viewingReward.pointsRequired} điểm
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Trạng thái
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            viewingReward.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {viewingReward.isActive
                            ? 'Hoạt động'
                            : 'Không hoạt động'}
                        </span>
                      </div>
                    </div>
                    {viewingReward.imageUrl && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hình ảnh
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <Image
                            src={viewingReward.imageUrl}
                            alt={viewingReward.name}
                            width={128}
                            height={128}
                            className="object-cover rounded"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  // Edit/Create Mode
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên phần thưởng *
                      </label>
                      <input
                        type="text"
                        value={rewardForm.name}
                        onChange={e =>
                          setRewardForm(prev => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nhập tên phần thưởng"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mô tả *
                      </label>
                      <textarea
                        value={rewardForm.description}
                        onChange={e =>
                          setRewardForm(prev => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nhập mô tả phần thưởng"
                        rows={3}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Điểm yêu cầu *
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={rewardForm.pointsRequired}
                        onChange={e =>
                          setRewardForm(prev => ({
                            ...prev,
                            pointsRequired: parseInt(e.target.value) || 0,
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nhập số điểm yêu cầu"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hình ảnh phần thưởng
                      </label>

                      {/* Image Preview */}
                      {imagePreview && (
                        <div className="mb-4">
                          <Image
                            src={imagePreview}
                            alt="Preview"
                            width={200}
                            height={200}
                            className="object-cover rounded-lg border border-gray-300"
                          />
                        </div>
                      )}

                      {/* File Input */}
                      <div className="space-y-3">
                        <div className="text-sm text-gray-600 mb-2">
                          Chọn hình ảnh cho phần thưởng. Ảnh sẽ được tự động
                          upload khi bạn lưu.
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />

                        {/* Upload Button - Only show if file selected and not yet uploaded */}
                        {selectedImageFile && !rewardForm.imageUrl && (
                          <Button
                            type="button"
                            onClick={handleImageUpload}
                            disabled={uploadingImage}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            {uploadingImage ? (
                              <span className="flex items-center justify-center">
                                <svg
                                  className="animate-spin h-4 w-4 mr-2 text-white"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                Đang tải lên...
                              </span>
                            ) : (
                              'Tải lên hình ảnh'
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={rewardForm.isActive}
                          onChange={e =>
                            setRewardForm(prev => ({
                              ...prev,
                              isActive: e.target.checked,
                            }))
                          }
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Phần thưởng đang hoạt động
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowRewardModal(false);
                      setEditingReward(null);
                      setViewingReward(null);
                      resetRewardForm();
                    }}
                  >
                    {viewingReward ? 'Đóng' : 'Hủy'}
                  </Button>
                  {!viewingReward && (
                    <Button
                      onClick={handleSaveReward}
                      disabled={
                        createRewardMutation.isPending ||
                        updateRewardMutation.isPending ||
                        uploadingImage ||
                        !rewardForm.name ||
                        !rewardForm.description
                      }
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {createRewardMutation.isPending ||
                      updateRewardMutation.isPending ||
                      uploadingImage
                        ? 'Đang lưu...'
                        : editingReward
                          ? 'Cập nhật'
                          : 'Tạo mới'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

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
      </div>
    </div>
  );
}
