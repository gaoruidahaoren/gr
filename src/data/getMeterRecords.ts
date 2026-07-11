// getMeterRecords 云函数 mock (H5 环境使用本地存储)
import { getRecords } from '@/services/localStorage';

export default function getMeterRecordsMock(params?: { limit?: number; skip?: number }) {
  console.log('[Mock] 获取记录列表:', params);

  const result = getRecords(params);

  console.log('[Mock] 获取到记录数量:', result.records.length);
  return result;
}