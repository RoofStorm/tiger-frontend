import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  total: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
}

type PageItem = number | 'ellipsis';

function visiblePageItems(
  currentPage: number,
  totalPages: number,
  siblingCount: number
): PageItem[] {
  const compactThreshold = siblingCount * 2 + 5;

  if (totalPages <= compactThreshold - 2) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
  const rightSiblingIndex = Math.min(
    currentPage + siblingCount,
    totalPages
  );

  const showLeftEllipsis = leftSiblingIndex > 2;
  const showRightEllipsis = rightSiblingIndex < totalPages - 1;

  const pages: PageItem[] = [1];

  if (!showLeftEllipsis) {
    for (let p = 2; p < leftSiblingIndex; p += 1) {
      pages.push(p);
    }
  } else {
    pages.push('ellipsis');
  }

  for (let p = leftSiblingIndex; p <= rightSiblingIndex; p += 1) {
    if (p !== 1 && p !== totalPages) {
      pages.push(p);
    }
  }

  if (showRightEllipsis) {
    pages.push('ellipsis');
  } else {
    for (let p = rightSiblingIndex + 1; p < totalPages; p += 1) {
      pages.push(p);
    }
  }

  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
}

export const Pagination: React.FC<PaginationProps> = ({
  total,
  currentPage,
  onPageChange,
  itemsPerPage = 10,
}) => {
  const totalPages = Math.ceil(total / itemsPerPage);

  const pageItems = useMemo(
    () => visiblePageItems(currentPage, totalPages, 1),
    [currentPage, totalPages]
  );

  if (totalPages <= 1) return null;

  return (
    <div className="mt-6 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="shrink-0 text-sm text-gray-700">
        Hiển thị {(currentPage - 1) * itemsPerPage + 1} đến{' '}
        {Math.min(currentPage * itemsPerPage, total)} trong tổng số {total} kết
        quả
      </div>
      <div className="flex min-w-0 max-w-full items-center justify-center gap-1 sm:justify-end sm:gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="shrink-0"
          aria-label="Trang trước"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div
          className="flex min-w-0 flex-wrap items-center justify-center gap-1 sm:gap-2"
          role="navigation"
          aria-label="Chọn trang"
        >
          {pageItems.map((item, index) =>
            item === 'ellipsis' ? (
              <span
                key={`ellipsis-${index}`}
                className="flex h-8 min-w-[2rem] items-center justify-center px-1 text-sm text-gray-500 select-none"
                aria-hidden
              >
                …
              </span>
            ) : (
              <Button
                key={item}
                variant={currentPage === item ? 'default' : 'outline'}
                size="sm"
                onClick={() => onPageChange(item)}
                className="h-8 min-w-8 shrink-0 px-0"
                aria-label={`Trang ${item}`}
                aria-current={currentPage === item ? 'page' : undefined}
              >
                {item}
              </Button>
            )
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="shrink-0"
          aria-label="Trang sau"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
