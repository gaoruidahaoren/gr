import React, { useEffect, useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { callFunction } from '@/services/cloud';
import styles from './index.module.scss';
import type { MeterRecord } from '@/types/meter';

const MinePage: React.FC = () => {
  const [recordCount, setRecordCount] = useState(0);
  const [totalReading, setTotalReading] = useState(0);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const result = await callFunction<{ records: MeterRecord[]; total: number }>('getMeterRecords');
      setRecordCount(result.total);
      const total = result.records.reduce((sum, r) => sum + r.reading, 0);
      setTotalReading(total);
    } catch (error) {
      console.error('[MinePage] 获取统计失败:', error);
    }
  };

  const handleSettings = () => {
    Taro.showToast({ title: '设置功能开发中', icon: 'none' });
  };

  const handleHelp = () => {
    Taro.showToast({ title: '帮助功能开发中', icon: 'none' });
  };

  const handleAbout = () => {
    Taro.showModal({
      title: '关于智能读表',
      content: '版本：1.0.0\n\n基于AI多模态能力的智能读数识别小程序，支持水表/电表识别、数据管理和Excel导出功能。',
      showCancel: false,
    });
  };

  const menuItems = [
    { icon: '⚙️', title: '设置', action: handleSettings },
    { icon: '❓', title: '帮助与反馈', action: handleHelp },
    { icon: 'ℹ️', title: '关于', action: handleAbout },
  ];

  return (
    <View className={styles.minePage}>
      <View className={styles.headerBg} />
      <View className={styles.headerContent}>
        <View className={styles.userCard}>
          <View className={styles.avatar}>👤</View>
          <View className={styles.userInfo}>
            <Text className={styles.nickname}>智能用户</Text>
            <Text className={styles.userDesc}>使用智能读表，轻松识别</Text>
          </View>
        </View>
        <View className={styles.userStats}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{recordCount}</Text>
            <Text className={styles.statLabel}>记录数</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{totalReading.toFixed(1)}</Text>
            <Text className={styles.statLabel}>总计读数</Text>
          </View>
        </View>
      </View>

      <View className={styles.contentSection}>
        <Text className={styles.sectionTitle}>功能设置</Text>
        <View className={styles.menuCard}>
          {menuItems.map((item, index) => (
            <View key={index} className={styles.menuItem} onClick={item.action}>
              <Text className={styles.menuIcon}>{item.icon}</Text>
              <Text className={styles.menuTitle}>{item.title}</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          ))}
        </View>

        <View className={styles.versionInfo}>
          <Text className={styles.versionText}>版本 1.0.0</Text>
        </View>
      </View>
    </View>
  );
};

export default MinePage;
