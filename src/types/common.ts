// 通用类型定义

/**
 * 加载状态
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * 分页参数
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * 分页响应
 */
export interface PaginationResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * API响应基础结构
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code?: number;
}