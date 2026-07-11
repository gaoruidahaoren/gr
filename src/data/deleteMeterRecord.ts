// deleteMeterRecord 云函数 mock (H5 环境使用本地存储)
import { deleteRecord } from '@/services/localStorage';

export default function deleteMeterRecordMock(params: { id: string }) {
  console.log('[Mock] 删除记录:', params.id);

  const success = deleteRecord(params.id);

  return {
    success,
  };
}