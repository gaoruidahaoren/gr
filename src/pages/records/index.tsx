import React, { useEffect, useState } from 'react';
import { View, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { callFunction } from '@/services/cloud';
import RecordCard from '@/components/RecordCard';
import EmptyState from '@/components/EmptyState';
import styles from './index.module.scss';
import type { MeterRecord } from '@/types/meter';

const RecordsPage: React.FC = () => {
  const [records, setRecords] = useState<MeterRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecords();
  }, []);

  useEffect(() => {
    Taro.onPullDownRefresh(loadRecords);
    return () => {
      Taro.offPullDownRefresh(loadRecords);
    };
  }, []);

  const loadRecords = async () => {
    setLoading(true);
    try {
      const result = await callFunction<{ records: MeterRecord[]; total: number }>('getMeterRecords');
      console.log('[RecordsPage] 获取记录成功:', result.records.length);
      setRecords(result.records);
    } catch (error) {
      console.error('[RecordsPage] 获取记录失败:', error);
      Taro.showToast({
        title: '加载失败',
        icon: 'none',
      });
    } finally {
      setLoading(false);
      Taro.stopPullDownRefresh();
    }
  };

  const handleRecordClick = (recordId: string) => {
    console.log('[RecordsPage] 点击记录:', recordId);
    Taro.navigateTo({
      url: `/pages/detail/index?id=${recordId}`,
    });
  };

  const handleUploadNew = () => {
    Taro.switchTab({
      url: '/pages/home/index',
    });
  };

  return (
    <View className={styles.recordsPage}>
      <View className={styles.header}>
        <Text className={styles.title}>历史记录</Text>
      </View>

      {records.length === 0 && !loading ? (
        <EmptyState
          icon="📊"
          title="暂无记录"
          description="开始上传水表照片，AI将自动识别读数"
          buttonText="立即上传"
          onButtonClick={handleUploadNew}
        />
      ) : (
        <ScrollView className={styles.recordList} scrollY>
          {records.map((record) => (
            <View key={record._id} className={styles.recordItem}>
              <RecordCard
                record={record}
                onClick={() => handleRecordClick(record._id)}
              />
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default RecordsPage;