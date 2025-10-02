'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Upload, Heart, Share2, MessageCircle, Pin, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Post, CreatePostData } from '@/types';
import apiClient from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export function Corner2() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [caption, setCaption] = useState('');

  // Fetch posts
  const { data: postsData, isLoading } = useQuery({
    queryKey: ['posts'],
    queryFn: () => apiClient.getPosts(),
    enabled: isAuthenticated,
  });

  const posts = postsData?.data || [];

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: (postId: string) => apiClient.likePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast({
        title: 'Đã thích bài viết!',
        description: 'Cảm ơn bạn đã chia sẻ cảm xúc.',
      });
    },
    onError: () => {
      toast({
        title: 'Lỗi',
        description: 'Không thể thích bài viết. Vui lòng thử lại.',
        variant: 'destructive',
      });
    },
  });

  // Share mutation
  const shareMutation = useMutation({
    mutationFn: (postId: string) => apiClient.sharePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast({
        title: 'Đã chia sẻ!',
        description: 'Bài viết đã được chia sẻ thành công.',
      });
    },
  });

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isAuthenticated) {
      toast({
        title: 'Cần đăng nhập',
        description: 'Vui lòng đăng nhập để chia sẻ ảnh.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);
    try {
      // Get signed upload URL
      const { data: uploadData } = await apiClient.getSignedUploadUrl(
        file.name,
        file.type
      );

      // Upload file to S3
      const formData = new FormData();
      Object.entries(uploadData.fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      formData.append('file', file);

      const uploadResponse = await fetch(uploadData.signedUrl, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Upload failed');
      }

      // Create post
      const postData: CreatePostData = {
        imageUrl: uploadData.publicUrl,
        caption: caption || '',
      };

      await apiClient.createPost(postData);
      
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      setCaption('');
      
      toast({
        title: 'Đã chia sẻ!',
        description: 'Ảnh của bạn đã được đăng thành công.',
      });
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: 'Lỗi upload',
        description: 'Không thể tải lên ảnh. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleLike = (postId: string) => {
    if (!isAuthenticated) {
      toast({
        title: 'Cần đăng nhập',
        description: 'Vui lòng đăng nhập để thích bài viết.',
        variant: 'destructive',
      });
      return;
    }
    likeMutation.mutate(postId);
  };

  const handleShare = (postId: string) => {
    if (!isAuthenticated) {
      toast({
        title: 'Cần đăng nhập',
        description: 'Vui lòng đăng nhập để chia sẻ bài viết.',
        variant: 'destructive',
      });
      return;
    }
    shareMutation.mutate(postId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50 py-12 lg:py-20">
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
              Chia sẻ khoảnh khắc đẹp và kết nối với cộng đồng
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
            <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-6">
              <div className="flex-1 w-full">
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Chia sẻ cảm xúc của bạn..."
                  className="w-full p-4 border-2 border-gray-200 rounded-2xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 text-lg"
                  rows={3}
                />
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
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
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-blue-500/25 hover:scale-105 transition-all duration-300"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  {uploading ? 'Đang tải...' : '📸 Chọn ảnh'}
                </Button>
              </div>
            </div>
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
              <h3 className="text-2xl font-bold text-gray-700 mb-4">Chưa có bài viết nào</h3>
              <p className="text-gray-500 text-lg">Hãy là người đầu tiên chia sẻ!</p>
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
                    <img
                      src={post.imageUrl}
                      alt={post.caption}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Pin Badge */}
                    {post.isPinned && (
                      <div className="absolute top-3 right-3">
                        <div className="bg-yellow-500 text-white p-2 rounded-full shadow-lg">
                          <Pin className="w-4 h-4" />
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
                        <p className="font-semibold text-gray-900 text-sm truncate">{post.user.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Caption */}
                    {post.caption && (
                      <p className="text-gray-800 text-sm mb-4 line-clamp-2">{post.caption}</p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center space-x-1 text-sm ${
                            post.isLiked ? 'text-red-500' : 'text-gray-500'
                          } hover:bg-red-50`}
                        >
                          <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                          <span>{post.likes}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center space-x-1 text-gray-500 text-sm hover:bg-blue-50"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>0</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShare(post.id)}
                          className="flex items-center space-x-1 text-gray-500 text-sm hover:bg-green-50"
                        >
                          <Share2 className="w-4 h-4" />
                          <span>{post.shares}</span>
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

