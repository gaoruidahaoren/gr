/**
 * 计算服务 - 多张电表计算功能
 */
import type { MeterRecord, MeterDifference, MeterSummary, CalculationResult } from '@/types/meter';

/**
 * 按表号分组
 */
export const groupByMeterNumber = (records: MeterRecord[]): Record<string, MeterRecord[]> => {
  return records.reduce((groups, record) => {
    const key = record.meterNumber || 'unknown';
    groups[key] = groups[key] || [];
    groups[key].push(record);
    return groups;
  }, {} as Record<string, MeterRecord[]>);
};

/**
 * 按日期分组
 */
export const groupByDate = (records: MeterRecord[]): Record<string, MeterRecord[]> => {
  return records.reduce((groups, record) => {
    const date = new Date(record.timestamp).toISOString().split('T')[0];
    groups[date] = groups[date] || [];
    groups[date].push(record);
    return groups;
  }, {} as Record<string, MeterRecord[]>);
};

/**
 * 按父子关系分组
 */
export const groupByParentChild = (records: MeterRecord[]): Record<string, MeterRecord[]> => {
  return records.reduce((groups, record) => {
    const parentKey = record.parentMeterNumber || record.meterNumber || 'unknown';
    groups[parentKey] = groups[parentKey] || [];
    groups[parentKey].push(record);
    return groups;
  }, {} as Record<string, MeterRecord[]>);
};

/**
 * 计算同一电表不同日期的差值
 */
export const calculateDifferences = (records: MeterRecord[]): MeterDifference[] => {
  const grouped = groupByMeterNumber(records);
  const differences: MeterDifference[] = [];

  Object.entries(grouped).forEach(([meterNumber, meterRecords]) => {
    // 按时间排序
    const sorted = meterRecords.sort((a, b) => a.timestamp - b.timestamp);

    if (sorted.length < 2) return;

    const first = sorted[0];
    const last = sorted[sorted.length - 1];
    const meterType = first.meterType;
    const unit = meterType === 'water' ? 'm³' : 'kWh';

    // 计算总差值
    differences.push({
      meterNumber,
      meterType,
      startDate: new Date(first.timestamp).toISOString().split('T')[0],
      endDate: new Date(last.timestamp).toISOString().split('T')[0],
      startReading: first.reading,
      endReading: last.reading,
      difference: Math.abs(last.reading - first.reading),
      unit,
    });
  });

  return differences;
};

/**
 * 计算同一天不同父子表的汇总比对
 */
export const calculateSummaries = (records: MeterRecord[]): MeterSummary[] => {
  const grouped = groupByParentChild(records);
  const summaries: MeterSummary[] = [];

  Object.entries(grouped).forEach(([parentMeter, meterRecords]) => {
    // 按日期分组
    const byDate = groupByDate(meterRecords);

    Object.entries(byDate).forEach(([date, dateRecords]) => {
      const unit = dateRecords[0]?.meterType === 'water' ? 'm³' : 'kWh';
      const childMeters = dateRecords.map(r => ({
        meterNumber: r.meterNumber || 'unknown',
        reading: r.reading,
      }));
      const totalReading = childMeters.reduce((sum, m) => sum + m.reading, 0);

      // 计算与父表的差值
      const parentRecord = dateRecords.find(r => r.meterNumber === parentMeter);
      const difference = parentRecord ? Math.abs(parentRecord.reading - totalReading) : 0;

      summaries.push({
        date,
        parentMeter,
        childMeters,
        totalReading,
        difference,
        unit,
      });
    });
  });

  return summaries;
};

/**
 * 计算总用量
 */
export const calculateTotalConsumption = (records: MeterRecord[]): number => {
  return records.reduce((total, record) => {
    return total + record.reading;
  }, 0);
};

/**
 * 获取所有唯一的表号
 */
export const getUniqueMeterNumbers = (records: MeterRecord[]): string[] => {
  const numbers = new Set<string>();
  records.forEach(r => {
    if (r.meterNumber) {
      numbers.add(r.meterNumber);
    }
  });
  return Array.from(numbers).sort();
};

/**
 * 获取所有唯一的父表号
 */
export const getUniqueParentMeters = (records: MeterRecord[]): string[] => {
  const numbers = new Set<string>();
  records.forEach(r => {
    if (r.parentMeterNumber) {
      numbers.add(r.parentMeterNumber);
    } else if (r.meterNumber) {
      numbers.add(r.meterNumber);
    }
  });
  return Array.from(numbers).sort();
};

/**
 * 获取日期范围
 */
export const getDateRange = (records: MeterRecord[]): { start: string; end: string } => {
  if (records.length === 0) {
    return { start: '', end: '' };
  }

  const timestamps = records.map(r => r.timestamp);
  const start = new Date(Math.min(...timestamps)).toISOString().split('T')[0];
  const end = new Date(Math.max(...timestamps)).toISOString().split('T')[0];

  return { start, end };
};

/**
 * 按日期范围筛选记录
 */
export const filterByDateRange = (
  records: MeterRecord[],
  startDate: string,
  endDate: string
): MeterRecord[] => {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime() + 86400000; // 加一天包含结束日期

  return records.filter(r => r.timestamp >= start && r.timestamp < end);
};

/**
 * 按表号筛选记录
 */
export const filterByMeterNumber = (
  records: MeterRecord[],
  meterNumber: string
): MeterRecord[] => {
  return records.filter(r => r.meterNumber === meterNumber);
};

/**
 * 按仪表类型筛选记录
 */
export const filterByMeterType = (
  records: MeterRecord[],
  meterType: 'water' | 'electric'
): MeterRecord[] => {
  return records.filter(r => r.meterType === meterType);
};
