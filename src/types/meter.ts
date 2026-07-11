export type MeterType = 'water' | 'electric';

export interface MeterRecord {
  _id: string;
  _openid: string;
  imageUrl: string;
  reading: number;
  confidence: number;
  timestamp: number;
  meterType: MeterType;
  meterNumber?: string;
  parentMeterNumber?: string;  // 父表表号
  location?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'exported';
}

export interface RecognitionResult {
  reading: number;
  confidence: number;
  meterType: MeterType;
  meterNumber?: string;
  success: boolean;
  message?: string;
}

export interface ExportConfig {
  format: 'excel' | 'csv';
  includeFields: string[];
  dateRange?: {
    start: number;
    end: number;
  };
}

// 计算相关类型
export interface MeterDifference {
  meterNumber: string;
  meterType: MeterType;
  startDate: string;
  endDate: string;
  startReading: number;
  endReading: number;
  difference: number;
  unit: string;
}

export interface MeterSummary {
  date: string;
  parentMeter: string;
  childMeters: {
    meterNumber: string;
    reading: number;
  }[];
  totalReading: number;
  difference: number;
  unit: string;
}

export interface CalculationResult {
  differences: MeterDifference[];
  summaries: MeterSummary[];
  totalConsumption: number;
  unit: string;
}