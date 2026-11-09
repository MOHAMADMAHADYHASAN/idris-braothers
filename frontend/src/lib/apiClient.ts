/**
 * Centralized API Client for Idris Brothers Grocery POS
 * Provides typed fetch wrapper, unified error handling, and request deduping.
 */

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  meta?: PaginationMeta;
}

export interface ValidationErrorField {
  field: string;
  message: string;
}

export class ApiError extends Error {
  status: number;
  errors?: ValidationErrorField[];

  constructor(message: string, status: number, errors?: ValidationErrorField[]) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }
}

// In-flight request map for request deduping (prevents double submission)
const activeRequests = new Map<string, Promise<any>>();

interface RequestOptions extends RequestInit {
  params?: Record<string, any>;
  dedupe?: boolean; // If true, in-flight duplicate requests return the same promise
  timeoutMs?: number;
}

class ApiClient {
  private defaultTimeout = 15000; // 15 seconds

  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    if (!params) return endpoint;

    const url = new URL(endpoint, typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });

    // If endpoint was relative, return pathname + search
    if (!endpoint.startsWith('http://') && !endpoint.startsWith('https://')) {
      return url.pathname + url.search;
    }
    return url.toString();
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    if (!endpoint || typeof endpoint !== 'string') {
      throw new ApiError('API endpoint URL is invalid or undefined', 400);
    }
    const { params, dedupe = false, timeoutMs = this.defaultTimeout, ...fetchOptions } = options;
    const url = this.buildUrl(endpoint, params);
    const method = fetchOptions.method || 'GET';
    const requestKey = `${method}:${url}:${JSON.stringify(fetchOptions.body || '')}`;

    // Request Deduping
    if (dedupe && activeRequests.has(requestKey)) {
      return activeRequests.get(requestKey)!;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((fetchOptions.headers as Record<string, string>) || {}),
    };

    const executeRequest = async (): Promise<ApiResponse<T>> => {
      try {
        const response = await fetch(url, {
          ...fetchOptions,
          headers,
          signal: controller.signal,
        });

        clearTimeout(timer);

        const isJson = response.headers.get('content-type')?.includes('application/json');
        const data = isJson ? await response.json() : null;

        if (!response.ok) {
          const errorMessage = data?.message || `HTTP error ${response.status}: ${response.statusText}`;
          const errors = data?.errors || undefined;
          throw new ApiError(errorMessage, response.status, errors);
        }

        return data as ApiResponse<T>;
      } catch (err: any) {
        clearTimeout(timer);
        if (err.name === 'AbortError') {
          throw new ApiError('রিকোয়েস্টের সময় শেষ হয়ে গেছে (Network Timeout)', 408);
        }
        if (err instanceof ApiError) {
          throw err;
        }
        throw new ApiError(err.message || 'সার্ভারের সাথে সংযোগ স্থাপন করা সম্ভব হয়নি', 500);
      } finally {
        if (dedupe) {
          activeRequests.delete(requestKey);
        }
      }
    };

    if (dedupe) {
      const promise = executeRequest();
      activeRequests.set(requestKey, promise);
      return promise;
    }

    return executeRequest();
  }

  get<T>(endpoint: string, params?: Record<string, any>, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: 'GET', params });
  }

  post<T>(endpoint: string, body?: any, options?: RequestOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(endpoint: string, body?: any, options?: RequestOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(endpoint: string, body?: any, options?: RequestOptions) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
