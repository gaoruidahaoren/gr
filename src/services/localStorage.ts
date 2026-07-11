/**
 * H5 环境本地存储服务
 * 使用 localStorage 模拟云数据库功能
 */

import type { MeterRecord } from '@/types/meter';

const STORAGE_KEY = 'meter_records';

// 获取所有记录
export const getAllRecords = (): MeterRecord[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('[LocalStorage] 读取记录失败:', error);
  }
  return [];
};

// 保存所有记录
const saveAllRecords = (records: MeterRecord[]): void => {
  try {
    const data = JSON.stringify(records);
    console.log('[LocalStorage] 准备保存数据，大小:', data.length, '字节');
    localStorage.setItem(STORAGE_KEY, data);
    console.log('[LocalStorage] 保存成功');
  } catch (error) {
    console.error('[LocalStorage] 保存记录失败:', error);
  }
};

// 创建记录
export const createRecord = (record: Omit<MeterRecord, '_id' | '_openid' | 'timestamp'>): MeterRecord => {
  console.log('[LocalStorage] 创建记录 - 输入参数:', record);

  const records = getAllRecords();
  console.log('[LocalStorage] 当前已有记录数:', records.length);

  const newRecord: MeterRecord = {
    _id: 'record_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    _openid: 'local_user',
    timestamp: Date.now(),
    ...record,
  };
  console.log('[LocalStorage] 新记录:', newRecord);

  records.unshift(newRecord); // 新记录插入到最前面
  saveAllRecords(records);

  // 验证保存是否成功
  const savedRecords = getAllRecords();
  console.log('[LocalStorage] 保存后记录数:', savedRecords.length);

  return newRecord;
};

// 获取记录列表
export const getRecords = (params?: { limit?: number; skip?: number }): { records: MeterRecord[]; total: number } => {
  console.log('[LocalStorage] 获取记录列表，参数:', params);

  const records = getAllRecords();
  console.log('[LocalStorage] 本地存储中的记录总数:', records.length);

  const limit = params?.limit || 20;
  const skip = params?.skip || 0;

  // 按时间倒序排列
  const sortedRecords = records.sort((a, b) => b.timestamp - a.timestamp);

  const result = {
    records: sortedRecords.slice(skip, skip + limit),
    total: records.length,
  };

  console.log('[LocalStorage] 返回记录数:', result.records.length);
  return result;
};

// 根据 ID 获取单条记录
export const getRecordById = (id: string): MeterRecord | null => {
  const records = getAllRecords();
  return records.find(r => r._id === id) || null;
};

// 更新记录
export const updateRecord = (id: string, updates: Partial<Pick<MeterRecord, 'reading' | 'notes' | 'status' | 'meterNumber'>>): boolean => {
  const records = getAllRecords();
  const index = records.findIndex(r => r._id === id);
  if (index === -1) {
    return false;
  }
  records[index] = { ...records[index], ...updates };
  saveAllRecords(records);
  return true;
};

// 删除记录
export const deleteRecord = (id: string): boolean => {
  const records = getAllRecords();
  const newRecords = records.filter(r => r._id !== id);
  if (newRecords.length === records.length) {
    return false; // 没有找到记录
  }
  saveAllRecords(newRecords);
  return true;
};

// 清空所有记录
export const clearAllRecords = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

// 导出记录为 JSON
export const exportRecords = (): string => {
  const records = getAllRecords();
  return JSON.stringify(records, null, 2);
};

// 导入记录
export const importRecords = (jsonString: string): number => {
  try {
    const records: MeterRecord[] = JSON.parse(jsonString);
    const existingRecords = getAllRecords();
    const newRecords = [...records, ...existingRecords];
    saveAllRecords(newRecords);
    return records.length;
  } catch (error) {
    console.error('[LocalStorage] 导入记录失败:', error);
    return 0;
  }
};
