import { useState, useMemo } from 'react';

interface UsePaginationProps {
  totalItems: number;
  itemsPerPage: number;
  initialPage?: number;
}

export function usePagination({
  totalItems,
  itemsPerPage,
  initialPage = 1,
}: UsePaginationProps) {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const pagination = useMemo(() => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

    return {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage,
      startIndex,
      endIndex,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    };
  }, [currentPage, totalItems, itemsPerPage]);

  const goToPage = (page: number) => {
    const maxPage = Math.ceil(totalItems / itemsPerPage);
    const validPage = Math.max(1, Math.min(page, maxPage));
    setCurrentPage(validPage);
  };

  const nextPage = () => {
    if (pagination.hasNextPage) {
      setCurrentPage((current) => current + 1);
    }
  };

  const prevPage = () => {
    if (pagination.hasPrevPage) {
      setCurrentPage((current) => current - 1);
    }
  };

  const reset = () => {
    setCurrentPage(1);
  };

  return {
    ...pagination,
    goToPage,
    nextPage,
    prevPage,
    reset,
  };
}
