// createMeterRecord 云函数 mock
export default function createMeterRecordMock(params: {
  imageUrl: string;
  reading: number;
  confidence: number;
  location?: string;
  notes?: string;
}) {
  return {
    recordId: 'record_' + Date.now(),
  };
}