import React, { useState } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { callFunction } from '@/services/cloud';
import { recognizeMeter } from '@/services/meter';
import UploadCard from '@/components/UploadCard';
import styles from './index.module.scss';
import type { MeterRecord } from '@/types/meter';

const HomePage: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [recognitionResult, setRecognitionResult] = useState<{ reading: number; confidence: number } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = async (url: string) => {
    console.log('[HomePage] 图片上传:', url);
    setImageUrl(url);
    setRecognitionResult(null);
    await performRecognition(url);
  };

  const performRecognition = async (imagePath: string) => {
    setLoading(true);
    try {
      console.log('[HomePage] 开始识别');
      const result = await recognizeMeter(imagePath);

      if (result.success) {
        setRecognitionResult({
          reading: result.reading,
          confidence: result.confidence,
        });
        Taro.showToast({
          title: '识别成功',
          icon: 'success',
        });
      } else {
        throw new Error(result.message || '识别失败');
      }
    } catch (error) {
      console.error('[HomePage] 识别失败:', error);
      Taro.showToast({
        title: '识别失败，请重试',
        icon: 'none',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!recognitionResult) return;

    try {
      // 调用云函数创建记录
      const result = await callFunction<{ recordId: string }>('createMeterRecord', {
        imageUrl,
        reading: recognitionResult.reading,
        confidence: recognitionResult.confidence,
        status: 'confirmed',
      });

      console.log('[HomePage] 创建记录成功:', result.recordId);

      Taro.showToast({
        title: '保存成功',
        icon: 'success',
      });

      // 清空状态
      setImageUrl('');
      setRecognitionResult(null);

      // 跳转到记录页
      setTimeout(() => {
        Taro.switchTab({
          url: '/pages/records/index',
        });
      }, 1500);
    } catch (error) {
      console.error('[HomePage] 保存失败:', error);
      Taro.showToast({
        title: '保存失败，请重试',
        icon: 'none',
      });
    }
  };

  const handleRetry = () => {
    setImageUrl('');
    setRecognitionResult(null);
  };

  const handleViewRecords = () => {
    Taro.switchTab({
      url: '/pages/records/index',
    });
  };

  const handleViewCalculate = () => {
    Taro.switchTab({
      url: '/pages/calculate/index',
    });
  };

  return (
    <View className={styles.homePage}>
      {/* 头部 */}
      <View className={styles.header}>
        <Text className={styles.title}>智能读表</Text>
        <Text className={styles.subtitle}>AI识别水表读数，智能计算用水量</Text>
      </View>

      {/* 上传区域 */}
      <View className={styles.uploadSection}>
        <UploadCard
          imageUrl={imageUrl}
          onUpload={handleImageUpload}
          loading={loading}
        />
      </View>

      {/* 识别结果 */}
      {recognitionResult && !loading && (
        <View className={styles.resultSection}>
          <View className={styles.resultCard}>
            <View className={styles.resultHeader}>
              <Text className={styles.resultTitle}>识别结果</Text>
              <Text className={styles.confidence}>
                置信度 {(recognitionResult.confidence * 100).toFixed(1)}%
              </Text>
            </View>
            <View className={styles.readingValue}>
              {recognitionResult.reading}
              <Text className={styles.readingUnit}>m³</Text>
            </View>
            <View className={styles.resultActions}>
              <Button
                className={`${styles.actionButton} ${styles.secondaryButton}`}
                onClick={handleRetry}
              >
                重新识别
              </Button>
              <Button
                className={`${styles.actionButton} ${styles.primaryButton}`}
                onClick={handleConfirm}
              >
                确认保存
              </Button>
            </View>
          </View>
        </View>
      )}

      {/* 快捷操作 */}
      <View className={styles.quickActions}>
        <View className={styles.quickActionCard} onClick={handleViewRecords}>
          <Text className={styles.quickActionIcon}>📊</Text>
          <Text className={styles.quickActionText}>历史记录</Text>
        </View>
        <View className={styles.quickActionCard} onClick={handleViewCalculate}>
          <Text className={styles.quickActionIcon}>⚙️</Text>
          <Text className={styles.quickActionText}>计算规则</Text>
        </View>
      </View>
    </View>
  );
};

export default HomePage;