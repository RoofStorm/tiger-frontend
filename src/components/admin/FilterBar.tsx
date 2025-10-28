import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';

interface FilterState {
  role?: string;
  status?: string;
  type?: string;
}

interface FilterBarProps {
  type: 'users' | 'posts';
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
}

export const FilterBar = memo<FilterBarProps>(
  ({ type, filters, setFilters }) => {
    const clearFilters = () => {
      if (type === 'users') {
        setFilters({ role: '', status: '' });
      } else {
        setFilters({ type: '' });
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Role/Type Filter */}
          <select
            value={filters.role || filters.type || ''}
            onChange={e =>
              setFilters({
                ...filters,
                [type === 'users' ? 'role' : 'type']: e.target.value,
              })
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">
              Tất cả {type === 'users' ? 'vai trò' : 'loại'}
            </option>
            {type === 'users' ? (
              <>
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </>
            ) : (
              <>
                <option value="EMOJI_CARD">EMOJI_CARD</option>
                <option value="CONFESSION">CONFESSION</option>
                <option value="IMAGE">IMAGE</option>
                <option value="VIDEO">VIDEO</option>
                <option value="CLIP">CLIP</option>
              </>
            )}
          </select>

          {/* Status Filter (only for users) */}
          {type === 'users' && (
            <select
              value={filters.status}
              onChange={e => setFilters({ ...filters, status: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          )}
        </div>
      </div>
    );
  }
);

FilterBar.displayName = 'FilterBar';
