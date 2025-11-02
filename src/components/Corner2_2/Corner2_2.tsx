'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import {
  Upload,
  Heart,
  Share2,
  MessageCircle,
  MoreHorizontal,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Post, CreatePostData } from '@/types';
import apiClient from '@/lib/api';
import { useNextAuth } from '@/hooks/useNextAuth';
import { useToast } from '@/hooks/use-toast';
import { useInputFix } from '@/hooks/useInputFix';
import { EmojiPicker } from '@/components/EmojiPicker';

export function Corner2_2() {
  const { isAuthenticated, user } = useNextAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { onKeyDown: handleInputKeyDown } = useInputFix();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const captionTextareaRef = useRef<HTMLTextAreaElement>(null);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Fetch highlighted posts only
  const { data: postsData, isLoading } = useQuery({
    queryKey: ['highlighted-posts', user?.id], // Include user ID in query key
    queryFn: () => apiClient.getHighlightedPosts(),
    enabled: isAuthenticated,
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
  });

  const posts = postsData?.data?.posts || [];

  // Fetch user actions to check which posts are liked
  const { data: userActionsData } = useQuery({
    queryKey: ['user-actions', user?.id], // Include user ID in query key
    queryFn: () => apiClient.getUserActions(),
    enabled: isAuthenticated && !!user,
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
  });

  const userActions = userActionsData?.data || [];
  const likedPostIds = userActions
    .filter(
      (action: { type: string; postId: string }) => action.type === 'LIKE'
    )
    .map((action: { type: string; postId: string }) => action.postId);

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: (postId: string) => apiClient.likePost(postId),
    onSuccess: data => {
      // Invalidate posts and user actions to refresh data
      queryClient.invalidateQueries({
        queryKey: ['highlighted-posts', user?.id],
      });
      queryClient.invalidateQueries({ queryKey: ['user-actions', user?.id] });
      // Invalidate user details to refresh points
      queryClient.invalidateQueries({ queryKey: ['userDetails', user?.id] });

      if (data.action === 'liked') {
        toast({
          title: 'Đã thích bài viết!',
          description: 'Cảm ơn bạn đã chia sẻ cảm xúc.',
          duration: 3000,
        });
      } else if (data.action === 'unliked') {
        toast({
          title: 'Đã bỏ thích bài viết',
          description: 'Bạn đã bỏ thích bài viết này.',
          duration: 3000,
        });
      }
    },
    onError: () => {
      toast({
        title: 'Lỗi',
        description: 'Không thể thích bài viết. Vui lòng thử lại.',
        variant: 'destructive',
        duration: 4000,
      });
    },
  });

  // Share mutation
  const shareMutation = useMutation({
    mutationFn: (postId: string) => apiClient.sharePost(postId),
    onSuccess: result => {
      // Invalidate posts to refresh global counts
      queryClient.invalidateQueries({
        queryKey: ['highlighted-posts', user?.id],
      });
      // Invalidate user details to refresh points
      queryClient.invalidateQueries({ queryKey: ['userDetails', user?.id] });
      // Invalidate point logs to refresh point history
      queryClient.invalidateQueries({ queryKey: ['pointHistory', user?.id] });

      // Show success message with points info
      toast({
        title: 'Chia sẻ thành công!',
        description:
          result.pointsMessage || 'Bài viết đã được chia sẻ thành công.',
        duration: 4000,
      });
    },
  });

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

    // Set selected file and create preview
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
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

    setUploading(true);
    try {
      // Upload file directly to backend
      const uploadResult = await apiClient.uploadFile(selectedFile);

      // Show upload success notification
      toast({
        title: 'Upload thành công!',
        description: 'Ảnh đã được tải lên thành công.',
        variant: 'success',
        duration: 3000,
      });

      // Create post
      const postData: CreatePostData = {
        imageUrl: uploadResult.data.url, // Fix: use uploadResult.data.url instead of uploadResult.url
        caption: caption || '',
      };

      const result = await apiClient.createPost(postData);

      queryClient.invalidateQueries({
        queryKey: ['highlighted-posts', user?.id],
      });
      // Invalidate user details to refresh points
      queryClient.invalidateQueries({ queryKey: ['userDetails', user?.id] });
      // Invalidate point logs to refresh point history
      queryClient.invalidateQueries({ queryKey: ['pointHistory', user?.id] });

      // Reset form
      setCaption('');
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Show success message with points info
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

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setCaption(prev => prev + emoji + ' ');
  };

  const handleCaptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    console.log('e:', e);
    console.log('Caption changed:', value);
    setCaption(value);
  };

  const handleLike = (postId: string) => {
    if (!isAuthenticated) {
      toast({
        title: 'Cần đăng nhập',
        description: 'Vui lòng đăng nhập để thích bài viết.',
        variant: 'destructive',
        duration: 4000,
      });
      return;
    }

    // Prevent duplicate calls
    if (likeMutation.isPending) {
      return;
    }
    likeMutation.mutate(postId);
  };

  const handleShare = (post: Post) => {
    if (!isAuthenticated) {
      toast({
        title: 'Cần đăng nhập',
        description: 'Vui lòng đăng nhập để chia sẻ bài viết.',
        variant: 'destructive',
        duration: 4000,
      });
      return;
    }

    // Tạo URL preview cho bài viết - Ưu tiên production URL
    // Facebook cần HTTPS và public URL để crawl meta tags
    const baseUrl =
      process.env.NEXT_PUBLIC_PUBLIC_URL ||
      (typeof window !== 'undefined' ? window.location.origin : null) ||
      process.env.NEXTAUTH_URL ||
      'https://tiger-frontend-eta.vercel.app'; // Fallback to production URL
    const postUrl = `${baseUrl}/posts/${post.id}`;
    const postTitle = post.caption || 'Bài viết nổi bật từ Tiger Mood Corner';
    const postDescription = post.caption
      ? `${post.caption.substring(0, 160)}...`
      : 'Khám phá thế giới cảm xúc qua những emoji đặc biệt. Tạo mood card cá nhân và chia sẻ với cộng đồng.';
    const postImage =
      'https://tiger-minio.fly.dev/tiger-uploads/uploads/1762095387737-mood-card-1760773086183.png';

    // Console log để kiểm tra URL preview
    console.log('🔗 Share URL Preview:', {
      postUrl,
      postTitle,
      postDescription,
      postImage,
      postId: post.id,
      isHighlighted: post.isHighlighted,
    });

    // Tạo Facebook Share URL
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
    console.log('📱 Facebook Share URL:', facebookShareUrl);

    // Mở popup Facebook Share Dialog
    const popup = window.open(
      facebookShareUrl,
      'facebook-share-dialog',
      'width=800,height=600,scrollbars=yes,resizable=yes'
    );

    // Kiểm tra nếu popup bị block
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      toast({
        title: 'Popup bị chặn',
        description: 'Vui lòng cho phép popup để chia sẻ.',
        variant: 'destructive',
        duration: 4000,
      });
      return;
    }

    // Focus vào popup
    if (popup) {
      popup.focus();
    }

    // Cập nhật share count
    shareMutation.mutate(post.id);
  };

  return (
    <div
      data-corner="2"
      className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 py-12 lg:py-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Góc Chia Sẻ
            </h2>
            <p className="text-xl sm:text-2xl lg:text-3xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Những khoảnh khắc đẹp được highlight bởi admin
            </p>
          </motion.div>
        </div>

        {/* Upload Section */}
        {isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-6 lg:p-8 mb-12"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              Chia sẻ khoảnh khắc của bạn
            </h3>

            {/* Caption Input */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  Caption
                </label>
                <EmojiPicker
                  onEmojiSelect={handleEmojiSelect}
                  textareaRef={captionTextareaRef}
                />
              </div>
              <textarea
                ref={captionTextareaRef}
                value={caption}
                onChange={handleCaptionChange}
                onKeyDown={handleInputKeyDown}
                placeholder="Chia sẻ cảm xúc của bạn..."
                className="w-full p-4 border-2 border-gray-200 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-lg font-normal"
                rows={3}
                autoComplete="off"
                spellCheck="false"
                inputMode="text"
                enterKeyHint="done"
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {caption.length}/500 ký tự
              </div>
            </div>

            {/* File Selection */}
            <div className="mb-6">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-blue-500/25 hover:scale-105 transition-all duration-300"
              >
                <Upload className="w-5 h-5 mr-2" />
                {selectedFile ? '📸 Chọn ảnh khác' : '📸 Chọn ảnh'}
              </Button>
            </div>

            {/* Image Preview */}
            {previewUrl && (
              <div className="mb-6">
                <div className="relative inline-block">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    width={400}
                    height={256}
                    className="max-w-full max-h-64 rounded-2xl shadow-lg object-cover"
                  />
                  <Button
                    onClick={handleRemoveFile}
                    className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 p-0 shadow-lg"
                  >
                    ×
                  </Button>
                </div>
              </div>
            )}

            {/* Upload Button */}
            {selectedFile && (
              <div className="flex justify-end">
                <Button
                  onClick={handleUploadPost}
                  disabled={uploading}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-3 text-lg rounded-xl shadow-lg hover:shadow-green-500/25 hover:scale-105 transition-all duration-300"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Đang đăng...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5 mr-2" />
                      Đăng bài
                    </>
                  )}
                </Button>
              </div>
            )}
          </motion.div>
        )}

        {/* Gallery */}
        <div className="space-y-8">
          {isLoading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto"></div>
              <p className="mt-6 text-gray-600 text-lg">Đang tải...</p>
            </div>
          ) : posts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center py-16"
            >
              <div className="w-32 h-32 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="w-16 h-16 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-4">
                Chưa có bài viết nổi bật nào
              </h3>
              <p className="text-gray-500 text-lg">
                Admin sẽ highlight những bài viết đẹp nhất!
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {posts.map((post: Post, index: number) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
                >
                  {/* Post Image */}
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    {post.imageUrl ? (
                      <Image
                        src={post.imageUrl}
                        alt={post.caption || 'Post image'}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <Upload className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Highlight Badge */}
                    {post.isHighlighted && (
                      <div className="absolute top-3 left-3">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full shadow-lg flex items-center space-x-1">
                          <Star className="w-4 h-4" />
                          <span className="text-xs font-semibold">Nổi bật</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Post Content */}
                  <div className="p-4">
                    {/* User Info */}
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {post.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {post.user.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Caption */}
                    {post.caption && (
                      <p className="text-gray-800 text-sm mb-4 line-clamp-2">
                        {post.caption}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center space-x-1 text-sm transition-colors duration-200 ${
                            likedPostIds.includes(post.id)
                              ? 'text-red-500 hover:text-red-600 hover:bg-red-50'
                              : 'text-gray-500 hover:text-red-400 hover:bg-red-50'
                          }`}
                        >
                          <Heart
                            className={`w-4 h-4 transition-colors duration-200 ${
                              likedPostIds.includes(post.id)
                                ? 'fill-red-500'
                                : ''
                            }`}
                          />
                          <span>{post.likeCount || 0}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center space-x-1 text-gray-500 text-sm hover:bg-blue-50"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.commentCount || 0}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShare(post)}
                          className="flex items-center space-x-1 text-gray-500 text-sm hover:bg-green-50"
                        >
                          <Share2 className="w-4 h-4" />
                          <span>{post.shareCount || 0}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
