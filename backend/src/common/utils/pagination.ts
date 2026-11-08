export interface PaginationParams {
  page?: number | string;
  limit?: number | string;
}

export interface PaginationResult {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Standardize pagination parameters from query string
 */
export const getPagination = (
  params?: PaginationParams,
  defaultLimit = 20,
  maxLimit = 100
): PaginationResult => {
  const page = Math.max(1, Number(params?.page) || 1);
  const rawLimit = Number(params?.limit) || defaultLimit;
  const limit = Math.max(1, Math.min(rawLimit, maxLimit));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Build consistent pagination metadata object
 */
export const buildPaginationMeta = (
  total: number,
  page: number,
  limit: number
): PaginationMeta => {
  const totalPages = Math.ceil(total / limit) || 1;

  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};
