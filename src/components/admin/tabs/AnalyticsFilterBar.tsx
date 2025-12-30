import React, { memo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface AnalyticsFilterState {
  from: string; // required - ISO date string
  to: string; // required - ISO date string
  page?: string; // optional
  zone?: string; // optional
  flow?: string; // optional
}

interface AnalyticsFilterBarProps {
  filters: AnalyticsFilterState;
  setFilters: (filters: AnalyticsFilterState) => void;
  availableData?: {
    pages: string[];
    zonesByPage: Record<string, string[]>; // page -> zones[]
    commonFunnelSteps?: string[];
    actions?: Array<{ action: string; count: number }>;
    components?: string[];
    totalRecords?: number;
    dateRange?: {
      from: string;
      to: string;
    };
  };
  onFilterChange?: (filters: AnalyticsFilterState) => void;
}

export const AnalyticsFilterBar = memo<AnalyticsFilterBarProps>(
  ({ filters, setFilters, availableData, onFilterChange }) => {
    // Set default time range (last 30 days) - only on initial mount
    useEffect(() => {
      if (!filters.from || !filters.to) {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        const defaultFilters: AnalyticsFilterState = {
          from: thirtyDaysAgo.toISOString().split('T')[0],
          to: today.toISOString().split('T')[0],
        };

        setFilters(defaultFilters);
        onFilterChange?.(defaultFilters);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Validation: from <= to
    const isDateRangeValid = () => {
      if (!filters.from || !filters.to) return false;
      return new Date(filters.from) <= new Date(filters.to);
    };

    // Validation: Max range = 90 days
    const isDateRangeWithinLimit = () => {
      if (!filters.from || !filters.to) return true;
      const from = new Date(filters.from);
      const to = new Date(filters.to);
      const diffTime = Math.abs(to.getTime() - from.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 90;
    };

    // Get available zones for selected page
    const availableZones = filters.page
      ? availableData?.zonesByPage[filters.page] || []
      : [];

    const handleValueChange = (
      field: keyof AnalyticsFilterState,
      value: string
    ) => {
      const newFilters: AnalyticsFilterState = {
        ...filters,
        [field]: value === 'all' || value === '' ? undefined : value,
      };

      // If page is changed (not just cleared), reset zone and flow
      if (field === 'page') {
        if (value === 'all' || value === '') {
          // Page is cleared, clear zone and flow
          newFilters.zone = undefined;
          newFilters.flow = undefined;
        } else {
          // Page is changed to a new value, reset zone and flow
          newFilters.zone = undefined;
          newFilters.flow = undefined;
        }
      }

      // If zone is cleared and page exists, validate zone belongs to page
      if (field === 'zone' && newFilters.page && value && value !== 'all') {
        if (!availableZones.includes(value)) {
          newFilters.zone = undefined;
        }
      }

      setFilters(newFilters);
      onFilterChange?.(newFilters);
    };

    const clearFilters = () => {
      const today = new Date();
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);

      const defaultFilters: AnalyticsFilterState = {
        from: thirtyDaysAgo.toISOString().split('T')[0],
        to: today.toISOString().split('T')[0],
      };

      setFilters(defaultFilters);
      onFilterChange?.(defaultFilters);
    };

    const hasActiveFilters =
      filters.page || filters.zone || filters.flow
        ? true
        : false;

    const dateRangeValid = isDateRangeValid();
    const dateRangeWithinLimit = isDateRangeWithinLimit();

    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-700 flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Bộ lọc Analytics
          </h3>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-4 h-4 mr-1" />
              Xóa bộ lọc
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* From Date */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Từ ngày <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={filters.from || ''}
              onChange={e => handleValueChange('from', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md text-sm ${
                !dateRangeValid || !dateRangeWithinLimit
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300'
              }`}
              max={filters.to || undefined}
            />
            {!dateRangeValid && filters.from && filters.to && (
              <p className="text-xs text-red-500 mt-1">
                Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc
              </p>
            )}
            {!dateRangeWithinLimit && filters.from && filters.to && (
              <p className="text-xs text-red-500 mt-1">
                Khoảng thời gian tối đa 90 ngày
              </p>
            )}
          </div>

          {/* To Date */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Đến ngày <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={filters.to || ''}
              onChange={e => handleValueChange('to', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md text-sm ${
                !dateRangeValid || !dateRangeWithinLimit
                  ? 'border-red-300 bg-red-50'
                  : 'border-gray-300'
              }`}
              min={filters.from || undefined}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Page Filter */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Page
            </label>
            <Select
              value={filters.page || 'all'}
              onValueChange={value => handleValueChange('page', value)}
            >
              <SelectTrigger
                className={!filters.page ? 'text-gray-400' : ''}
              >
                <SelectValue placeholder="Tất cả pages" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả pages</SelectItem>
                {availableData?.pages.map(page => (
                  <SelectItem key={page} value={page}>
                    {page}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Zone Filter - Only enabled when page is selected */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Zone
            </label>
            <Select
              value={filters.zone || 'all'}
              onValueChange={value => handleValueChange('zone', value)}
              disabled={!filters.page || availableZones.length === 0}
            >
              <SelectTrigger
                className={
                  !filters.zone
                    ? 'text-gray-400'
                    : filters.page && availableZones.length === 0
                      ? 'text-gray-300'
                      : ''
                }
              >
                <SelectValue
                  placeholder={
                    !filters.page
                      ? 'Chọn page trước'
                      : availableZones.length === 0
                        ? 'Không có zone'
                        : 'Tất cả zones'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả zones</SelectItem>
                {availableZones.map(zone => (
                  <SelectItem key={zone} value={zone}>
                    {zone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Flow Filter - Optional */}
          {availableData?.commonFunnelSteps &&
            availableData.commonFunnelSteps.length > 0 && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Flow
                </label>
                <Select
                  value={filters.flow || 'all'}
                  onValueChange={value => handleValueChange('flow', value)}
                >
                  <SelectTrigger
                    className={!filters.flow ? 'text-gray-400' : ''}
                  >
                    <SelectValue placeholder="Tất cả flows" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả flows</SelectItem>
                    {availableData.commonFunnelSteps.map(flow => (
                      <SelectItem key={flow} value={flow}>
                        {flow}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
        </div>
      </div>
    );
  }
);

AnalyticsFilterBar.displayName = 'AnalyticsFilterBar';

