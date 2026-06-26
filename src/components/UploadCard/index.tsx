import React from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import classnames from 'classnames';
import styles from './index.module.scss';

interface UploadCardProps {
  imageUrl?: string;
  onUpload: (imageUrl: string) => void;
  loading?: boolean;
}

const UploadCard: React.FC<UploadCardProps> = ({ imageUrl, onUpload, loading }) => {
  const handleChooseImage = async () => {
    try {
      const res = await Taro.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      });

      if (res.tempFilePaths && res.tempFilePaths.length > 0) {
        onUpload(res.tempFilePaths[0]);
      }
    } catch (error) {
      console.error('[UploadCard] 选择图片失败:', error);
      Taro.showToast({
        title: '选择图片失败',
        icon: 'none',
      });
    }
  };

  return (
    <View className={styles.uploadCard}>
      {imageUrl ? (
        <View className={styles.previewContainer}>
          <Image
            src={imageUrl}
            mode="aspectFill"
            className={styles.previewImage}
            onError={() => {
              console.error('[UploadCard] 图片加载失败');
              Taro.showToast({
                title: '图片加载失败',
                icon: 'none',
              });
            }}
          />
          {!loading && (
            <Button
              className={styles.reuploadButton}
              onClick={handleChooseImage}
            >
              重新选择
            </Button>
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
            {loading ? '识别中...' : '点击上传水表照片'}
          </Text>
          <Text className={styles.uploadHint}>支持相册选择或拍照</Text>
        </View>
      )}
    </View>
  );
};

export default UploadCard;