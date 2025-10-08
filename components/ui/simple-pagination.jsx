'use client';

import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

/**
 * SimplePagination component
 * A reusable pagination component that can be used with any data source
 * 
 * @param {Object} props
 * @param {number} props.currentPage - Current page number (1-indexed)
 * @param {number} props.totalPages - Total number of pages
 * @param {number} props.pageSize - Number of items per page
 * @param {number} props.totalItems - Total number of items
 * @param {Function} props.onPageChange - Callback when page changes (page)
 * @param {Function} props.onPageSizeChange - Callback when page size changes (pageSize)
 * @param {number[]} props.pageSizeOptions - Available page size options
 * @param {boolean} props.showPageSizeSelector - Whether to show page size selector
 * @param {boolean} props.showFirstLast - Whether to show first/last buttons
 * @param {string} props.className - Additional CSS classes
 */
export function SimplePagination({
  currentPage = 1,
  totalPages = 1,
  pageSize = 12,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [12, 24, 36, 48],
  showPageSizeSelector = true,
  showFirstLast = true,
  className,
}) {
  const from = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      onPageChange?.(newPage);
    }
  };

  const handlePageSizeChange = (newPageSize) => {
    onPageSizeChange?.(Number(newPageSize));
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages with ellipsis
      const leftSiblingIndex = Math.max(currentPage - 1, 1);
      const rightSiblingIndex = Math.min(currentPage + 1, totalPages);
      
      const shouldShowLeftDots = leftSiblingIndex > 2;
      const shouldShowRightDots = rightSiblingIndex < totalPages - 1;
      
      if (!shouldShowLeftDots && shouldShowRightDots) {
        // Show: 1 2 3 4 ... 10
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (shouldShowLeftDots && !shouldShowRightDots) {
        // Show: 1 ... 7 8 9 10
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else if (shouldShowLeftDots && shouldShowRightDots) {
        // Show: 1 ... 5 6 7 ... 10
        pages.push(1);
        pages.push('...');
        pages.push(leftSiblingIndex);
        pages.push(currentPage);
        pages.push(rightSiblingIndex);
        pages.push('...');
        pages.push(totalPages);
      } else {
        // Fallback
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      }
    }
    
    return pages;
  };

  if (totalPages <= 1 && !showPageSizeSelector) {
    return null;
  }

  return (
    <div
      className={cn(
        'flex flex-col items-end justify-center gap-3 py-4',
        className
      )}
    >
      {/* Navigation controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          {showFirstLast && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <span className="sr-only">Go to previous page</span>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {getPageNumbers().map((page, index) => (
            page === '...' ? (
              <span
                key={`ellipsis-${currentPage}-${index}`}
                className="flex h-8 w-8 items-center justify-center text-sm text-gray-600 dark:text-gray-400"
              >
                ...
              </span>
            ) : (
              <Button
                key={page}
                variant="ghost"
                size="sm"
                onClick={() => handlePageChange(page)}
                className={cn(
                  'h-8 w-8 p-0 text-sm font-medium',
                  currentPage === page 
                    ? 'bg-blue-600 text-white hover:bg-blue-700 rounded-full' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                {page}
              </Button>
            )
          ))}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <span className="sr-only">Go to next page</span>
            <ChevronRight className="h-4 w-4" />
          </Button>

          {showFirstLast && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      {/* Item count info */}
      {totalItems > 0 && (
        <div className="text-sm text-gray-600 dark:text-gray-400 text-right">
          {from} - {to} of {totalItems} items
        </div>
      )}

      {/* Page size selector */}
      {showPageSizeSelector && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Show</span>
          <Select
            value={String(pageSize)}
            onValueChange={handlePageSizeChange}
          >
            <SelectTrigger className="w-[60px] h-8 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
              {pageSizeOptions.map((size) => (
                <SelectItem 
                  key={size} 
                  value={String(size)}
                  className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-gray-600 dark:text-gray-400">per page</span>
        </div>
      )}
    </div>
  );
}

SimplePagination.propTypes = {
  currentPage: PropTypes.number,
  totalPages: PropTypes.number,
  pageSize: PropTypes.number,
  totalItems: PropTypes.number,
  onPageChange: PropTypes.func,
  onPageSizeChange: PropTypes.func,
  pageSizeOptions: PropTypes.arrayOf(PropTypes.number),
  showPageSizeSelector: PropTypes.bool,
  showFirstLast: PropTypes.bool,
  className: PropTypes.string,
};

