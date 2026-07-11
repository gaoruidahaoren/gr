import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { callFunction } from '@/services/cloud';
import {
  calculateDifferences,
  calculateSummaries,
  getUniqueMeterNumbers,
  getUniqueParentMeters,
  getDateRange,
  filterByDateRange,
  filterByMeterNumber,
  filterByMeterType,
} from '@/services/calculate';
import styles from './index.module.scss';
import type { MeterRecord, MeterDifference, MeterSummary } from '@/types/meter';

const CalculatePage: React.FC = () => {
  const [records, setRecords] = useState<MeterRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'difference' | 'summary'>('difference');
  const [filterType, setFilterType] = useState<'all' | 'water' | 'electric'>('all');
  const [selectedMeter, setSelectedMeter] = useState<string>('all');

  const [differences, setDifferences] = useState<MeterDifference[]>([]);
  const [summaries, setSummaries] = useState<MeterSummary[]>([]);
  const [meterNumbers, setMeterNumbers] = useState<string[]>([]);
  const [parentMeters, setParentMeters] = useState<string[]>([]);

  useEffect(() => {
    loadRecords();
  }, []);

  useEffect(() => {
    if (records.length > 0) {
      calculate();
    }
  }, [records, filterType, selectedMeter]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const result = await callFunction<{ records: MeterRecord[]; total: number }>('getMeterRecords');
      setRecords(result.records);
    } catch (error) {
      console.error('[CalculatePage] 获取记录失败:', error);
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const calculate = () => {
    // 应用筛选
    let filtered = records;
    if (filterType !== 'all') {
      filtered = filterByMeterType(filtered, filterType);
    }
    if (selectedMeter !== 'all') {
      filtered = filterByMeterNumber(filtered, selectedMeter);
    }

    // 计算差值
    const diffs = calculateDifferences(filtered);
    setDifferences(diffs);

    // 计算汇总
    const sums = calculateSummaries(filtered);
    setSummaries(sums);

    // 获取所有表号
    const numbers = getUniqueMeterNumbers(filtered);
    setMeterNumbers(numbers);

    const parents = getUniqueParentMeters(filtered);
    setParentMeters(parents);
  };

  const getUnit = (type: 'water' | 'electric') => {
    return type === 'water' ? 'm³' : 'kWh';
  };

  return (
    <View className={styles.calculatePage}>
      <View className={styles.headerBg} />
      <View className={styles.headerContent}>
        <View className={styles.headerTop}>
          <Text className={styles.pageTitle}>电表计算</Text>
          <Text className={styles.headerIcon}>📊</Text>
        </View>
      </View>

      <View className={styles.contentSection}>
        {/* 筛选区域 */}
        <View className={styles.filterSection}>
          <View className={styles.filterRow}>
            <Text className={styles.filterLabel}>类型：</Text>
            <View className={styles.filterTags}>
              <Text
                className={`${styles.filterTag} ${filterType === 'all' ? styles.active : ''}`}
                onClick={() => setFilterType('all')}
              >
                全部
              </Text>
              <Text
                className={`${styles.filterTag} ${filterType === 'water' ? styles.active : ''}`}
                onClick={() => setFilterType('water')}
              >
                💧 水表
              </Text>
              <Text
                className={`${styles.filterTag} ${filterType === 'electric' ? styles.active : ''}`}
                onClick={() => setFilterType('electric')}
              >
                ⚡ 电表
              </Text>
            </View>
          </View>

          {meterNumbers.length > 0 && (
            <View className={styles.filterRow}>
              <Text className={styles.filterLabel}>表号：</Text>
              <View className={styles.filterTags}>
                <Text
                  className={`${styles.filterTag} ${selectedMeter === 'all' ? styles.active : ''}`}
                  onClick={() => setSelectedMeter('all')}
                >
                  全部
                </Text>
                {meterNumbers.slice(0, 5).map(num => (
                  <Text
                    key={num}
                    className={`${styles.filterTag} ${selectedMeter === num ? styles.active : ''}`}
                    onClick={() => setSelectedMeter(num)}
                  >
                    {num}
                  </Text>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* 标签页切换 */}
        <View className={styles.tabBar}>
          <Text
            className={`${styles.tabItem} ${activeTab === 'difference' ? styles.active : ''}`}
            onClick={() => setActiveTab('difference')}
          >
            差值计算
          </Text>
          <Text
            className={`${styles.tabItem} ${activeTab === 'summary' ? styles.active : ''}`}
            onClick={() => setActiveTab('summary')}
          >
            汇总比对
          </Text>
        </View>

        {/* 计算结果 */}
        <ScrollView className={styles.resultList} scrollY>
          {activeTab === 'difference' ? (
            differences.length === 0 ? (
              <View className={styles.emptyState}>
                <Text className={styles.emptyIcon}>📉</Text>
                <Text className={styles.emptyTitle}>暂无差值数据</Text>
                <Text className={styles.emptyDesc}>同一电表需要至少2条记录才能计算差值</Text>
              </View>
            ) : (
              differences.map((diff, index) => (
                <View key={index} className={styles.resultCard}>
                  <View className={styles.cardHeader}>
                    <Text className={styles.meterNumber}>{diff.meterNumber}</Text>
                    <Text className={styles.meterType}>
                      {diff.meterType === 'water' ? '💧 水表' : '⚡ 电表'}
                    </Text>
                  </View>
                  <View className={styles.cardBody}>
                    <View className={styles.dateRange}>
                      <Text className={styles.dateItem}>{diff.startDate}</Text>
                      <Text className={styles.dateArrow}>→</Text>
                      <Text className={styles.dateItem}>{diff.endDate}</Text>
                    </View>
                    <View className={styles.readingRow}>
                      <View className={styles.readingItem}>
                        <Text className={styles.readingLabel}>起始读数</Text>
                        <Text className={styles.readingValue}>{diff.startReading}</Text>
                      </View>
                      <View className={styles.readingItem}>
                        <Text className={styles.readingLabel}>结束读数</Text>
                        <Text className={styles.readingValue}>{diff.endReading}</Text>
                      </View>
                      <View className={styles.readingItem}>
                        <Text className={styles.readingLabel}>差值</Text>
                        <Text className={styles.diffValue}>{diff.difference.toFixed(2)}</Text>
                        <Text className={styles.diffUnit}>{diff.unit}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            )
          ) : (
            summaries.length === 0 ? (
              <View className={styles.emptyState}>
                <Text className={styles.emptyIcon}>📊</Text>
                <Text className={styles.emptyTitle}>暂无汇总数据</Text>
                <Text className={styles.emptyDesc}>需要设置父表号才能进行汇总比对</Text>
              </View>
            ) : (
              summaries.map((sum, index) => (
                <View key={index} className={styles.resultCard}>
                  <View className={styles.cardHeader}>
                    <Text className={styles.meterNumber}>父表: {sum.parentMeter}</Text>
                    <Text className={styles.dateText}>{sum.date}</Text>
                  </View>
                  <View className={styles.cardBody}>
                    <View className={styles.childList}>
                      {sum.childMeters.map((child, i) => (
                        <View key={i} className={styles.childItem}>
                          <Text className={styles.childNumber}>{child.meterNumber}</Text>
                          <Text className={styles.childReading}>{child.reading} {sum.unit}</Text>
                        </View>
                      ))}
                    </View>
                    <View className={styles.summaryRow}>
                      <View className={styles.summaryItem}>
                        <Text className={styles.summaryLabel}>子表合计</Text>
                        <Text className={styles.summaryValue}>{sum.totalReading.toFixed(2)}</Text>
                      </View>
                      <View className={styles.summaryItem}>
                        <Text className={styles.summaryLabel}>差值</Text>
                        <Text className={styles.summaryValue}>{sum.difference.toFixed(2)}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))
            )
          )}
        </ScrollView>
      </View>
    </View>
  );
};

export default CalculatePage;
