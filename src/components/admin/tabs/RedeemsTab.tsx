import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api';
import { Pagination } from '../Pagination';
import { ActionButton } from '../ActionButton';
import { Tooltip } from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AdminRedeemItem {
  id: string;
  status: string;
  pointsUsed: number;
  createdAt: string;
  updatedAt: string;
  receiverName: string;
  receiverPhone: string;
  receiverEmail?: string;
  receiverAddress: string;
  rejectionReason?: string;
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
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedRedeemId, setSelectedRedeemId] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');

  // Fetch redeem data
  const {
    data: redeemData,
    isLoading: redeemLoading,
    refetch: refetchRedeems,
  } = useQuery({
    queryKey: ['admin-redeems', redeemPage, redeemStatusFilter],
    queryFn: () =>
      apiClient.getRedeemLogs(
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
    mutationFn: ({
      redeemId,
      status,
      rejectionReason,
    }: {
      redeemId: string;
      status: string;
      rejectionReason?: string;
    }) => apiClient.updateRedeemStatus(redeemId, status, rejectionReason),
    onSuccess: () => {
      toast({
        title: 'Cập nhật thành công',
        description: 'Trạng thái đổi thưởng đã được cập nhật',
        variant: 'success',
        duration: 3000,
      });
      refetchRedeems();
      setShowRejectDialog(false);
      setRejectionReason('');
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
    if (newStatus === 'REJECTED') {
      setSelectedRedeemId(redeemId);
      setShowRejectDialog(true);
    } else {
      updateRedeemStatusMutation.mutate({ redeemId, status: newStatus });
    }
  };

  const handleRejectConfirm = () => {
    if (!rejectionReason.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập lý do từ chối',
        variant: 'destructive',
        duration: 3000,
      });
      return;
    }
    updateRedeemStatusMutation.mutate({
      redeemId: selectedRedeemId,
      status: 'REJECTED',
      rejectionReason: rejectionReason.trim(),
    });
  };

  const redeems: AdminRedeemItem[] = redeemData?.data?.data || [];
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
            <Select
              value={redeemStatusFilter || 'all'}
              onValueChange={value => {
                setRedeemStatusFilter(value === 'all' ? '' : value);
                setRedeemPage(1);
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="PENDING">Chờ duyệt</SelectItem>
                <SelectItem value="APPROVED">Đã duyệt</SelectItem>
                <SelectItem value="DELIVERED">Đã giao</SelectItem>
                <SelectItem value="REJECTED">Từ chối</SelectItem>
              </SelectContent>
            </Select>
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
                      Email nhận
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số điện thoại
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Điểm sử dụng
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                      Note
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
                          {redeem.receiverEmail || '-'}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {redeem.receiverPhone}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {redeem.pointsUsed} điểm
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {getStatusBadge(redeem.status)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900 w-40">
                        {redeem.rejectionReason ? (
                          <Tooltip content={redeem.rejectionReason}>
                            <div className="bg-red-50 border border-red-200 rounded-md p-2 cursor-help hover:bg-red-100 transition-colors overflow-hidden">
                              <p className="text-xs text-red-600 font-medium mb-1">
                                Lý do từ chối:
                              </p>
                              <p className="text-xs text-red-700 truncate">
                                {redeem.rejectionReason}
                              </p>
                            </div>
                          </Tooltip>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
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

      {/* Rejection Reason Dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Nhập lý do từ chối</h3>
            <textarea
              value={rejectionReason}
              onChange={e => {
                // Không trim - giữ nguyên giá trị người dùng nhập
                setRejectionReason(e.target.value);
              }}
              onKeyDown={(e) => {
                // Ngăn event bubbling lên parent để tránh bị ảnh hưởng
                e.stopPropagation();
              }}
              onKeyPress={(e) => {
                // Ngăn event bubbling lên parent
                e.stopPropagation();
              }}
              onKeyUp={(e) => {
                // Ngăn event bubbling lên parent
                e.stopPropagation();
              }}
              onDragOver={(e) => {
                // Ngăn drag events từ parent ảnh hưởng đến textarea
                e.stopPropagation();
              }}
              onDrop={(e) => {
                // Ngăn drop events từ parent ảnh hưởng đến textarea
                e.stopPropagation();
              }}
              placeholder="Nhập lý do từ chối yêu cầu đổi quà..."
              className="w-full h-24 p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setShowRejectDialog(false);
                  setRejectionReason('');
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={updateRedeemStatusMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {updateRedeemStatusMutation.isPending
                  ? 'Đang xử lý...'
                  : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
