'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Modal } from '@/components/ui/modal';
import apiClient from '@/lib/api';
import { Star } from 'lucide-react';
import { Pagination } from './Pagination';

interface PointLog {
  id: string;
  points: number;
  reason: string;
  createdAt: string;
}

interface UserPointHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

export const UserPointHistoryModal: React.FC<UserPointHistoryModalProps> = ({
  isOpen,
  onClose,
  userId,
  userName,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const {
    data: pointHistoryData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['userPointHistory', userId, currentPage],
    queryFn: () => apiClient.getUserPointHistory(userId, currentPage, itemsPerPage),
    enabled: isOpen && !!userId,
    staleTime: 0,
    refetchOnMount: true,
  });

  const pointHistory: PointLog[] = Array.isArray(pointHistoryData?.data?.logs)
    ? pointHistoryData.data.logs
    : [];
  const total = pointHistoryData?.data?.total || 0;
  const totalPages = Math.ceil(total / itemsPerPage);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      headerTitle={`Lịch sử điểm thưởng - ${userName}`}
      maxWidth="2xl"
    >
      <div className="px-6 py-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 border-t-transparent mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải lịch sử điểm...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">Lỗi khi tải lịch sử điểm</p>
            <p className="text-sm text-gray-500 mt-2">
              Vui lòng thử lại sau
            </p>
          </div>
        ) : pointHistory.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Chưa có lịch sử cộng điểm</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Hiển thị {pointHistory.length} trong tổng số {total} bản ghi
              </p>
            </div>
            <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
              {pointHistory.map((log: PointLog) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                      <Star className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{log.reason}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(log.createdAt).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold text-lg ${
                        log.points > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {log.points > 0 ? '+' : ''}
                      {log.points}
                    </p>
                    <p className="text-sm text-gray-500">điểm</p>
                  </div>
                </div>
              ))}
            </div>
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  total={total}
                  currentPage={currentPage}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};

