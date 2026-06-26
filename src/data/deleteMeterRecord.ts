// deleteMeterRecord 云函数 mock
export default function deleteMeterRecordMock(params: { id: string }) {
  console.log('[Mock] 删除记录:', params.id);
  return {
    success: true,
  };
}