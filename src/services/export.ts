import Taro from '@tarojs/taro';
import type { MeterRecord, ExportConfig } from '@/types/meter';

/**
 * 模拟Excel导出服务
 * 实际项目中应该使用真实的Excel导出库
 */
export const exportToExcel = async (
  records: MeterRecord[],
  config: ExportConfig
): Promise<boolean> => {
  console.log('[ExportService] 开始导出Excel:', { recordsCount: records.length, config });

  // 模拟导出延迟
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 模拟导出成功
  console.log('[ExportService] 导出成功');
  return true;
};

/**
 * 导出数据（带进度提示）
 */
export const exportDataWithProgress = async (
  records: MeterRecord[]
): Promise<void> => {
  console.log('[ExportService] 导出数据，记录数量:', records.length);

  if (records.length === 0) {
    Taro.showToast({
      title: '暂无数据可导出',
      icon: 'none',
    });
    return;
  }

  Taro.showLoading({
    title: '正在导出...',
  });

  try {
    const config: ExportConfig = {
      format: 'excel',
      includeFields: ['imageUrl', 'reading', 'confidence', 'timestamp', 'status'],
    };

    const success = await exportToExcel(records, config);

    if (success) {
      Taro.hideLoading();
      Taro.showToast({
        title: '导出成功',
        icon: 'success',
      });
    } else {
      throw new Error('导出失败');
    }
  } catch (error) {
    console.error('[ExportService] 导出失败:', error);
    Taro.hideLoading();
    Taro.showToast({
      title: '导出失败，请重试',
      icon: 'none',
    });
  }
};