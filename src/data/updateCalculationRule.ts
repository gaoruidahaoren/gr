// updateCalculationRule 云函数 mock
export default function updateCalculationRuleMock(params: {
  id: string;
  name?: string;
  formula?: string;
  unitPrice?: number;
  description?: string;
  isDefault?: boolean;
}) {
  console.log('[Mock] 更新规则:', params);
  return {
    success: true,
  };
}