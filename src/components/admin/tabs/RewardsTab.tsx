import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Eye, Gift } from 'lucide-react';
import { useConfirm } from '@/hooks/useConfirm';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api';
import { Pagination } from '../Pagination';
import { RewardModal } from '../RewardModal';
import { ActionButton } from '../ActionButton';

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  imageUrl?: string;
  isActive: boolean;
}

interface RewardsTabProps {
  isAdmin: boolean;
}

export const RewardsTab: React.FC<RewardsTabProps> = ({ isAdmin }) => {
  const { confirm, setLoading } = useConfirm();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [rewardsPage, setRewardsPage] = useState(1);
  const [rewardsPerPage] = useState(10);

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

  // Fetch rewards data
  const { data: rewardsData, isLoading: rewardsLoading } = useQuery({
    queryKey: ['admin-rewards', rewardsPage],
    queryFn: () => apiClient.getRewards(rewardsPage, rewardsPerPage),
    enabled: isAdmin,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
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
        duration: 3000,
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
        duration: 4000,
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
        duration: 3000,
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
        duration: 4000,
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
        duration: 3000,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-rewards'] });
    },
    onError: (error: Error) => {
      toast({
        title: 'Lỗi',
        description: error.message || 'Không thể xóa phần thưởng',
        variant: 'destructive',
        duration: 4000,
      });
    },
  });

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

  const rewards: Reward[] = rewardsData?.data?.data || [];
  const totalRewards = rewardsData?.data?.total || 0;

  if (rewardsLoading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  return (
    <>
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

        {rewards.length === 0 ? (
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
                          <ActionButton
                            variant="ghost"
                            size="sm"
                            onClick={() => openViewRewardModal(reward)}
                            tooltip="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </ActionButton>
                          <ActionButton
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditRewardModal(reward)}
                            tooltip="Chỉnh sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </ActionButton>
                          <ActionButton
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-800 hover:bg-red-50"
                            onClick={() =>
                              handleDeleteReward(reward.id, reward.name)
                            }
                            disabled={deleteRewardMutation.isPending}
                            tooltip="Vô hiệu hóa phần thưởng"
                          >
                            <Trash2 className="w-4 h-4" />
                          </ActionButton>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              total={totalRewards}
              currentPage={rewardsPage}
              onPageChange={setRewardsPage}
              itemsPerPage={rewardsPerPage}
            />
          </>
        )}
      </div>

      {/* Reward Modal */}
      <RewardModal
        isOpen={showRewardModal}
        onClose={() => {
          setShowRewardModal(false);
          setEditingReward(null);
          setViewingReward(null);
          resetRewardForm();
        }}
        editingReward={editingReward}
        viewingReward={viewingReward}
        rewardForm={rewardForm}
        setRewardForm={setRewardForm}
        selectedImageFile={selectedImageFile}
        setSelectedImageFile={setSelectedImageFile}
        imagePreview={imagePreview}
        setImagePreview={setImagePreview}
        uploadingImage={uploadingImage}
        setUploadingImage={setUploadingImage}
        createRewardMutation={createRewardMutation}
        updateRewardMutation={updateRewardMutation}
      />
    </>
  );
};
