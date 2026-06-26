import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import styles from './index.module.scss';

interface EmptyStateProps {
  icon?: string;
  title?: string;
  description?: string;
  buttonText?: string;
  onButtonClick?: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📭',
  title = '暂无数据',
  description = '还没有相关记录',
  buttonText,
  onButtonClick,
}) => {
  return (
    <View className={styles.emptyState}>
      <Text className={styles.emptyIcon}>{icon}</Text>
      <Text className={styles.emptyTitle}>{title}</Text>
      <Text className={styles.emptyDescription}>{description}</Text>
      {buttonText && onButtonClick && (
        <Button className={styles.emptyButton} onClick={onButtonClick}>
          {buttonText}
        </Button>
      )}
    </View>
  );
};

export default EmptyState;