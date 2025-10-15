import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
// import { BarChart3, Users, Clock, TrendingUp } from 'lucide-react';
import apiClient from '@/lib/api';
import { Pagination } from '../Pagination';

interface AnalyticsItem {
  id: string;
  corner: number;
  duration: number;
  createdAt: string;
  userId?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

interface CornerStats {
  corner: number;
  totalVisits: number;
  totalDuration: number;
  avgDuration: number;
  cornerName: string;
}

interface UserDateStats {
  userId: string;
  userName: string;
  userEmail?: string;
  date: string;
  corners: Record<number, { visits: number; totalDuration: number }>;
  totalVisits: number;
  totalDuration: number;
}

interface AnalyticsTabProps {
  isAdmin: boolean;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ isAdmin }) => {
  const [analyticsPage, setAnalyticsPage] = useState(1);
  const [analyticsPerPage] = useState(20);

  // Fetch analytics data
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => apiClient.getCornerAnalytics(),
    enabled: isAdmin,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const analytics: AnalyticsItem[] = analyticsData?.data || [];

  const getCornerName = (corner: number) => {
    const names = {
      0: 'Trang chủ (Video)',
      1: 'Mục lục (Emoji Grid)',
      2: 'Made in Vietnam',
      3: 'Chia sẻ (Gallery)',
      4: 'Flip Card',
      5: 'Phần thưởng',
    };
    return names[corner as keyof typeof names] || `Corner ${corner}`;
  };

  // Group analytics by corner for overview
  const cornerStats = analytics.reduce(
    (acc: Record<number, CornerStats>, item: AnalyticsItem) => {
      const corner = item.corner;
      if (!acc[corner]) {
        acc[corner] = {
          corner,
          totalVisits: 0,
          totalDuration: 0,
          avgDuration: 0,
          cornerName: getCornerName(corner),
        };
      }
      acc[corner].totalVisits += 1;
      acc[corner].totalDuration += item.duration;
      acc[corner].avgDuration = Math.round(
        acc[corner].totalDuration / acc[corner].totalVisits
      );
      return acc;
    },
    {}
  );

  // Group analytics by user and date for detailed table
  const userDateStats = analytics.reduce(
    (acc: Record<string, UserDateStats>, item: AnalyticsItem) => {
      const userId = item.userId || 'Anonymous';
      const userName = item.user?.name || 'Anonymous User';
      const userEmail = item.user?.email;
      const date = new Date(item.createdAt).toLocaleDateString('vi-VN');
      const key = `${userId}-${date}`;

      if (!acc[key]) {
        acc[key] = {
          userId,
          userName,
          userEmail,
          date,
          corners: {} as Record<
            number,
            { visits: number; totalDuration: number }
          >,
          totalVisits: 0,
          totalDuration: 0,
        };
      }

      const corner = item.corner;
      if (!acc[key].corners[corner]) {
        acc[key].corners[corner] = { visits: 0, totalDuration: 0 };
      }

      acc[key].corners[corner].visits += 1;
      acc[key].corners[corner].totalDuration += item.duration;
      acc[key].totalVisits += 1;
      acc[key].totalDuration += item.duration;

      return acc;
    },
    {}
  );

  const userDateArray = Object.values(userDateStats).sort(
    (a: UserDateStats, b: UserDateStats) =>
      new Date(b.date.split('/').reverse().join('-')).getTime() -
      new Date(a.date.split('/').reverse().join('-')).getTime()
  );

  if (analyticsLoading) {
    return <div className="text-center py-8">Đang tải analytics...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Corner Analytics Overview
        </h2>

        {analytics.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Chưa có dữ liệu analytics
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.values(cornerStats).map((stat: CornerStats) => (
              <div
                key={stat.corner}
                className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {stat.cornerName}
                  </h3>
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {stat.corner}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Tổng lượt truy cập:
                    </span>
                    <span className="font-semibold text-blue-600">
                      {stat.totalVisits}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Tổng thời gian:
                    </span>
                    <span className="font-semibold text-green-600">
                      {stat.totalDuration}s
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Thời gian TB:</span>
                    <span className="font-semibold text-purple-600">
                      {stat.avgDuration}s
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detailed Analytics Table */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Chi tiết Analytics theo User & Ngày
          </h3>
          <div className="text-sm text-gray-600">
            Hiển thị{' '}
            {Math.min(
              (analyticsPage - 1) * analyticsPerPage + 1,
              userDateArray.length
            )}{' '}
            đến{' '}
            {Math.min(analyticsPage * analyticsPerPage, userDateArray.length)}{' '}
            trong tổng số {userDateArray.length} records
          </div>
        </div>

        {userDateArray.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Chưa có dữ liệu analytics
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
                      Ngày
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Corner 0
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Corner 1
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Corner 2
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Corner 3
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Corner 4
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Corner 5
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tổng
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {userDateArray
                    .slice(
                      (analyticsPage - 1) * analyticsPerPage,
                      analyticsPage * analyticsPerPage
                    )
                    .map((userDate: UserDateStats) => (
                      <tr key={`${userDate.userId}-${userDate.date}`}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center mr-3">
                              <span className="text-white font-bold text-sm">
                                {userDate.userName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="text-sm font-medium text-gray-900">
                              <div className="font-semibold">
                                {userDate.userName}
                              </div>
                              {userDate.userEmail && (
                                <div className="text-xs text-gray-500">
                                  {userDate.userEmail}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {userDate.date}
                        </td>
                        {[0, 1, 2, 3, 4, 5].map(corner => {
                          const cornerData = userDate.corners[corner];
                          return (
                            <td
                              key={corner}
                              className="px-2 py-4 text-center text-sm"
                            >
                              {cornerData ? (
                                <div className="space-y-1">
                                  <div className="font-semibold text-blue-600">
                                    {cornerData.visits}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {cornerData.totalDuration}s
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-300">-</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="px-4 py-4 text-center text-sm font-semibold text-gray-900">
                          <div className="space-y-1">
                            <div className="text-blue-600">
                              {userDate.totalVisits}
                            </div>
                            <div className="text-xs text-gray-500">
                              {userDate.totalDuration}s
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Analytics Pagination */}
            <Pagination
              total={userDateArray.length}
              currentPage={analyticsPage}
              onPageChange={setAnalyticsPage}
              itemsPerPage={analyticsPerPage}
            />
          </>
        )}
      </div>
    </div>
  );
};
