import { useState, useCallback } from 'react';
import { Reward } from './types';

export const useRewardModal = () => {
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

  const openEditRewardModal = useCallback(async (reward: Reward) => {
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
  }, []);

  const openViewRewardModal = useCallback((reward: Reward) => {
    setViewingReward(reward);
    setEditingReward(null);
    setShowRewardModal(true);
  }, []);

  const closeRewardModal = useCallback(() => {
    setShowRewardModal(false);
    setEditingReward(null);
    setViewingReward(null);
    resetRewardForm();
  }, [resetRewardForm]);

  return {
    showRewardModal,
    editingReward,
    viewingReward,
    rewardForm,
    setRewardForm,
    uploadingImage,
    setUploadingImage,
    selectedImageFile,
    setSelectedImageFile,
    imagePreview,
    setImagePreview,
    openCreateRewardModal,
    openEditRewardModal,
    openViewRewardModal,
    closeRewardModal,
    resetRewardForm,
  };
};
