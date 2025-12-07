'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { CreatePostData } from '@/types';
import apiClient from '@/lib/api';
import { useNextAuth } from '@/hooks/useNextAuth';
import { useToast } from '@/hooks/use-toast';
import { useInputFix } from '@/hooks/useInputFix';
import { Modal } from '@/components/ui/modal';

export function LunchboxUploadSection() {
  const { isAuthenticated, user } = useNextAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { onKeyDown: handleInputKeyDown } = useInputFix();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const captionTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCaptionModal, setShowCaptionModal] = useState(false);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isAuthenticated) {
      toast({
        title: 'Cần đăng nhập',
        description: 'Vui lòng đăng nhập để chia sẻ ảnh.',
        variant: 'destructive',
        duration: 4000,
      });
      return;
    }

    // Validate file type
    const validTypes = [
      'image/svg+xml',
      'image/png',
      'image/jpeg',
      'image/jpg',
    ];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Định dạng không hợp lệ',
        description: 'Vui lòng chọn file SVG, PNG hoặc JPG.',
        variant: 'destructive',
        duration: 4000,
      });
      return;
    }

    // Set selected file and create preview
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setUploadProgress(0);
    // Show caption modal when file is selected
    setShowCaptionModal(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    // Simulate file input change
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    if (fileInputRef.current) {
      fileInputRef.current.files = dataTransfer.files;
      const event = new Event('change', { bubbles: true });
      fileInputRef.current.dispatchEvent(event);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setUploadProgress(0);
    setShowCaptionModal(false);
    setCaption('');
  };

  const handleUploadPost = async () => {
    if (!selectedFile) {
      toast({
        title: 'Chưa chọn ảnh',
        description: 'Vui lòng chọn ảnh để đăng bài.',
        variant: 'destructive',
        duration: 4000,
      });
      return;
    }

    if (!isAuthenticated) {
      toast({
        title: 'Cần đăng nhập',
        description: 'Vui lòng đăng nhập để đăng bài.',
        variant: 'destructive',
        duration: 4000,
      });
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload file directly to backend
      const uploadResult = await apiClient.uploadFile(selectedFile);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Create post
      const postData: CreatePostData = {
        imageUrl: uploadResult.data.url,
        caption: caption || '',
      };

      const result = await apiClient.createPost(postData);

      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: ['highlighted-posts-challenge', user?.id],
      });
      queryClient.invalidateQueries({ queryKey: ['userDetails', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['pointHistory', user?.id] });

      // Reset form
      setCaption('');
      setSelectedFile(null);
      setPreviewUrl(null);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Show success message
      toast({
        title: 'Đăng bài thành công!',
        description:
          result.pointsMessage || 'Bài viết của bạn đã được chia sẻ.',
        variant: 'success',
        duration: 4000,
      });
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: 'Đăng bài thất bại',
        description: 'Vui lòng thử lại sau.',
        variant: 'destructive',
        duration: 4000,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCaption(e.target.value);
  };

  return (
    <>
      {/* Bottom Section - Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mt-20 rounded-lg"
        style={{ backgroundColor: '#004EA3' }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Image */}
          <div className="relative w-full h-full min-h-[400px] lg:min-h-[600px]">
            <Image
              src="/thuthachnhipsong/upload_section.png"
              alt="Upload section"
              fill
              className="object-cover rounded-lg"
            />
          </div>

          {/* Right Column - Upload và Input */}
          <div 
            className="space-y-6 p-8 lg:p-12"
            style={{ 
              backgroundImage: 'url(/thuthachnhipsong/upload_background.png)',
              backgroundSize: '90%',
              backgroundPosition: 'center top',
              backgroundRepeat: 'no-repeat',
            }}
          >
          {/* Title */}
          <div className="space-y-4 mt-2">
              <h2 className="font-prata font-bold text-white leading-tight text-center" style={{ fontSize: '28px' }}>
              Khoảnh khắc giữ nhịp – bữa trưa của bạn có câu chuyện gì?
            </h2>
             
          </div>

          {/* Upload Area */}
          <div
            className="rounded-lg p-8 transition-colors cursor-pointer"
            style={{ backgroundColor: '#FFFFFF1A', border: '0.5px solid #DCDCDC' }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/svg+xml,image/png,image/jpeg,image/jpg"
              onChange={handleFileSelect}
              className="hidden"
            />
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 flex items-center justify-center">
                    <Image
                      src="/icons/upload.png"
                      alt="Upload"
                      width={48}
                      height={48}
                      className="w-12 h-12"
                    />
                  </div>
                </div>
                <p className="font-medium mb-2" style={{ color: '#DCDCDC', fontSize: '12px' }}>
                  Nhấn tải ảnh hoặc kéo ảnh lên
                </p>
                <p className="text-sm" style={{ color: '#DCDCDC', fontSize: '12px' }}>SVG, PNG, JPG</p>
              </div>
          </div>

          {/* File Info Display - Shown when file is selected but not uploading */}
          {selectedFile && !uploading && (
            <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: '#FFFFFF1A', border: '0.5px solid #DCDCDC' }}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                    <Image
                    src="/icons/jpg_file.png"
                    alt="File icon"
                    width={40}
                    height={40}
                    className="flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-300 mt-1">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="flex-shrink-0 p-2 hover:opacity-80 transition-opacity"
                  type="button"
                >
                  <Image
                    src="/icons/trash.png"
                    alt="Delete"
                    width={20}
                    height={20}
                  />
                </button>
              </div>
              </div>
            )}

          {/* Upload Progress */}
          {uploading && selectedFile && (
            <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: '#FFFFFF1A', border: '0.5px solid #DCDCDC' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Image
                    src="/icons/jpg_file.png"
                    alt="File icon"
                    width={40}
                    height={40}
                    className="flex-shrink-0"
                  />
                  <div>
                    <p className="text-sm font-medium text-white">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-300 mt-1">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveFile}
                  className="flex-shrink-0 p-2 hover:opacity-80 transition-opacity"
                  type="button"
                >
                  <Image
                    src="/icons/trash.png"
                    alt="Delete"
                    width={20}
                    height={20}
                  />
                </button>
              </div>
              <div className="mb-2">
                <div className="flex justify-between text-xs text-white mb-1">
                  <span>
                    {(selectedFile.size / (1024 * 1024) * uploadProgress / 100).toFixed(2)} MB of{' '}
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Image
                  src="/icons/upload.png"
                  alt="Uploading"
                  width={16}
                  height={16}
                />
                <p className="text-xs text-white">Uploading...</p>
              </div>
            </div>
          )}

          {/* Text Input - Hidden, will show in modal */}

          {/* Upload Post Button */}
          <Button
            onClick={handleUploadPost}
            disabled={!selectedFile || uploading || !isAuthenticated}
            className="w-full font-medium py-3 rounded-lg transition-all duration-300"
            style={{ backgroundColor: '#ffffff', color: '#00579F' }}
          >
            {uploading ? 'Đang chia sẻ...' : 'Chia sẻ ngay!'}
          </Button>
          </div>
        </div>


        {/* Caption Modal */}
        <Modal
          isOpen={showCaptionModal && !!selectedFile}
          onClose={() => setShowCaptionModal(false)}
          showCloseButton={true}
          showHeader={true}
          headerTitle="Câu chuyện của bạn"
          maxWidth="md"
          closeOnBackdropClick={true}
        >
          <div className="space-y-4">
            <textarea
              ref={captionTextareaRef}
              value={caption}
              onChange={handleCaptionChange}
              onKeyDown={handleInputKeyDown}
              placeholder="Câu chuyện của bạn..."
              rows={6}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg resize-none focus:outline-none focus:border-blue-500 text-gray-700 placeholder-gray-400 font-noto-sans"
            />
            <div className="flex gap-4 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCaptionModal(false);
                  setCaption('');
                }}
              >
                Hủy
              </Button>
              <Button
                onClick={() => {
                  setShowCaptionModal(false);
                }}
                className="bg-[#00579F] text-white hover:bg-[#004080]"
              >
                Xác nhận
              </Button>
            </div>
          </div>
        </Modal>
      </motion.div>
    </>
  );
}

