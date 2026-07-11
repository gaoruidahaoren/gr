import React, { useEffect, useState } from 'react';
import { View, ScrollView, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { callFunction } from '@/services/cloud';
import styles from './index.module.scss';
import type { MeterRecord } from '@/types/meter';

const RecordsPage: React.FC = () => {
  const [records, setRecords] = useState<MeterRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'water' | 'electric'>('all');

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const result = await callFunction<{ records: MeterRecord[]; total: number }>('getMeterRecords');
      setRecords(result.records);
    } catch (error) {
      console.error('[RecordsPage] 获取记录失败:', error);
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
      Taro.stopPullDownRefresh();
    }
  };

  const handleRecordClick = (recordId: string) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${recordId}` });
  };

  const handleUploadNew = () => {
    Taro.switchTab({ url: '/pages/home/index' });
  };

  const filteredRecords = filterType === 'all'
    ? records
    : records.filter(r => r.meterType === filterType);

  const waterCount = records.filter(r => r.meterType === 'water').length;
  const electricCount = records.filter(r => r.meterType === 'electric').length;

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${month}-${day} ${hours}:${minutes}`;
  };

  const getStatusText = (status: MeterRecord['status']) => {
    switch (status) {
      case 'pending': return '待确认';
      case 'confirmed': return '已确认';
      case 'exported': return '已导出';
      default: return '';
    }
  };

  return (
    <View className={styles.recordsPage}>
      <View className={styles.headerBg} />
      <View className={styles.headerContent}>
        <View className={styles.headerTop}>
          <View className={styles.greeting}>
            <Text className={styles.pageTitle}>历史记录</Text>
          </View>
          <Text className={styles.headerIcon}>📋</Text>
        </View>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{records.length}</Text>
            <Text className={styles.statLabel}>总记录</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{waterCount}</Text>
            <Text className={styles.statLabel}>水表</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{electricCount}</Text>
            <Text className={styles.statLabel}>电表</Text>
          </View>
        </View>
      </View>

      <View className={styles.contentSection}>
        <View className={styles.filterBar}>
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

        {filteredRecords.length === 0 && !loading ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📊</Text>
            <Text className={styles.emptyTitle}>暂无记录</Text>
            <Text className={styles.emptyDesc}>开始上传水表或电表照片，AI将自动识别读数</Text>
            <Text className={styles.uploadBtn} onClick={handleUploadNew}>立即上传</Text>
          </View>
        ) : (
          <ScrollView className={styles.recordList} scrollY>
            {filteredRecords.map((record) => (
              <View
                key={record._id}
                className={styles.recordCard}
                onClick={() => handleRecordClick(record._id)}
              >
                <View className={styles.recordTop}>
                  <View className={styles.recordType}>
                    <Text className={styles.typeIcon}>
                      {record.meterType === 'water' ? '💧' : '⚡'}
                    </Text>
                    <Text className={styles.typeName}>
                      {record.meterType === 'water' ? '水表' : '电表'}
                    </Text>
                  </View>
                  <Text className={styles.recordTime}>{formatDate(record.timestamp)}</Text>
                </View>

                <View className={styles.recordBody}>
                  <Image
                    src={record.imageUrl}
                    className={styles.recordImage}
                    mode="aspectFill"
                  />
                  <View className={styles.recordInfo}>
                    <View className={styles.infoRow}>
                      <Text className={styles.infoLabel}>读数</Text>
                      <Text className={styles.readingBig}>{record.reading}</Text>
                    </View>
                    {record.meterNumber && (
                      <View className={styles.infoRow}>
                        <Text className={styles.infoLabel}>表号</Text>
                        <Text className={styles.meterNum}>{record.meterNumber}</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View className={styles.recordFooter}>
                  <Text className={`${styles.statusBadge} ${record.status}`}>
                    {getStatusText(record.status)}
                  </Text>
                  <Text className={styles.confidence}>
                    置信度: {(record.confidence * 100).toFixed(0)}%
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

export default RecordsPage;
