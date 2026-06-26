import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import classnames from 'classnames';
import styles from './index.module.scss';
import type { MeterRecord } from '@/types/meter';

interface RecordCardProps {
  record: MeterRecord;
  onClick: () => void;
  onDelete?: () => void;
}

const RecordCard: React.FC<RecordCardProps> = ({ record, onClick, onDelete }) => {
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

  const getStatusClass = (status: MeterRecord['status']) => {
    switch (status) {
      case 'pending':
        return styles.statusPending;
      case 'confirmed':
        return styles.statusConfirmed;
      case 'exported':
        return styles.statusExported;
      default:
        return '';
    }
  };

  return (
    <View className={styles.recordCard} onClick={onClick}>
      <Image
        src={record.imageUrl}
        mode="aspectFill"
        className={styles.recordImage}
        onError={() => {
          console.error('[RecordCard] 图片加载失败:', record.imageUrl);
        }}
      />
      <View className={styles.recordContent}>
        <View className={styles.recordHeader}>
          <Text className={styles.readingValue}>
            {record.reading}
            <Text className={styles.readingUnit}>m³</Text>
          </Text>
          <View className={classnames(styles.statusBadge, getStatusClass(record.status))}>
            <Text className={styles.statusText}>{getStatusText(record.status)}</Text>
          </View>
        </View>
        <Text className={styles.recordTime}>{formatDate(record.timestamp)}</Text>
        {record.notes && (
          <Text className={styles.recordNotes}>{record.notes}</Text>
        )}
      </View>
    </View>
  );
};

export default RecordCard;