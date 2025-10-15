import React, { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, Eye, Star, StarOff } from 'lucide-react';
import { useConfirm } from '@/hooks/useConfirm';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { FilterBar } from '../FilterBar';
import { Pagination } from '../Pagination';
import { ActionButton } from '../ActionButton';

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

interface PostsTabProps {
  isAdmin: boolean;
}

export const PostsTab: React.FC<PostsTabProps> = ({ isAdmin }) => {
  const { confirm } = useConfirm();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [postFilters, setPostFilters] = useState<FilterState>({
    type: '',
  });
  const [highlightingPosts, setHighlightingPosts] = useState<Set<string>>(
    new Set()
  );

  // Fetch posts data
  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['admin-posts'],
    queryFn: () => apiClient.getPosts(),
    enabled: isAdmin,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const allPosts = useMemo(() => postsData?.data?.posts || [], [postsData]);

  // Filter functions
  const filterPosts = useCallback(
    (posts: Post[]) => {
      return posts.filter(post => {
        const matchesType = !postFilters.type || post.type === postFilters.type;
        return matchesType;
      });
    },
    [postFilters]
  );

  const posts = useMemo(() => filterPosts(allPosts), [allPosts, filterPosts]);

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
          duration: 3000,
        });
      } catch (error) {
        console.error('Failed to highlight post:', error);
        toast({
          title: 'Lỗi',
          description: 'Không thể highlight bài viết. Vui lòng thử lại.',
          variant: 'destructive',
          duration: 4000,
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
          duration: 3000,
        });
      } catch (error) {
        console.error('Failed to unhighlight post:', error);
        toast({
          title: 'Lỗi',
          description: 'Không thể bỏ highlight bài viết. Vui lòng thử lại.',
          variant: 'destructive',
          duration: 4000,
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

  if (postsLoading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  return (
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
                    <ActionButton
                      variant="ghost"
                      size="sm"
                      tooltip="Xem chi tiết"
                    >
                      <Eye className="w-4 h-4" />
                    </ActionButton>
                    {post.isHighlighted ? (
                      <ActionButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleUnhighlightPost(post.id)}
                        disabled={highlightingPosts.has(post.id)}
                        className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 disabled:opacity-50"
                        tooltip="Bỏ highlight"
                      >
                        {highlightingPosts.has(post.id) ? (
                          <div className="w-4 h-4 animate-spin rounded-full border-2 border-yellow-600 border-t-transparent" />
                        ) : (
                          <StarOff className="w-4 h-4" />
                        )}
                      </ActionButton>
                    ) : (
                      <ActionButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleHighlightPost(post.id)}
                        disabled={highlightingPosts.has(post.id)}
                        className="text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 disabled:opacity-50"
                        tooltip="Highlight bài viết"
                      >
                        {highlightingPosts.has(post.id) ? (
                          <div className="w-4 h-4 animate-spin rounded-full border-2 border-yellow-600 border-t-transparent" />
                        ) : (
                          <Star className="w-4 h-4" />
                        )}
                      </ActionButton>
                    )}
                    <ActionButton
                      variant="ghost"
                      size="sm"
                      tooltip="Chỉnh sửa bài viết"
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
                    >
                      <Edit className="w-4 h-4" />
                    </ActionButton>
                    <ActionButton
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      tooltip="Xóa bài viết"
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
        total={posts.length}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};
