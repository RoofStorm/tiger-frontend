import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const usePagination = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const [postsPage, setPostsPage] = useState(1);
  const [analyticsPage, setAnalyticsPage] = useState(1);
  const [redeemPage, setRedeemPage] = useState(1);
  const [rewardsPage, setRewardsPage] = useState(1);

  const [analyticsPerPage] = useState(10);
  const [redeemPerPage] = useState(10);
  const [rewardsPerPage] = useState(10);

  const renderPagination = useCallback(
    (
      totalItems: number,
      currentPage: number,
      setCurrentPage: (page: number) => void,
      itemsPerPage: number = 20,
      itemsPerPageOverride?: number
    ) => {
      const actualItemsPerPage = itemsPerPageOverride || itemsPerPage;
      const totalPages = Math.ceil(totalItems / actualItemsPerPage);

      if (totalPages <= 1) return null;

      return (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700">
            Hiển thị {Math.min(
              (currentPage - 1) * actualItemsPerPage + 1,
              totalItems
            )}{' '}
            đến {Math.min(currentPage * actualItemsPerPage, totalItems)} trong
            tổng số {totalItems} mục
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-gray-700">
              Trang {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      );
    },
    []
  );

  return {
    currentPage,
    setCurrentPage,
    usersPage,
    setUsersPage,
    postsPage,
    setPostsPage,
    analyticsPage,
    setAnalyticsPage,
    redeemPage,
    setRedeemPage,
    rewardsPage,
    setRewardsPage,
    analyticsPerPage,
    redeemPerPage,
    rewardsPerPage,
    renderPagination,
  };
};
