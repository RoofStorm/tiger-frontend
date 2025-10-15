import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import Image from 'next/image';
import { UseMutationResult } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api';

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsRequired: number;
  imageUrl?: string;
  isActive: boolean;
}

interface RewardForm {
  name: string;
  description: string;
  pointsRequired: number;
  imageUrl: string;
  isActive: boolean;
}

interface RewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingReward: Reward | null;
  viewingReward: Reward | null;
  rewardForm: RewardForm;
  setRewardForm: React.Dispatch<React.SetStateAction<RewardForm>>;
  selectedImageFile: File | null;
  setSelectedImageFile: React.Dispatch<React.SetStateAction<File | null>>;
  imagePreview: string | null;
  setImagePreview: React.Dispatch<React.SetStateAction<string | null>>;
  uploadingImage: boolean;
  setUploadingImage: React.Dispatch<React.SetStateAction<boolean>>;
  createRewardMutation: UseMutationResult<any, Error, any, unknown>;
  updateRewardMutation: UseMutationResult<any, Error, any, unknown>;
  resetRewardForm: () => void;
}

export const RewardModal: React.FC<RewardModalProps> = ({
  isOpen,
  onClose,
  editingReward,
  viewingReward,
  rewardForm,
  setRewardForm,
  selectedImageFile,
  setSelectedImageFile,
  imagePreview,
  setImagePreview,
  uploadingImage,
  setUploadingImage,
  createRewardMutation,
  updateRewardMutation,
  resetRewardForm,
}) => {
  const { toast } = useToast();
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
    [setSelectedImageFile, setImagePreview]
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
        duration: 3000,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload thất bại',
        description: 'Không thể tải lên hình ảnh',
        variant: 'destructive',
        duration: 4000,
      });
    } finally {
      setUploadingImage(false);
    }
  }, [selectedImageFile, setRewardForm, setImagePreview, setUploadingImage]);

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
            duration: 3000,
          });
        } catch (error) {
          console.error('Upload error:', error);
          toast({
            title: 'Upload thất bại',
            description: 'Không thể tải lên hình ảnh',
            variant: 'destructive',
            duration: 4000,
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
        duration: 4000,
      });
    }
  }, [
    editingReward,
    rewardForm,
    selectedImageFile,
    updateRewardMutation,
    createRewardMutation,
    setUploadingImage,
  ]);

  if (!isOpen) return null;

  return (
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
              onClick={onClose}
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
                    {viewingReward.isActive ? 'Hoạt động' : 'Không hoạt động'}
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
                    Chọn hình ảnh cho phần thưởng. Ảnh sẽ được tự động upload
                    khi bạn lưu.
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
            <Button variant="outline" onClick={onClose}>
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
  );
};
