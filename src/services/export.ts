import Taro from '@tarojs/taro';
import * as XLSX from 'xlsx';
import type { MeterRecord, ExportConfig } from '@/types/meter';

/**
 * 导出数据为 Excel 文件并下载
 */
export const exportToExcel = async (
  records: MeterRecord[],
  config: ExportConfig
): Promise<boolean> => {
  console.log('[ExportService] 开始导出Excel:', { recordsCount: records.length, config });

  try {
    // 准备数据
    const data = records.map((record, index) => {
      const row: Record<string, any> = {
        '序号': index + 1,
        '仪表类型': record.meterType === 'water' ? '水表' : '电表',
        '读数': record.reading,
        '表号': record.meterNumber || '-',
        '置信度': `${(record.confidence * 100).toFixed(1)}%`,
        '时间': formatDate(record.timestamp),
        '状态': getStatusText(record.status),
      };

      if (record.location) {
        row['位置'] = record.location;
      }
      if (record.notes) {
        row['备注'] = record.notes;
      }

      return row;
    });

    // 创建工作表
    const worksheet = XLSX.utils.json_to_sheet(data);

    // 设置列宽
    worksheet['!cols'] = [
      { wch: 8 },   // 序号
      { wch: 10 },  // 仪表类型
      { wch: 12 },  // 读数
      { wch: 15 },  // 表号
      { wch: 10 },  // 置信度
      { wch: 20 },  // 时间
      { wch: 10 },  // 状态
      { wch: 10 },  // 位置
      { wch: 20 },  // 备注
    ];

    // 创建工作簿
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '表计记录');

    // 生成 Excel 文件
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    // 转换为 Blob
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    // 下载文件
    const fileName = `智能读表记录_${formatDateForFile(Date.now())}.xlsx`;
    downloadBlob(blob, fileName);

    console.log('[ExportService] 导出成功，文件名:', fileName);
    return true;
  } catch (error) {
    console.error('[ExportService] 导出失败:', error);
    throw error;
  }
};

/**
 * 下载 Blob 文件
 */
const downloadBlob = (blob: Blob, fileName: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * 格式化日期
 */
const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

/**
 * 格式化日期用于文件名
 */
const formatDateForFile = (timestamp: number): string => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
};

/**
 * 获取状态文本
 */
const getStatusText = (status: MeterRecord['status']): string => {
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
        title: '导出成功，文件已下载',
        icon: 'success',
        duration: 3000,
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
