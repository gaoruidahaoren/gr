// getMeterRecords 云函数 mock
import type { MeterRecord } from '@/types/meter';

const mockRecords: MeterRecord[] = [
  {
    _id: 'record_1',
    _openid: 'mock_openid',
    imageUrl: 'https://picsum.photos/id/160/300/300',
    reading: 125.6,
    confidence: 0.95,
    timestamp: Date.now() - 86400000 * 7,
    notes: '正常读数',
    status: 'confirmed',
  },
  {
    _id: 'record_2',
    _openid: 'mock_openid',
    imageUrl: 'https://picsum.photos/id/1/300/300',
    reading: 128.3,
    confidence: 0.92,
    timestamp: Date.now() - 86400000 * 3,
    location: '一楼',
    status: 'confirmed',
  },
  {
    _id: 'record_3',
    _openid: 'mock_openid',
    imageUrl: 'https://picsum.photos/id/2/300/300',
    reading: 132.1,
    confidence: 0.88,
    timestamp: Date.now() - 86400000,
    notes: '本周读数',
    status: 'pending',
  },
];

export default function getMeterRecordsMock(params?: { limit?: number; skip?: number }) {
  const limit = params?.limit || 20;
  const skip = params?.skip || 0;

  return {
    records: mockRecords.slice(skip, skip + limit),
    total: mockRecords.length,
  };
}