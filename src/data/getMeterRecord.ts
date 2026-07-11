// getMeterRecord 云函数 mock (H5 环境使用本地存储)
import { getRecordById } from '@/services/localStorage';

export default function getMeterRecordMock(params: { recordId: string }) {
  console.log('[Mock] 获取单条记录:', params.recordId);

  const record = getRecordById(params.recordId);

  return {
    record,
  };
}
