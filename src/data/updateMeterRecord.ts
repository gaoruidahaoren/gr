// updateMeterRecord 云函数 mock (H5 环境使用本地存储)
import { updateRecord } from '@/services/localStorage';

export default function updateMeterRecordMock(params: {
  id: string;
  reading?: number;
  notes?: string;
  status?: 'pending' | 'confirmed' | 'exported';
  meterNumber?: string;
}) {
  console.log('[Mock] 更新记录:', params);

  const success = updateRecord(params.id, {
    reading: params.reading,
    notes: params.notes,
    status: params.status,
    meterNumber: params.meterNumber,
  });

  return {
    success,
  };
}