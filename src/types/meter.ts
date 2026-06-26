// 水表相关类型定义

/**
 * 水表读数记录（云数据库）
 */
export interface MeterRecord {
  _id: string;
  _openid: string;
  imageUrl: string;
  reading: number;
  confidence: number;
  timestamp: number;
  location?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'exported';
}

/**
 * 识别结果
 */
export interface RecognitionResult {
  reading: number;
  confidence: number;
  success: boolean;
  message?: string;
}

/**
 * 计算规则（云数据库）
 */
export interface CalculationRule {
  _id: string;
  _openid: string;
  name: string;
  formula: string;
  unitPrice: number;
  description: string;
  isDefault: boolean;
  createdAt: number;
}

/**
 * 导出配置
 */
export interface ExportConfig {
  format: 'excel' | 'csv';
  includeFields: string[];
  dateRange?: {
    start: number;
    end: number;
  };
}