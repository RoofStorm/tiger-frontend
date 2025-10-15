import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api';
import { Pagination } from '../Pagination';
import { ActionButton } from '../ActionButton';

interface AdminRedeemItem {
  id: string;
  status: string;
  pointsUsed: number;
  createdAt: string;
  updatedAt: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  reward?: {
    id: string;
    name: string;
    description: string;
    imageUrl: string;
  };
}

interface RedeemsTabProps {
  isAdmin: boolean;
}

export const RedeemsTab: React.FC<RedeemsTabProps> = ({ isAdmin }) => {
  const { toast } = useToast();
  const [redeemPage, setRedeemPage] = useState(1);
  const [redeemPerPage] = useState(20);
  const [redeemStatusFilter, setRedeemStatusFilter] = useState<string>('');

  // Fetch redeem data
  const {
    data: redeemData,
    isLoading: redeemLoading,
    refetch: refetchRedeems,
  } = useQuery({
    queryKey: ['admin-redeems', redeemPage, redeemStatusFilter],
    queryFn: () =>
      apiClient.getAllRedeems(
        redeemPage,
        redeemPerPage,
        redeemStatusFilter || undefined
      ),
    enabled: isAdmin,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  // Update redeem status mutation
  const updateRedeemStatusMutation = useMutation({
    mutationFn: ({ redeemId, status }: { redeemId: string; status: string }) =>
      apiClient.updateRedeemStatus(redeemId, status),
    onSuccess: () => {
      toast({
        title: 'Cập nhật thành công',
        description: 'Trạng thái đổi thưởng đã được cập nhật',
        variant: 'success',
        duration: 3000,
      });
      refetchRedeems();
    },
    onError: (error: Error) => {
      toast({
        title: 'Lỗi',
        description: error.message || 'Có lỗi xảy ra',
        variant: 'destructive',
        duration: 4000,
      });
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            ⏳ Chờ duyệt
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            ✅ Đã duyệt
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            📦 Đã giao
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            ❌ Từ chối
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const handleStatusUpdate = (redeemId: string, newStatus: string) => {
    updateRedeemStatusMutation.mutate({ redeemId, status: newStatus });
  };

  const redeems: AdminRedeemItem[] = redeemData?.data?.redeems || [];
  const totalRedeems = redeemData?.data?.total || 0;

  if (redeemLoading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Quản lý đổi thưởng
          </h2>
          <div className="flex items-center space-x-4">
            <select
              value={redeemStatusFilter}
              onChange={e => {
                setRedeemStatusFilter(e.target.value);
                setRedeemPage(1);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="DELIVERED">Đã giao</option>
              <option value="REJECTED">Từ chối</option>
            </select>
          </div>
        </div>

        {redeems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Chưa có yêu cầu đổi thưởng nào
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phần thưởng
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thông tin nhận
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Điểm sử dụng
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {redeems.map((redeem: AdminRedeemItem) => (
                    <tr key={redeem.id}>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white font-bold text-sm">
                              {redeem.user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {redeem.user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {redeem.user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {redeem.reward?.name || 'N/A'}
                        </div>
                        {redeem.reward?.description && (
                          <div className="text-sm text-gray-500">
                            {redeem.reward.description}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">
                            {redeem.receiverName}
                          </div>
                          <div className="text-gray-500">
                            {redeem.receiverPhone}
                          </div>
                          <div className="text-gray-500 break-words max-w-xs">
                            {redeem.receiverAddress}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {redeem.pointsUsed} điểm
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {getStatusBadge(redeem.status)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(redeem.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {redeem.status === 'PENDING' && (
                            <>
                              <ActionButton
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleStatusUpdate(redeem.id, 'APPROVED')
                                }
                                disabled={updateRedeemStatusMutation.isPending}
                                className="text-green-600 hover:text-green-800"
                                tooltip="Duyệt yêu cầu"
                              >
                                Duyệt
                              </ActionButton>
                              <ActionButton
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleStatusUpdate(redeem.id, 'REJECTED')
                                }
                                disabled={updateRedeemStatusMutation.isPending}
                                className="text-red-600 hover:text-red-800"
                                tooltip="Từ chối yêu cầu"
                              >
                                Từ chối
                              </ActionButton>
                            </>
                          )}
                          {redeem.status === 'APPROVED' && (
                            <ActionButton
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleStatusUpdate(redeem.id, 'DELIVERED')
                              }
                              disabled={updateRedeemStatusMutation.isPending}
                              className="text-blue-600 hover:text-blue-800"
                              tooltip="Đánh dấu đã giao"
                            >
                              Đã giao
                            </ActionButton>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Redeem Pagination */}
            <Pagination
              total={totalRedeems}
              currentPage={redeemPage}
              onPageChange={setRedeemPage}
              itemsPerPage={redeemPerPage}
            />
          </>
        )}
      </div>
    </div>
  );
};
