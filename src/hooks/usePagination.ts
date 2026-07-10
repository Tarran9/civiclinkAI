import { useState, useCallback } from "react";

interface PaginationState {
  page: number;
  pageSize: number;
}

interface PaginationActions {
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  reset: () => void;
}

interface UsePaginationReturn extends PaginationState, PaginationActions {
  totalPages: number;
  canGoNext: boolean;
  canGoPrev: boolean;
}

export function usePagination(
  total: number,
  defaultPageSize = 10
): UsePaginationReturn {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeState] = useState(defaultPageSize);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setPage(1);
  }, []);

  const nextPage = useCallback(() => {
    setPage((p) => Math.min(p + 1, totalPages));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setPage((p) => Math.max(p - 1, 1));
  }, []);

  const goToPage = useCallback(
    (p: number) => {
      setPage(Math.max(1, Math.min(p, totalPages)));
    },
    [totalPages]
  );

  const reset = useCallback(() => setPage(1), []);

  return {
    page,
    pageSize,
    totalPages,
    canGoNext: page < totalPages,
    canGoPrev: page > 1,
    setPage,
    setPageSize,
    nextPage,
    prevPage,
    goToPage,
    reset,
  };
}
