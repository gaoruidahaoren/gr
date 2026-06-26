// deleteCalculationRule 云函数 mock
export default function deleteCalculationRuleMock(params: { id: string }) {
  console.log('[Mock] 删除规则:', params.id);
  return {
    success: true,
  };
}