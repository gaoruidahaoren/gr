import React, { useState } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { callFunction } from '@/services/cloud';
import { recognizeMeter } from '@/services/meter';
import { exportDataWithProgress } from '@/services/export';
import UploadCard from '@/components/UploadCard';
import styles from './index.module.scss';
import type { RecognitionResult, MeterRecord } from '@/types/meter';
import { meterTypeLabels, meterUnitLabels } from '@/config/prompt';

interface ImageRecognitionResult {
  imageUrl: string;
  result: RecognitionResult | null;
  status: 'pending' | 'processing' | 'success' | 'error';
}

const HomePage: React.FC = () => {
  const [selectedMeterType, setSelectedMeterType] = useState<'water' | 'electric' | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [recognitionResults, setRecognitionResults] = useState<ImageRecognitionResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentProgress, setCurrentProgress] = useState<{ current: number; total: number } | null>(null);

  const handleImageUpload = async (urls: string[]) => {
    console.log('[HomePage] 图片上传:', urls);
    setImageUrls(urls);
    setRecognitionResults(urls.map(url => ({
      imageUrl: url,
      result: null,
      status: 'pending' as const,
    })));
    await performBatchRecognition(urls);
  };

  const handleRemoveImage = (index: number) => {
    const newUrls = [...imageUrls];
    newUrls.splice(index, 1);
    setImageUrls(newUrls);
    
    const newResults = [...recognitionResults];
    newResults.splice(index, 1);
    setRecognitionResults(newResults);
  };

  const performBatchRecognition = async (imagePaths: string[]) => {
    setLoading(true);
    setCurrentProgress({ current: 0, total: imagePaths.length });

    const results: ImageRecognitionResult[] = imagePaths.map(url => ({
      imageUrl: url,
      result: null,
      status: 'processing' as const,
    }));
    setRecognitionResults(results);

    try {
      console.log('[HomePage] 开始批量识别');
      let successCount = 0;

      for (let i = 0; i < imagePaths.length; i++) {
        setCurrentProgress({ current: i + 1, total: imagePaths.length });
        try {
          const result = await recognizeMeter(imagePaths[i], selectedMeterType!);

          if (result.success) {
            successCount++;
            results[i] = {
              imageUrl: imagePaths[i],
              result,
              status: 'success',
            };
          } else {
            results[i] = {
              imageUrl: imagePaths[i],
              result: null,
              status: 'error',
            };
          }
        } catch {
          results[i] = {
            imageUrl: imagePaths[i],
            result: null,
            status: 'error',
          };
        }
        setRecognitionResults([...results]);
      }

      Taro.showToast({
        title: `${successCount}/${imagePaths.length} 识别成功`,
        icon: successCount === imagePaths.length ? 'success' : 'none',
      });
    } catch (error) {
      console.error('[HomePage] 批量识别失败:', error);
    } finally {
      setLoading(false);
      setCurrentProgress(null);
    }
  };

  const handleConfirm = async () => {
    const successfulResults = recognitionResults.filter(r => r.status === 'success' && r.result);
    if (successfulResults.length === 0) {
      Taro.showToast({ title: '没有可保存的识别结果', icon: 'none' });
      return;
    }

    setLoading(true);
    let savedCount = 0;

    try {
      for (const item of successfulResults) {
        try {
          await callFunction<{ recordId: string }>('createMeterRecord', {
            imageUrl: item.imageUrl,
            reading: item.result!.reading,
            confidence: item.result!.confidence,
            meterType: item.result!.meterType,
            meterNumber: item.result!.meterNumber,
            status: 'confirmed',
          });
          savedCount++;
        } catch {
          console.error('[HomePage] 保存单条记录失败');
        }
      }

      Taro.showToast({
        title: `${savedCount}/${successfulResults.length} 保存成功`,
        icon: savedCount === successfulResults.length ? 'success' : 'none',
      });

      setImageUrls([]);
      setRecognitionResults([]);

      setTimeout(() => {
        Taro.switchTab({
          url: '/pages/records/index',
        });
      }, 1500);
    } catch (error) {
      console.error('[HomePage] 保存失败:', error);
      Taro.showToast({ title: '保存失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setImageUrls([]);
    setRecognitionResults([]);
    setSelectedMeterType(null);
  };

  const handleExport = async () => {
    console.log('[HomePage] 导出数据');
    try {
      const result = await callFunction<{ records: MeterRecord[]; total: number }>('getMeterRecords');
      if (result.records.length === 0) {
        Taro.showToast({ title: '暂无数据可导出', icon: 'none' });
        return;
      }
      await exportDataWithProgress(result.records);
    } catch (error) {
      console.error('[HomePage] 导出失败:', error);
      Taro.showToast({
        title: '导出失败',
        icon: 'none',
      });
    }
  };

  const handleEditReading = (index: number) => {
    // 使用微信小程序原生的 showModal with editable
    // @ts-ignore - Taro 类型定义不完整，但微信小程序支持 editable
    Taro.showModal({
      title: '修改读数',
      editable: true,
      placeholderText: `请输入读数（当前: ${recognitionResults[index].result?.reading}）`,
      success: (res) => {
        // @ts-ignore
        if (res.confirm && res.content) {
          // @ts-ignore
          const newReading = parseFloat(res.content);
          if (!isNaN(newReading) && newReading >= 0) {
            const newResults = [...recognitionResults];
            newResults[index] = {
              ...newResults[index],
              result: {
                ...newResults[index].result!,
                reading: newReading,
                confidence: 1.0,
              },
            };
            setRecognitionResults(newResults);
            Taro.showToast({ title: '读数已更新', icon: 'success' });
          } else {
            Taro.showToast({ title: '请输入有效的数字', icon: 'none' });
          }
        }
      },
    });
  };

  const handleRetrySingle = async (index: number) => {
    const item = recognitionResults[index];
    if (!item || !selectedMeterType) return;

    const newResults = [...recognitionResults];
    newResults[index] = { ...item, status: 'processing', result: null };
    setRecognitionResults(newResults);

    try {
      const result = await recognizeMeter(item.imageUrl, selectedMeterType);
      newResults[index] = {
        ...item,
        result: result.success ? result : null,
        status: result.success ? 'success' : 'error',
      };
    } catch {
      newResults[index] = { ...item, status: 'error', result: null };
    }

    setRecognitionResults([...newResults]);
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
      <View className={styles.headerBg} />
      <View className={styles.headerContent}>
        <View className={styles.headerTop}>
          <View className={styles.greeting}>
            <Text className={styles.greetingText}>你好，欢迎使用</Text>
            <Text className={styles.appTitle}>智能读表</Text>
          </View>
          <Text className={styles.headerIcon}>📊</Text>
        </View>
        <View className={styles.quickStats}>
          <View className={styles.statCard}>
            <Text className={styles.statIcon}>🤖</Text>
            <Text className={styles.statValue}>AI</Text>
            <Text className={styles.statLabel}>智能识别</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statIcon}>🎯</Text>
            <Text className={styles.statValue}>98%</Text>
            <Text className={styles.statLabel}>准确率</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statIcon}>📤</Text>
            <Text className={styles.statValue}>Excel</Text>
            <Text className={styles.statLabel}>一键导出</Text>
          </View>
        </View>
      </View>

      <View className={styles.mainContent}>
        {!selectedMeterType ? (
          <>
            <View className={styles.sectionHeader}>
              <Text className={styles.sectionTitle}>选择识别类型</Text>
            </View>
            <View className={styles.typeGrid}>
              <View
                className={styles.typeCard}
                onClick={() => setSelectedMeterType('water')}
              >
                <Text className={styles.typeEmoji}>💧</Text>
                <Text className={styles.typeName}>水表</Text>
                <Text className={styles.typeDesc}>识别水表读数</Text>
              </View>
              <View
                className={styles.typeCard}
                onClick={() => setSelectedMeterType('electric')}
              >
                <Text className={styles.typeEmoji}>⚡</Text>
                <Text className={styles.typeName}>电表</Text>
                <Text className={styles.typeDesc}>识别电表读数</Text>
              </View>
            </View>
          </>
        ) : (
          <View className={styles.uploadArea}>
            <View className={styles.uploadHeader}>
              <Button className={styles.backBtn} onClick={() => setSelectedMeterType(null)}>
                ← 返回
              </Button>
              <Text className={styles.typeTag}>
                {meterTypeLabels[selectedMeterType || 'water']}识别
              </Text>
            </View>
            <UploadCard
              imageUrls={imageUrls}
              onUpload={handleImageUpload}
              onRemove={handleRemoveImage}
              loading={loading}
              meterType={selectedMeterType || 'water'}
            />
          </View>
        )}

        {loading && currentProgress && (
          <View className={styles.progressWrap}>
            <Text className={styles.progressText}>
              正在识别第 {currentProgress.current}/{currentProgress.total} 张...
            </Text>
          </View>
        )}

        {recognitionResults.length > 0 && !loading && (
          <View className={styles.resultWrap}>
            <View className={styles.resultTop}>
              <Text className={styles.resultTitle}>识别结果</Text>
              <Text className={styles.resultBadge}>共 {recognitionResults.length} 张</Text>
            </View>

            <View className={styles.resultList}>
              {recognitionResults.map((item, index) => (
                <View key={index} className={styles.resultItem}>
                  <Image src={item.imageUrl} mode="aspectFill" className={styles.resultThumb} />
                  <View className={styles.resultInfo}>
                    {item.result ? (
                      <>
                        <View className={styles.resultRow}>
                          <Text className={styles.resultLabel}>读数</Text>
                          <Text className={styles.readingBig}>
                            {item.result.reading} {meterUnitLabels[item.result.meterType]}
                          </Text>
                          <Text
                            className={styles.editBtn}
                            onClick={() => handleEditReading(index)}
                          >
                            ✏️
                          </Text>
                        </View>
                        <View className={styles.resultRow}>
                          <Text className={styles.resultLabel}>置信度</Text>
                          <Text className={styles.resultValue}>
                            {(item.result.confidence * 100).toFixed(1)}%
                            {item.result.confidence < 0.7 && (
                              <Text className={styles.warnText}> ⚠️</Text>
                            )}
                          </Text>
                        </View>
                      </>
                    ) : item.status === 'error' ? (
                      <View className={styles.errorWrap}>
                        <Text className={styles.errorText}>识别失败</Text>
                        <Text
                          className={styles.retryBtn}
                          onClick={() => handleRetrySingle(index)}
                        >
                          重试
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              ))}
            </View>

            <View className={styles.resultActions}>
              <Button
                className={`${styles.actionBtn} ${styles.secondary}`}
                onClick={handleRetry}
              >
                重新识别
              </Button>
              <Button
                className={`${styles.actionBtn} ${styles.primary}`}
                onClick={handleConfirm}
              >
                确认保存
              </Button>
            </View>
          </View>
        )}
      </View>

      <View className={styles.bottomActions}>
        <View className={styles.actionCard} onClick={handleViewRecords}>
          <Text className={styles.actionIcon}>📊</Text>
          <Text className={styles.actionText}>历史记录</Text>
        </View>
        <View className={styles.actionCard} onClick={handleViewCalculate}>
          <Text className={styles.actionIcon}>🔢</Text>
          <Text className={styles.actionText}>计算</Text>
        </View>
        <View className={styles.actionCard} onClick={handleExport}>
          <Text className={styles.actionIcon}>📤</Text>
          <Text className={styles.actionText}>导出数据</Text>
        </View>
      </View>

      <View className={styles.bottomBtn}>
        <Button
          className={styles.viewAllBtn}
          onClick={handleViewRecords}
        >
          查看全部记录
        </Button>
      </View>
    </View>
  );
};

export default HomePage;