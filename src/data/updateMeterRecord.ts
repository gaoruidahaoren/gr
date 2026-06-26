// updateMeterRecord 云函数 mock
export default function updateMeterRecordMock(params: {
  id: string;
  reading?: number;
  notes?: string;
  status?: 'pending' | 'confirmed' | 'exported';
}) {
  console.log('[Mock] 更新记录:', params);
  return {
    success: true,
  };
}