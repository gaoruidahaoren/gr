import React from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';

interface UploadCardProps {
  imageUrls?: string[];
  onUpload: (imageUrls: string[]) => void;
  onRemove?: (index: number) => void;
  loading?: boolean;
  meterType?: 'water' | 'electric';
}

const UploadCard: React.FC<UploadCardProps> = ({ imageUrls = [], onUpload, onRemove, loading, meterType = 'water' }) => {
  const handleChooseImage = async () => {
    try {
      const maxCount = 9 - imageUrls.length;
      if (maxCount <= 0) {
        Taro.showToast({
          title: '最多选择9张图片',
          icon: 'none',
        });
        return;
      }

      const res = await Taro.chooseImage({
        count: maxCount,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      });

      if (res.tempFilePaths && res.tempFilePaths.length > 0) {
        onUpload([...imageUrls, ...res.tempFilePaths]);
      }
    } catch (error) {
      console.error('[UploadCard] 选择图片失败:', error);
      Taro.showToast({
        title: '选择图片失败',
        icon: 'none',
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    if (onRemove) {
      onRemove(index);
    }
  };

  return (
    <View className={styles.uploadCard}>
      {imageUrls.length > 0 ? (
        <View className={styles.previewGrid}>
          {imageUrls.map((url, index) => (
            <View key={index} className={styles.previewItem}>
              <Image
                src={url}
                mode="aspectFill"
                className={styles.previewImage}
                onError={() => {
                  console.error('[UploadCard] 图片加载失败');
                }}
              />
              {!loading && (
                <Button
                  className={styles.removeButton}
                  onClick={() => handleRemoveImage(index)}
                >
                  ×
                </Button>
              )}
            </View>
          ))}
          {imageUrls.length < 9 && !loading && (
            <View
              className={styles.addMoreButton}
              onClick={handleChooseImage}
            >
              <Text className={styles.addIcon}>+</Text>
            </View>
          )}
        </View>
      ) : (
        <View
          className={classnames(styles.uploadPlaceholder, loading && styles.disabled)}
          onClick={loading ? undefined : handleChooseImage}
        >
          <View className={styles.uploadIcon}>
            <Text className={styles.cameraIcon}>📷</Text>
          </View>
          <Text className={styles.uploadText}>
            {loading ? '识别中...' : `点击上传${meterType === 'water' ? '水表' : '电表'}照片`}
          </Text>
          <Text className={styles.uploadHint}>支持相册选择或拍照，最多9张</Text>
        </View>
      )}
    </View>
  );
};

export default UploadCard;