// createCalculationRule 云函数 mock
export default function createCalculationRuleMock(params: {
  name: string;
  formula: string;
  unitPrice: number;
  description: string;
  isDefault: boolean;
}) {
  console.log('[Mock] 创建规则:', params);
  return {
    ruleId: 'rule_' + Date.now(),
  };
}