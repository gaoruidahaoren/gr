// createMeterRecord 云函数 mock (H5 环境使用本地存储)
import { createRecord } from '@/services/localStorage';

export default function createMeterRecordMock(params: {
  imageUrl: string;
  reading: number;
  confidence: number;
  meterType: 'water' | 'electric';
  meterNumber?: string;
  location?: string;
  notes?: string;
  status?: 'pending' | 'confirmed' | 'exported';
}) {
  console.log('[Mock] 创建记录:', params);

  const record = createRecord({
    imageUrl: params.imageUrl,
    reading: params.reading,
    confidence: params.confidence,
    meterType: params.meterType,
    meterNumber: params.meterNumber,
    location: params.location,
    notes: params.notes,
    status: params.status || 'confirmed',
  });

  return {
    recordId: record._id,
  };
}