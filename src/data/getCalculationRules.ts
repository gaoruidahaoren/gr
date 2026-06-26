// getCalculationRules 云函数 mock
import type { CalculationRule } from '@/types/meter';

const mockRules: CalculationRule[] = [
  {
    _id: 'rule_1',
    _openid: 'mock_openid',
    name: '居民用水标准',
    formula: 'reading * unitPrice',
    unitPrice: 2.8,
    description: '适用于普通居民家庭用水计费',
    isDefault: true,
    createdAt: Date.now() - 86400000 * 7,
  },
  {
    _id: 'rule_2',
    _openid: 'mock_openid',
    name: '商业用水标准',
    formula: 'reading * unitPrice * 1.5',
    unitPrice: 4.5,
    description: '适用于商业场所用水计费',
    isDefault: false,
    createdAt: Date.now() - 86400000 * 3,
  },
];

export default function getCalculationRulesMock(params?: any) {
  return {
    rules: mockRules,
  };
}