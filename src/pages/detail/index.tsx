import React, { useEffect, useState } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { callFunction } from '@/services/cloud';
import styles from './index.module.scss';
import type { MeterRecord } from '@/types/meter';
import { meterTypeLabels, meterUnitLabels } from '@/config/prompt';

const DetailPage: React.FC = () => {
  const [record, setRecord] = useState<MeterRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const pages = Taro.getCurrentPages();
    const currentPage = pages[pages.length - 1];
    const options = (currentPage as unknown as { options: { id: string } }).options;
    
    if (options?.id) {
      loadRecord(options.id);
    }
  }, []);

  const loadRecord = async (recordId: string) => {
    setLoading(true);
    try {
      const result = await callFunction<{ record: MeterRecord }>('getMeterRecord', {
        recordId,
      });
      setRecord(result.record);
    } catch (error) {
      console.error('[DetailPage] 获取记录失败:', error);
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const getStatusText = (status: MeterRecord['status']) => {
    switch (status) {
      case 'pending':
        return '待确认';
      case 'confirmed':
        return '已确认';
      case 'exported':
        return '已导出';
      default:
        return '';
    }
  };

  const handleBack = () => {
    Taro.navigateBack();
  };

  if (loading) {
    return (
      <View className={styles.detailPage}>
        <View className={styles.loadingContainer}>
          <Text className={styles.loadingText}>加载中...</Text>
        </View>
      </View>
    );
  }

  if (!record) {
    return (
      <View className={styles.detailPage}>
        <View className={styles.placeholder}>
          <Text className={styles.placeholderIcon}>📋</Text>
          <Text className={styles.placeholderTitle}>记录不存在</Text>
          <Text className={styles.placeholderText}>该记录可能已被删除</Text>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.detailPage}>
      <View className={styles.header}>
        <Button className={styles.backButton} onClick={handleBack}>
          <Text className={styles.backIcon}>←</Text>
        </Button>
        <Text className={styles.title}>记录详情</Text>
        <View className={styles.statusBadge}>
          <Text className={styles.statusText}>{getStatusText(record.status)}</Text>
        </View>
      </View>

      <View className={styles.content}>
        <View className={styles.imageContainer}>
          <Image src={record.imageUrl} mode="widthFix" className={styles.recordImage} />
        </View>

        <View className={styles.infoCard}>
          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>仪表类型</Text>
            <Text className={styles.infoValue}>{meterTypeLabels[record.meterType]}</Text>
          </View>

          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>表号</Text>
            <Text className={styles.infoValue}>{record.meterNumber || '-'}</Text>
          </View>

          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>读数</Text>
            <Text className={styles.infoValue}>
              <Text className={styles.readingNum}>{record.reading}</Text>
              <Text className={styles.readingUnit}>{meterUnitLabels[record.meterType]}</Text>
            </Text>
          </View>

          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>置信度</Text>
            <Text className={styles.infoValue}>{(record.confidence * 100).toFixed(1)}%</Text>
          </View>

          <View className={styles.infoRow}>
            <Text className={styles.infoLabel}>时间</Text>
            <Text className={styles.infoValue}>{formatDate(record.timestamp)}</Text>
          </View>

          {record.location && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>位置</Text>
              <Text className={styles.infoValue}>{record.location}</Text>
            </View>
          )}

          {record.notes && (
            <View className={styles.infoRow}>
              <Text className={styles.infoLabel}>备注</Text>
              <Text className={styles.infoValue}>{record.notes}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default DetailPage;