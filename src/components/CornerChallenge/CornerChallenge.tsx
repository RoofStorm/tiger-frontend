'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { Upload, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreatePostData, Post } from '@/types';
import apiClient from '@/lib/api';
import { useNextAuth } from '@/hooks/useNextAuth';
import { useToast } from '@/hooks/use-toast';
import { useInputFix } from '@/hooks/useInputFix';

export function CornerChallenge() {
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

  // Fetch highlighted posts (tối đa 5 bài)
  const { data: postsData, isLoading } = useQuery({
    queryKey: ['highlighted-posts-challenge', user?.id],
    queryFn: () => apiClient.getHighlightedPosts(),
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
  });

  const posts = Array.isArray(postsData?.data?.posts)
    ? postsData.data.posts.slice(0, 5) // Giới hạn tối đa 5 bài
    : [];

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[45%_55%] gap-8 lg:gap-12">
          {/* Left Column - Upload và Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {/* Title */}
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-blue-900 leading-tight">
                Khoảnh khắc giữ nhịp – bữa trưa của bạn có câu chuyện gì?
              </h2>
              <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                Một hộp cơm giản dị, một bình nước bên bàn làm việc, hay nụ cười
                bên đồng nghiệp cũng đủ trở thành &quot;nhịp giữ&quot; trong
                ngày bận rộn. Hãy lưu giữ và chia sẻ khoảnh khắc trưa nay – để
                thấy nhịp sống của mình cũng đang hòa chung cùng mọi người.
              </p>
            </div>

            {/* Upload Area */}
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-white hover:border-blue-400 transition-colors cursor-pointer"
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
              {!selectedFile ? (
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                      <Upload className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                  <p className="text-gray-700 font-medium mb-2">
                    Nhấn tải ảnh hoặc kéo ảnh lên
                  </p>
                  <p className="text-sm text-gray-500">SVG, PNG, JPG</p>
                </div>
              ) : (
                <div className="text-center">
                  {previewUrl && (
                    <div className="mb-4">
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        width={200}
                        height={200}
                        className="mx-auto rounded-lg object-cover"
                      />
                    </div>
                  )}
                  <p className="text-sm text-gray-600 mb-2">
                    {selectedFile.name}
                  </p>
                  <Button
                    onClick={e => {
                      e.stopPropagation();
                      handleRemoveFile();
                    }}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Xóa
                  </Button>
                </div>
              )}
            </div>

            {/* Upload Progress */}
            {uploading && selectedFile && (
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-600">
                        JPG
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {selectedFile.name}
                    </span>
                  </div>
                  <Button
                    onClick={handleRemoveFile}
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>
                      {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB of{' '}
                      {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
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
                <p className="text-xs text-blue-600">Uploading...</p>
              </div>
            )}

            {/* Text Input */}
            <div>
              <textarea
                ref={captionTextareaRef}
                value={caption}
                onChange={handleCaptionChange}
                onKeyDown={handleInputKeyDown}
                placeholder="Câu chuyện của bạn..."
                rows={6}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg resize-none focus:outline-none focus:border-blue-500 text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Upload Post Button */}
            <Button
              onClick={handleUploadPost}
              disabled={!selectedFile || uploading || !isAuthenticated}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {uploading ? 'Đang đăng...' : 'Đăng bài'}
            </Button>
          </motion.div>

          {/* Right Column - Highlighted Posts Grid */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            {isLoading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div
                    key={i}
                    className="aspect-square bg-gray-200 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : posts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {posts.map((post: Post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer hover:scale-105 transition-transform duration-300"
                  >
                    {post.imageUrl ? (
                      <Image
                        src={post.imageUrl}
                        alt={post.caption || 'Post image'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>Chưa có bài viết nào được highlight</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
