import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { callFunction } from '@/services/cloud';
import EmptyState from '@/components/EmptyState';
import styles from './index.module.scss';
import type { CalculationRule } from '@/types/meter';

const CalculatePage: React.FC = () => {
  const [calculationRules, setCalculationRules] = useState<CalculationRule[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    setLoading(true);
    try {
      const result = await callFunction<{ rules: CalculationRule[] }>('getCalculationRules');
      console.log('[CalculatePage] 获取规则成功:', result.rules.length);
      setCalculationRules(result.rules);
    } catch (error) {
      console.error('[CalculatePage] 获取规则失败:', error);
      Taro.showToast({
        title: '加载失败',
        icon: 'none',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddRule = () => {
    Taro.showToast({
      title: '添加规则功能开发中',
      icon: 'none',
    });
  };

  const handleEditRule = (ruleId: string) => {
    console.log('[CalculatePage] 编辑规则:', ruleId);
    Taro.showToast({
      title: '编辑规则功能开发中',
      icon: 'none',
    });
  };

  const handleDeleteRule = async (ruleId: string) => {
    console.log('[CalculatePage] 删除规则:', ruleId);
    Taro.showModal({
      title: '确认删除',
      content: '确定要删除这个计算规则吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await callFunction('deleteCalculationRule', { id: ruleId });
            Taro.showToast({
              title: '删除成功',
              icon: 'success',
            });
            loadRules();
          } catch (error) {
            console.error('[CalculatePage] 删除失败:', error);
            Taro.showToast({
              title: '删除失败',
              icon: 'none',
            });
          }
        }
      },
    });
  };

  return (
    <View className={styles.calculatePage}>
      <View className={styles.header}>
        <Text className={styles.title}>计算规则</Text>
        <Text className={styles.subtitle}>设置水表计费标准和计算公式</Text>
      </View>

      {calculationRules.length === 0 && !loading ? (
        <EmptyState
          icon="⚙️"
          title="暂无规则"
          description="添加计费规则，自动计算水费"
          buttonText="添加规则"
          onButtonClick={handleAddRule}
        />
      ) : (
        <ScrollView className={styles.ruleList} scrollY>
          {calculationRules.map((rule) => (
            <View key={rule._id} className={styles.ruleCard}>
              <View className={styles.ruleHeader}>
                <Text className={styles.ruleName}>{rule.name}</Text>
                {rule.isDefault && (
                  <View className={styles.ruleBadge}>
                    <Text className={styles.ruleBadgeText}>默认</Text>
                  </View>
                )}
              </View>
              <Text className={styles.ruleFormula}>公式: {rule.formula}</Text>
              <Text className={styles.rulePrice}>单价: ¥{rule.unitPrice}/m³</Text>
              <Text className={styles.ruleDescription}>{rule.description}</Text>
              <View className={styles.ruleActions}>
                <Button
                  className={`${styles.actionButton} ${styles.editButton}`}
                  onClick={() => handleEditRule(rule._id)}
                >
                  编辑
                </Button>
                <Button
                  className={`${styles.actionButton} ${styles.deleteButton}`}
                  onClick={() => handleDeleteRule(rule._id)}
                >
                  删除
                </Button>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <Button className={styles.addButton} onClick={handleAddRule}>
        + 添加规则
      </Button>
    </View>
  );
};

export default CalculatePage;