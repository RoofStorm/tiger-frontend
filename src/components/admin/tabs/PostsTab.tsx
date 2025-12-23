import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Star, StarOff, X, ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import { useConfirm } from '@/hooks/useConfirm';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { FilterBar } from '../FilterBar';
import { Pagination } from '../Pagination';
import { ActionButton } from '../ActionButton';
import Image from 'next/image';
import { Modal } from '@/components/ui/modal';

interface Post {
  id: string;
  caption: string;
  type: string;
  imageUrl?: string;
  url?: string;
  likeCount: number;
  shareCount: number;
  commentCount: number;
  isHighlighted: boolean;
  createdAt?: string;
  user?: {
    name: string;
  };
}

interface FilterState {
  role?: string;
  status?: string;
  type?: string;
  month?: string;
  year?: string;
  isHighlighted?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
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
    month: '',
    year: '',
    isHighlighted: '',
    sortBy: '',
    sortOrder: 'desc',
  });
  const [highlightingPosts, setHighlightingPosts] = useState<Set<string>>(
    new Set()
  );
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

  // Fetch posts data with server-side pagination
  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ['admin-posts', currentPage, postFilters],
    queryFn: () =>
      apiClient.getAdminPosts(currentPage, 10, {
        highlighted:
          postFilters.isHighlighted === 'true'
            ? true
            : postFilters.isHighlighted === 'false'
              ? false
              : undefined,
        month: postFilters.month ? parseInt(postFilters.month) : undefined,
        year: postFilters.year ? parseInt(postFilters.year) : undefined,
        sortBy: postFilters.sortBy || undefined,
        sortOrder: postFilters.sortOrder || undefined,
      }),
    enabled: isAdmin,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const posts = useMemo(() => postsData?.data?.data || [], [postsData]);
  const totalPosts = useMemo(() => postsData?.data?.total || 0, [postsData]);
  const totalPages = useMemo(() => Math.ceil(totalPosts / 10), [totalPosts]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [postFilters]);

  // Reset to page 1 if current page is greater than total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

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

  // Handle sort click: desc -> asc -> no sort
  const handleSortClick = useCallback(
    (field: string) => {
      if (postFilters.sortBy !== field) {
        // Click lần đầu: sort desc
        setPostFilters({
          ...postFilters,
          sortBy: field,
          sortOrder: 'desc',
        });
      } else if (postFilters.sortOrder === 'desc') {
        // Click lần 2: sort asc
        setPostFilters({
          ...postFilters,
          sortBy: field,
          sortOrder: 'asc',
        });
      } else {
        // Click lần 3: bỏ sort
        setPostFilters({
          ...postFilters,
          sortBy: '',
          sortOrder: 'desc',
        });
      }
    },
    [postFilters]
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
          Hiển thị {posts.length} trong tổng số {totalPosts} bài viết
          {postFilters.type && ' (đã lọc)'}
        </p>
        {posts.length === 0 && totalPosts > 0 && (
          <p className="text-sm text-amber-600">
            Không tìm thấy kết quả phù hợp với bộ lọc
          </p>
        )}
        {totalPosts === 0 && (
          <p className="text-sm text-amber-600">Chưa có bài viết nào</p>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200" style={{ tableLayout: 'fixed', width: '100%' }}>
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '100px' }}>
                Ảnh
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '250px' }}>
                Nội dung
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSortClick('userName')}
                style={{ width: '170px' }}
              >
                <div className="flex items-center gap-1">
                  Người đăng
                  {postFilters.sortBy === 'userName' ? (
                    postFilters.sortOrder === 'asc' ? (
                      <ArrowUp className="w-4 h-4 text-blue-600" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-blue-600" />
                    )
                  ) : (
                    <ArrowUpDown className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSortClick('isHighlighted')}
                style={{ width: '150px' }}
              >
                <div className="flex items-center gap-1">
                  Highlight
                  {postFilters.sortBy === 'isHighlighted' ? (
                    postFilters.sortOrder === 'asc' ? (
                      <ArrowUp className="w-4 h-4 text-blue-600" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-blue-600" />
                    )
                  ) : (
                    <ArrowUpDown className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSortClick('likeCount')}
                style={{ width: '180px' }}
              >
                <div className="flex items-center gap-1">
                  Lượt thích
                  {postFilters.sortBy === 'likeCount' ? (
                    postFilters.sortOrder === 'asc' ? (
                      <ArrowUp className="w-4 h-4 text-blue-600" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-blue-600" />
                    )
                  ) : (
                    <ArrowUpDown className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSortClick('createdAt')}
                style={{ width: '180px' }}
              >
                <div className="flex items-center gap-1">
                  Ngày tạo
                  {postFilters.sortBy === 'createdAt' ? (
                    postFilters.sortOrder === 'asc' ? (
                      <ArrowUp className="w-4 h-4 text-blue-600" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-blue-600" />
                    )
                  ) : (
                    <ArrowUpDown className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" style={{ width: '140px' }}>
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {posts.map((post: Post) => (
              <tr key={post.id}>
                <td className="px-6 py-4 whitespace-nowrap" style={{ width: '100px' }}>
                  {post.imageUrl || post.url ? (
                    <div
                      className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() =>
                        setSelectedImageUrl(post.imageUrl || post.url || null)
                      }
                    >
                      <Image
                        src={post.imageUrl || post.url || ''}
                        alt={post.caption || 'Bài viết'}
                        fill
                        className="object-cover"
                        sizes="64px"
                        unoptimized={
                          (post.imageUrl || post.url || '').includes(
                            'platform-lookaside.fbsbx.com'
                          )
                        }
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">Không có ảnh</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4" style={{ width: '250px' }}>
                  <div className="text-sm text-gray-900 truncate">
                    {post.caption || 'Không có nội dung'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" style={{ width: '170px' }}>
                  {post.user?.name || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap" style={{ width: '150px' }}>
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" style={{ width: '180px' }}>
                  {post.likeCount || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" style={{ width: '180px' }}>
                  {post.createdAt
                    ? new Date(post.createdAt).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" style={{ width: '140px' }}>
                  <div className="flex items-center space-x-2">
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
        total={totalPosts}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        itemsPerPage={10}
      />

      {/* Image Preview Modal */}
      <Modal
        isOpen={!!selectedImageUrl}
        onClose={() => setSelectedImageUrl(null)}
        maxWidth="2xl"
        showHeader={false}
        showCloseButton={false}
      >
        <div className="relative w-full h-[60vh] bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center p-4">
          {selectedImageUrl && (
            <Image
              src={selectedImageUrl}
              alt="Preview"
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 768px"
              unoptimized={selectedImageUrl.includes(
                'platform-lookaside.fbsbx.com'
              )}
            />
          )}
          {/* Close button inside content */}
          <button
            onClick={() => setSelectedImageUrl(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/90 hover:bg-white text-gray-800 transition-colors z-10"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </Modal>
    </div>
  );
};
