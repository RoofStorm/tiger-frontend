import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

interface FilterBarProps {
  type: 'users' | 'posts';
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
}

export const FilterBar = memo<FilterBarProps>(
  ({ type, filters, setFilters }) => {
    // Helper to convert "all" to empty string for filter state
    const handleValueChange = (
      field: keyof FilterState,
      value: string
    ) => {
      setFilters({
        ...filters,
        [field]: value === 'all' ? '' : value,
      });
    };

    // Helper to convert empty string to "all" for Select value
    const getSelectValue = (value: string | undefined) => {
      return value && value !== '' ? value : 'all';
    };

    const clearFilters = () => {
      if (type === 'users') {
        setFilters({ role: '', status: '' });
      } else {
        setFilters({
          month: '',
          year: '',
          isHighlighted: '',
          sortBy: '',
          sortOrder: 'desc',
        });
      }
    };

    const hasActiveFilters = Object.values(filters).some(value => value !== '');

    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-700 flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Bộ lọc
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Role Filter (only for users) */}
          {type === 'users' && (
            <Select
              value={getSelectValue(filters.role)}
              onValueChange={value => handleValueChange('role', value)}
            >
              <SelectTrigger className={!filters.role ? 'text-gray-400' : ''}>
                <SelectValue placeholder="Tất cả vai trò" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả vai trò</SelectItem>
                <SelectItem value="USER">USER</SelectItem>
                <SelectItem value="ADMIN">ADMIN</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* Status Filter (only for users) */}
          {type === 'users' && (
            <Select
              value={getSelectValue(filters.status)}
              onValueChange={value => handleValueChange('status', value)}
            >
              <SelectTrigger className={!filters.status ? 'text-gray-400' : ''}>
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                <SelectItem value="INACTIVE">INACTIVE</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* Highlight Status Filter (only for posts) */}
          {type === 'posts' && (
            <Select
              value={getSelectValue(filters.isHighlighted)}
              onValueChange={value => handleValueChange('isHighlighted', value)}
            >
              <SelectTrigger className={!filters.isHighlighted ? 'text-gray-400' : ''}>
                <SelectValue placeholder="Tất cả highlight" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả highlight</SelectItem>
                <SelectItem value="true">Đã highlight</SelectItem>
                <SelectItem value="false">Chưa highlight</SelectItem>
              </SelectContent>
            </Select>
          )}

          {/* Month Filter (only for posts) */}
          {type === 'posts' && (
            <Select
              value={getSelectValue(filters.month)}
              onValueChange={value => handleValueChange('month', value)}
            >
              <SelectTrigger className={!filters.month ? 'text-gray-400' : ''}>
                <SelectValue placeholder="Tất cả tháng" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả tháng</SelectItem>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <SelectItem key={month} value={month.toString()}>
                    Tháng {month}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Year Filter (only for posts) */}
          {type === 'posts' && (
            <Select
              value={getSelectValue(filters.year)}
              onValueChange={value => handleValueChange('year', value)}
            >
              <SelectTrigger className={!filters.year ? 'text-gray-400' : ''}>
                <SelectValue placeholder="Tất cả năm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả năm</SelectItem>
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    Năm {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>
    );
  }
);

FilterBar.displayName = 'FilterBar';
