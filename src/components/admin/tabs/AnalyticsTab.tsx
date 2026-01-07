import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api';
import { AnalyticsSummaryResponse } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AnalyticsFilterBar,
  AnalyticsFilterState,
} from './AnalyticsFilterBar';

interface AnalyticsTabProps {
  isAdmin: boolean;
}

interface AnalysisRow {
  date: string;
  page: string;
  zone: string | null;
  action: string;
  component: string | null;
  value: number;
  unit: string;
  metadata?: Record<string, unknown>;
}

interface AnalysisResponse {
  columns: string[];
  rows: AnalysisRow[];
  nextCursor?: string;
  count: number;
  hasMore: boolean;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ isAdmin }) => {
  const { toast } = useToast();
  const [filters, setFilters] = useState<AnalyticsFilterState>({
    from: '',
    to: '',
  });
  const [debouncedFilters, setDebouncedFilters] =
    useState<AnalyticsFilterState>(filters);
  const [analysisLimit, setAnalysisLimit] = useState(50);
  const [analysisCursor, setAnalysisCursor] = useState<string | undefined>(
    undefined
  );
  const [cursorHistory, setCursorHistory] = useState<string[]>([]); // For back navigation
  const [isExporting, setIsExporting] = useState(false);

  // Debounce filter changes (300-500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 400);

    return () => clearTimeout(timer);
  }, [filters]);

  // Reset cursor when filters change
  useEffect(() => {
    setAnalysisCursor(undefined);
    setCursorHistory([]);
  }, [debouncedFilters.page, debouncedFilters.zone, debouncedFilters.from, debouncedFilters.to]);

  // Fetch available data on mount
  const { data: availableData, isLoading: availableDataLoading } = useQuery({
    queryKey: ['analytics-available-data'],
    queryFn: () => apiClient.getAnalyticsAvailableData(),
    enabled: isAdmin,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });


  // Fetch Summary Data
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: [
      'analytics-summary',
      debouncedFilters.page,
      debouncedFilters.zone,
      debouncedFilters.from,
      debouncedFilters.to,
    ],
    queryFn: () =>
      apiClient.getAnalyticsSummary({
        page: debouncedFilters.page,
        zone: debouncedFilters.zone,
        from: debouncedFilters.from,
        to: debouncedFilters.to,
      }),
    enabled:
      isAdmin &&
      !!debouncedFilters.from &&
      !!debouncedFilters.to &&
      new Date(debouncedFilters.from) <= new Date(debouncedFilters.to),
  });

  // Fetch Analysis Data
  const canFetchAnalysis =
    isAdmin &&
    !!debouncedFilters.from &&
    !!debouncedFilters.to &&
    new Date(debouncedFilters.from) <= new Date(debouncedFilters.to);

  const { data: analysisData, isLoading: analysisLoading } = useQuery({
    queryKey: [
      'analytics-analysis',
      debouncedFilters.page,
      debouncedFilters.zone,
      debouncedFilters.from,
      debouncedFilters.to,
      analysisLimit,
      analysisCursor,
    ],
    queryFn: () =>
      apiClient.getAnalyticsAnalysis({
        from: debouncedFilters.from!,
        to: debouncedFilters.to!,
        page: debouncedFilters.page,
        zone: debouncedFilters.zone,
        limit: analysisLimit,
        cursor: analysisCursor,
      }),
    enabled: canFetchAnalysis,
  });

  const summary: AnalyticsSummaryResponse | undefined = summaryData;
  const analysis: AnalysisResponse | undefined = analysisData;

  // Calculate derived metrics
  const totalUniqueUsers = summary
    ? summary.uniqueUsers + summary.uniqueAnonymousUsers
    : 0;
  const conversionRate = summary && totalUniqueUsers > 0
    ? (summary.uniqueUsers / totalUniqueUsers) * 100
    : 0;

  // Handle next page
  const handleNextPage = () => {
    if (analysis?.nextCursor) {
      setCursorHistory([...cursorHistory, analysisCursor || '']);
      setAnalysisCursor(analysis.nextCursor);
    }
  };

  // Handle previous page
  const handlePreviousPage = () => {
    if (cursorHistory.length > 0) {
      const previousCursor = cursorHistory[cursorHistory.length - 1];
      setCursorHistory(cursorHistory.slice(0, -1));
      setAnalysisCursor(previousCursor || undefined);
    } else {
      setAnalysisCursor(undefined);
    }
  };

  // Format seconds
  const formatSeconds = (seconds: number): string => {
    if (seconds < 60) return `${seconds.toFixed(1)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  // Handle Excel export
  const handleExportExcel = async () => {
    if (!debouncedFilters.from || !debouncedFilters.to) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn khoảng thời gian trước khi xuất báo cáo.',
        variant: 'destructive',
        duration: 4000,
      });
      return;
    }

    if (new Date(debouncedFilters.from) > new Date(debouncedFilters.to)) {
      toast({
        title: 'Lỗi',
        description: 'Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc.',
        variant: 'destructive',
        duration: 4000,
      });
      return;
    }

    setIsExporting(true);
    try {
      const blob = await apiClient.exportAnalyticsExcel({
        from: debouncedFilters.from,
        to: debouncedFilters.to,
        page: debouncedFilters.page,
        zone: debouncedFilters.zone,
      });

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const pagePart = debouncedFilters.page ? `_${debouncedFilters.page}` : '';
      const zonePart = debouncedFilters.zone ? `_${debouncedFilters.zone}` : '';
      const filename = `analytics_${debouncedFilters.from}_to_${debouncedFilters.to}${pagePart}${zonePart}_${timestamp}.xlsx`;

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
        description: 'Báo cáo Excel đã được xuất thành công.',
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

  if (availableDataLoading) {
    return <div className="text-center py-8">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filter Bar */}
      <AnalyticsFilterBar
        filters={filters}
        setFilters={setFilters}
        availableData={availableData}
      />

      {/* Export Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleExportExcel}
          disabled={
            isExporting ||
            !debouncedFilters.from ||
            !debouncedFilters.to ||
            new Date(debouncedFilters.from) > new Date(debouncedFilters.to)
          }
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          {isExporting ? 'Đang xuất...' : 'Xuất báo cáo Excel'}
        </Button>
      </div>

      {/* TABLE 1 - SUMMARY TABLE */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Summary Table
        </h2>

        {summaryLoading ? (
          <div className="text-center py-8 text-gray-500">
            Đang tải dữ liệu summary...
          </div>
        ) : !summary ? (
          <div className="text-center py-8 text-gray-500">
            Chưa có dữ liệu summary. Vui lòng chọn khoảng thời gian.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Khoảng thời gian
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng lượt xem
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng lượt click
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng thời gian (s)
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thời gian trung bình (s)
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Số sessions đã truy cập
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tổng người dùng đã truy cập
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người dùng đã đăng nhập
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Người dùng ẩn danh
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tỷ lệ chuyển đổi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {summary.dateRange.from} to {summary.dateRange.to}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {summary.totalViews.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {summary.totalClicks.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {formatSeconds(summary.totalDurations)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {formatSeconds(summary.avgDuration)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                    {summary.uniqueSessions.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                    {totalUniqueUsers.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-blue-600 text-right">
                    {summary.uniqueUsers.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 text-right">
                    {summary.uniqueAnonymousUsers.toLocaleString()}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                    {conversionRate.toFixed(2)}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* TABLE 2 - ANALYSIS TABLE */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Analysis Table
          </h2>
          <div className="flex items-center gap-4">
            {/* Limit Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-700">Limit:</label>
              <Select
                value={analysisLimit.toString()}
                onValueChange={value => setAnalysisLimit(Number(value))}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="200">200</SelectItem>
                  <SelectItem value="500">500</SelectItem>
                  <SelectItem value="1000">1000</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Count Display */}
            {analysis && (
              <div className="text-sm text-gray-600">
                Hiển thị {analysis.rows.length} / {analysis.count} records
              </div>
            )}
          </div>
        </div>

        {!canFetchAnalysis ? (
          <div className="text-center py-8 text-gray-500">
            Vui lòng chọn khoảng thời gian để xem dữ liệu analysis.
          </div>
        ) : analysisLoading ? (
          <div className="text-center py-8 text-gray-500">
            Đang tải dữ liệu analysis...
          </div>
        ) : !analysis || !analysis.rows || analysis.rows.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Chưa có dữ liệu analysis cho điều kiện đã chọn.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Page
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zone
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Component
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Metadata
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analysis.rows.map((row, index) => (
                  <tr key={`${row.date}-${row.page}-${row.zone || 'null'}-${row.action}-${row.component || 'null'}-${index}`}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.date}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.page}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {row.zone || '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.action}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {row.component || '-'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {row.unit === 'seconds' 
                        ? formatSeconds(row.value)
                        : row.value.toLocaleString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {row.unit}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {row.metadata ? (
                        <div className="space-y-1">
                          {Object.entries(row.metadata).map(([key, value]) => (
                            <div key={key} className="text-xs">
                              <span className="font-medium text-gray-700">{key}:</span>{' '}
                              <span className="text-gray-600">
                                {typeof value === 'object'
                                  ? JSON.stringify(value)
                                  : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {analysis && analysis.rows.length > 0 && (
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {analysis.count > 0 && (
                <span>
                  Hiển thị {analysis.rows.length} trong tổng số {analysis.count} records
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousPage}
                disabled={cursorHistory.length === 0 && !analysisCursor}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={!analysis.hasMore || !analysis.nextCursor}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
