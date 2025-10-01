'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Users, 
  Image, 
  Gift, 
  TrendingUp, 
  Pin, 
  CheckCircle, 
  XCircle,
  Clock,
  Filter
} from 'lucide-react';
import apiClient from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function AdminPage() {
  const { isAdmin, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');

  // Fetch admin stats
  const { data: statsData } = useQuery({
    queryKey: ['adminStats'],
    queryFn: () => apiClient.getAdminStats(),
    enabled: isAuthenticated && isAdmin,
  });

  // Fetch redeem logs
  const { data: redeemLogsData } = useQuery({
    queryKey: ['redeemLogs'],
    queryFn: () => apiClient.getRedeemLogs(),
    enabled: isAuthenticated && isAdmin,
  });

  // Fetch posts for pinning
  const { data: postsData } = useQuery({
    queryKey: ['adminPosts'],
    queryFn: () => apiClient.getPosts(1, 50),
    enabled: isAuthenticated && isAdmin,
  });

  // Pin post mutation
  const pinPostMutation = useMutation({
    mutationFn: (postId: string) => apiClient.pinPost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminPosts'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast({
        title: 'Đã ghim bài viết',
        description: 'Bài viết đã được ghim thành công.',
      });
    },
  });

  // Update redeem status mutation
  const updateRedeemMutation = useMutation({
    mutationFn: ({ redeemId, status }: { redeemId: string; status: string }) => 
      apiClient.updateRedeemStatus(redeemId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['redeemLogs'] });
      toast({
        title: 'Đã cập nhật trạng thái',
        description: 'Trạng thái đã được cập nhật thành công.',
      });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Cần đăng nhập
          </h1>
          <p className="text-gray-600 mb-6">
            Vui lòng đăng nhập để truy cập trang quản trị.
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Không có quyền truy cập
          </h1>
          <p className="text-gray-600 mb-6">
            Bạn không có quyền truy cập trang quản trị.
          </p>
        </div>
      </div>
    );
  }

  const stats = statsData?.data || {};
  const redeemLogs = redeemLogsData?.data || [];
  const posts = postsData?.data || [];

  const filteredRedeemLogs = filter === 'all' 
    ? redeemLogs 
    : redeemLogs.filter((log: any) => log.status === filter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-20">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Bảng điều khiển quản trị
          </h1>
          <p className="text-gray-600">
            Quản lý nội dung và theo dõi hoạt động của người dùng
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng người dùng</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalUsers || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tổng bài viết</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalPosts || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Image className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Yêu cầu đổi quà</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalRedeems || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Gift className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Điểm đã trao</p>
                <p className="text-3xl font-bold text-gray-900">
                  {stats.totalPointsAwarded || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Posts Management */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Quản lý bài viết
            </h2>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {posts.map((post: any) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <img
                      src={post.imageUrl}
                      alt={post.caption}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {post.user.name}
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {post.caption}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {post.isPinned && (
                      <Pin className="w-4 h-4 text-yellow-500" />
                    )}
                    <Button
                      size="sm"
                      onClick={() => pinPostMutation.mutate(post.id)}
                      disabled={pinPostMutation.isPending}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      {post.isPinned ? 'Bỏ ghim' : 'Ghim'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Redeem Logs */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Lịch sử đổi quà
              </h2>
              
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tất cả</option>
                <option value="pending">Chờ duyệt</option>
                <option value="approved">Đã duyệt</option>
                <option value="completed">Hoàn thành</option>
                <option value="rejected">Từ chối</option>
              </select>
            </div>
            
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredRedeemLogs.map((redeem: any) => (
                <div
                  key={redeem.id}
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900">
                        {redeem.user.name}
                      </span>
                      <span className="text-sm text-gray-500">
                        đổi {redeem.reward.name}
                      </span>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      redeem.status === 'completed' ? 'bg-green-100 text-green-800' :
                      redeem.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                      redeem.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {redeem.status === 'completed' ? 'Hoàn thành' :
                       redeem.status === 'approved' ? 'Đã duyệt' :
                       redeem.status === 'rejected' ? 'Từ chối' :
                       'Chờ duyệt'}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    <p>Người nhận: {redeem.receiverName}</p>
                    <p>Điện thoại: {redeem.receiverPhone}</p>
                    <p>Địa chỉ: {redeem.receiverAddress}</p>
                    <p>Điểm sử dụng: {redeem.pointsUsed}</p>
                  </div>
                  
                  {redeem.status === 'pending' && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() => updateRedeemMutation.mutate({ 
                          redeemId: redeem.id, 
                          status: 'approved' 
                        })}
                        disabled={updateRedeemMutation.isPending}
                        className="bg-green-500 hover:bg-green-600 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Duyệt
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateRedeemMutation.mutate({ 
                          redeemId: redeem.id, 
                          status: 'rejected' 
                        })}
                        disabled={updateRedeemMutation.isPending}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Từ chối
                      </Button>
                    </div>
                  )}
                  
                  {redeem.status === 'approved' && (
                    <Button
                      size="sm"
                      onClick={() => updateRedeemMutation.mutate({ 
                        redeemId: redeem.id, 
                        status: 'completed' 
                      })}
                      disabled={updateRedeemMutation.isPending}
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Hoàn thành
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

