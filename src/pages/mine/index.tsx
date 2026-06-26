import React, { useEffect, useState } from 'react';
import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { callFunction } from '@/services/cloud';
import { exportDataWithProgress } from '@/services/export';
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
      console.log('[MinePage] 获取统计数据');
      setRecordCount(result.total);
      const total = result.records.reduce((sum, r) => sum + r.reading, 0);
      setTotalReading(total);
    } catch (error) {
      console.error('[MinePage] 获取统计失败:', error);
    }
  };

  const handleExport = async () => {
    console.log('[MinePage] 导出数据');
    try {
      const result = await callFunction<{ records: MeterRecord[]; total: number }>('getMeterRecords');
      await exportDataWithProgress(result.records);
    } catch (error) {
      console.error('[MinePage] 导出失败:', error);
      Taro.showToast({
        title: '导出失败',
        icon: 'none',
      });
    }
  };

  const handleSettings = () => {
    console.log('[MinePage] 打开设置');
    Taro.showToast({
      title: '设置功能开发中',
      icon: 'none',
    });
  };

  const handleHelp = () => {
    console.log('[MinePage] 打开帮助');
    Taro.showToast({
      title: '帮助功能开发中',
      icon: 'none',
    });
  };

  const handleAbout = () => {
    console.log('[MinePage] 打开关于');
    Taro.showModal({
      title: '关于智能读表',
      content: '版本：1.0.0\n\n基于AI多模态能力的水表读数识别小程序，支持智能识别、数据管理和Excel导出功能。',
      showCancel: false,
    });
  };

  const menuItems = [
    {
      icon: '📤',
      title: '导出数据',
      action: handleExport,
    },
    {
      icon: '⚙️',
      title: '设置',
      action: handleSettings,
    },
    {
      icon: '❓',
      title: '帮助与反馈',
      action: handleHelp,
    },
    {
      icon: 'ℹ️',
      title: '关于',
      action: handleAbout,
    },
  ];

  return (
    <View className={styles.minePage}>
      {/* 用户信息卡片 */}
      <View className={styles.userCard}>
        <View className={styles.avatar}>👤</View>
        <View className={styles.userInfo}>
          <Text className={styles.nickname}>智能用户</Text>
          <View className={styles.userStats}>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{recordCount}</Text>
              <Text className={styles.statLabel}>记录</Text>
            </View>
            <View className={styles.statItem}>
              <Text className={styles.statValue}>{totalReading.toFixed(1)}</Text>
              <Text className={styles.statLabel}>总计(m³)</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 功能菜单 */}
      <View className={styles.menuList}>
        {menuItems.map((item, index) => (
          <View key={index} className={styles.menuItem} onClick={item.action}>
            <View className={styles.menuIcon}>{item.icon}</View>
            <View className={styles.menuContent}>
              <Text className={styles.menuTitle}>{item.title}</Text>
            </View>
            <Text className={styles.menuArrow}>›</Text>
          </View>
        ))}
      </View>

      {/* 版本信息 */}
      <View className={styles.versionInfo}>
        <Text className={styles.versionText}>版本 1.0.0</Text>
      </View>
    </View>
  );
};

export default MinePage;