import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Star, StarOff, Trash2, Eye } from 'lucide-react';
import apiClient from '@/lib/api';
import { Wish } from '../types';
import { ActionButton } from '../ActionButton';

interface WishesTabProps {
  isAdmin: boolean;
}

export const WishesTab = ({ isAdmin }: WishesTabProps) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);
  const [highlightFilter, setHighlightFilter] = useState<boolean | undefined>(
    undefined
  );

  // Fetch wishes data
  const { data: wishesData, isLoading: wishesLoading } = useQuery({
    queryKey: ['admin-wishes', page, highlightFilter],
    queryFn: () => apiClient.getAllWishes(page, perPage, highlightFilter),
  });

  // Toggle highlight mutation
  const toggleHighlightMutation = useMutation({
    mutationFn: (wishId: string) => apiClient.toggleWishHighlight(wishId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-wishes'] });
      toast({
        title: 'Thành công',
        description: 'Trạng thái highlight đã được cập nhật',
        variant: 'success',
      });
    },
    onError: () => {
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật trạng thái highlight',
        variant: 'destructive',
      });
    },
  });

  // Delete wish mutation
  const deleteWishMutation = useMutation({
    mutationFn: (wishId: string) => apiClient.deleteWish(wishId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-wishes'] });
      toast({
        title: 'Thành công',
        description: 'Lời chúc đã được xóa',
        variant: 'success',
      });
    },
    onError: () => {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa lời chúc',
        variant: 'destructive',
      });
    },
  });

  const wishes: Wish[] = wishesData?.data?.data || [];
  const totalWishes = wishesData?.data?.total || 0;

  const handleToggleHighlight = (wishId: string) => {
    toggleHighlightMutation.mutate(wishId);
  };

  const handleDeleteWish = (wishId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa lời chúc này?')) {
      deleteWishMutation.mutate(wishId);
    }
  };

  const renderPagination = () => {
    const totalPages = Math.ceil(totalWishes / perPage);
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-sm text-gray-700">
          Hiển thị {Math.min((page - 1) * perPage + 1, totalWishes)} đến{' '}
          {Math.min(page * perPage, totalWishes)} trong tổng số {totalWishes}{' '}
          lời chúc
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            ←
          </Button>
          <span className="text-sm text-gray-700">
            Trang {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            →
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Quản lý lời chúc</h2>
        <div className="flex items-center space-x-4">
          <select
            value={
              highlightFilter === undefined ? '' : highlightFilter.toString()
            }
            onChange={e => {
              const value = e.target.value;
              setHighlightFilter(value === '' ? undefined : value === 'true');
              setPage(1);
            }}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Tất cả</option>
            <option value="true">Đã highlight</option>
            <option value="false">Chưa highlight</option>
          </select>
        </div>
      </div>

      {wishesLoading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : wishes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Chưa có lời chúc nào
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người gửi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nội dung
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {wishes.map((wish: Wish) => (
                  <tr key={wish.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mr-3">
                          <span className="text-white font-bold text-sm">
                            {wish.user?.name?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {wish.user?.name || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {wish.user?.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-md">
                        <div className="line-clamp-3">{wish.content}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          wish.isHighlighted
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {wish.isHighlighted
                          ? '⭐ Đã highlight'
                          : 'Chưa highlight'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(wish.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <ActionButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleHighlight(wish.id)}
                          disabled={toggleHighlightMutation.isPending}
                          className={
                            wish.isHighlighted
                              ? 'text-yellow-600'
                              : 'text-gray-600'
                          }
                          tooltip={
                            wish.isHighlighted ? 'Bỏ highlight' : 'Highlight'
                          }
                        >
                          {wish.isHighlighted ? (
                            <StarOff className="w-4 h-4" />
                          ) : (
                            <Star className="w-4 h-4" />
                          )}
                        </ActionButton>
                        <ActionButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteWish(wish.id)}
                          disabled={deleteWishMutation.isPending}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                          tooltip="Xóa lời chúc"
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
          {renderPagination()}
        </>
      )}
    </div>
  );
};
