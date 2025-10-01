'use client';

import { useState, useRef } from 'react';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Góc Chia Sẻ
          </h2>
          <p className="text-xl md:text-2xl text-gray-600">
            Chia sẻ khoảnh khắc đẹp và kết nối với cộng đồng
          </p>
        </div>

        {/* Upload Section */}
        {isAuthenticated && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <textarea
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Chia sẻ cảm xúc của bạn..."
                  className="w-full p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>
              <div className="flex flex-col space-y-2">
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
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Đang tải...' : 'Chọn ảnh'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Gallery */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-gray-600 text-lg">Chưa có bài viết nào</p>
              <p className="text-gray-500">Hãy là người đầu tiên chia sẻ!</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {posts.map((post: Post) => (
                <div key={post.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  {/* Post Header */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {post.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{post.user.name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {post.isPinned && (
                        <Pin className="w-4 h-4 text-yellow-500" />
                      )}
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Post Image */}
                  <div className="aspect-video bg-gray-100">
                    <img
                      src={post.imageUrl}
                      alt={post.caption}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Post Caption */}
                  {post.caption && (
                    <div className="p-4">
                      <p className="text-gray-800">{post.caption}</p>
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="px-4 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center space-x-2 ${
                            post.isLiked ? 'text-red-500' : 'text-gray-500'
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                          <span>{post.likes}</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center space-x-2 text-gray-500"
                        >
                          <MessageCircle className="w-5 h-5" />
                          <span>0</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShare(post.id)}
                          className="flex items-center space-x-2 text-gray-500"
                        >
                          <Share2 className="w-5 h-5" />
                          <span>{post.shares}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

