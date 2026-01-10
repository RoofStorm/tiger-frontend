import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Plus, Eye, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import apiClient from '@/lib/api';
import { FilterBar } from '../FilterBar';
import { Pagination } from '../Pagination';
import { LoginMethodBadge } from '../LoginMethodBadge';
import { ActionButton } from '../ActionButton';
import { UserPointHistoryModal } from '../UserPointHistoryModal';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  points: number;
  loginMethod: string;
}

interface FilterState {
  role?: string;
  status?: string;
  type?: string;
}

interface UsersTabProps {
  isAdmin: boolean;
}

export const UsersTab: React.FC<UsersTabProps> = ({ isAdmin }) => {
  // const { confirm } = useConfirm();
  const { toast } = useToast();
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [userFilters, setUserFilters] = useState<FilterState>({
    role: '',
    status: '',
  });
  const [isPointHistoryModalOpen, setIsPointHistoryModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Fetch users data with server-side pagination
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users', currentPage, userFilters],
    queryFn: () =>
      apiClient.getUsers(
        currentPage,
        10, // itemsPerPage
        userFilters.role || undefined,
        userFilters.status || undefined
      ),
    enabled: isAdmin,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const users = useMemo(() => usersData?.data?.data || [], [usersData]);
  const totalUsers = useMemo(() => usersData?.data?.total || 0, [usersData]);
  const totalPages = useMemo(() => Math.ceil(totalUsers / 10), [totalUsers]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [userFilters]);

  // Reset to page 1 if current page is greater than total pages
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  // Handle Excel export
  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const blob = await apiClient.exportUsersExcel();

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `users_export_${timestamp}.xlsx`;

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Thành công',
        description: 'Báo cáo Excel người dùng đã được xuất thành công.',
        variant: 'success',
        duration: 3000,
      });
    } catch (error: unknown) {
      console.error('Error exporting Excel:', error);
      const errorMessage =
        (error && typeof error === 'object' && 'response' in error
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined) ||
        (error && typeof error === 'object' && 'message' in error
          ? (error as { message?: string }).message
          : undefined) ||
        'Có lỗi xảy ra khi xuất báo cáo. Vui lòng thử lại.';
      toast({
        title: 'Lỗi',
        description: errorMessage,
        variant: 'destructive',
        duration: 4000,
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (usersLoading) {
    return <div className="text-center py-8">Đang tải...</div>;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Quản lý người dùng</h2>
        <div className="flex items-center gap-2">
          <Button
            onClick={handleExportExcel}
            disabled={isExporting}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            {isExporting ? 'Đang xuất...' : 'Xuất Excel'}
          </Button>
          <Button className="bg-blue-500 hover:bg-blue-600">
            <Plus className="w-4 h-4 mr-2" />
            Thêm người dùng
          </Button>
        </div>
      </div>

      <FilterBar
        type="users"
        filters={userFilters}
        setFilters={setUserFilters}
      />

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Hiển thị {users.length} trong tổng số {totalUsers} người dùng
          {(userFilters.role || userFilters.status) && ' (đã lọc)'}
        </p>
        {users.length === 0 && totalUsers > 0 && (
          <p className="text-sm text-amber-600">
            Không tìm thấy kết quả phù hợp với bộ lọc
          </p>
        )}
        {totalUsers === 0 && (
          <p className="text-sm text-amber-600">Chưa có người dùng nào</p>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vai trò
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Điểm
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Đăng nhập
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((userItem: User) => (
              <tr key={userItem.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-bold text-sm">
                        {userItem.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {userItem.name}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {userItem.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      userItem.role === 'ADMIN'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {userItem.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {userItem.points}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <LoginMethodBadge method={userItem.loginMethod || 'LOCAL'} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      userItem.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {userItem.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <ActionButton
                      variant="ghost"
                      size="sm"
                      tooltip="Xem lịch sử điểm thưởng"
                      onClick={() => {
                        setSelectedUser(userItem);
                        setIsPointHistoryModalOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </ActionButton>
                    {/* <ActionButton
                      variant="ghost"
                      size="sm"
                      tooltip="Chỉnh sửa"
                      onClick={async () => {
                        const confirmed = await confirm({
                          title: 'Chỉnh sửa người dùng',
                          message: `Bạn có chắc chắn muốn chỉnh sửa thông tin người dùng "${userItem.name}"?`,
                          type: 'info',
                          confirmText: 'Chỉnh sửa',
                          cancelText: 'Hủy',
                        });
                        if (confirmed) {
                          // TODO: Implement edit user functionality
                        }
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </ActionButton>
                    <ActionButton
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      tooltip="Xóa người dùng"
                      onClick={async () => {
                        const confirmed = await confirm({
                          title: 'Xóa người dùng',
                          message: `Bạn có chắc chắn muốn xóa người dùng "${userItem.name}"? Hành động này không thể hoàn tác!`,
                          type: 'danger',
                          confirmText: 'Xóa',
                          cancelText: 'Hủy',
                        });
                        if (confirmed) {
                          // TODO: Implement delete user functionality
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </ActionButton> */}
                  </div> 
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        total={totalUsers}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        itemsPerPage={10}
      />
      {selectedUser && (
        <UserPointHistoryModal
          isOpen={isPointHistoryModalOpen}
          onClose={() => {
            setIsPointHistoryModalOpen(false);
            setSelectedUser(null);
          }}
          userId={selectedUser.id}
          userName={selectedUser.name}
        />
      )}
    </div>
  );
};
